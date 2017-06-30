# jquery-scroll-container
>


## Description
Create a container with auto scroll and resize

## Installation
### bower
`bower install https://github.com/FCOO/jquery-scroll-container.git --save`

## Demo
http://FCOO.github.io/jquery-scroll-container/demo/ 

## Usage

    var $myContainer = $(aElement).addScrollbar( options );

    //$myContainer is now a jQuery-element where the contents of the scroll-box can be added or removed

### options

    direction: ["vertical"|"horizontal"|"both"] (default: "vertical")

- `direction: "vertical"` adds left and right margin to contents to make room for the slider
- `direction: "horizontal"` adds top and bottom margin to contents to make room for the slider
- `direction: "both"` **do not** adds margins **>>NOT IMPLEMENTED<<**

## Size
The size (absolute, minimum, and/or maximum) is set using css on the the inner or outer container. 
See source code for [the demo page](http://FCOO.github.io/jquery-scroll-container/demo/ ) for examples

## Modernizr
The package uses class `touchevents` and `no-touchevents` for the `<html>` element as in [modernizr](https://modernizr.com/) test `touchevents` to enable or disable dragging the bar. 

[modernizr](https://modernizr.com/) is not included automatic.

## Copyright and License
This plugin is licensed under the [MIT license](https://github.com/FCOO/jquery-scroll-container/LICENSE).

Copyright (c) 2017 [FCOO](https://github.com/FCOO)

## Contact information

Niels Holt nho@fcoo.dk


## Credits and acknowledgments
Using the great [perfect-scrollbar](https://github.com/noraesae/perfect-scrollbar) by [noraesae](https://github.com/noraesae)

