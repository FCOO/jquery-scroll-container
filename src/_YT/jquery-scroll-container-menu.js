/****************************************************************************
    jquery-scroll-container-menu.js,

    (c) 2017, FCOO

    https://github.com/FCOO/jquery-scroll-container
    https://github.com/FCOO

    Very simple version using browser scroll and add margin-right = scrollbar-widrh when
    no scroll

****************************************************************************/

(function ($ /*, window, document, undefined*/) {
    "use strict";

    var $html = $('html');

    if ( $html.hasClass('touchevents') || $html.hasClass('no-touchevents') )
        ;    //Modernizr (or someone else) has set the correct class
    else
        //Default: No touch
        $html.addClass('no-touchevents');


    //Extend $.fn with scrollIntoView
    $.fn.extend({
        scrollIntoView: function( arg ){
            if (this.get(0).scrollIntoView)
                this.get(0).scrollIntoView( arg );
        }
    });

    var scrollbarWidth = 0;
    function getScrollbarWidth() {
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


    //Extend $.fn with internal scrollbar methods. sb = simplebar
    $.fn.extend({
        _sbUpdate: function(isVertical){
            var elem = this.get(0),
                hasScroll = isVertical ? elem.scrollHeight > elem.offsetHeight : elem.scrollWidth > elem.offsetWidth;
            this.toggleClass('has-scroll', hasScroll);
        }
    });

    $.fn.addScrollbar = function( direction ){
        this
            .addClass('jq-scroll-container')
            .toggleClass('jq-scroll-container-horizontal', direction == 'horizontal')
            .toggleClass('jq-scroll-container-vertical', direction == 'vertical')
            .toggleClass('jq-scroll-container-auto', direction == 'auto')

        this.scrollContent =
            $('<div/>')
                .addClass('jq-scroll-content')
                .appendTo(this);

        if ($html.hasClass('no-touchevents') && (direction != 'auto')){
            var isVertical = direction == 'vertical';
            scrollbarWidth = scrollbarWidth || getScrollbarWidth();

            this.css(isVertical ? 'padding-right' : 'padding-bottom', scrollbarWidth+'px');

            var _sbUpdate = $.proxy( this._sbUpdate, this, isVertical);
            this.scrollContent.resize( _sbUpdate );
            _sbUpdate();
        }
        return this.scrollContent;
    };

}(jQuery, this, document));