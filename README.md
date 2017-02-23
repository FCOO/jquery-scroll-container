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

    var $myContainer = $(aElement).scrollContainer( options );

    //$myContainer is now a jQuery-element where the contents of the scroll-box can be added or removed

### options

There are tree ways to set and control the size of the scroll-container using The `options.size`:

#### Full: `options.size` = 0 (default)
The scroll-container have always the same size as its parent element regardless of the contents of the scroll-container

#### Fixed: `options.size` > 1
The scroll-container have always the same fixed size (`options.size px`) regardless of the contents of the scroll-container

#### Relative: `options.size` <= 1
Using additional options:
`refELement`: DOM- or jQuery-element (default = `window` )
`padding`: number (default = 0)

The scroll-container have a **maximum** size = `options.size`x(the height of refElement) minus `options.padding`

E.g.
If `options = {size:0.6, padding:30}`the maximum height of the scroll-container will be 60% of the height of the window minus `30px`




## Copyright and License
This plugin is licensed under the [MIT license](https://github.com/FCOO/jquery-scroll-container/LICENSE).

Copyright (c) 2017 [FCOO](https://github.com/FCOO)

## Contact information

Niels Holt nho@fcoo.dk


## Credits and acknowledgements
Using the great [jquery-custom-content-scroller](http://manos.malihu.gr/jquery-custom-content-scroller/) by [malihu](https://github.com/malihu)