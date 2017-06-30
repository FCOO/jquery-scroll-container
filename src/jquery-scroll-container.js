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


    //Extend $.fn with internal scrollbar methods
    $.fn.extend({
        _psUpdate: function(){
            this.perfectScrollbar('update');
            this._psUpdateShadow();
        },

        _psSetShadow: function( $rail, postfix, on ){
            $rail.toggleClass('shadow-'+postfix, on );
        },
        _psSetXShadow: function( postfix, on ){
            this._psSetShadow( this.scrollbarXRail , postfix, on );
        },
        _psSetYShadow: function( postfix, on ){
            this._psSetShadow( this.scrollbarYRail , postfix, on );
        },
        _psUpdateShadow: function(){
            
            this._psSetXShadow( 'left',   this.scrollLeft() > 0 ); 
            this._psSetXShadow( 'right',  this.scrollLeft() < (this.get(0).scrollWidth - this.get(0).clientWidth) ); 

            this._psSetYShadow( 'top',    this.scrollTop() > 0 ); 
            this._psSetYShadow( 'bottom', this.scrollTop() < (this.get(0).scrollHeight - this.get(0).clientHeight) ); 

        }

    });
    
    var scrollbarOptions = {
        //handlers              //It is a list of handlers to use to scroll the element. Default: ['click-rail', 'drag-scrollbar', 'keyboard', 'wheel', 'touch'] Disabled by default: 'selection'
        //wheelSpeed            //The scroll speed applied to mousewheel event. Default: 1
        //wheelPropagation      //If this option is true, when the scroll reaches the end of the side, mousewheel event will be propagated to parent element. Default: false
        //swipePropagation      //If this option is true, when the scroll reaches the end of the side, touch scrolling will be propagated to parent element. Default: true
        //swipeEasing           //If this option is true, swipe scrolling will be eased. Default: true
        //minScrollbarLength    //When set to an integer value, the thumb part of the scrollbar will not shrink below that number of pixels. Default: null
        //maxScrollbarLength    //When set to an integer value, the thumb part of the scrollbar will not expand over that number of pixels. Default: null
        //useBothWheelAxes      //When set to true, and only one (vertical or horizontal) scrollbar is visible then both vertical and horizontal scrolling will affect the scrollbar. Default: false
        //suppressScrollX       //When set to true, the scroll bar in X axis will not be available, regardless of the content width. Default: false
        //suppressScrollY       //When set to true, the scroll bar in Y axis will not be available, regardless of the content height. Default: false
        //scrollXMarginOffset   //The number of pixels the content width can surpass the container width without enabling the X axis scroll bar. Allows some "wiggle room" or "offset break", so that X axis scroll bar is not enabled just because of a few pixels. Default: 0
        //scrollYMarginOffset   //The number of pixels the content height can surpass the container height without enabling the Y axis scroll bar. Allows some "wiggle room" or "offset break", so that Y axis scroll bar is not enabled just because of a few pixels.Default: 0

        useBothWheelAxes   : true, //=> Mousewheel works in both horizontal and vertical scroll
        scrollXMarginOffset: 1,    //IE11 apears to work betten when == 1
        scrollYMarginOffset: 1,    //                --||--
            
        direction: 'vertical' //["vertical"|"horizontal"|"both"] (default: "vertical")
    };



    $.fn.addScrollbar = function( options ){
        //Update options
        options = $.extend( scrollbarOptions, options || {} );
        options.isVertical   = (options.direction == 'vertical');
        options.isHorizontal = (options.direction == 'horizontal');
        options.isBoth       = (options.direction == 'both');

        options.suppressScrollX = options.isVertical;
        options.suppressScrollY = options.isHorizontal;

        this.psOptions = options;
        this
            //Set direction class
            .toggleClass( 'scrollbar-horizontal', this.psOptions.isHorizontal )
            .toggleClass( 'scrollbar-vertical',   this.psOptions.isVertical   )
            .toggleClass( 'scrollbar-both',       this.psOptions.isBoth       );

        //Create perfect.scrollbar
        this.perfectScrollbar( options );

        //Find the rail for x and y scroll
        this.scrollbarXRail = this.find('.ps__scrollbar-x-rail');
        this.scrollbarYRail = this.find('.ps__scrollbar-y-rail');

        //Add background for the bar
        this.scrollbarXRail.prepend( $('<div/>').addClass('ps__scrollbar-x-bg') );
        this.scrollbarYRail.prepend( $('<div/>').addClass('ps__scrollbar-y-bg') );
        
       
        //Assume the the content is scrolled to the top/left 
        this._psSetXShadow('right',   true  ); 
        this._psSetYShadow( 'bottom', true  );

        // Adding event to update shadows
        this.on('ps-scroll-y ps-scroll-x', $.proxy( this._psUpdateShadow, this ) );
        
        
        //Add inner container to cache resize when adding/removing elements from container
        this.scrollbarContainer = 
            $('<div/>')
                .addClass('jquery-scroll-container')
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


    
    //Initialize/ready 
    $(function() { 
    }); 



}(jQuery, this, document));