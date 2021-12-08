# jquery-scroll-container
>


## Description

Contains css to make scrollbars look *thin*

On mobile devices (with touch-events) the browsers own scrollbars are used. Detecting touch-events is done using [modernizr](https://modernizr.com/) (see below)

*"Scroll shadows"* are added (see demo)

**NOTE Version 7.x differ largely from version 6.x and 5.x**

## Installation
### bower
`bower install https://github.com/FCOO/jquery-scroll-container.git --save`

## Demo
[https://FCOO.github.io/jquery-scroll-container/demo/](https://FCOO.github.io/jquery-scroll-container/demo/)
 
## Usage

    var $myContainer = $(aElement).addScrollbar( direction or options );

    //$myContainer is now a jQuery-element where the contents of the scroll-box can be added or removed

### `options`
- `direction`: [`"vertical"`|`"horizontal"`|`"both"`] (default: `"vertical"`)
    - `"vertical"`: Only allows vertical scroll and adds left and right margin to contents to make room for the slider. 
    - `"horizontal"` Only allows horizontal scroll and adds bottom margin to contents to make room for the slider
    - `"both"`: Allows both vertical and horizontal scroll. Do not add any margin to content
- `contentClassName: ''`. Class-name added to the inner content-container
- `paddingLeft: false`. Only for direction`:'vertical'`. If `true` the container gets `padding-left` equal the width of the scrollbar to center content


## Modernizr
The package uses class `touchevents` and `no-touchevents` for the `<html>` element as in [modernizr](https://modernizr.com/) test `touchevents` to enable the use of browser default scrollbar. 

[modernizr](https://modernizr.com/) is not included automatic.

## `Element.scrollIntoView`
The [Element.scrollIntoView](https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollIntoView) is partly supported by most browser

A `$.fn.scrollIntoView()` is added to scroll a jQuery-element into view


## Copyright and License
This plugin is licensed under the [MIT license](https://github.com/FCOO/jquery-scroll-container/LICENSE).

Copyright (c) 2019 [FCOO](https://github.com/FCOO)

## Contact information
Niels Holt nho@fcoo.dk
