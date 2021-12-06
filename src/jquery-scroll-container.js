/****************************************************************************
    jquery-scroll-container.js,

    (c) 2017, FCOO

    https://github.com/FCOO/jquery-scroll-container
    https://github.com/FCOO

****************************************************************************/

(function ($, window, document/*, undefined*/) {
    "use strict";

    var isIE11 = !!window.MSInputMethodContext && !!document.documentMode;

    if ( $('html').hasClass('touchevents') || $('html').hasClass('no-touchevents') )
        ;    //Modernizr (or someone else) has set the correct class
    else
        //Default: No touch
        $('html').addClass('no-touchevents');

    //Create namespace
    var ns = window.JqueryScrollContainer = window.JqueryScrollContainer || {};

    //Get the width of default scrollbar
    function getAnyScrollbarWidth(className){
        if (typeof document === 'undefined')
            return 0;

        var body = document.body,
            box = document.createElement('div'),
            boxStyle = box.style;

        box.className = className;
        boxStyle.position = 'fixed';
        boxStyle.left = 0;
        boxStyle.visibility = 'hidden';
        boxStyle.overflowY = 'scroll';
        body.appendChild(box);
        var result = box.getBoundingClientRect().right;
        body.removeChild(box);

        return result;
    }


    var scrollbarWidth = null;
    window.getScrollbarWidth = function() {
        if (scrollbarWidth === null){
            if (typeof document === 'undefined')
                return 0;
            scrollbarWidth = getAnyScrollbarWidth('jq-scroll-default');
        }
        return scrollbarWidth;
    };


    /**************************************************
    Extend PerfectScrollbar.prototype with two methods
    .lock(): Lock the scroll and prevents (allmost) all scroll
    .unlock(): Unlock
    Also overwrite onScroll to handle lock
    **************************************************/
    $.extend(window.PerfectScrollbar.prototype, {

        lock: function(){
            if (this.isLocked)
                return;
            this.isLocked = true;
            this.lockedScrollTop = this.element.scrollTop;
            this.lockedScrollLeft = this.element.scrollLeft;
        },

        unlock: function(){
            if (!this.isLocked)
                return;
            this.element.scrollTop = this.lockedScrollTop;
            this.element.scrollLeft = this.lockedScrollLeft;
            this.update();
            this.isLocked = false;
        },
    });

    window.PerfectScrollbar.prototype.onScroll = function (onScroll) {
		return function () {
            if (this.isLocked){
                this.element.scrollTop = this.lockedScrollTop;
                this.element.scrollLeft = this.lockedScrollLeft;
            }
            //Original function/method
            return onScroll.apply(this, arguments);
		};
	} (window.PerfectScrollbar.prototype.onScroll);



    //Extend $.fn with scrollIntoView
    $.fn.extend({
        scrollIntoView: function( arg ){
            if (this.get(0).scrollIntoView)
                this.get(0).scrollIntoView( arg );
        }
    });

    ns.scrollbarOptions = {
        //handlers              //It is a list of handlers to use to scroll the element. Default: ['click-rail', 'drag-scrollbar', 'keyboard', 'wheel', 'touch'] Disabled by default: 'selection'
        //wheelSpeed            //The scroll speed applied to mousewheel event. Default: 1
        //wheelPropagation      //If this option is true, when the scroll reaches the end of the side, mousewheel event will be propagated to parent element. Default: false
        //swipeEasing           //If this option is true, swipe scrolling will be eased. Default: true
        //minScrollbarLength    //When set to an integer value, the thumb part of the scrollbar will not shrink below that number of pixels. Default: null
        //maxScrollbarLength    //When set to an integer value, the thumb part of the scrollbar will not expand over that number of pixels. Default: null
        //scrollingThreshold    //This sets threashold for ps--scrolling-x and ps--scrolling-y classes to remain. In the default CSS, they make scrollbars shown regardless of hover state. The unit is millisecond. Default: 1000
        //useBothWheelAxes      //When set to true, and only one (vertical or horizontal) scrollbar is visible then both vertical and horizontal scrolling will affect the scrollbar. Default: false
        //suppressScrollX       //When set to true, the scroll bar in X axis will not be available, regardless of the content width. Default: false
        //suppressScrollY       //When set to true, the scroll bar in Y axis will not be available, regardless of the content height. Default: false
        //scrollXMarginOffset   //The number of pixels the content width can surpass the container width without enabling the X axis scroll bar. Allows some "wiggle room" or "offset break", so that X axis scroll bar is not enabled just because of a few pixels. Default: 0
        //scrollYMarginOffset   //The number of pixels the content height can surpass the container height without enabling the Y axis scroll bar. Allows some "wiggle room" or "offset break", so that Y axis scroll bar is not enabled just because of a few pixels.Default: 0


        minScrollbarLength : 16,
        scrollingThreshold: 0,  //Using css transition to do the job

        useBothWheelAxes   : true, //=> Mousewheel works in both horizontal and vertical scroll
        scrollXMarginOffset: 1,    //IE11 apears to work betten when == 1. TODO: Should only be 1 for Edge and IE11
        scrollYMarginOffset: 1,    //                --||--

        direction       : 'vertical', //["vertical"|"horizontal"|"both"] (default: "vertical")
        contentClassName: '',         //Class-name added to the inner content-container

        defaultScrollbarOnTouch: false,      //If true and the browser support touchevents => use simple version using the browsers default scrollbar
        forceDefaultScrollbar  : false,      //If true => use simple version using the browsers default scrollbar (regardless of defaultScrollbarOnTouch and touchevents-support)

        adjustPadding          : 'scroll',   //['scroll', 'left', 'both', none']. Defines witch 'side(s)' that will have padding adjusted:
                                             //  'left'  : Only for direction: 'vertical': The paddingLeft of the container is set equal to the width of the scrollbar
                                             //  'scroll': Only when using browser default scrollbar: If the width of the default scrollbar > 0 => always have padding == scrollbar-width (also when no scrollbar is present)
                                             //  'both'  : As 'left' and 'scroll'
                                             //  'none'  : No adjustment beside the scrollbar when using perfect-scrollbar
        //hasTouchEvents: `true` if the browser supports touch-events and the scroll should use default scroll
        hasTouchEvents: function(){ return $('html').hasClass('touchevents'); }
    };


    //ns.update = Test if the browser supports css for scrollbars and sets the class-name for html to use jquery-scroll-container it needed
    ns.update = function(){
        if (getAnyScrollbarWidth('jq-scroll-test-123') != 123) return;

        var addScrollbarClassName,
            isTouch = $.isFunction(ns.scrollbarOptions.hasTouchEvents) ? ns.scrollbarOptions.hasTouchEvents() : ns.scrollbarOptions.hasTouchEvents;

        if (isTouch)
            //Use scrollbar-classes if touch and not use browser default scrollbar on touch devices
            addScrollbarClassName = !ns.scrollbarOptions.defaultScrollbarOnTouch;
        else {
            //Always use default scrollbar and scrollbar-classes on desktop (no-touch)
            addScrollbarClassName = true;
            ns.scrollbarOptions.forceDefaultScrollbar = true;
        }
        $('html').toggleClass('jq-scroll-default-css', !!addScrollbarClassName);
    };

    ns.update();



    //_jscUpdateScrollShadowClass: update the classNames setting the scroll-shadow
    $.fn._jscUpdateScrollShadowClass = function( isVertical ){
        var elem = this.get(0),
            hasScroll, position;


        if (isVertical){
            hasScroll = elem.scrollHeight > (elem.clientHeight + this._jscScrollOffset);
            position = elem.scrollTop <= 0 ? 'start' :
                       elem.scrollTop >= elem.scrollHeight - elem.clientHeight ? 'end' :
                       null;
        }
        else {
            hasScroll = elem.scrollWidth >= (elem.clientWidth + this._jscScrollOffset);
            position = elem.scrollLeft <= 0 ? 'start' :
                       elem.scrollLeft >= elem.scrollWidth - elem.clientWidth ? 'end' :
                       null;
        }

        this
            .modernizrToggle('scroll-at-start', (position == 'start') || !hasScroll)
            .modernizrToggle('scroll-at-end', (position == 'end') || !hasScroll);
    };

    /**************************************************
    Extend jQuery-element with tree new methods
    .addScrollbar( direction or options )
    .lockScrollbar()
    .unlockScrollbar()
    **************************************************/

    //addScrollbar( direction ) or addScrollbar( options )
    $.fn.addScrollbar = function( options ){
        var _this = this;
        if ($.type( options ) == "string")
            options = {
                direction: options
            };

        //Update options
        options = $.extend( {},  ns.scrollbarOptions, options || {} );

        //Get return-values if options[id] is a function
        $.each(options, function(id, value){
            if ($.isFunction(value))
                options[id] = value();
        });

        var observer,
            isVertical   = (options.direction == 'vertical'),
            isHorizontal = (options.direction == 'horizontal'),
            isBoth       = (options.direction == 'both'),
            directionClassName = isHorizontal ? 'jq-scroll-container-horizontal' :
                                 isVertical   ? 'jq-scroll-container-vertical' :
                                 isBoth       ? 'jq-scroll-container-both' :
                                                '',
            adjustPaddingLeft   = isVertical && ($.inArray(options.adjustPadding, ['left', 'both']) >= 0),
            adjustPaddingScroll = $.inArray(options.adjustPadding, ['scroll', 'both']) >= 0;

        options.suppressScrollX = isVertical;
        options.suppressScrollY = isHorizontal;

        this._jscScrollOffset = isVertical ? options.scrollYMarginOffset :
                                isVertical ? options.scrollXMarginOffset :
                                0;

        function updateScrollClass(){
            _this._jscUpdateScrollShadowClass(isVertical);
        }

        //Add element to display scroll-shadow
        //TODO: Not working for horizontal scroll
//        if (!isBoth && !isIE11){
        if (isVertical && !isIE11){
            this.addClass('jq-scroll-container-shadow');
            $('<div/>')
                .addClass('jq-scroll-shadow top-left')
                .appendTo(this);
            $('<div/>')
                .addClass('jq-scroll-shadow bottom-right')
                .appendTo(this);
        }


        this.addClass( directionClassName );

        //Add inner container to hold content
        this.scrollbarContainer =
            $('<div/>')
                .addClass('jq-scroll-content')
                .addClass(options.contentClassName)
                .appendTo( this );

        var scrollEventName = '',
            onResizeFunc = null;

        if (options.forceDefaultScrollbar || (options.defaultScrollbarOnTouch && options.hasTouchEvents )) {
            //Use default browser scrollbar
            scrollbarWidth = scrollbarWidth || window.getScrollbarWidth();
            this.addClass('jq-scroll-default');

            if (adjustPaddingLeft)
                this.css('padding-left', scrollbarWidth+'px' );
            if (adjustPaddingScroll)
                this
                    .toggleClass('jq-scroll-adjust-padding', !!scrollbarWidth)
                    .css(isVertical ? 'padding-right' : 'padding-bottom', scrollbarWidth+'px');

            scrollEventName = 'scroll';
            onResizeFunc = updateScrollClass;
        }
        else {
            //no-touch browser OR force using perfect-scroll => use perfect.scrollbar
            this
                .toggleClass('jq-scroll-adjust-padding-left', adjustPaddingLeft)
                .modernizrToggle('touch', !!options.hasTouchEvents);

            //Create perfect.scrollbar
            this.perfectScrollbar = new window.PerfectScrollbar(this.get(0), options );

            //Add class ps__rail to both x- and y-rail
            $(this.perfectScrollbar.scrollbarXRail).addClass('ps__rail');
            $(this.perfectScrollbar.scrollbarYRail).addClass('ps__rail');

            //Add class ps__thumb to both x- and y-thumb
            $(this.perfectScrollbar.scrollbarX).addClass('ps__thumb');
            $(this.perfectScrollbar.scrollbarY).addClass('ps__thumb');

            scrollEventName = 'ps-scroll-'+(isVertical ? 'y' : 'x');
            onResizeFunc = function(){
                _this.perfectScrollbar.update();
                updateScrollClass();
            };

            //Save perfectScrollbar as data('perfectScrollbar') for both this and container
            this.data('perfectScrollbar', this.perfectScrollbar );
            this.scrollbarContainer.data('perfectScrollbar', this.perfectScrollbar );
        }

        //Update scroll-shadow when scrolling
        if (!isBoth)
            this.on(scrollEventName, updateScrollClass );

        //Update scrollbar when container or content change size or elements are added to/removed from the content-container
        this.resize( onResizeFunc );
        this.scrollbarContainer.resize( onResizeFunc );

        observer = new window.MutationObserver( onResizeFunc );
        observer.observe(this.scrollbarContainer.get(0), { attributes: true, childList: true, subtree: true });

        this.get(0).scrollTop = 0;

        return this.scrollbarContainer;
    };

    //$.fn.lockScrollbar
    $.fn.lockScrollbar = function(){
        var ps = this.data('perfectScrollbar');
        if (ps)
            ps.lock();
        return this;
    };

    //$.fn.unlockScrollbar
    $.fn.unlockScrollbar = function(){
        var ps = this.data('perfectScrollbar');
        if (ps)
            ps.unlock();
        return this;
    };

}(jQuery, this, document));