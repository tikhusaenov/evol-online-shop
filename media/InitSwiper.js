/*!
 * InitSwiper v0.2.9
 * Vladimir Ivanin
 * 2018
 */
(function() {
    function r(e, n, t) {
        function o(i, f) {
            if (!n[i]) {
                if (!e[i]) {
                    var c = "function" == typeof require && require;
                    if (!f && c) return c(i, !0);
                    if (u) return u(i, !0);
                    var a = new Error("Cannot find module '" + i + "'");
                    throw a.code = "MODULE_NOT_FOUND", a
                }
                var p = n[i] = {
                    exports: {}
                };
                e[i][0].call(p.exports, function(r) {
                    var n = e[i][1][r];
                    return o(n || r)
                }, p, p.exports, r, e, n, t)
            }
            return n[i].exports
        }
        for (var u = "function" == typeof require && require, i = 0; i < t.length; i++) o(t[i]);
        return o
    }
    return r
})()({
    1: [function(require, module, exports) {
        function generateUUID() {
            var e = (new Date).getTime();
            return "xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx".replace(/[xy]/g, function(t) {
                var n = (e + 16 * Math.random()) % 16 | 0;
                return e = Math.floor(e / 16), ("x" == t ? n : 3 & n | 8).toString(16)
            })
        }

        function patchNumber(e) {
            var t, n = "string" == typeof e;
            if (!("number" == typeof e) && !n) return 0;
            return n && (e = (e = (e = e.replace(/,/g, ".")).replace(/px/g, "")).replace(/\%/g, ""), e = isNaN(+e) ? 1 : +e), Number((t = e, Number(t) === t && t % 1 != 0 ? e.toFixed(2) : e))
        }

        function debounce(e, t, n) {
            var r;
            return function() {
                var x = this,
                    a = arguments,
                    i = n && !r;
                clearTimeout(r), r = setTimeout(function() {
                    r = null, n || e.apply(x, a)
                }, t), i && e.apply(x, a)
            }
        }

        function slideLength(e, t) {
            var n = Math.floor(e / t);
            return (!n || n < 1) && (n = 1), n
        }

        function getContainerWidth(e) {
            var t = e.parents(":visible").width(),
                n = e.width();
            return 0 == n && (n = t > 0 ? t : e.parent().parent().width()), n
        }
        module.exports = {
            slideLength: slideLength,
            debounce: debounce,
            generateUUID: generateUUID,
            getContainerWidth: getContainerWidth,
            patchNumber: patchNumber
        };
    }, {}],
    2: [function(require, module, exports) {
        var defaults = require("../variables").defaults,
            init = require("./init"),
            InitSwiper = function(i, e) {
                var t = this,
                    n = [];
                return t.options = $.extend(!0, {}, defaults, e), t.init = init, "undefined" == typeof Swiper && console.warn("Отсутствует плагин Swiper"), ("string" == typeof i ? $(i) : i).each(function(i, e) {
                    var r = t.init($(e));
                    _.isArray(r) ? n = n.concat(r) : n.push(r)
                }), n
            };
        module.exports = InitSwiper;
    }, {
        "../variables": 5,
        "./init": 3
    }],
    3: [function(require, module, exports) {
        var debounce = require("./help").debounce,
            slideLength = require("./help").slideLength,
            generateUUID = require("./help").generateUUID,
            getContainerWidth = require("./help").getContainerWidth;

        function init(e) {
            var i = e.hasClass("swiper-container") ? e.parent() : e,
                n = generateUUID(),
                r = this.options,
                t = i[0] && i[0].swiper ? i[0].swiper : null,
                a = ".slider-" + n,
                s = ".container-" + n,
                p = a + " .swiper-container" + s,
                d = a + " .swiper-button-next",
                o = a + " .swiper-button-prev",
                l = i.find(".swiper-slide").length,
                w = r._parents,
                u = null;
            w && (u = i.parents(w + ":first")), i.addClass(a.replace(".", "")), i.find(".swiper-container").eq(0).addClass(s.replace(".", ""));
            var g = 1,
                h = $(p).eq(0),
                f = getContainerWidth(h);
            r.$swiperContainer = h, r.autoLength && (g = slideLength(f, r.minCartWidth));
            var v = {
                slidesPerView: g,
                loop: g < l,
                loopAdditionalSlides: l,
                navigation: {
                    nextEl: d,
                    prevEl: o
                },
                pagination: {
                    el: a + " .swiper-pagination",
                    type: "bullets",
                    clickable: !0
                }
            };
            Swiper.options || (v.nextButton = d, v.prevButton = o, v.pagination = a + " .swiper-pagination");
            var c = "undefined" != typeof Site && void 0 !== Site.menuConfig && void 0 !== Site.alertifyConfig;
            void 0 !== Swiper.name && "Factory" == Swiper.name && c && (i.find(".swiper-slide").attr("data-slider-slide", ""), i.find(".swiper-slide").parent(".swiper-wrapper").length && i.find(".swiper-slide").unwrap(".swiper-wrapper"));
            var C = $.extend(!0, v, r),
                m = l > 0;
            if (l < C.slidesPerView && i.addClass("arrow-hide"), m) {
                if (t) return t.params = C, t.update(!0), t;
                var S = new Swiper(p, C);
                return u && u.on("mouseenter", function(e) {
                    S.update(!0)
                }), r.autoResponsive && $(window).on("resize", debounce(function(e) {
                    void 0 !== S.params && (f = getContainerWidth(h), S.params.slidesPerView = slideLength(f, r.minCartWidth), S.update(!0))
                }, 150)), S
            }
            i.addClass("is-empty")
        }
        module.exports = init;
    }, {
        "./help": 1
    }],
    4: [function(require, module, exports) {
        window.InitSwiper = require("InitSwiper");
    }, {
        "InitSwiper": 2
    }],
    5: [function(require, module, exports) {
        var defaults = {
            setWrapperSize: !0,
            controlBy: "container",
            spaceBetween: 20,
            autoLength: !1,
            autoResponsive: !1,
            maxBreakpoint: 4200,
            minBreakpoint: 300,
            minCartWidth: 300,
            gutterCart: 10,
            pagination: {
                type: "bullets",
                clickable: !0
            }
        };
        module.exports = {
            defaults: defaults
        };
    }, {}]
}, {}, [4]);