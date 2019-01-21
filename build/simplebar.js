'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); // Polyfills


require('core-js/fn/array/from');

var _scrollbarwidth = require('scrollbarwidth');

var _scrollbarwidth2 = _interopRequireDefault(_scrollbarwidth);

var _lodash = require('lodash.debounce');

var _lodash2 = _interopRequireDefault(_lodash);

var _resizeObserverPolyfill = require('resize-observer-polyfill');

var _resizeObserverPolyfill2 = _interopRequireDefault(_resizeObserverPolyfill);

require('./simplebar.css');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

Object.assign = require('object-assign');

var SimpleBar = function () {
    function SimpleBar(element, options) {
        _classCallCheck(this, SimpleBar);

        this.el = element;
        this.flashTimeout;
        this.contentEl;
        this.scrollContentEl;
        this.dragOffset = { x: 0, y: 0 };
        this.isVisible = { x: true, y: true };
        this.scrollOffsetAttr = { x: 'scrollLeft', y: 'scrollTop' };
        this.sizeAttr = { x: 'offsetWidth', y: 'offsetHeight' };
        this.scrollSizeAttr = { x: 'scrollWidth', y: 'scrollHeight' };
        this.offsetAttr = { x: 'left', y: 'top' };
        this.globalObserver;
        this.mutationObserver;
        this.resizeObserver;
        this.currentAxis;
        this.isRtl;
        this.options = Object.assign({}, SimpleBar.defaultOptions, options);
        this.classNames = this.options.classNames;
        this.scrollbarWidth = (0, _scrollbarwidth2.default)();
        this.offsetSize = 20;
        this.flashScrollbar = this.flashScrollbar.bind(this);
        this.onDragY = this.onDragY.bind(this);
        this.onDragX = this.onDragX.bind(this);
        this.onScrollY = this.onScrollY.bind(this);
        this.onScrollX = this.onScrollX.bind(this);
        this.drag = this.drag.bind(this);
        this.onEndDrag = this.onEndDrag.bind(this);
        this.onMouseEnter = this.onMouseEnter.bind(this);

        this.recalculate = (0, _lodash2.default)(this.recalculate, 100, { leading: true });

        this.init();
    }

    _createClass(SimpleBar, [{
        key: 'init',
        value: function init() {
            // Save a reference to the instance, so we know this DOM node has already been instancied
            this.el.SimpleBar = this;

            this.initDOM();

            this.scrollbarX = this.trackX.querySelector('.' + this.classNames.scrollbar);
            this.scrollbarY = this.trackY.querySelector('.' + this.classNames.scrollbar);

            this.isRtl = getComputedStyle(this.contentEl).direction === 'rtl';

            this.scrollContentEl.style[this.isRtl ? 'paddingLeft' : 'paddingRight'] = (this.scrollbarWidth || this.offsetSize) + 'px';
            this.scrollContentEl.style.marginBottom = '-' + (this.scrollbarWidth * 2 || this.offsetSize) + 'px';
            this.contentEl.style.paddingBottom = (this.scrollbarWidth || this.offsetSize) + 'px';

            if (this.scrollbarWidth !== 0) {
                this.contentEl.style[this.isRtl ? 'marginLeft' : 'marginRight'] = '-' + this.scrollbarWidth + 'px';
            }

            // Calculate content size
            this.recalculate();

            this.initListeners();
        }
    }, {
        key: 'initDOM',
        value: function initDOM() {
            var _this = this;

            // make sure this element doesn't have the elements yet
            if (Array.from(this.el.children).filter(function (child) {
                return child.classList.contains(_this.classNames.scrollContent);
            }).length) {
                // assume that element has his DOM already initiated
                this.trackX = this.el.querySelector('.' + this.classNames.track + '.horizontal');
                this.trackY = this.el.querySelector('.' + this.classNames.track + '.vertical');
                this.scrollContentEl = this.el.querySelector('.' + this.classNames.scrollContent);
                this.contentEl = this.el.querySelector('.' + this.classNames.content);
            } else {
                // Prepare DOM
                this.scrollContentEl = document.createElement('div');
                this.contentEl = document.createElement('div');

                this.scrollContentEl.classList.add(this.classNames.scrollContent);
                this.contentEl.classList.add(this.classNames.content);

                while (this.el.firstChild) {
                    this.contentEl.appendChild(this.el.firstChild);
                }this.scrollContentEl.appendChild(this.contentEl);
                this.el.appendChild(this.scrollContentEl);
            }

            if (!this.trackX || !this.trackY) {
                var track = document.createElement('div');
                var scrollbar = document.createElement('div');

                track.classList.add(this.classNames.track);
                scrollbar.classList.add(this.classNames.scrollbar);

                track.appendChild(scrollbar);

                this.trackX = track.cloneNode(true);
                this.trackX.classList.add('horizontal');

                this.trackY = track.cloneNode(true);
                this.trackY.classList.add('vertical');

                this.el.insertBefore(this.trackX, this.el.firstChild);
                this.el.insertBefore(this.trackY, this.el.firstChild);
            }

            this.el.setAttribute('data-simplebar', 'init');
        }
    }, {
        key: 'initListeners',
        value: function initListeners() {
            var _this2 = this;

            // Event listeners
            if (this.options.autoHide) {
                this.el.addEventListener('mouseenter', this.onMouseEnter);
            }

            this.scrollbarY.addEventListener('mousedown', this.onDragY);
            this.scrollbarX.addEventListener('mousedown', this.onDragX);

            this.scrollContentEl.addEventListener('scroll', this.onScrollY);
            this.contentEl.addEventListener('scroll', this.onScrollX);

            // MutationObserver is IE11+
            if (typeof MutationObserver !== 'undefined') {
                // create an observer instance
                this.mutationObserver = new MutationObserver(function (mutations) {
                    mutations.forEach(function (mutation) {
                        if (_this2.isChildNode(mutation.target) || mutation.addedNodes.length) {
                            _this2.recalculate();
                        }
                    });
                });

                // pass in the target node, as well as the observer options
                this.mutationObserver.observe(this.el, { attributes: true, childList: true, characterData: true, subtree: true });
            }

            this.resizeObserver = new _resizeObserverPolyfill2.default(this.recalculate.bind(this));
            this.resizeObserver.observe(this.el);
        }
    }, {
        key: 'removeListeners',
        value: function removeListeners() {
            // Event listeners
            if (this.options.autoHide) {
                this.el.removeEventListener('mouseenter', this.onMouseEnter);
            }

            this.scrollbarX.removeEventListener('mousedown', this.onDragX);
            this.scrollbarY.removeEventListener('mousedown', this.onDragY);

            this.scrollContentEl.removeEventListener('scroll', this.onScrollY);
            this.contentEl.removeEventListener('scroll', this.onScrollX);

            this.mutationObserver.disconnect();
            this.resizeObserver.disconnect();
        }
    }, {
        key: 'onDragX',
        value: function onDragX(e) {
            this.onDrag(e, 'x');
        }
    }, {
        key: 'onDragY',
        value: function onDragY(e) {
            this.onDrag(e, 'y');
        }

        /**
         * on scrollbar handle drag
         */

    }, {
        key: 'onDrag',
        value: function onDrag(e) {
            var axis = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'y';

            // Preventing the event's default action stops text being
            // selectable during the drag.
            e.preventDefault();

            var scrollbar = axis === 'y' ? this.scrollbarY : this.scrollbarX;

            // Measure how far the user's mouse is from the top of the scrollbar drag handle.
            var eventOffset = axis === 'y' ? e.pageY : e.pageX;

            this.dragOffset[axis] = eventOffset - scrollbar.getBoundingClientRect()[this.offsetAttr[axis]];
            this.currentAxis = axis;

            document.addEventListener('mousemove', this.drag);
            document.addEventListener('mouseup', this.onEndDrag);
        }

        /**
         * Drag scrollbar handle
         */

    }, {
        key: 'drag',
        value: function drag(e) {
            var eventOffset = void 0,
                track = void 0,
                scrollEl = void 0;

            e.preventDefault();

            if (this.currentAxis === 'y') {
                eventOffset = e.pageY;
                track = this.trackY;
                scrollEl = this.scrollContentEl;
            } else {
                eventOffset = e.pageX;
                track = this.trackX;
                scrollEl = this.contentEl;
            }

            // Calculate how far the user's mouse is from the top/left of the scrollbar (minus the dragOffset).
            var dragPos = eventOffset - track.getBoundingClientRect()[this.offsetAttr[this.currentAxis]] - this.dragOffset[this.currentAxis];

            // Convert the mouse position into a percentage of the scrollbar height/width.
            var dragPerc = dragPos / track[this.sizeAttr[this.currentAxis]];

            // Scroll the content by the same percentage.
            var scrollPos = dragPerc * this.contentEl[this.scrollSizeAttr[this.currentAxis]];

            scrollEl[this.scrollOffsetAttr[this.currentAxis]] = scrollPos;
        }

        /**
         * End scroll handle drag
         */

    }, {
        key: 'onEndDrag',
        value: function onEndDrag() {
            document.removeEventListener('mousemove', this.drag);
            document.removeEventListener('mouseup', this.onEndDrag);
        }

        /**
         * Resize scrollbar
         */

    }, {
        key: 'resizeScrollbar',
        value: function resizeScrollbar() {
            var axis = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'y';

            var track = void 0;
            var scrollbar = void 0;
            var scrollOffset = void 0;
            var contentSize = void 0;
            var scrollbarSize = void 0;

            if (axis === 'x') {
                track = this.trackX;
                scrollbar = this.scrollbarX;
                scrollOffset = this.contentEl[this.scrollOffsetAttr[axis]]; // Either scrollTop() or scrollLeft().
                contentSize = this.contentSizeX;
                scrollbarSize = this.scrollbarXSize;
            } else {
                // 'y'
                track = this.trackY;
                scrollbar = this.scrollbarY;
                scrollOffset = this.scrollContentEl[this.scrollOffsetAttr[axis]]; // Either scrollTop() or scrollLeft().
                contentSize = this.contentSizeY;
                scrollbarSize = this.scrollbarYSize;
            }

            var scrollbarRatio = scrollbarSize / contentSize;
            var scrollPourcent = scrollOffset / (contentSize - scrollbarSize);
            // Calculate new height/position of drag handle.
            var handleSize = Math.max(~~(scrollbarRatio * scrollbarSize), this.options.scrollbarMinSize);
            var handleOffset = ~~((scrollbarSize - handleSize) * scrollPourcent);

            // Set isVisible to false if scrollbar is not necessary (content is shorter than wrapper)
            this.isVisible[axis] = scrollbarSize < contentSize;

            if (this.isVisible[axis] || this.options.forceVisible) {
                track.style.visibility = 'visible';

                if (this.options.forceVisible) {
                    scrollbar.style.visibility = 'hidden';
                } else {
                    scrollbar.style.visibility = 'visible';
                }

                if (axis === 'x') {
                    scrollbar.style.left = handleOffset + 'px';
                    scrollbar.style.width = handleSize + 'px';
                } else {
                    scrollbar.style.top = handleOffset + 'px';
                    scrollbar.style.height = handleSize + 'px';
                }
            } else {
                track.style.visibility = 'hidden';
            }
        }

        /**
         * On scroll event handling
         */

    }, {
        key: 'onScrollX',
        value: function onScrollX() {
            this.flashScrollbar('x');
        }
    }, {
        key: 'onScrollY',
        value: function onScrollY() {
            this.flashScrollbar('y');
        }

        /**
         * On mouseenter event handling
         */

    }, {
        key: 'onMouseEnter',
        value: function onMouseEnter() {
            this.flashScrollbar('x');
            this.flashScrollbar('y');
        }

        /**
         * Flash scrollbar visibility
         */

    }, {
        key: 'flashScrollbar',
        value: function flashScrollbar() {
            var axis = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'y';

            this.resizeScrollbar(axis);
            this.showScrollbar(axis);
        }

        /**
         * Show scrollbar
         */

    }, {
        key: 'showScrollbar',
        value: function showScrollbar() {
            var axis = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'y';

            if (!this.isVisible[axis]) {
                return;
            }

            if (axis === 'x') {
                this.scrollbarX.classList.add('visible');
            } else {
                this.scrollbarY.classList.add('visible');
            }

            if (!this.options.autoHide) {
                return;
            }
            if (typeof this.flashTimeout === 'number') {
                window.clearTimeout(this.flashTimeout);
            }

            this.flashTimeout = window.setTimeout(this.hideScrollbar.bind(this), 1000);
        }

        /**
         * Hide Scrollbar
         */

    }, {
        key: 'hideScrollbar',
        value: function hideScrollbar() {
            this.scrollbarX.classList.remove('visible');
            this.scrollbarY.classList.remove('visible');

            if (typeof this.flashTimeout === 'number') {
                window.clearTimeout(this.flashTimeout);
            }
        }

        /**
         * Recalculate scrollbar
         */

    }, {
        key: 'recalculate',
        value: function recalculate() {
            this.contentSizeX = this.contentEl[this.scrollSizeAttr['x']];
            this.contentSizeY = this.contentEl[this.scrollSizeAttr['y']] - (this.scrollbarWidth || this.offsetSize);
            this.scrollbarXSize = this.trackX[this.sizeAttr['x']];
            this.scrollbarYSize = this.trackY[this.sizeAttr['y']];

            this.resizeScrollbar('x');
            this.resizeScrollbar('y');

            if (!this.options.autoHide) {
                this.showScrollbar('x');
                this.showScrollbar('y');
            }
        }

        /**
         * Getter for original scrolling element
         */

    }, {
        key: 'getScrollElement',
        value: function getScrollElement() {
            var axis = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'y';

            return axis === 'y' ? this.scrollContentEl : this.contentEl;
        }

        /**
         * Getter for content element
         */

    }, {
        key: 'getContentElement',
        value: function getContentElement() {
            return this.contentEl;
        }

        /**
         * UnMount mutation observer and delete SimpleBar instance from DOM element
         */

    }, {
        key: 'unMount',
        value: function unMount() {
            this.removeListeners();
            this.el.SimpleBar = null;
        }

        /**
         * Recursively walks up the parent nodes looking for this.el
         */

    }, {
        key: 'isChildNode',
        value: function isChildNode(el) {
            if (el === null) return false;
            if (el === this.el) return true;

            return this.isChildNode(el.parentNode);
        }
    }], [{
        key: 'initHtmlApi',
        value: function initHtmlApi() {
            this.initDOMLoadedElements = this.initDOMLoadedElements.bind(this);

            // MutationObserver is IE11+
            if (typeof MutationObserver !== 'undefined') {
                // Mutation observer to observe dynamically added elements
                this.globalObserver = new MutationObserver(function (mutations) {
                    mutations.forEach(function (mutation) {
                        Array.from(mutation.addedNodes).forEach(function (addedNode) {
                            if (addedNode.nodeType === 1) {
                                if (addedNode.hasAttribute('data-simplebar')) {
                                    !addedNode.SimpleBar && new SimpleBar(addedNode, SimpleBar.getElOptions(addedNode));
                                } else {
                                    Array.from(addedNode.querySelectorAll('[data-simplebar]')).forEach(function (el) {
                                        !el.SimpleBar && new SimpleBar(el, SimpleBar.getElOptions(el));
                                    });
                                }
                            }
                        });

                        Array.from(mutation.removedNodes).forEach(function (removedNode) {
                            if (removedNode.nodeType === 1) {
                                if (removedNode.hasAttribute('data-simplebar')) {
                                    removedNode.SimpleBar && removedNode.SimpleBar.unMount();
                                } else {
                                    Array.from(removedNode.querySelectorAll('[data-simplebar]')).forEach(function (el) {
                                        el.SimpleBar && el.SimpleBar.unMount();
                                    });
                                }
                            }
                        });
                    });
                });

                this.globalObserver.observe(document, { childList: true, subtree: true });
            }

            // Taken from jQuery `ready` function
            // Instantiate elements already present on the page
            if (document.readyState === 'complete' || document.readyState !== 'loading' && !document.documentElement.doScroll) {
                // Handle it asynchronously to allow scripts the opportunity to delay init
                window.setTimeout(this.initDOMLoadedElements.bind(this));
            } else {
                document.addEventListener('DOMContentLoaded', this.initDOMLoadedElements);
                window.addEventListener('load', this.initDOMLoadedElements);
            }
        }

        // Helper function to retrieve options from element attributes

    }, {
        key: 'getElOptions',
        value: function getElOptions(el) {
            var options = Object.keys(SimpleBar.htmlAttributes).reduce(function (acc, obj) {
                var attribute = SimpleBar.htmlAttributes[obj];
                if (el.hasAttribute(attribute)) {
                    acc[obj] = JSON.parse(el.getAttribute(attribute) || true);
                }
                return acc;
            }, {});

            return options;
        }
    }, {
        key: 'removeObserver',
        value: function removeObserver() {
            this.globalObserver.disconnect();
        }
    }, {
        key: 'initDOMLoadedElements',
        value: function initDOMLoadedElements() {
            document.removeEventListener('DOMContentLoaded', this.initDOMLoadedElements);
            window.removeEventListener('load', this.initDOMLoadedElements);

            Array.from(document.querySelectorAll('[data-simplebar]')).forEach(function (el) {
                if (!el.SimpleBar) new SimpleBar(el, SimpleBar.getElOptions(el));
            });
        }
    }, {
        key: 'defaultOptions',
        get: function get() {
            return {
                autoHide: true,
                forceVisible: false,
                classNames: {
                    content: 'simplebar-content',
                    scrollContent: 'simplebar-scroll-content',
                    scrollbar: 'simplebar-scrollbar',
                    track: 'simplebar-track'
                },
                scrollbarMinSize: 25
            };
        }
    }, {
        key: 'htmlAttributes',
        get: function get() {
            return {
                autoHide: 'data-simplebar-auto-hide',
                forceVisible: 'data-simplebar-force-visible',
                scrollbarMinSize: 'data-simplebar-scrollbar-min-size'
            };
        }
    }]);

    return SimpleBar;
}();

/**
 * HTML API
 */


exports.default = SimpleBar;
SimpleBar.initHtmlApi();
