/****************************************************************************
    jquery-scroll-container.js,

    (c) 2017, FCOO

    https://github.com/FCOO/jquery-scroll-container
    https://github.com/FCOO

****************************************************************************/
(function ($, window, document/*, undefined*/) {
    "use strict";

    if ( $('html').hasClass('touchevents') || $('html').hasClass('no-touchevents') )
        ;    //Modernizr (or someone else) has set the correct class
    else
        //Default: No touch
        $('html').addClass('no-touchevents');

    //Create namespace
    var ns = window.JqueryScrollContainer = window.JqueryScrollContainer || {};

    //Calc the scrollbar-width when the document is loaded
    var getScrollbarWidth = window.getScrollbarWidth = function() {
        if (typeof document === 'undefined'){
            window.setTimeout( getScrollbarWidth, 1000 );
            return;
        }

        var body = document.body,
            box = document.createElement('div'),
            boxStyle = box.style;

        box.className       = 'jq-scroll-default';
        boxStyle.position   = 'fixed';
        boxStyle.left       = 0;
        boxStyle.visibility = 'hidden';
        boxStyle.overflowY  = 'scroll';
        body.appendChild(box);
        var scrollbarWidth = box.getBoundingClientRect().right;
        body.removeChild(box);

        //Update to css-var for scrollbars
        var root = document.querySelector(':root');
        root.style.setProperty('--jsc-scroll-size', scrollbarWidth+'px');
        if (scrollbarWidth > 0){
            root.style.setProperty('--jsc-scroll-padding-opposite', scrollbarWidth+'px');
            root.style.setProperty('--jsc-scroll-padding',          '0px');
        }

        return scrollbarWidth;
    };

    //Called when document is laoded
    $(getScrollbarWidth);


    //Extend $.fn with scrollIntoView
    $.fn.extend({
        scrollIntoView: function( arg ){
            if (this.get(0).scrollIntoView)
                this.get(0).scrollIntoView( arg );
        }
    });

    ns.scrollbarOptions = {
        direction       : 'vertical',   //["vertical"|"horizontal"|"both"] (default: "vertical")
        contentClassName: '',           //Class-name added to the inner content-container
        paddingLeft     : true          //Only for direction:'vertical'. If true the container gets padding-left equal the width of the scrollbar to center content
    };

    ns.update = function( isTouch ){
        $('html').toggleClass('jq-scroll-default-css', !isTouch);
    };

    ns.update( $('html').hasClass('touchevents') );


    //_jscUpdateScrollShadowClass: update the classNames setting the scroll-shadow
    $.fn._jscUpdateScrollShadowClass = function( isVertical ){
        var elem = this.get(0),
            noScroll, position;

        if (isVertical){
            noScroll = elem.scrollHeight <= elem.clientHeight;
            position = elem.scrollTop <= 0 ? 'start' :
                       elem.scrollTop >= elem.scrollHeight - elem.clientHeight ? 'end' :
                       null;
        }
        else {
            noScroll = elem.scrollWidth < elem.clientWidth;
            position = elem.scrollLeft <= 0 ? 'start' :
                       elem.scrollLeft >= elem.scrollWidth - elem.clientWidth ? 'end' :
                       null;
        }

        this
            .modernizrToggle('jq-scroll-none' , noScroll)
            .modernizrToggle('scroll-at-start', (position == 'start') || noScroll)
            .modernizrToggle('scroll-at-end'  , (position == 'end')   || noScroll);
    };

    /**************************************************
    Extend jQuery-element with new method
    .addScrollbar( direction or options )
    **************************************************/
    $.fn.addScrollbar = function( options = {}){
        var _this = this;
        options = $.extend( {},  ns.scrollbarOptions, typeof options == "string" ? {direction: options} : options );

        var isVertical   = (options.direction == 'vertical'),
            isHorizontal = (options.direction == 'horizontal'),
            isBoth       = (options.direction == 'both'),
            directionClassName = isHorizontal ? 'jq-scroll-container-horizontal' :
                                 isVertical   ? 'jq-scroll-container-vertical' :
                                 isBoth       ? 'jq-scroll-container-both' :
                                                '';
        function updateScrollClass(){
            _this._jscUpdateScrollShadowClass(isVertical);
        }

        //Add element to display scroll-shadow
        //TODO: Not working for horizontal scroll
        if (isVertical){
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

        this.addClass('jq-scroll-default');

        if (isVertical && options.paddingLeft)
            this.addClass('jq-scroll-padding-left');

        //Update scroll-shadow when scrolling
        if (!isBoth)
            this.on('scroll', updateScrollClass );

        //Update scrollbar when container or content change size or elements are added to/removed from the content-container
        this.resize( updateScrollClass );
        this.scrollbarContainer.resize( updateScrollClass );

        var observer = new window.MutationObserver( updateScrollClass );
        observer.observe(this.scrollbarContainer.get(0), { attributes: true, childList: true, subtree: true });

        this.get(0).scrollTop = 0;

        return this.scrollbarContainer;
    };

}(jQuery, this, document));