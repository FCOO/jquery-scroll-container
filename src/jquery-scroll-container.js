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
        this.simplebar = new window.Simplebar(this.get(0), options);


        this.scrollbarContainer = $(this.simplebar.getContentElement());

        this.innerContainer = this.scrollbarContainer;//$('<div/>').appendTo(this.scrollbarContainer);

        //Update scrollbar when container or content change size
        var _sbUpdate = $.proxy( this._sbUpdate, this );
        this.scrollbarContainer.resize( _sbUpdate );
        this.innerContainer.resize( _sbUpdate );

        return this.innerContainer;
    };

}(jQuery, this, document));