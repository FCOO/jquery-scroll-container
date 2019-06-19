/****************************************************************************
    jquery-scroll-container-simplebar.js,

    An adjusted and simplified version of

    SimpleBar.js - v3.1.1
    https://grsmto.github.io/simplebar/
    Made by Adrien Denat from a fork by Jonathan Nicol
****************************************************************************/
(function ($, window/*, document, undefined*/) {
    "use strict";

    function scrollbarWidth() {
        if (typeof document === 'undefined')
            return 0;

        var body = document.body,
            box = document.createElement('div'),
            boxStyle = box.style,
            width;

        boxStyle.position = 'absolute';
        boxStyle.top = boxStyle.left = '-9999px';
        boxStyle.width = boxStyle.height = '100px';
        boxStyle.overflow = 'scroll';

        body.appendChild(box);

        width = box.offsetWidth - box.clientWidth;
        body.removeChild(box);
        return width;
    }



    /********************************************
    Simplebar
    ********************************************/
    var defaultOptions = {
            direction: 'auto',
            classNames: {
                content     : 'simplebar-content',
                offset      : 'simplebar-offset',
                mask        : 'simplebar-mask',
                wrapper     : 'simplebar-wrapper',
                placeholder : 'simplebar-placeholder',
                scrollbar   : 'simplebar-scrollbar',
                track       : 'simplebar-track',
                visible     : 'simplebar-visible',
                horizontal  : 'simplebar-horizontal',
                vertical    : 'simplebar-vertical',
                hover       : 'simplebar-hover',
                dragging    : 'simplebar-dragging'
            },
            scrollbarMinSize: 25,
            scrollbarMaxSize: 0
        };


    function Simplebar( element, options ) {
        this.options = $.extend({}, defaultOptions, options || {} );
        this.classNames = $.extend({}, defaultOptions.classNames, this.options.classNames);

        this.el = element;
        this.contentEl;
        this.offsetEl;
        this.maskEl;
        this.scrollbarWidth;
        this.minScrollbarWidth = 20;
        this.axis = {
            x: {
                scrollOffsetAttr: 'scrollLeft',
                sizeAttr        : 'width',
                scrollSizeAttr  : 'scrollWidth',
                offsetAttr      : 'left',
                overflowAttr    : 'overflowX',
                dragOffset      : 0,
                isOverflowing   : true,
                isVisible       : false,
                track           : {},
                scrollbar       : {}
            },
            y: {
                scrollOffsetAttr: 'scrollTop',
                sizeAttr        : 'height',
                scrollSizeAttr  : 'scrollHeight',
                offsetAttr      : 'top',
                overflowAttr    : 'overflowY',
                dragOffset      : 0,
                isOverflowing   : true,
                isVisible       : false,
                track           : {},
                scrollbar       : {}
            }
        };

        //Convert event-methods to have this as context
        var _this = this;
        $.each(['onScroll', 'scrollX', 'scrollY', 'onMouseMove', 'onMouseLeave', 'onWindowResize', 'onPointerEvent', 'drag', 'onEndDrag'], function(index, methodName){
            _this[methodName] = $.proxy(_this[methodName], _this);
        });

        this.getContentElement = this.getScrollElement;
        this.init();
    }

    // expose access to the constructor
    window.Simplebar = Simplebar;

    //Extend the prototype
    window.Simplebar.prototype = {
        //onScroll
        onScroll: function () {
            if (!this.scrollXTicking) {
                window.requestAnimationFrame(this.scrollX);
                this.scrollXTicking = true;
            }

            if (!this.scrollYTicking) {
                window.requestAnimationFrame(this.scrollY);
                this.scrollYTicking = true;
            }
        },

        //scrollX
        scrollX: function () {
            if (this.axis.x.isOverflowing) {
                this.showScrollbar('x');
                this.positionScrollbar('x');
            }
            this.scrollXTicking = false;
        },

        //scrollY
        scrollY: function () {
            if (this.axis.y.isOverflowing) {
                this.showScrollbar('y');
                this.positionScrollbar('y');
            }
            this.scrollYTicking = false;
        },

        //onMouseMove
        onMouseMove: function (e) {
            this.mouseX = e.clientX;
            this.mouseY = e.clientY;

            if (this.axis.x.isOverflowing) {
                this.onMouseMoveForAxis('x');
            }

            if (this.axis.y.isOverflowing) {
                this.onMouseMoveForAxis('y');
            }
        },

        //onMouseLeave
        onMouseLeave: function () {
            if (this.axis.x.isOverflowing) {
                this.onMouseLeaveForAxis('x');
            }

            if (this.axis.y.isOverflowing) {
                this.onMouseLeaveForAxis('y');
            }

            this.mouseX = -1;
            this.mouseY = -1;
        },

        //onWindowResize
        onWindowResize: function () {
            // Recalculate scrollbarWidth in case it's a zoom
            this.scrollbarWidth = scrollbarWidth();
            this.hideNativeScrollbar();
        },

        //onPointerEvent
        onPointerEvent: function (e) {
            var isWithinBoundsY, isWithinBoundsX;
            this.axis.x.scrollbar.rect = this.axis.x.scrollbar.el.getBoundingClientRect();
            this.axis.y.scrollbar.rect = this.axis.y.scrollbar.el.getBoundingClientRect();

            if (this.axis.x.isOverflowing) {
                isWithinBoundsX = this.isWithinBounds(this.axis.x.scrollbar.rect);
            }

            if (this.axis.y.isOverflowing) {
                isWithinBoundsY = this.isWithinBounds(this.axis.y.scrollbar.rect);
            } // If any pointer event is called on the scrollbar

            if (isWithinBoundsY || isWithinBoundsX) {
                // Preventing the event's default action stops text being
                // selectable during the drag.
                e.preventDefault(); // Prevent event leaking
                e.stopPropagation();
                if (e.type === 'mousedown') {
                    if (isWithinBoundsY) {
                        this.onDragStart(e, 'y');
                    }
                    if (isWithinBoundsX) {
                        this.onDragStart(e, 'x');
                    }
                }
            }
        },

        //onDragStart - on scrollbar handle drag movement starts
        onDragStart: function(e) {
            var axis = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'y';
            var scrollbar = this.axis[axis].scrollbar.el; // Measure how far the user's mouse is from the top of the scrollbar drag handle.

            var eventOffset = axis === 'y' ? e.pageY : e.pageX;
            this.axis[axis].dragOffset = eventOffset - scrollbar.getBoundingClientRect()[this.axis[axis].offsetAttr];
            this.draggedAxis = axis;

            this.el.classList.add(this.classNames.dragging);
            this.axis[this.draggedAxis].scrollbar.el.classList.add(this.classNames.dragging);
            this.axis[this.draggedAxis].track.el.classList.add(this.classNames.dragging);

            document.addEventListener('mousemove', this.drag);
            document.addEventListener('mouseup', this.onEndDrag);
        },

        //drag
        drag: function (e) {
            var eventOffset;
            var track = this.axis[this.draggedAxis].track;
            e.preventDefault();
            e.stopPropagation();

            if (this.draggedAxis === 'y') {
                eventOffset = e.pageY;
            }
            else {
                eventOffset = e.pageX;
            } // Calculate how far the user's mouse is from the top/left of the scrollbar (minus the dragOffset).

            var dragPos = eventOffset - track.rect[this.axis[this.draggedAxis].offsetAttr] - this.axis[this.draggedAxis].dragOffset; // Convert the mouse position into a percentage of the scrollbar height/width.
            var dragPerc = dragPos / track.rect[this.axis[this.draggedAxis].sizeAttr]; // Scroll the content by the same percentage.
            var scrollPos = dragPerc * this.contentEl[this.axis[this.draggedAxis].scrollSizeAttr]; // Fix browsers inconsistency on RTL
            this.contentEl[this.axis[this.draggedAxis].scrollOffsetAttr] = scrollPos;
        },

        //onEndDrag
        onEndDrag: function (e) {
            e.preventDefault();
            e.stopPropagation();

            this.el.classList.remove(this.classNames.dragging);
            this.axis[this.draggedAxis].scrollbar.el.classList.remove(this.classNames.dragging);
            this.axis[this.draggedAxis].track.el.classList.remove(this.classNames.dragging);

            document.removeEventListener('mousemove', this.drag);
            document.removeEventListener('mouseup', this.onEndDrag);
        },


        //init
        init: function() {
            // Save a reference to the instance, so we know this DOM node has already been instancied
            this.el.SimpleBar = this;
            this.initDOM(); // We stop here on server-side

            // Recalculate scrollbarWidth in case it's a zoom
            this.scrollbarWidth = scrollbarWidth();
            this.recalculate();
            this.initListeners();
        },

        //initDOM
        initDOM: function() {
            var _this2 = this;

            // make sure this element doesn't have the elements yet
            if (Array.from(this.el.children).filter(function (child) {
                return child.classList.contains(_this2.classNames.wrapper);
            }).length) {
                // assume that element has his DOM already initiated
                this.wrapperEl = this.el.querySelector(".".concat(this.classNames.wrapper));
                this.contentEl = this.el.querySelector(".".concat(this.classNames.content));
                this.offsetEl = this.el.querySelector(".".concat(this.classNames.offset));
                this.maskEl = this.el.querySelector(".".concat(this.classNames.mask));
                this.placeholderEl = this.el.querySelector(".".concat(this.classNames.placeholder));
                this.axis.x.track.el = this.el.querySelector(".".concat(this.classNames.track, ".").concat(this.classNames.horizontal));
                this.axis.y.track.el = this.el.querySelector(".".concat(this.classNames.track, ".").concat(this.classNames.vertical));
            }
            else {
                // Prepare DOM
                this.wrapperEl = document.createElement('div');
                this.contentEl = document.createElement('div');
                this.offsetEl = document.createElement('div');
                this.maskEl = document.createElement('div');
                this.placeholderEl = document.createElement('div');
                this.wrapperEl.classList.add(this.classNames.wrapper);
                this.contentEl.classList.add(this.classNames.content);
                this.offsetEl.classList.add(this.classNames.offset);
                this.maskEl.classList.add(this.classNames.mask);
                this.placeholderEl.classList.add(this.classNames.placeholder);

                while (this.el.firstChild) {
                    this.contentEl.appendChild(this.el.firstChild);
                }

                this.offsetEl.appendChild(this.contentEl);
                this.maskEl.appendChild(this.offsetEl);
                this.wrapperEl.appendChild(this.maskEl);
                this.wrapperEl.appendChild(this.placeholderEl);
                this.el.appendChild(this.wrapperEl);
            }

            if (!this.axis.x.track.el || !this.axis.y.track.el) {
                var track = document.createElement('div');
                var scrollbar = document.createElement('div');
                track.classList.add(this.classNames.track);
                scrollbar.classList.add(this.classNames.scrollbar);
                scrollbar.classList.add(this.classNames.visible);

                track.appendChild(scrollbar);
                this.axis.x.track.el = track.cloneNode(true);
                this.axis.x.track.el.classList.add(this.classNames.horizontal);
                this.axis.y.track.el = track.cloneNode(true);
                this.axis.y.track.el.classList.add(this.classNames.vertical);
                this.el.appendChild(this.axis.x.track.el);
                this.el.appendChild(this.axis.y.track.el);
            }
            this.axis.x.scrollbar.el = this.axis.x.track.el.querySelector(".".concat(this.classNames.scrollbar));
            this.axis.y.scrollbar.el = this.axis.y.track.el.querySelector(".".concat(this.classNames.scrollbar));
            this.el.setAttribute('data-simplebar', 'init');
        },

        //initListeners
        initListeners: function() {
            var _this = this;

            // Event listeners
            ['mousedown', 'click', 'dblclick', 'touchstart', 'touchend', 'touchmove'].forEach(function (e) {
                _this.el.addEventListener(e, _this.onPointerEvent, true);
            });
            this.el.addEventListener('mousemove', this.onMouseMove);
            this.el.addEventListener('mouseleave', this.onMouseLeave);
            this.contentEl.addEventListener('scroll', this.onScroll); // Browser zoom triggers a window resize
        },

        //recalculate
        recalculate: function() {
            this.elStyles = window.getComputedStyle(this.el);
            this.contentEl.style.padding = "".concat(this.elStyles.paddingTop, " ").concat(this.elStyles.paddingRight, " ").concat(this.elStyles.paddingBottom, " ").concat(this.elStyles.paddingLeft);
            this.contentEl.style.height = '100%';
            this.placeholderEl.style.width = "".concat(this.contentEl.scrollWidth, "px");
            this.placeholderEl.style.height = "".concat(this.contentEl.scrollHeight, "px");
            this.wrapperEl.style.margin = "-".concat(this.elStyles.paddingTop, " -").concat(this.elStyles.paddingRight, " -").concat(this.elStyles.paddingBottom, " -").concat(this.elStyles.paddingLeft);
            this.axis.x.track.rect = this.axis.x.track.el.getBoundingClientRect();
            this.axis.y.track.rect = this.axis.y.track.el.getBoundingClientRect(); // Set isOverflowing to false if scrollbar is not necessary (content is shorter than offset)

            this.axis.x.isOverflowing = (this.scrollbarWidth ? this.contentEl.scrollWidth : this.contentEl.scrollWidth - this.minScrollbarWidth) > Math.ceil(this.axis.x.track.rect.width);
            this.axis.y.isOverflowing = (this.scrollbarWidth ? this.contentEl.scrollHeight : this.contentEl.scrollHeight - this.minScrollbarWidth) > Math.ceil(this.axis.y.track.rect.height); // Set isOverflowing to false if user explicitely set hidden overflow

            this.axis.x.isOverflowing = this.elStyles.overflowX === 'hidden' || this.options.isVertical   ? false : this.axis.x.isOverflowing;
            this.axis.y.isOverflowing = this.elStyles.overflowY === 'hidden' || this.options.isHorizontal ? false : this.axis.y.isOverflowing;

            this.axis.x.scrollbar.size = this.getScrollbarSize('x');
            this.axis.y.scrollbar.size = this.getScrollbarSize('y');
            this.axis.x.scrollbar.el.style.width = "".concat(this.axis.x.scrollbar.size, "px");
            this.axis.y.scrollbar.el.style.height = "".concat(this.axis.y.scrollbar.size, "px");
            this.positionScrollbar('x');
            this.positionScrollbar('y');
            this.toggleTrackVisibility('x');
            this.toggleTrackVisibility('y');
            this.hideNativeScrollbar();
        },

        //getScrollbarSize - Calculate scrollbar size
        getScrollbarSize: function() {
            var axis = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'y';
            var contentSize = this.scrollbarWidth ? this.contentEl[this.axis[axis].scrollSizeAttr] : this.contentEl[this.axis[axis].scrollSizeAttr] - this.minScrollbarWidth;
            var trackSize = this.axis[axis].track.rect[this.axis[axis].sizeAttr];
            var scrollbarSize;

            if (!this.axis[axis].isOverflowing) {
                return;
            }

            var scrollbarRatio = trackSize / contentSize; // Calculate new height/position of drag handle.
            scrollbarSize = Math.max(~~(scrollbarRatio * trackSize), this.options.scrollbarMinSize);

            if (this.options.scrollbarMaxSize) {
                scrollbarSize = Math.min(scrollbarSize, this.options.scrollbarMaxSize);
            }

            return scrollbarSize;
        },

        //positionScrollbar
        positionScrollbar: function(axis) {
            var contentSize = this.contentEl[this.axis[axis].scrollSizeAttr],
                trackSize = this.axis[axis].track.rect[this.axis[axis].sizeAttr],
                hostSize = parseInt(this.elStyles[this.axis[axis].sizeAttr], 10),
                scrollbar = this.axis[axis].scrollbar,
                scrollOffset = this.contentEl[this.axis[axis].scrollOffsetAttr],
                scrollPourcent = scrollOffset / (contentSize - hostSize),
                handleOffset = ~~((trackSize - scrollbar.size) * scrollPourcent);
            scrollbar.el.style.transform = axis === 'x' ? "translate3d(".concat(handleOffset, "px, 0, 0)") : "translate3d(0, ".concat(handleOffset, "px, 0)");
        },

        //toggleTrackVisibility
        toggleTrackVisibility: function(axis) {
            var track = this.axis[axis].track.el,
                scrollbar = this.axis[axis].scrollbar.el;

            if (this.axis[axis].isOverflowing) {
                track.style.visibility = 'visible';
                this.contentEl.style[this.axis[axis].overflowAttr] = 'scroll';
            }
            else {
                track.style.visibility = 'hidden';
                this.contentEl.style[this.axis[axis].overflowAttr] = 'hidden';
            }

            if (this.axis[axis].isOverflowing) {
                scrollbar.style.visibility = 'visible';
            }
            else {
                scrollbar.style.visibility = 'hidden';
            }
        },

        //hideNativeScrollbar
        hideNativeScrollbar: function() {
            this.offsetEl.style['right'] = this.axis.y.isOverflowing ? "-".concat(this.scrollbarWidth || this.minScrollbarWidth, "px") : 0;
            this.offsetEl.style.bottom = this.axis.x.isOverflowing ? "-".concat(this.scrollbarWidth || this.minScrollbarWidth, "px") : 0; // If floating scrollbar

            if (!this.scrollbarWidth) {
                var paddingDirection = ['paddingRight'];
                this.contentEl.style[paddingDirection] = this.axis.y.isOverflowing ? "calc(".concat(this.elStyles[paddingDirection], " + ").concat(this.minScrollbarWidth, "px)") : this.elStyles[paddingDirection];
                this.contentEl.style.paddingBottom = this.axis.x.isOverflowing ? "calc(".concat(this.elStyles.paddingBottom, " + ").concat(this.minScrollbarWidth, "px)") : this.elStyles.paddingBottom;
            }
        },

        //onMouseMoveForAxis - On scroll event handling
        onMouseMoveForAxis: function() {
            var axis = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'y';
            this.axis[axis].track.rect = this.axis[axis].track.el.getBoundingClientRect();
            this.axis[axis].scrollbar.rect = this.axis[axis].scrollbar.el.getBoundingClientRect();
            var isWithinScrollbarBoundsX = this.isWithinBounds(this.axis[axis].scrollbar.rect);

            if (isWithinScrollbarBoundsX) {
                this.axis[axis].scrollbar.el.classList.add(this.classNames.hover);
            }
            else {
                this.axis[axis].scrollbar.el.classList.remove(this.classNames.hover);
            }

            if (this.isWithinBounds(this.axis[axis].track.rect)) {
                this.showScrollbar(axis);
                this.axis[axis].track.el.classList.add(this.classNames.hover);
            }
            else {
                this.axis[axis].track.el.classList.remove(this.classNames.hover);
            }
        },

        //onMouseLeaveForAxis
        onMouseLeaveForAxis: function() {
            var axis = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'y';
            this.axis[axis].track.el.classList.remove(this.classNames.hover);
            this.axis[axis].scrollbar.el.classList.remove(this.classNames.hover);
        },

        //ShowScrollbar
        showScrollbar: function() {
            var axis = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'y';
            var scrollbar = this.axis[axis].scrollbar.el;

            if (!this.axis[axis].isVisible) {
                scrollbar.classList.add(this.classNames.visible);
                this.axis[axis].isVisible = true;
            }
        },


        /**********************************
        Drag scrollbar handle
        **********************************/
        //Getter for original scrolling element
        getScrollElement: function() {
            return this.contentEl;
        },

        removeListeners: function() {
            // Event listeners
            this.contentEl.removeEventListener('scroll', this.onScroll);
            window.removeEventListener('resize', this.onWindowResize);
        },

        //UnMount mutation observer and delete SimpleBar instance from DOM element
        unMount: function() {
            this.removeListeners();
            this.el.SimpleBar = null;
        },

        //Recursively walks up the parent nodes looking for this.el
        isChildNode: function(el) {
            if (el === null) return false;
            if (el === this.el) return true;
            return this.isChildNode(el.parentNode);
        },

        // Check if mouse is within bounds
        isWithinBounds: function(bbox) {
            return this.mouseX >= bbox.left && this.mouseX <= bbox.left + bbox.width && this.mouseY >= bbox.top && this.mouseY <= bbox.top + bbox.height;
        }
    };

}(jQuery, this, document));


