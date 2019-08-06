/****************************************************************************
    jquery-scroll-container.js,

    (c) 2017, FCOO

    https://github.com/FCOO/jquery-scroll-container
    https://github.com/FCOO

****************************************************************************/

(function ($, window/*, document, undefined*/) {
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


    //Extend $.fn with internal scrollbar methods
    $.fn.extend({
        _psUpdate: function(){
            this.perfectScrollbar.update();
        },
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
        scrollXMarginOffset: 1,    //IE11 apears to work betten when == 1
        scrollYMarginOffset: 1,    //                --||--

        direction: 'vertical' //["vertical"|"horizontal"|"both"] (default: "vertical")
    };

    $.fn.addScrollbar = function( options ){
        if ($.type( options ) == "string")
            options = {direction: options };

        //Update options
        options = $.extend( scrollbarOptions, options || {} );

        var isVertical   = (options.direction == 'vertical'),
            isHorizontal = (options.direction == 'horizontal'),
            isBoth       = (options.direction == 'both'),
            directionClassName = isHorizontal ? 'scrollbar-horizontal' :
                                 isVertical   ? 'scrollbar-vertical' :
                                 isBoth       ? 'scrollbar-both' :
                                                '';
        options.suppressScrollX = isVertical;
        options.suppressScrollY = isHorizontal;

        this.addClass( directionClassName );

        //Create perfect.scrollbar
        this.perfectScrollbar = new window.PerfectScrollbar(this.get(0), options );

        //Add class ps__rail to both x- and y-rail
        $(this.perfectScrollbar.scrollbarXRail).addClass('ps__rail');
        $(this.perfectScrollbar.scrollbarYRail).addClass('ps__rail');

        //Add class ps__thumb to both x- and y-thumb
        $(this.perfectScrollbar.scrollbarX).addClass('ps__thumb');
        $(this.perfectScrollbar.scrollbarY).addClass('ps__thumb');

console.log(this.perfectScrollbar);

        //Add inner container to cache resize when adding/removing elements from container
        this.scrollbarContainer =
            $('<div/>')
                .addClass('jquery-scroll-container')
//                .addClass(directionClassName)
                .appendTo( this );

        //Update scrollbar when container or content change size
        var _psUpdate = $.proxy( this._psUpdate, this );
        this.resize( _psUpdate );
        this.scrollbarContainer.resize( _psUpdate );

        return this.scrollbarContainer;
    };


    /**********************************************************************
    TODO: NEW METHODS
        //verticalScrollToElement
        this.verticalScrollToElement = function verticalScrollToElement(elem, options){
            elem = elem instanceof $ ? elem : $(elem);
            //Find the different relative positions and heights
            var topInContents = elem.position().top,                                   //The top-position in the hole contentens
                elemHeight    = elem.outerHeight(),                                    //The height of the element
                boxHeight     = this.find('.mCustomScrollBox ').outerHeight(),         //The height of the scrolling-box
                scrolledBy    = Math.abs(this.find('.mCSB_container').position().top), //Amount of scroll. >=0
                topInBox      = topInContents - scrolledBy,                            //The elements top-position relative to the top of the scroll-box. If <0 the elem is above the scroll-box top
                bottomInBox   = topInBox + elemHeight,                                 //The elements bottom-position relative to the top of the scroll-box. If >boxHeight the elems bottom is below the scroll-box bottom
                deltaScroll   = 0;                                                     //The change in total scroll

            if ((topInBox >= 0) && (bottomInBox <= boxHeight)){
                //Ok - The element is inside the box
            } else
                if (topInBox < 0){
                    //The elements top is above the top of the box => scroll element t top of box
                    deltaScroll = topInBox;
                } else {
                    //element-top is below box-top AND element-bottom is below box-bottom => scroll up so element-bottom is just inside the box, but no more than element-top is still inside the box
                    deltaScroll = bottomInBox - boxHeight;
                    if ((topInBox - deltaScroll) < 0){
                        deltaScroll += (topInBox - deltaScroll);
                    }
                }

            if (deltaScroll)
                this.mCustomScrollbar("scrollTo", scrolledBy + deltaScroll, {timeout:0, scrollInertia:0});
        };

        //verticalScrollElementToTop( elem ) - scroll elem to the top of the scroll-box. TODO

        //verticalScrollToTop
        this.verticalScrollToTop    = function verticalScrollToTop(options){ this.mCustomScrollbar("scrollTo", 'top', options); };
        //verticalScrollToBottom
        this.verticalScrollToBottom = function verticalScrollToBottom(options){ this.mCustomScrollbar("scrollTo", 'bottom', options);    };
        //verticalScrollAppend
        this.verticalScrollAppend   = function verticalScrollAppend( elem ){ this.find('.mCSB_container').append( elem ); };
        //verticalScrollPrepend
        this.verticalScrollPrepend  = function verticalScrollPrepend( elem ){ this.find('.mCSB_container').prepend( elem );    };

    **********************************************************************/

}(jQuery, this, document));