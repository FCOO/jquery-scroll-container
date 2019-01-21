# jquery-scroll-container
>


## Description

Create a container with auto scroll and resize using a reduced version of [simplebar](https://github.com/Grsmto/simplebar) by [Adrien Denat](https://github.com/Grsmto).
 
## Installation
### bower
`bower install https://github.com/FCOO/jquery-scroll-container.git --save`

## Demo
[https://FCOO.github.io/jquery-scroll-container/demo/](https://FCOO.github.io/jquery-scroll-container/demo/)
 

## Usage

    var $myContainer = $(aElement).addScrollbar( direction );

    //$myContainer is now a jQuery-element where the contents of the scroll-box can be added or removed

### `direction`

    ["vertical"|"horizontal"|"auto"] (default: "auto")

- `"vertical"`: Only allows vertical scroll and adds left and right margin to contents to make room for the slider. 
- `"horizontal"` Only allows horizontal scroll and adds bottom margin to contents to make room for the slider
- `"auto"`: Allows boith vertical and horizontal scroll. Do not add any margin to content
 
<!--
## Modernizr
The package uses class `touchevents` and `no-touchevents` for the `<html>` element as in [modernizr](https://modernizr.com/) test `touchevents` to enable or disable dragging the bar. 

[modernizr](https://modernizr.com/) is not included automatic.
-->
## `Element.scrollIntoView`
The [Element.scrollIntoView](https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollIntoView) is partly supported by most browser

A `$.fn.scrollIntoView()` is added to scroll a jQuery-element into view


## Copyright and License
This plugin is licensed under the [MIT license](https://github.com/FCOO/jquery-scroll-container/LICENSE).

Copyright (c) 2019 [FCOO](https://github.com/FCOO)

## Contact information

Niels Holt nho@fcoo.dk


## Credits and acknowledgments
Based on the great [simplebar](https://github.com/Grsmto/simplebar) by [Adrien Denat](https://github.com/Grsmto)

