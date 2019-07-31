/****************************************************************************
    jquery-scroll-container-simplebar.js,

    An adjusted and simplified version of
    SimpleBar.js - v4.1.0 - Scrollbars, simpler.
    https://grsmto.github.io/simplebar/
    Made by Adrien Denat from a fork by Jonathan Nicol
    Under MIT License

****************************************************************************/
(function ($, window/*, document, undefined*/) {
    "use strict";

    function scrollbarWidth() {
        if (typeof document === 'undefined') {
            return 0;
        }

        var body = document.body,
            box = document.createElement('div'),
            boxStyle = box.style;
        boxStyle.position = 'fixed';
        boxStyle.left = 0;
        boxStyle.visibility = 'hidden';
        boxStyle.overflowY = 'scroll';
        body.appendChild(box);
        var width = box.getBoundingClientRect().right;
        body.removeChild(box);
        return width;
    }


    /********************************************
    SimpleBar
    ********************************************/
    var defaultOptions = {
            autoHide    : false,//true,
            forceVisible: false,
            classNames: {
                contentEl                   : 'simplebar-content',
                contentWrapper              : 'simplebar-content-wrapper',
                offset                      : 'simplebar-offset',
                mask                        : 'simplebar-mask',
                wrapper                     : 'simplebar-wrapper',
                placeholder                 : 'simplebar-placeholder',
                scrollbar                   : 'simplebar-scrollbar',
                track                       : 'simplebar-track',
                heightAutoObserverWrapperEl : 'simplebar-height-auto-observer-wrapper',
                heightAutoObserverEl        : 'simplebar-height-auto-observer',
                visible                     : 'simplebar-visible',
                horizontal                  : 'simplebar-horizontal',
                vertical                    : 'simplebar-vertical',
                hover                       : 'simplebar-hover',
                dragging                    : 'simplebar-dragging'
            },
            scrollbarMinSize: 25,
            scrollbarMaxSize: 0,
            timeout: 1000
        };

    function SimpleBar( element, options ) {
        var _this = this;

        this.onScroll = function () {
            if (!_this.scrollXTicking) {
                window.requestAnimationFrame(_this.scrollX);
                _this.scrollXTicking = true;
            }

            if (!_this.scrollYTicking) {
                window.requestAnimationFrame(_this.scrollY);
                _this.scrollYTicking = true;
            }
        };

        this.scrollX = function () {
            if (_this.axis.x.isOverflowing) {
                _this.showScrollbar('x');

                _this.positionScrollbar('x');
            }

            _this.scrollXTicking = false;
        };

        this.scrollY = function () {
            if (_this.axis.y.isOverflowing) {
                _this.showScrollbar('y');

                _this.positionScrollbar('y');
            }

            _this.scrollYTicking = false;
        };

        this.onMouseEnter = function () {
            _this.showScrollbar('x');
            _this.showScrollbar('y');
        };

        this.onMouseMove = function (e) {
            _this.mouseX = e.clientX;
            _this.mouseY = e.clientY;

            if (_this.axis.x.isOverflowing || _this.axis.x.forceVisible) {
                _this.onMouseMoveForAxis('x');
            }

            if (_this.axis.y.isOverflowing || _this.axis.y.forceVisible) {
                _this.onMouseMoveForAxis('y');
            }
        };

        this.onMouseLeave = function () {
            //**_this.onMouseMove.cancel();

            if (_this.axis.x.isOverflowing || _this.axis.x.forceVisible) {
                _this.onMouseLeaveForAxis('x');
            }

            if (_this.axis.y.isOverflowing || _this.axis.y.forceVisible) {
                _this.onMouseLeaveForAxis('y');
            }

            _this.mouseX = -1;
            _this.mouseY = -1;
        };

        this.onWindowResize = function () {
            // Recalculate scrollbarWidth in case it's a zoom
            _this.scrollbarWidth = scrollbarWidth();

            _this.hideNativeScrollbar();
        };

        this.hideScrollbars = function () {
            _this.axis.x.track.rect = _this.axis.x.track.el.getBoundingClientRect();
            _this.axis.y.track.rect = _this.axis.y.track.el.getBoundingClientRect();

            if (!_this.isWithinBounds(_this.axis.y.track.rect)) {
                _this.axis.y.scrollbar.el.classList.remove(_this.classNames.visible);

                _this.axis.y.isVisible = false;
            }

            if (!_this.isWithinBounds(_this.axis.x.track.rect)) {
                _this.axis.x.scrollbar.el.classList.remove(_this.classNames.visible);

                _this.axis.x.isVisible = false;
            }
        };

        this.onPointerEvent = function (e) {
            var isWithinBoundsY, isWithinBoundsX;
            _this.axis.x.scrollbar.rect = _this.axis.x.scrollbar.el.getBoundingClientRect();
            _this.axis.y.scrollbar.rect = _this.axis.y.scrollbar.el.getBoundingClientRect();

            if (_this.axis.x.isOverflowing || _this.axis.x.forceVisible) {
                isWithinBoundsX = _this.isWithinBounds(_this.axis.x.scrollbar.rect);
            }

            if (_this.axis.y.isOverflowing || _this.axis.y.forceVisible) {
                isWithinBoundsY = _this.isWithinBounds(_this.axis.y.scrollbar.rect);
            } // If any pointer event is called on the scrollbar

            if (isWithinBoundsY || isWithinBoundsX) {
                // Preventing the event's default action stops text being
                // selectable during the drag.
                e.preventDefault(); // Prevent event leaking

                e.stopPropagation();

                if (e.type === 'mousedown') {
                    if (isWithinBoundsY) {
                        _this.onDragStart(e, 'y');
                    }

                    if (isWithinBoundsX) {
                        _this.onDragStart(e, 'x');
                    }
                }
            }
        };

        this.drag = function (e) {
            var eventOffset;
            var track = _this.axis[_this.draggedAxis].track;
            var trackSize = track.rect[_this.axis[_this.draggedAxis].sizeAttr];
            var scrollbar = _this.axis[_this.draggedAxis].scrollbar;
            e.preventDefault();
            e.stopPropagation();

            if (_this.draggedAxis === 'y') {
                eventOffset = e.pageY;
            } else {
                eventOffset = e.pageX;
            } // Calculate how far the user's mouse is from the top/left of the scrollbar (minus the dragOffset).

            var dragPos = eventOffset - track.rect[_this.axis[_this.draggedAxis].offsetAttr] - _this.axis[_this.draggedAxis].dragOffset; // Convert the mouse position into a percentage of the scrollbar height/width.

            var dragPerc = dragPos / track.rect[_this.axis[_this.draggedAxis].sizeAttr]; // Scroll the content by the same percentage.

            var scrollPos = dragPerc * _this.contentWrapperEl[_this.axis[_this.draggedAxis].scrollSizeAttr]; // Fix browsers inconsistency on RTL

            if (_this.draggedAxis === 'x') {
                scrollPos = _this.isRtl && SimpleBar.getRtlHelpers().isRtlScrollbarInverted ? scrollPos - (trackSize + scrollbar.size) : scrollPos;
                scrollPos = _this.isRtl && SimpleBar.getRtlHelpers().isRtlScrollingInverted ? -scrollPos : scrollPos;
            }

            _this.contentWrapperEl[_this.axis[_this.draggedAxis].scrollOffsetAttr] = scrollPos;
        };

        this.onEndDrag = function (e) {
            e.preventDefault();
            e.stopPropagation();

            _this.el.classList.remove(_this.classNames.dragging);

            document.removeEventListener('mousemove', _this.drag, true);
            document.removeEventListener('mouseup', _this.onEndDrag, true);
            _this.removePreventClickId = window.setTimeout(function () {
                // Remove these asynchronously so we still suppress click events
                // generated simultaneously with mouseup.
                document.removeEventListener('click', _this.preventClick, true);
                document.removeEventListener('dblclick', _this.preventClick, true);
                _this.removePreventClickId = null;
            });
        };

        this.preventClick = function (e) {
            e.preventDefault();
            e.stopPropagation();
        };

        this.el = element;
        this.flashTimeout;
        this.contentEl;
        this.contentWrapperEl;
        this.offsetEl;
        this.maskEl;
        this.globalObserver;
        this.mutationObserver;
        this.resizeObserver;
        this.scrollbarWidth;
        this.minScrollbarWidth = 20;
        //**this.options = Object.assign({}, SimpleBar.defaultOptions, options);
        this.options = $.extend({}, defaultOptions, options || {} );
        //**this.classNames = Object.assign({}, SimpleBar.defaultOptions.classNames, this.options.classNames);
        this.classNames = $.extend({}, defaultOptions.classNames, this.options.classNames);

        this.isRtl;
        this.axis = {
            x: {
                scrollOffsetAttr: 'scrollLeft',
                sizeAttr: 'width',
                scrollSizeAttr: 'scrollWidth',
                offsetAttr: 'left',
                overflowAttr: 'overflowX',
                dragOffset: 0,
                isOverflowing: true,
                isVisible: false,
                forceVisible: false,
                track: {},
                scrollbar: {}
            },
            y: {
                scrollOffsetAttr: 'scrollTop',
                sizeAttr: 'height',
                scrollSizeAttr: 'scrollHeight',
                offsetAttr: 'top',
                overflowAttr: 'overflowY',
                dragOffset: 0,
                isOverflowing: true,
                isVisible: false,
                forceVisible: false,
                track: {},
                scrollbar: {}
            }
        };
        this.removePreventClickId = null; // Don't re-instantiate over an existing one

        if (this.el.SimpleBar) {
            return;
        }

        //**this.recalculate = throttle(this.recalculate.bind(this), 64);
        //**this.onMouseMove = throttle(this.onMouseMove.bind(this), 64);
        //**this.hideScrollbars = debounce(this.hideScrollbars.bind(this), this.options.timeout);
        //**this.onWindowResize = debounce(this.onWindowResize.bind(this), 64, {
        //**    leading: true
        //**});
        //**SimpleBar.getRtlHelpers = memoize(SimpleBar.getRtlHelpers);

        $.each(['recalculate', 'onMouseMove', 'hideScrollbars', 'onWindowResize', 'getRtlHelpers'], function(index, methodName){
            _this[methodName] = $.proxy(_this[methodName], _this);
        });

        this.init();
    }

    // expose access to the constructor
    window.SimpleBar = SimpleBar;

  /**
   * Static properties
   */

  /**
   * Helper to fix browsers inconsistency on RTL:
   *  - Firefox inverts the scrollbar initial position
   *  - IE11 inverts both scrollbar position and scrolling offset
   * Directly inspired by @KingSora's OverlayScrollbars https://github.com/KingSora/OverlayScrollbars/blob/master/js/OverlayScrollbars.js#L1634
   */
    SimpleBar.getRtlHelpers = function getRtlHelpers() {
        var dummyDiv = document.createElement('div');
        dummyDiv.innerHTML = '<div class="hs-dummy-scrollbar-size"><div style="height: 200%; width: 200%; margin: 10px 0;"></div></div>';
        var scrollbarDummyEl = dummyDiv.firstElementChild;
        document.body.appendChild(scrollbarDummyEl);
        var dummyContainerChild = scrollbarDummyEl.firstElementChild;
        scrollbarDummyEl.scrollLeft = 0;
        var dummyContainerOffset = SimpleBar.getOffset(scrollbarDummyEl);
        var dummyContainerChildOffset = SimpleBar.getOffset(dummyContainerChild);
        scrollbarDummyEl.scrollLeft = 999;
        var dummyContainerScrollOffsetAfterScroll = SimpleBar.getOffset(dummyContainerChild);
        return {
            // determines if the scrolling is responding with negative values
            isRtlScrollingInverted: dummyContainerOffset.left !== dummyContainerChildOffset.left && dummyContainerChildOffset.left - dummyContainerScrollOffsetAfterScroll.left !== 0,
            // determines if the origin scrollbar position is inverted or not (positioned on left or right)
            isRtlScrollbarInverted: dummyContainerOffset.left !== dummyContainerChildOffset.left
        };
    };

    SimpleBar.initHtmlApi = function initHtmlApi() {
        this.initDOMLoadedElements = this.initDOMLoadedElements.bind(this); // MutationObserver is IE11+

        if (typeof MutationObserver !== 'undefined') {
            // Mutation observer to observe dynamically added elements
            this.globalObserver = new MutationObserver(function (mutations) {
                mutations.forEach(function (mutation) {
                    Array.prototype.forEach.call(mutation.addedNodes, function (addedNode) {
                        if (addedNode.nodeType === 1) {
                            if (addedNode.hasAttribute('data-simplebar')) {
                                !addedNode.SimpleBar && new SimpleBar(addedNode, SimpleBar.getElOptions(addedNode));
                            } else {
                                Array.prototype.forEach.call(addedNode.querySelectorAll('[data-simplebar]'), function (el) {
                                    !el.SimpleBar && new SimpleBar(el, SimpleBar.getElOptions(el));
                                });
                            }
                        }
                    });
                    Array.prototype.forEach.call(mutation.removedNodes, function (removedNode) {
                        if (removedNode.nodeType === 1) {
                            if (removedNode.hasAttribute('data-simplebar')) {
                                removedNode.SimpleBar && removedNode.SimpleBar.unMount();
                            } else {
                                Array.prototype.forEach.call(removedNode.querySelectorAll('[data-simplebar]'), function (el) {
                                    el.SimpleBar && el.SimpleBar.unMount();
                                });
                            }
                        }
                    });
                });
            });
            this.globalObserver.observe(document, {
                childList: true,
                subtree: true
            });
        } // Taken from jQuery `ready` function

        // Instantiate elements already present on the page
        if (document.readyState === 'complete' || document.readyState !== 'loading' && !document.documentElement.doScroll) {
            // Handle it asynchronously to allow scripts the opportunity to delay init
            window.setTimeout(this.initDOMLoadedElements);
        } else {
            document.addEventListener('DOMContentLoaded', this.initDOMLoadedElements);
            window.addEventListener('load', this.initDOMLoadedElements);
        }
    };

    // Helper function to retrieve options from element attributes
    SimpleBar.getElOptions = function getElOptions(el) {
        var options = Array.prototype.reduce.call(el.attributes, function (acc, attribute) {
        var option = attribute.name.match(/data-simplebar-(.+)/);

        if (option) {
            var key = option[1].replace(/\W+(.)/g, function (x, chr) {
                return chr.toUpperCase();
            });

            switch (attribute.value) {
                case 'true':
                    acc[key] = true;
                    break;

                case 'false':
                    acc[key] = false;
                    break;

                case undefined:
                    acc[key] = true;
                    break;

                default:
                    acc[key] = attribute.value;
            }
        }

        return acc;
        }, {});
        return options;
    };

    SimpleBar.removeObserver = function removeObserver() {
        this.globalObserver.disconnect();
    };

    SimpleBar.initDOMLoadedElements = function initDOMLoadedElements() {
            document.removeEventListener('DOMContentLoaded', this.initDOMLoadedElements);
            window.removeEventListener('load', this.initDOMLoadedElements);
            Array.prototype.forEach.call(document.querySelectorAll('[data-simplebar]'), function (el) {
            if (!el.SimpleBar) new SimpleBar(el, SimpleBar.getElOptions(el));
        });
    };

    SimpleBar.getOffset = function getOffset(el) {
        var rect = el.getBoundingClientRect();
        return {
            top: rect.top + (window.pageYOffset || document.documentElement.scrollTop),
            left: rect.left + (window.pageXOffset || document.documentElement.scrollLeft)
        };
    };

    //Extend the prototype
    var _proto = SimpleBar.prototype;

    _proto.init = function init() {
        // Save a reference to the instance, so we know this DOM node has already been instancied
        this.el.SimpleBar = this; // We stop here on server-side

        //**if (canUseDOM) {
            this.initDOM();
            this.scrollbarWidth = scrollbarWidth();
            this.recalculate();
            this.initListeners();
        //**}
    };

    _proto.initDOM = function initDOM() {
        var _this2 = this;

        // make sure this element doesn't have the elements yet
        if (Array.prototype.filter.call(this.el.children, function (child) {
            return child.classList.contains(_this2.classNames.wrapper);
        }).length) {
            // assume that element has his DOM already initiated
            this.wrapperEl = this.el.querySelector("." + this.classNames.wrapper);
            this.contentWrapperEl = this.el.querySelector("." + this.classNames.contentWrapper);
            this.offsetEl = this.el.querySelector("." + this.classNames.offset);
            this.maskEl = this.el.querySelector("." + this.classNames.mask);
            this.contentEl = this.el.querySelector("." + this.classNames.contentEl);
            this.placeholderEl = this.el.querySelector("." + this.classNames.placeholder);
            this.heightAutoObserverWrapperEl = this.el.querySelector("." + this.classNames.heightAutoObserverWrapperEl);
            this.heightAutoObserverEl = this.el.querySelector("." + this.classNames.heightAutoObserverEl);
            this.axis.x.track.el = this.el.querySelector("." + this.classNames.track + "." + this.classNames.horizontal);
            this.axis.y.track.el = this.el.querySelector("." + this.classNames.track + "." + this.classNames.vertical);
        } else {
            // Prepare DOM
            this.wrapperEl = document.createElement('div');
            this.contentWrapperEl = document.createElement('div');
            this.offsetEl = document.createElement('div');
            this.maskEl = document.createElement('div');
            this.contentEl = document.createElement('div');
            this.placeholderEl = document.createElement('div');
            this.heightAutoObserverWrapperEl = document.createElement('div');
            this.heightAutoObserverEl = document.createElement('div');
            this.wrapperEl.classList.add(this.classNames.wrapper);
            this.contentWrapperEl.classList.add(this.classNames.contentWrapper);
            this.offsetEl.classList.add(this.classNames.offset);
            this.maskEl.classList.add(this.classNames.mask);
            this.contentEl.classList.add(this.classNames.contentEl);
            this.placeholderEl.classList.add(this.classNames.placeholder);
            this.heightAutoObserverWrapperEl.classList.add(this.classNames.heightAutoObserverWrapperEl);
            this.heightAutoObserverEl.classList.add(this.classNames.heightAutoObserverEl);

            while (this.el.firstChild) {
                this.contentEl.appendChild(this.el.firstChild);
            }

            this.contentWrapperEl.appendChild(this.contentEl);
            this.offsetEl.appendChild(this.contentWrapperEl);
            this.maskEl.appendChild(this.offsetEl);
            this.heightAutoObserverWrapperEl.appendChild(this.heightAutoObserverEl);
            this.wrapperEl.appendChild(this.heightAutoObserverWrapperEl);
            this.wrapperEl.appendChild(this.maskEl);
            this.wrapperEl.appendChild(this.placeholderEl);
            this.el.appendChild(this.wrapperEl);
        }

        if (!this.axis.x.track.el || !this.axis.y.track.el) {
            var track = document.createElement('div');
            var scrollbar = document.createElement('div');
            track.classList.add(this.classNames.track);
            scrollbar.classList.add(this.classNames.scrollbar);
            track.appendChild(scrollbar);
            this.axis.x.track.el = track.cloneNode(true);
            this.axis.x.track.el.classList.add(this.classNames.horizontal);
            this.axis.y.track.el = track.cloneNode(true);
            this.axis.y.track.el.classList.add(this.classNames.vertical);
            this.el.appendChild(this.axis.x.track.el);
            this.el.appendChild(this.axis.y.track.el);
        }

        this.axis.x.scrollbar.el = this.axis.x.track.el.querySelector("." + this.classNames.scrollbar);
        this.axis.y.scrollbar.el = this.axis.y.track.el.querySelector("." + this.classNames.scrollbar);

        if (!this.options.autoHide) {
            this.axis.x.scrollbar.el.classList.add(this.classNames.visible);
            this.axis.y.scrollbar.el.classList.add(this.classNames.visible);
        }

        this.el.setAttribute('data-simplebar', 'init');
    };

    _proto.initListeners = function initListeners() {
        var _this3 = this;

        // Event listeners
        if (this.options.autoHide) {
            this.el.addEventListener('mouseenter', this.onMouseEnter);
        }

        ['mousedown', 'click', 'dblclick', 'touchstart', 'touchend', 'touchmove'].forEach(function (e) {
            _this3.el.addEventListener(e, _this3.onPointerEvent, true);
        });
        this.el.addEventListener('mousemove', this.onMouseMove);
        this.el.addEventListener('mouseleave', this.onMouseLeave);
        this.contentWrapperEl.addEventListener('scroll', this.onScroll); // Browser zoom triggers a window resize

        window.addEventListener('resize', this.onWindowResize);
        this.resizeObserver = new ResizeObserver(this.recalculate);
        this.resizeObserver.observe(this.el);
        this.resizeObserver.observe(this.contentEl);
    };

    _proto.recalculate = function recalculate() {
        var isHeightAuto = this.heightAutoObserverEl.offsetHeight <= 1;
        var isWidthAuto = this.heightAutoObserverEl.offsetWidth <= 1;
        this.elStyles = window.getComputedStyle(this.el);
        this.isRtl = this.elStyles.direction === 'rtl';
        this.contentEl.style.padding = this.elStyles.paddingTop + " " + this.elStyles.paddingRight + " " + this.elStyles.paddingBottom + " " + this.elStyles.paddingLeft;
        this.wrapperEl.style.margin = "-" + this.elStyles.paddingTop + " -" + this.elStyles.paddingRight + " -" + this.elStyles.paddingBottom + " -" + this.elStyles.paddingLeft;
        this.contentWrapperEl.style.height = isHeightAuto ? 'auto' : '100%'; // Determine placeholder size

        this.placeholderEl.style.width = isWidthAuto ? this.contentEl.offsetWidth + "px" : 'auto';
        this.placeholderEl.style.height = this.contentEl.scrollHeight + "px"; // Set isOverflowing to false if scrollbar is not necessary (content is shorter than offset)

        this.axis.x.isOverflowing = this.contentWrapperEl.scrollWidth > this.contentWrapperEl.offsetWidth;
        this.axis.y.isOverflowing = this.contentWrapperEl.scrollHeight > this.contentWrapperEl.offsetHeight; // Set isOverflowing to false if user explicitely set hidden overflow

        this.axis.x.isOverflowing = this.elStyles.overflowX === 'hidden' ? false : this.axis.x.isOverflowing;
        this.axis.y.isOverflowing = this.elStyles.overflowY === 'hidden' ? false : this.axis.y.isOverflowing;
        this.axis.x.forceVisible = this.options.forceVisible === 'x' || this.options.forceVisible === true;
        this.axis.y.forceVisible = this.options.forceVisible === 'y' || this.options.forceVisible === true;
        this.hideNativeScrollbar();
        this.axis.x.track.rect = this.axis.x.track.el.getBoundingClientRect();
        this.axis.y.track.rect = this.axis.y.track.el.getBoundingClientRect();
        this.axis.x.scrollbar.size = this.getScrollbarSize('x');
        this.axis.y.scrollbar.size = this.getScrollbarSize('y');
        this.axis.x.scrollbar.el.style.width = this.axis.x.scrollbar.size + "px";
        this.axis.y.scrollbar.el.style.height = this.axis.y.scrollbar.size + "px";
        this.positionScrollbar('x');
        this.positionScrollbar('y');
        this.toggleTrackVisibility('x');
        this.toggleTrackVisibility('y');
    };

    /**
    * Calculate scrollbar size
    */
    _proto.getScrollbarSize = function getScrollbarSize(axis) {
        if (axis === void 0) {
            axis = 'y';
        }

        var contentSize = this.scrollbarWidth ? this.contentWrapperEl[this.axis[axis].scrollSizeAttr] : this.contentWrapperEl[this.axis[axis].scrollSizeAttr] - this.minScrollbarWidth;
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
    };

    _proto.positionScrollbar = function positionScrollbar(axis) {
        if (axis === void 0) {
            axis = 'y';
        }

        var contentSize = this.contentWrapperEl[this.axis[axis].scrollSizeAttr];
        var trackSize = this.axis[axis].track.rect[this.axis[axis].sizeAttr];
        var hostSize = parseInt(this.elStyles[this.axis[axis].sizeAttr], 10);
        var scrollbar = this.axis[axis].scrollbar;
        var scrollOffset = this.contentWrapperEl[this.axis[axis].scrollOffsetAttr];
        scrollOffset = axis === 'x' && this.isRtl && SimpleBar.getRtlHelpers().isRtlScrollingInverted ? -scrollOffset : scrollOffset;
        var scrollPourcent = scrollOffset / (contentSize - hostSize);
        var handleOffset = ~~((trackSize - scrollbar.size) * scrollPourcent);
        handleOffset = axis === 'x' && this.isRtl && SimpleBar.getRtlHelpers().isRtlScrollbarInverted ? handleOffset + (trackSize - scrollbar.size) : handleOffset;
        scrollbar.el.style.transform = axis === 'x' ? "translate3d(" + handleOffset + "px, 0, 0)" : "translate3d(0, " + handleOffset + "px, 0)";
    };

    _proto.toggleTrackVisibility = function toggleTrackVisibility(axis) {
        if (axis === void 0) {
            axis = 'y';
        }

        var track = this.axis[axis].track.el;
        var scrollbar = this.axis[axis].scrollbar.el;

        if (this.axis[axis].isOverflowing || this.axis[axis].forceVisible) {
            track.style.visibility = 'visible';
            this.contentWrapperEl.style[this.axis[axis].overflowAttr] = 'scroll';
        } else {
            track.style.visibility = 'hidden';
            this.contentWrapperEl.style[this.axis[axis].overflowAttr] = 'hidden';
        } // Even if forceVisible is enabled, scrollbar itself should be hidden


        if (this.axis[axis].isOverflowing) {
            scrollbar.style.display = 'block';
        } else {
            scrollbar.style.display = 'none';
        }
    };

    _proto.hideNativeScrollbar = function hideNativeScrollbar() {
        this.offsetEl.style[this.isRtl ? 'left' : 'right'] = this.axis.y.isOverflowing || this.axis.y.forceVisible ? "-" + (this.scrollbarWidth || this.minScrollbarWidth) + "px" : 0;
        this.offsetEl.style.bottom = this.axis.x.isOverflowing || this.axis.x.forceVisible ? "-" + (this.scrollbarWidth || this.minScrollbarWidth) + "px" : 0; // If floating scrollbar

        if (!this.scrollbarWidth) {
            var paddingDirection = [this.isRtl ? 'paddingLeft' : 'paddingRight'];
            this.contentWrapperEl.style[paddingDirection] = this.axis.y.isOverflowing || this.axis.y.forceVisible ? this.minScrollbarWidth + "px" : 0;
            this.contentWrapperEl.style.paddingBottom = this.axis.x.isOverflowing || this.axis.x.forceVisible ? this.minScrollbarWidth + "px" : 0;
        }
    };

    /**
    * On scroll event handling
    */
    _proto.onMouseMoveForAxis = function onMouseMoveForAxis(axis) {
        if (axis === void 0) {
            axis = 'y';
        }

        this.axis[axis].track.rect = this.axis[axis].track.el.getBoundingClientRect();
        this.axis[axis].scrollbar.rect = this.axis[axis].scrollbar.el.getBoundingClientRect();
        var isWithinScrollbarBoundsX = this.isWithinBounds(this.axis[axis].scrollbar.rect);

        if (isWithinScrollbarBoundsX) {
            this.axis[axis].scrollbar.el.classList.add(this.classNames.hover);
        } else {
            this.axis[axis].scrollbar.el.classList.remove(this.classNames.hover);
        }

        if (this.isWithinBounds(this.axis[axis].track.rect)) {
            this.showScrollbar(axis);
            this.axis[axis].track.el.classList.add(this.classNames.hover);
        } else {
            this.axis[axis].track.el.classList.remove(this.classNames.hover);
        }
    };

    _proto.onMouseLeaveForAxis = function onMouseLeaveForAxis(axis) {
        if (axis === void 0) {
            axis = 'y';
        }

        this.axis[axis].track.el.classList.remove(this.classNames.hover);
        this.axis[axis].scrollbar.el.classList.remove(this.classNames.hover);
    };

    /**
    * Show scrollbar
    */
    _proto.showScrollbar = function showScrollbar(axis) {
        if (axis === void 0) {
            axis = 'y';
        }

        var scrollbar = this.axis[axis].scrollbar.el;

        if (!this.axis[axis].isVisible) {
            scrollbar.classList.add(this.classNames.visible);
            this.axis[axis].isVisible = true;
        }

        if (this.options.autoHide) {
            this.hideScrollbars();
        }
    };


    /**
    * Hide Scrollbar
    */

    /**
    * on scrollbar handle drag movement starts
    */
    _proto.onDragStart = function onDragStart(e, axis) {
        if (axis === void 0) {
            axis = 'y';
        }

        var scrollbar = this.axis[axis].scrollbar.el; // Measure how far the user's mouse is from the top of the scrollbar drag handle.

        var eventOffset = axis === 'y' ? e.pageY : e.pageX;
        this.axis[axis].dragOffset = eventOffset - scrollbar.getBoundingClientRect()[this.axis[axis].offsetAttr];
        this.draggedAxis = axis;
        this.el.classList.add(this.classNames.dragging);
        document.addEventListener('mousemove', this.drag, true);
        document.addEventListener('mouseup', this.onEndDrag, true);

        if (this.removePreventClickId === null) {
            document.addEventListener('click', this.preventClick, true);
            document.addEventListener('dblclick', this.preventClick, true);
        } else {
            window.clearTimeout(this.removePreventClickId);
            this.removePreventClickId = null;
        }
    };


    /**
    * Drag scrollbar handle
    */

    /**
    * Getter for content element
    */
    _proto.getContentElement = function getContentElement() {
        return this.contentEl;
    };

    /**
    * Getter for original scrolling element
    */
    _proto.getScrollElement = function getScrollElement() {
        return this.contentWrapperEl;
    };

    _proto.removeListeners = function removeListeners() {
        var _this4 = this;

        // Event listeners
        if (this.options.autoHide) {
            this.el.removeEventListener('mouseenter', this.onMouseEnter);
        }

        ['mousedown', 'click', 'dblclick', 'touchstart', 'touchend', 'touchmove'].forEach(function (e) {
            _this4.el.removeEventListener(e, _this4.onPointerEvent);
        });
        this.el.removeEventListener('mousemove', this.onMouseMove);
        this.el.removeEventListener('mouseleave', this.onMouseLeave);
        this.contentWrapperEl.removeEventListener('scroll', this.onScroll);
        window.removeEventListener('resize', this.onWindowResize);
        this.mutationObserver && this.mutationObserver.disconnect();
        this.resizeObserver.disconnect(); // Cancel all debounced functions

//        this.recalculate.cancel();
//        this.onMouseMove.cancel();
//        this.hideScrollbars.cancel();
//        this.onWindowResize.cancel();
    };

    /**
    * UnMount mutation observer and delete SimpleBar instance from DOM element
    */
    _proto.unMount = function unMount() {
        this.removeListeners();
        this.el.SimpleBar = null;
    };

    /**
    * Recursively walks up the parent nodes looking for this.el
    */
    _proto.isChildNode = function isChildNode(el) {
        if (el === null) return false;
        if (el === this.el) return true;
        return this.isChildNode(el.parentNode);
    };

    /**
    * Check if mouse is within bounds
    */
    _proto.isWithinBounds = function isWithinBounds(bbox) {
        return this.mouseX >= bbox.left && this.mouseX <= bbox.left + bbox.width && this.mouseY >= bbox.top && this.mouseY <= bbox.top + bbox.height;
    };


//SLET NEDENFOR************************************************************************************
//SLET NEDENFOR************************************************************************************
//SLET NEDENFOR************************************************************************************

        //Extend the prototype
/*
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


        //**********************************
        //    Drag scrollbar handle
        //**********************************
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
*/
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
        this.simplebar = new window.SimpleBar(this.get(0), options);


        this.scrollbarContainer = $(this.simplebar.getContentElement());

        this.innerContainer = this.scrollbarContainer;//$('<div/>').appendTo(this.scrollbarContainer);

        //Update scrollbar when container or content change size
        var _sbUpdate = $.proxy( this._sbUpdate, this );
        this.scrollbarContainer.resize( _sbUpdate );
        this.innerContainer.resize( _sbUpdate );

        return this.innerContainer;
    };

}(jQuery, this, document));