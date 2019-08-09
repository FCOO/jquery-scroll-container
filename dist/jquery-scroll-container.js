/****************************************************************************
    jquery-scroll-container.js,

    (c) 2017, FCOO

    https://github.com/FCOO/jquery-scroll-container
    https://github.com/FCOO

****************************************************************************/

(function ($, window, document/*, undefined*/) {
    "use strict";

    //TODO var isIE11 = !!window.MSInputMethodContext && !!document.documentMode;

    if ( $('html').hasClass('touchevents') || $('html').hasClass('no-touchevents') )
        ;    //Modernizr (or someone else) has set the correct class
    else
        //Default: No touch
        $('html').addClass('no-touchevents');

    var scrollbarWidth = 0;
    function getScrollbarWidth() {
        if (typeof document === 'undefined')
            return 0;

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

    //Extend $.fn with scrollIntoView
    $.fn.extend({
        scrollIntoView: function( arg ){
            if (this.get(0).scrollIntoView)
                this.get(0).scrollIntoView( arg );
        }
    });

    var scrollbarOptions = {
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

        direction: 'vertical', //["vertical"|"horizontal"|"both"] (default: "vertical")

        defaultScrollbarOnTouch: false   //If true and the browser support touchevents => use simple version using the browsers default scrollbar
    };


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


    //addScrollBar( direction, defaultScrollbarOnTouch ) or addScrollBar( options )
    $.fn.addScrollbar = function( options, defaultScrollbarOnTouch ){
        var _this = this;
        if ($.type( options ) == "string")
            options = {
                direction: options,
                defaultScrollbarOnTouch: defaultScrollbarOnTouch
            };

        //Update options
        options = $.extend( scrollbarOptions, options || {} );

        var observer,
            isVertical   = (options.direction == 'vertical'),
            isHorizontal = (options.direction == 'horizontal'),
            isBoth       = (options.direction == 'both'),
            directionClassName = isHorizontal ? 'jq-scroll-container-horizontal' :
                                 isVertical   ? 'jq-scroll-container-vertical' :
                                 isBoth       ? 'jq-scroll-container-both' :
                                                '';
        options.suppressScrollX = isVertical;
        options.suppressScrollY = isHorizontal;

        this._jscScrollOffset = isVertical ? options.scrollYMarginOffset :
                                isVertical ? options.scrollXMarginOffset :
                                0;

        function updateScrollClass(){
            _this._jscUpdateScrollShadowClass(isVertical);
        }

        if (!options.defaultScrollbarOnTouch || $('html').hasClass('no-touchevents')){
            //no-touch browser => use perfect.scrollbar

            this.addClass( directionClassName );

            //Create perfect.scrollbar
            this.perfectScrollbar = new window.PerfectScrollbar(this.get(0), options );

            //Add class ps__rail to both x- and y-rail
            $(this.perfectScrollbar.scrollbarXRail).addClass('ps__rail');
            $(this.perfectScrollbar.scrollbarYRail).addClass('ps__rail');

            //Add class ps__thumb to both x- and y-thumb
            $(this.perfectScrollbar.scrollbarX).addClass('ps__thumb');
            $(this.perfectScrollbar.scrollbarY).addClass('ps__thumb');

            //Add inner container to cache resize when adding/removing elements from container
            this.scrollbarContainer =
                $('<div/>')
                    .addClass('jq-scroll-container')
                    .appendTo( this );


            //Update scroll-shadow when scrolling - not working in IE11!
            if (!isBoth)
                this.on('ps-scroll-'+(isVertical ? 'y' : 'x'), updateScrollClass );

            //Update scrollbar when container or content change size or elements are added to/removed from the container
            var psUpdate = function(){
                _this.perfectScrollbar.update();
                updateScrollClass();
            };
            this.resize( psUpdate );
            this.scrollbarContainer.resize( psUpdate );

            observer = new window.MutationObserver( psUpdate );
            observer.observe(this.scrollbarContainer.get(0), { attributes: true, childList: true, subtree: true });

            return this.scrollbarContainer;
        }
        else {
            //Use default browser scrollbar
//            this._jscScrollOffset = 1;
            scrollbarWidth = scrollbarWidth || getScrollbarWidth();
            this
                .addClass('jq-scroll-container')
                .addClass( directionClassName )
                .css(isVertical ?
                        {'padding-right': scrollbarWidth+'px', 'padding-left': scrollbarWidth+'px'} :
                        {'padding-bottom': scrollbarWidth+'px'}
                );

            this.resize( updateScrollClass );
            this.on( 'scroll', updateScrollClass );

            observer = new window.MutationObserver( updateScrollClass );
            observer.observe(this.get(0), { attributes: true, childList: true, subtree: true });

            updateScrollClass();

this.get(0).scrollTop = 0;
            return this;
        }

    };
}(jQuery, this, document));