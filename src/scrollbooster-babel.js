/****************************************************************************
scrollbooster-bable.js,

A bable-adjusted version of ScrollBooster
See https://ilyashubin.github.io/scrollbooster/

****************************************************************************/
!function (t, e) {
  "object" == typeof exports && "object" == typeof module ? module.exports = e() : "function" == typeof define && define.amd ? define("ScrollBooster", [], e) : "object" == typeof exports ? exports.ScrollBooster = e() : t.ScrollBooster = e();
}(this, function () {
  return function (t) {
    var e = {};
    function i(o) {
      if (e[o]) return e[o].exports;
      var n = e[o] = {
        i: o,
        l: !1,
        exports: {}
      };
      return t[o].call(n.exports, n, n.exports, i), n.l = !0, n.exports;
    }
    return i.m = t, i.c = e, i.d = function (t, e, o) {
      i.o(t, e) || Object.defineProperty(t, e, {
        enumerable: !0,
        get: o
      });
    }, i.r = function (t) {
      "undefined" != typeof Symbol && Symbol.toStringTag && Object.defineProperty(t, Symbol.toStringTag, {
        value: "Module"
      }), Object.defineProperty(t, "__esModule", {
        value: !0
      });
    }, i.t = function (t, e) {
      if (1 & e && (t = i(t)), 8 & e) return t;
      if (4 & e && "object" == typeof t && t && t.__esModule) return t;
      var o = Object.create(null);
      if (i.r(o), Object.defineProperty(o, "default", {
        enumerable: !0,
        value: t
      }), 2 & e && "string" != typeof t) for (var n in t) i.d(o, n, function (e) {
        return t[e];
      }.bind(null, n));
      return o;
    }, i.n = function (t) {
      var e = t && t.__esModule ? function () {
        return t.default;
      } : function () {
        return t;
      };
      return i.d(e, "a", e), e;
    }, i.o = function (t, e) {
      return Object.prototype.hasOwnProperty.call(t, e);
    }, i.p = "", i(i.s = 0);
  }([function (t, e, i) {
    "use strict";

    function o(t, e) {
      var i = Object.keys(t);
      if (Object.getOwnPropertySymbols) {
        var o = Object.getOwnPropertySymbols(t);
        e && (o = o.filter(function (e) {
          return Object.getOwnPropertyDescriptor(t, e).enumerable;
        })), i.push.apply(i, o);
      }
      return i;
    }
    function n(t) {
      for (var e = 1; e < arguments.length; e++) {
        var i = null != arguments[e] ? arguments[e] : {};
        e % 2 ? o(Object(i), !0).forEach(function (e) {
          s(t, e, i[e]);
        }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(t, Object.getOwnPropertyDescriptors(i)) : o(Object(i)).forEach(function (e) {
          Object.defineProperty(t, e, Object.getOwnPropertyDescriptor(i, e));
        });
      }
      return t;
    }
    function s(t, e, i) {
      return e in t ? Object.defineProperty(t, e, {
        value: i,
        enumerable: !0,
        configurable: !0,
        writable: !0
      }) : t[e] = i, t;
    }
    function r(t, e) {
      if (!(t instanceof e)) throw new TypeError("Cannot call a class as a function");
    }
    function a(t, e) {
      for (var i = 0; i < e.length; i++) {
        var o = e[i];
        o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(t, o.key, o);
      }
    }
    i.r(e), i.d(e, "default", function () {
      return p;
    });
    var l = function (t) {
        return Math.max(t.offsetHeight, t.scrollHeight);
      },
      p = function () {
        function t() {
          var e = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {};
          r(this, t);
          var i = {
            content: e.viewport.children[0],
            direction: "all",
            pointerMode: "all",
            scrollMode: void 0,
            bounce: !0,
            bounceForce: .1,
            friction: .05,
            textSelection: !1,
            inputsFocus: !0,
            emulateScroll: !1,
            preventDefaultOnEmulateScroll: !1,
            preventPointerMoveDefault: !0,
            lockScrollOnDragDirection: !1,
            dragDirectionTolerance: 40,
            onPointerDown: function () {},
            onPointerUp: function () {},
            onPointerMove: function () {},
            onClick: function () {},
            onUpdate: function () {},
            onWheel: function () {},
            shouldScroll: function () {
              return !0;
            }
          };
          if (this.props = n(n({}, i), e), this.props.viewport && this.props.viewport instanceof Element) {
            if (this.props.content) {
              this.isDragging = !1, this.isTargetScroll = !1, this.isScrolling = !1, this.isRunning = !1;
              var o = {
                x: 0,
                y: 0
              };
              this.position = n({}, o), this.velocity = n({}, o), this.dragStartPosition = n({}, o), this.dragOffset = n({}, o), this.clientOffset = n({}, o), this.dragPosition = n({}, o), this.targetPosition = n({}, o), this.scrollOffset = n({}, o), this.rafID = null, this.events = {}, this.updateMetrics(), this.handleEvents();
            } else console.error("ScrollBooster init error: Viewport does not have any content");
          } else console.error('ScrollBooster init error: "viewport" config property must be present and must be Element');
        }
        var e, i, o;
        return e = t, (i = [{
          key: "updateOptions",
          value: function () {
            var t = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {};
            this.props = n(n({}, this.props), t), this.props.onUpdate(this.getState()), this.startAnimationLoop();
          }
        }, {
          key: "updateMetrics",
          value: function () {
            var t;
            this.viewport = {
              width: this.props.viewport.clientWidth,
              height: this.props.viewport.clientHeight
            }, this.content = {
              width: (t = this.props.content, Math.max(t.offsetWidth, t.scrollWidth)),
              height: l(this.props.content)
            }, this.edgeX = {
              from: Math.min(-this.content.width + this.viewport.width, 0),
              to: 0
            }, this.edgeY = {
              from: Math.min(-this.content.height + this.viewport.height, 0),
              to: 0
            }, this.props.onUpdate(this.getState()), this.startAnimationLoop();
          }
        }, {
          key: "startAnimationLoop",
          value: function () {
            var t = this;
            this.isRunning = !0, cancelAnimationFrame(this.rafID), this.rafID = requestAnimationFrame(function () {
              return t.animate();
            });
          }
        }, {
          key: "animate",
          value: function () {
            var t = this;
            if (this.isRunning) {
              this.updateScrollPosition(), this.isMoving() || (this.isRunning = !1, this.isTargetScroll = !1);
              var e = this.getState();
              this.setContentPosition(e), this.props.onUpdate(e), this.rafID = requestAnimationFrame(function () {
                return t.animate();
              });
            }
          }
        }, {
          key: "updateScrollPosition",
          value: function () {
            this.applyEdgeForce(), this.applyDragForce(), this.applyScrollForce(), this.applyTargetForce();
            var t = 1 - this.props.friction;
            this.velocity.x *= t, this.velocity.y *= t, "vertical" !== this.props.direction && (this.position.x += this.velocity.x), "horizontal" !== this.props.direction && (this.position.y += this.velocity.y), this.props.bounce && !this.isScrolling || this.isTargetScroll || (this.position.x = Math.max(Math.min(this.position.x, this.edgeX.to), this.edgeX.from), this.position.y = Math.max(Math.min(this.position.y, this.edgeY.to), this.edgeY.from));
          }
        }, {
          key: "applyForce",
          value: function (t) {
            this.velocity.x += t.x, this.velocity.y += t.y;
          }
        }, {
          key: "applyEdgeForce",
          value: function () {
            if (this.props.bounce && !this.isDragging) {
              var t = this.position.x < this.edgeX.from,
                e = this.position.x > this.edgeX.to,
                i = this.position.y < this.edgeY.from,
                o = this.position.y > this.edgeY.to,
                n = t || e,
                s = i || o;
              if (n || s) {
                var r = t ? this.edgeX.from : this.edgeX.to,
                  a = i ? this.edgeY.from : this.edgeY.to,
                  l = r - this.position.x,
                  p = a - this.position.y,
                  c = {
                    x: l * this.props.bounceForce,
                    y: p * this.props.bounceForce
                  },
                  h = this.position.x + (this.velocity.x + c.x) / this.props.friction,
                  u = this.position.y + (this.velocity.y + c.y) / this.props.friction;
                (t && h >= this.edgeX.from || e && h <= this.edgeX.to) && (c.x = l * this.props.bounceForce - this.velocity.x), (i && u >= this.edgeY.from || o && u <= this.edgeY.to) && (c.y = p * this.props.bounceForce - this.velocity.y), this.applyForce({
                  x: n ? c.x : 0,
                  y: s ? c.y : 0
                });
              }
            }
          }
        }, {
          key: "applyDragForce",
          value: function () {
            if (this.isDragging) {
              var t = this.dragPosition.x - this.position.x,
                e = this.dragPosition.y - this.position.y;
              this.applyForce({
                x: t - this.velocity.x,
                y: e - this.velocity.y
              });
            }
          }
        }, {
          key: "applyScrollForce",
          value: function () {
            this.isScrolling && (this.applyForce({
              x: this.scrollOffset.x - this.velocity.x,
              y: this.scrollOffset.y - this.velocity.y
            }), this.scrollOffset.x = 0, this.scrollOffset.y = 0);
          }
        }, {
          key: "applyTargetForce",
          value: function () {
            this.isTargetScroll && this.applyForce({
              x: .08 * (this.targetPosition.x - this.position.x) - this.velocity.x,
              y: .08 * (this.targetPosition.y - this.position.y) - this.velocity.y
            });
          }
        }, {
          key: "isMoving",
          value: function () {
            return this.isDragging || this.isScrolling || Math.abs(this.velocity.x) >= .01 || Math.abs(this.velocity.y) >= .01;
          }
        }, {
          key: "scrollTo",
          value: function () {
            var t = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {};
            this.isTargetScroll = !0, this.targetPosition.x = -t.x || 0, this.targetPosition.y = -t.y || 0, this.startAnimationLoop();
          }
        }, {
          key: "setPosition",
          value: function () {
            var t = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {};
            this.velocity.x = 0, this.velocity.y = 0, this.position.x = -t.x || 0, this.position.y = -t.y || 0, this.startAnimationLoop();
          }
        }, {
          key: "getState",
          value: function () {
            return {
              isMoving: this.isMoving(),
              isDragging: !(!this.dragOffset.x && !this.dragOffset.y),
              position: {
                x: -this.position.x,
                y: -this.position.y
              },
              dragOffset: this.dragOffset,
              dragAngle: this.getDragAngle(this.clientOffset.x, this.clientOffset.y),
              borderCollision: {
                left: this.position.x >= this.edgeX.to,
                right: this.position.x <= this.edgeX.from,
                top: this.position.y >= this.edgeY.to,
                bottom: this.position.y <= this.edgeY.from
              }
            };
          }
        }, {
          key: "getDragAngle",
          value: function (t, e) {
            return Math.round(Math.atan2(t, e) * (180 / Math.PI));
          }
        }, {
          key: "getDragDirection",
          value: function (t, e) {
            return Math.abs(90 - Math.abs(t)) <= 90 - e ? "horizontal" : "vertical";
          }
        }, {
          key: "setContentPosition",
          value: function (t) {
            "transform" === this.props.scrollMode && (this.props.content.style.transform = "translate(".concat(-t.position.x, "px, ").concat(-t.position.y, "px)")), "native" === this.props.scrollMode && (this.props.viewport.scrollTop = t.position.y, this.props.viewport.scrollLeft = t.position.x);
          }
        }, {
          key: "handleEvents",
          value: function () {
            var t = this,
              e = {
                x: 0,
                y: 0
              },
              i = {
                x: 0,
                y: 0
              },
              o = null,
              n = null,
              s = !1,
              r = function (n) {
                if (t.isDragging) {
                  var r = s ? n.touches[0] : n,
                    a = r.pageX,
                    l = r.pageY,
                    p = r.clientX,
                    c = r.clientY;
                  t.dragOffset.x = a - e.x, t.dragOffset.y = l - e.y, t.clientOffset.x = p - i.x, t.clientOffset.y = c - i.y, (Math.abs(t.clientOffset.x) > 5 && !o || Math.abs(t.clientOffset.y) > 5 && !o) && (o = t.getDragDirection(t.getDragAngle(t.clientOffset.x, t.clientOffset.y), t.props.dragDirectionTolerance)), t.props.lockScrollOnDragDirection && "all" !== t.props.lockScrollOnDragDirection ? o === t.props.lockScrollOnDragDirection && s ? (t.dragPosition.x = t.dragStartPosition.x + t.dragOffset.x, t.dragPosition.y = t.dragStartPosition.y + t.dragOffset.y) : s ? (t.dragPosition.x = t.dragStartPosition.x, t.dragPosition.y = t.dragStartPosition.y) : (t.dragPosition.x = t.dragStartPosition.x + t.dragOffset.x, t.dragPosition.y = t.dragStartPosition.y + t.dragOffset.y) : (t.dragPosition.x = t.dragStartPosition.x + t.dragOffset.x, t.dragPosition.y = t.dragStartPosition.y + t.dragOffset.y);
                }
              };
            this.events.pointerdown = function (o) {
              s = !(!o.touches || !o.touches[0]), t.props.onPointerDown(t.getState(), o, s);
              var n = s ? o.touches[0] : o,
                a = n.pageX,
                l = n.pageY,
                p = n.clientX,
                c = n.clientY,
                h = t.props.viewport,
                u = h.getBoundingClientRect();
              if (!(p - u.left >= h.clientLeft + h.clientWidth) && !(c - u.top >= h.clientTop + h.clientHeight) && t.props.shouldScroll(t.getState(), o) && 2 !== o.button && ("mouse" !== t.props.pointerMode || !s) && ("touch" !== t.props.pointerMode || s) && !(t.props.inputsFocus && ["input", "textarea", "button", "select", "label"].indexOf(o.target.nodeName.toLowerCase()) > -1)) {
                if (t.props.textSelection) {
                  if (function (t, e, i) {
                    for (var o = t.childNodes, n = document.createRange(), s = 0; s < o.length; s++) {
                      var r = o[s];
                      if (3 === r.nodeType) {
                        n.selectNodeContents(r);
                        var a = n.getBoundingClientRect();
                        if (e >= a.left && i >= a.top && e <= a.right && i <= a.bottom) return r;
                      }
                    }
                    return !1;
                  }(o.target, p, c)) return;
                  (f = window.getSelection ? window.getSelection() : document.selection) && (f.removeAllRanges ? f.removeAllRanges() : f.empty && f.empty());
                }
                var f;
                t.isDragging = !0, e.x = a, e.y = l, i.x = p, i.y = c, t.dragStartPosition.x = t.position.x, t.dragStartPosition.y = t.position.y, r(o), t.startAnimationLoop();
              }
            }, this.events.pointermove = function (e) {
              !e.cancelable || "all" !== t.props.lockScrollOnDragDirection && t.props.lockScrollOnDragDirection !== o || e.preventDefault(), r(e), t.props.onPointerMove(t.getState(), e, s);
            }, this.events.pointerup = function (e) {
              t.isDragging = !1, o = null, t.props.onPointerUp(t.getState(), e, s);
            }, this.events.wheel = function (e) {
              var i = t.getState();
              t.props.emulateScroll && (t.velocity.x = 0, t.velocity.y = 0, t.isScrolling = !0, t.scrollOffset.x = -e.deltaX, t.scrollOffset.y = -e.deltaY, t.props.onWheel(i, e), t.startAnimationLoop(), clearTimeout(n), n = setTimeout(function () {
                return t.isScrolling = !1;
              }, 200/*80*/), t.props.preventDefaultOnEmulateScroll && t.getDragDirection(t.getDragAngle(-e.deltaX, -e.deltaY), t.props.dragDirectionTolerance) === t.props.preventDefaultOnEmulateScroll && e.preventDefault());
            }, this.events.scroll = function () {
              var e = t.props.viewport,
                i = e.scrollLeft,
                o = e.scrollTop;
              Math.abs(t.position.x + i) > 3 && (t.position.x = -i, t.velocity.x = 0), Math.abs(t.position.y + o) > 3 && (t.position.y = -o, t.velocity.y = 0);
            }, this.events.click = function (e) {
              var i = t.getState(),
                o = "vertical" !== t.props.direction ? i.dragOffset.x : 0,
                n = "horizontal" !== t.props.direction ? i.dragOffset.y : 0;
              Math.max(Math.abs(o), Math.abs(n)) > 5 && (e.preventDefault(), e.stopPropagation()), t.props.onClick(i, e, s);
            }, this.events.contentLoad = function () {
              return t.updateMetrics();
            }, this.events.resize = function () {
              return t.updateMetrics();
            }, this.props.viewport.addEventListener("mousedown", this.events.pointerdown), this.props.viewport.addEventListener("touchstart", this.events.pointerdown, {
              passive: !1
            }), this.props.viewport.addEventListener("click", this.events.click), this.props.viewport.addEventListener("wheel", this.events.wheel, {
              passive: !1
            }), this.props.viewport.addEventListener("scroll", this.events.scroll), this.props.content.addEventListener("load", this.events.contentLoad, !0), window.addEventListener("mousemove", this.events.pointermove), window.addEventListener("touchmove", this.events.pointermove, {
              passive: !1
            }), window.addEventListener("mouseup", this.events.pointerup), window.addEventListener("touchend", this.events.pointerup), window.addEventListener("resize", this.events.resize);
          }
        }, {
          key: "destroy",
          value: function () {
            this.props.viewport.removeEventListener("mousedown", this.events.pointerdown), this.props.viewport.removeEventListener("touchstart", this.events.pointerdown), this.props.viewport.removeEventListener("click", this.events.click), this.props.viewport.removeEventListener("wheel", this.events.wheel), this.props.viewport.removeEventListener("scroll", this.events.scroll), this.props.content.removeEventListener("load", this.events.contentLoad), window.removeEventListener("mousemove", this.events.pointermove), window.removeEventListener("touchmove", this.events.pointermove), window.removeEventListener("mouseup", this.events.pointerup), window.removeEventListener("touchend", this.events.pointerup), window.removeEventListener("resize", this.events.resize);
          }
        }]) && a(e.prototype, i), o && a(e, o), t;
      }();
  }]).default;
});