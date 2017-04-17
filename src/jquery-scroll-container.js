/****************************************************************************
    jquery-scroll-container.js, 

    (c) 2017, FCOO

    https://github.com/FCOO/jquery-scroll-container
    https://github.com/FCOO

****************************************************************************/

(function ($, window /*, document, undefined*/) {
    "use strict";
    
    //*****************************************************
    //updateScrollBoxShadow() - Update the container with class mCSB_shadowTop and mCSB_shadowBottom to show or hide shadow at the top and bottom
    function updateScrollBoxShadow(){ 
        var $this = $(this),
            showShadow = $this.find('.mCSB_container').height() > $this.find('.mCustomScrollBox').height(),
            scrollPct = this.mcs ? this.mcs.topPct : 0;
        $this
            .toggleClass('mCSB_shadowTop',    showShadow && (scrollPct > 0)   )
            .toggleClass('mCSB_shadowBottom', showShadow && (scrollPct < 100) );

    }

    //*****************************************************
    //
    function updateScrollContainer_from_mCustomScrollbar(){ 
        $(this).parent()._updateScrollContainer();
    }

    function updateScrollContainer_from_this(){ 
        $(this)._updateScrollContainer();
    }

    //*****************************************************
    //$.fn._updateScrollContainer - updates the size of the scroll-container
    $.fn._updateScrollContainer = function(){
        var _scrollContainer = this.data('_scrollContainer'),
            options          = _scrollContainer.options,
            newHeight;

        if (options.size > 1)
            return this;

        if (options.size == 0){
            newHeight = this.innerHeight();
        }
        else{
            var refElementHeight = options.size * options.$refElement.height() - options.padding,
                containerHeight = _scrollContainer.$container.outerHeight();
            newHeight = Math.max( 0, Math.min( refElementHeight, containerHeight) );
        }
        _scrollContainer.$outerContainer.height( newHeight );

        return this;
    };
    

    //*****************************************************
    //scrollContainer as jQuery prototype
    $.fn.scrollContainer = function (options) {
        options = $.extend({
            //Default options
            theme        : "minimal-dark",
            scrollInertia: 100, //1000
//            snapAmount:42 <- used for scrolling tables with equal row-height

            size   : 0,
            padding: 0

        }, options || {} );

        this.css('overflow', 'hidden');

        var onSelectorChange = null; 

        //Sets the element that controls the scroll-box height
        if (options.size == 0){
            //Full size = fill the parent 100%: Update when this is resized
            this.resize( updateScrollContainer_from_this ); 
        }
        else
            if (options.size <= 1){
                //Relative size => update scroll-box when contents are changed or when refElement's height is changed
                //If refElement == null then it is window that is refElement 
                var onResizeFunc = $.proxy( this._updateScrollContainer, this );
                if (options.refElement){
                    options.$refElement = options.refElement instanceof $ ? options.refElement : $(options.refElement);                         
                    options.$refElement.resize( onResizeFunc );
                }
                else {
                    options.$refElement = $(window);
                    options.$refElement.resize( onResizeFunc );
                }
                
                onSelectorChange = updateScrollContainer_from_mCustomScrollbar;              
            }
            else {
                //Fixed size: Nothing here
            }

        var $outerContainer = 
            $('<div/>')
                .addClass('jquery-scroll-outer-container')
                .appendTo( this ),

            mCustomScrollbar = 
                $outerContainer.mCustomScrollbar({
                    theme        : options.theme,
                    scrollInertia: options.scrollInertia, 
                    keyboard: { 
                        enable: true 
                    },
                    callbacks:{
                        onUpdate        : updateScrollBoxShadow, 
                        onOverflowY     : updateScrollBoxShadow, 
                        onOverflowYNone : updateScrollBoxShadow, 
                        whileScrolling  : updateScrollBoxShadow, 
                        onSelectorChange: onSelectorChange 
                    },
                    advanced:{ 
                        updateOnContentResize : true,
                        updateOnSelectorChange: true
                    }
                }),
            
            $container = $('<div/>')
                            .addClass('jquery-scroll-container')
                            .appendTo( $outerContainer.find('.mCSB_container') );


        if (options.size > 1)
            $outerContainer.height( options.size+'px' );

        this.data('_scrollContainer', {
            options         : options,
            $outerContainer : $outerContainer,
            mCustomScrollbar: mCustomScrollbar,
            $container      : $container
        });

        return $container;
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
        //Update all scrollContainer
        $('.jquery-scroll-outer-container').each( function(){
            $(this).parent()._updateScrollContainer();
        });

    }); 



}(jQuery, this, document));