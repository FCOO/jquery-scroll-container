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

        var $content = $(this.simplebar.getContentElement());

        //Update scrollbar when container or content change size
        var _sbUpdate = $.proxy( this._sbUpdate, this );
        $content.resize( _sbUpdate );
        this.resize( _sbUpdate );

        return $content;
    };

}(jQuery, this, document));