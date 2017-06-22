/****************************************************************************
    jquery-scroll-container.js, 

    (c) 2017, FCOO

    https://github.com/FCOO/jquery-scroll-container
    https://github.com/FCOO

****************************************************************************/

(function ($ /*, window, document, undefined*/) {
    "use strict";

    
    function adjust( scroll ){
        scroll.maxScroll = Math.floor( scroll.maxScroll );
        scroll.scroll = Math.floor( scroll.scroll );
        scroll.size = Math.floor( scroll.size );
        scroll.visible = Math.floor( scroll.visible );
        return scroll;
    }


    function scrollbar_onScroll( scrollY, scrollX ){ 
        scrollY = adjust( scrollY );
        scrollX = adjust( scrollX );
        if (this.options.isVertical)
            this.wrapper
                .toggleClass('shadow-top',    scrollY.scroll > 0   )
                .toggleClass('shadow-bottom', scrollY.scroll < scrollY.maxScroll );

        if (this.options.isHorizontal)
            this.wrapper
            .toggleClass('shadow-left',  scrollX.scroll > 0   )
            .toggleClass('shadow-right', scrollX.scroll < scrollX.maxScroll );
    }
    

    function mousewheel( event, delta ){
        this.container.scrollLeft(
            this.container.scrollLeft() - delta*this.options.scrollStep
        );
        if (this.options.disableBodyScroll)
            event.preventDefault();
    }


    var scrollbarOptions = {
            //autoScrollSize [true|false] (default: true) //automatically calculate scrollbar size depending on container/content size
            //autoUpdate [true|false] (default: true)   //automatically update scrollbar if container/content size is changed

            //disableBodyScroll [true|false] (default: false) //if this option is enabled and the mouse is over the scrollable container, the main page won't be scrolled
            disableBodyScroll: true,

            //duration [ms] (default: 200)  //scroll speed duration when the mouse is over scrollbar (scroll emulating mode)
            //ignoreMobile [true|false] (default: false)    //do not initialize custom scrollbars on mobile devices
            //ignoreOverlay [true|false] (default: false)   //do not initialize custom scrollbars in browsers when native scrollbars overlay content (Mac OS, mobile devices, etc...)
            //scrollStep [px] (default: 30) //scroll step when the mouse is over the scrollbar (scroll emulating mode)
            //showArrows [true|false] (default: false)  //add a class to show scrollbar arrows in the advanced scrollbar
            //stepScrolling [true|false] (default: true)    //emulate step scrolling on mousedown over scrollbar
            //scrollx [string|element] (default: simple)    //simple, advanced, HTML or jQuery element for horizontal scrollbar
            //scrolly [string|element] (default: simple)    //simple, advanced, HTML or jQuery element for vertical scrollbar
            //onDestroy [function] (default: null)  //callback function when scrollbar is destroyed

            //onInit [function] (default: null) //callback function when scrollbar is initialized at the first time
            onInit: function(){
                //Add horizontal scroll with mouse-wheel
                if (this.options.isHorizontal)
                    this.wrapper.on( 'mousewheel'+ this.namespace,  $.proxy( mousewheel, this ) );

                this.wrapper
                    //Set direction class
                    .toggleClass( 'scrollbar-horizontal', this.options.isHorizontal )
                    .toggleClass( 'scrollbar-vertical', this.options.isVertical )
                    .toggleClass( 'scrollbar-both', this.options.isBoth )

                    //Call init when parent element is updated
                    .parent().resize( $.proxy( this.init, this ) );
            },

            //onScroll [function] (default: null)   //callback function when container is scrolled
            onScroll: scrollbar_onScroll, 

            //onUpdate [function] (default: null)   //callback function before scrollbars size is calculated

            direction: 'vertical' //["vertical"|"horizontal"|"both"] (default: "vertical")
        };



    $.fn.addScrollbar = function( options ){

        this.addClass( 'scrollbar-inner' );

        this.scrollbarContainer = 
            $('<div/>')
                .addClass('jquery-scroll-container')
                .appendTo( this );

        options = $.extend( scrollbarOptions, options || {} );
        options.isVertical   = (options.direction == 'vertical');
        options.isHorizontal = (options.direction == 'horizontal');
        options.isBoth       = (options.direction == 'both');

        this.scrollbar( options );

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