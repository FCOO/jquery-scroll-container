/****************************************************************************
jquery-scroll-booster.js

Adding the use of ding ScrollBooster
https://ilyashubin.github.io/scrollbooster/


****************************************************************************/
(function ($, window/*, document, undefined*/) {
    "use strict";


    $.fn.extend({

        addScrollBooster: function( options = {} ){
            let $viewport =
                    (options.viewport ? $(options.viewport) : null) ||
                    options.$viewport ||
                    (options.container ? $(options.container) : null) ||
                    options.$container ||
                    this,
                $content  = (options.content ? $(options.content) : null) || options.$content,
                direction = (options.direction == 'both' ? 'all' : null) || options.direction || 'all';

            options = $.extend(true, {}, {
                viewport                        : $viewport.get(0), //DOM Node  null     Content viewport element (required)
                content                         : $content.get(0),  //DOM Node  viewport child element    Scrollable content element inside viewport
                scrollMode                      : 'native',         //String    undefined Scroll technique - via CSS transform or natively. Could be 'transform' or 'native'
                direction                       : direction,        //String    'all'     Scroll direction. Could be 'horizontal', 'vertical' or 'all'
                bounce                          : false,            //Boolean   true      Enables elastic bounce effect when hitting viewport borders

              //textSelection                   : false,    //Boolean   false     Enables text selection inside viewport
              //inputsFocus                     : true,     //Boolean   true      Enables focus for elements: 'input', 'textarea', 'button', 'select' and 'label'
              //pointerMode                     : 'all',    //String    'all'     Specify pointer type. Supported values - 'touch' (scroll only on touch devices), 'mouse' (scroll only on desktop), 'all' (mobile and desktop)
              //friction                        : 0.05,     //Number    0.05      Scroll friction factor - how fast scrolling stops after pointer release
              //bounceForce                     : 0.1,      //Number    0.1       Elastic bounce effect factor
              //emulateScroll                   : false,    //Boolean   false     Enables mouse wheel/trackpad emulation inside viewport
              //preventDefaultOnEmulateScroll   : false,    //String    false     Prevents horizontal or vertical default when emulateScroll is enabled (eg. useful to prevent horizontal trackpad gestures while enabling vertical scrolling). Could be 'horizontal' or 'vertical'.
              //lockScrollOnDragDirection       : false,    //String    false     Detect drag direction and either prevent default mousedown/touchstart event or lock content scroll. Could be 'horizontal', 'vertical' or 'all'
              //dragDirectionTolerance          : 40,       //Number    40        Tolerance for horizontal or vertical drag detection
              //onUpdate                        : null,     //Function  noop      Handler function to perform actual scrolling. Receives scrolling state object with coordinates
              //onClick                         : null,     //Function  noop      Click handler function. Here you can, for example, prevent default event for click on links. Receives object with scrolling metrics and event object. Calls after each click in scrollable area
              //onPointerDown                   : null,     //Function  noop      mousedown/touchstart events handler
              //onPointerUp                     : null,     //Function  noop      mouseup/touchend events handler
              //onPointerMove                   : null,     //Function  noop      mousemove/touchmove events handler
              //onWheel                         : null,     //Function  noop      wheel event handler
              //shouldScroll                    : null,     //Function  noop      Function to permit or disable scrolling. Receives object with scrolling state and event object. Calls on pointerdown (mousedown, touchstart) in scrollable area. You can return true or false to enable or disable scrolling

            }, options );

            let scrollBooster = new window.ScrollBooster(options);
            this.data('scrollBooster', scrollBooster);

            $viewport.on('mouseleave', this._sb_mouseleave.bind(this) );

            return scrollBooster;
        },

        getScrollBooster: function(){
            return this.data('scrollBooster');
        },

        sbUpdate: function(){
            let sb = this.getScrollBooster();
            if (sb)
                sb.updateMetrics();
        },

        sbScrollTo(left, top){
            let sb = this.getScrollBooster();
            if (sb){
                sb.scrollTo({x: left, y: top});
                sb.updateMetrics();
            }
            else
                this.$container.get(0).scrollTo(left, top);

        },


        _sb_mouseleave: function(){
            let sb = this.getScrollBooster();
            if (sb && sb.isDragging)
                sb.events.pointerup();
        }

    });

}(jQuery, this, document));