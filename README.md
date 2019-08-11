# jquery-scroll-container
>


## Description

Create a container with auto scroll and resize using [perfect-scrollbar](https://github.com/mdbootstrap/perfect-scrollbar) by [MDBootstrap](https://github.com/mdbootstrap).
 
On mobile devices (with touch-events) the browsers own scrollbars are used. Detecting touch-events is done using [modernizr](https://modernizr.com/) (see below)

## Installation
### bower
`bower install https://github.com/FCOO/jquery-scroll-container.git --save`

## Demo
[https://FCOO.github.io/jquery-scroll-container/demo/](https://FCOO.github.io/jquery-scroll-container/demo/)
 

## Usage

    var $myContainer = $(aElement).addScrollbar( direction, forceDefaultScrollbar );

    //$myContainer is now a jQuery-element where the contents of the scroll-box can be added or removed

### `direction`

    ["vertical"|"horizontal"|"both"] (default: "vertical")

- `"vertical"`: Only allows vertical scroll and adds left and right margin to contents to make room for the slider. 
- `"horizontal"` Only allows horizontal scroll and adds bottom margin to contents to make room for the slider
- `"both"`: Allows both vertical and horizontal scroll. Do not add any margin to content
 
### `forceDefaultScrollbar`
If `true` the browser default scrollbar is used instead

## Modernizr
The package uses class `touchevents` and `no-touchevents` for the `<html>` element as in [modernizr](https://modernizr.com/) test `touchevents` to enable or disable dragging the bar. 

[modernizr](https://modernizr.com/) is not included automatic.

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