;
/****************************************************************************
    jquery-scroll-container.js,

    (c) 2017, FCOO

    https://github.com/FCOO/jquery-scroll-container
    https://github.com/FCOO

****************************************************************************/

(function ($ /*, window, document, undefined*/) {
    "use strict";

    if ( $('html').hasClass('touchevents') || $('html').hasClass('no-touchevents') )
        ;    //Modernizr (or someone else) has set the correct class
    else
        //Default: No touch
        $('html').addClass('no-touchevents');


    //Extend $.fn with scrollIntoView
    $.fn.extend({
        scrollIntoView: function( arg ){
            if (this.get(0).scrollIntoView)
                this.get(0).scrollIntoView( arg );
        }
    });

    //Extend $.fn with internal scrollbar methods. sb = simplebar
    $.fn.extend({
        _sbUpdate: function(){
            this.simplebar.recalculate();
        }
    });

    $.fn.addScrollbar = function( direction ){
        var options = {
                direction: direction || 'auto'
            };
        options.isVertical   = (options.direction == 'vertical');
        options.isHorizontal = (options.direction == 'horizontal');
        options.isAuto       = (options.direction == 'auto');

        this
            //Set direction class
            .toggleClass( 'scrollbar-horizontal', options.isHorizontal )
            .toggleClass( 'scrollbar-vertical',   options.isVertical   );

        //Create simplebar
        this.simplebar = new window.Simplebar(this.get(0), options);


        this.scrollbarContainer = $(this.simplebar.getContentElement());

        this.innerContainer = this.scrollbarContainer;//$('<div/>').appendTo(this.scrollbarContainer);

        //Update scrollbar when container or content change size
        var _sbUpdate = $.proxy( this._sbUpdate, this );
        this.scrollbarContainer.resize( _sbUpdate );
        this.innerContainer.resize( _sbUpdate );

        return this.innerContainer;
    };

}(jQuery, this, document));