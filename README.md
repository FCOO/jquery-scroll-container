# jquery-scroll-container
>


## Description

Create a container with auto scroll and resize using [perfect-scrollbar](https://github.com/mdbootstrap/perfect-scrollbar) by [MDBootstrap](https://github.com/mdbootstrap).
 
Contains styles to have standard scroll bars looking the same way.

It detects if the browser supports [scroll styling](https://caniuse.com/?search=scroll%20styling) and set the default to use standard scroll if supported

On mobile devices (with touch-events) the browsers own scrollbars are used (optional). Detecting touch-events is done using [modernizr](https://modernizr.com/) (see below)

## Installation
### bower
`bower install https://github.com/FCOO/jquery-scroll-container.git --save`

## Demo
[https://FCOO.github.io/jquery-scroll-container/demo/](https://FCOO.github.io/jquery-scroll-container/demo/)
 
## Usage

    var $myContainer = $(aElement).addScrollbar( direction or options );

    //$myContainer is now a jQuery-element where the contents of the scroll-box can be added or removed

### `options`
All values in options can be a simple value or a function returning the value;
Default options can be set in `window.JqueryScrollContainer.scrollbarOptions`

- `direction`: [`"vertical"`|`"horizontal"`|`"both"`] (default: `"vertical"`)
    - `"vertical"`: Only allows vertical scroll and adds left and right margin to contents to make room for the slider. 
    - `"horizontal"` Only allows horizontal scroll and adds bottom margin to contents to make room for the slider
    - `"both"`: Allows both vertical and horizontal scroll. Do not add any margin to content
- `contentClassName: ''`. Class-name added to the inner content-container
- `defaultScrollbarOnTouch: false`. If `true` and the browser support touchevents => use simple version using the browsers default scrollbar
- `forceDefaultScrollbar: false`. If `true` => use simple version using the browsers default scrollbar (regardless of `defaultScrollbarOnTouch` and touchevents-support)
- `adjustPadding`: [`"scroll"`, `"left"`, `"both"`, `"none"`] Defalut = `"scroll"`. Defines witch 'side(s)' that will have padding adjusted:
	- `"left"`  : Only for `direction: "vertical"`: The `paddingLeft` of the container is set equal to the width of the scrollbar
	- `"scroll"`: Only when using browser default scrollbar: If the width of the default scrollbar > 0 => always have `padding` == scrollbar-width (also when no scrollbar is present)
	- `"both"`  : As `"left"` and `"scroll"`
	- `"none"`  : No adjustment beside the scrollbar when using perfect-scrollbar
- `hasTouchEvents`: `true` if the browser supports touch-events and the scroll should use default scroll. Default = `function(){ return window.modernizrOn('touchevents'); }`



## Modernizr
The package uses class `touchevents` and `no-touchevents` for the `<html>` element as in [modernizr](https://modernizr.com/) test `touchevents` to enable the use of browser default scrollbar. 

[modernizr](https://modernizr.com/) is not included automatic.

## Lock and unlock the scroll
If [perfect-scrollbar](https://github.com/mdbootstrap/perfect-scrollbar) is used two jQuery-element methods are available to lock and unlock the scrolling of a element

    var $myContainer = $(aElement).addScrollbar( direction or options );
    ...
    $myContainer.lockScrollbar();
    ...
    $myContainer.unlockScrollbar();


## `Element.scrollIntoView`
The [Element.scrollIntoView](https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollIntoView) is partly supported by most browser

A `$.fn.scrollIntoView()` is added to scroll a jQuery-element into view


## Copyright and License
This plugin is licensed under the [MIT license](https://github.com/FCOO/jquery-scroll-container/LICENSE).

Copyright (c) 2019 [FCOO](https://github.com/FCOO)

## Contact information
Niels Holt nho@fcoo.dk

## Credits and acknowledgments
Based on the great [perfect-scrollbar](https://github.com/mdbootstrap/perfect-scrollbar) by [MDBootstrap](https://github.com/mdbootstrap)