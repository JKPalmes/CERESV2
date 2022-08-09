!(function () {
    function I() {
        //window.addEventListener("resize", v),
        //    v(),
        //    Waves.init(),
            document.addEventListener("scroll", function () {
                var e;
                /*(e = document.getElementById("page-topbar")) && (50 <= document.body.scrollTop || 50 <= document.documentElement.scrollTop ? e.classList.add("topbar-shadow") : e.classList.remove("topbar-shadow"));*/
                (e = document.getElementById("page-title")) && (50 <= document.body.scrollTop || 50 <= document.documentElement.scrollTop ? e.classList.add("topbar-shadow") : e.classList.remove("topbar-shadow"));
            })
            //document.getElementById("topnav-hamburger-icon") && document.getElementById("topnav-hamburger-icon").addEventListener("click", w);
    }
    function f(e) {
        if (e) {
            var t = e.offsetTop,
                a = e.offsetLeft,
                n = e.offsetWidth,
                o = e.offsetHeight;
            if (e.offsetParent) for (; e.offsetParent;) (t += (e = e.offsetParent).offsetTop), (a += e.offsetLeft);
            return t >= window.pageYOffset && a >= window.pageXOffset && t + o <= window.pageYOffset + window.innerHeight && a + n <= window.pageXOffset + window.innerWidth;
        }
    }
    function N() {
        document.webkitIsFullScreen || document.mozFullScreen || document.msFullscreenElement || document.body.classList.remove("fullscreen-enable");
    }
    (i = document.querySelector('[data-toggle="fullscreen"]')) &&
        i.addEventListener("click", function (e) {
            e.preventDefault(),
                document.body.classList.toggle("fullscreen-enable"),
                document.fullscreenElement || document.mozFullScreenElement || document.webkitFullscreenElement
                    ? document.cancelFullScreen
                        ? document.cancelFullScreen()
                        : document.mozCancelFullScreen
                            ? document.mozCancelFullScreen()
                            : document.webkitCancelFullScreen && document.webkitCancelFullScreen()
                    : document.documentElement.requestFullscreen
                        ? document.documentElement.requestFullscreen()
                        : document.documentElement.mozRequestFullScreen
                            ? document.documentElement.mozRequestFullScreen()
                            : document.documentElement.webkitRequestFullscreen && document.documentElement.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
        }),
        document.addEventListener("fullscreenchange", N),
        document.addEventListener("webkitfullscreenchange", N),
        document.addEventListener("mozfullscreenchange", N)
        //(l = document.getElementsByTagName("HTML")[0]),
        //(i = document.querySelectorAll(".light-dark-mode")) &&
        //i.length &&
        //i[0].addEventListener("click", function (e) {
        //    l.hasAttribute("data-layout-mode") && "dark" == l.getAttribute("data-layout-mode") ? F("data-layout-mode", "light", "layout-mode-light", l) : F("data-layout-mode", "dark", "layout-mode-dark", l);
        //}),
        //I(),
        //k(),
        //h(),
        //(i = document.querySelectorAll("[data-provider]")),
        //Array.from(i).forEach(function (e) {
        //    var t, a, n;
        //    "flatpickr" == e.getAttribute("data-provider")
        //        ? ((n = {}),
        //            (t = e.attributes)["data-date-format"] && (n.dateFormat = t["data-date-format"].value.toString()),
        //            t["data-enable-time"] && ((n.enableTime = !0), (n.dateFormat = t["data-date-format"].value.toString() + " H:i")),
        //            t["data-altFormat"] && ((n.altInput = !0), (n.altFormat = t["data-altFormat"].value.toString())),
        //            t["data-minDate"] && ((n.minDate = t["data-minDate"].value.toString()), (n.dateFormat = t["data-date-format"].value.toString())),
        //            t["data-maxDate"] && ((n.maxDate = t["data-maxDate"].value.toString()), (n.dateFormat = t["data-date-format"].value.toString())),
        //            t["data-deafult-date"] && ((n.defaultDate = t["data-deafult-date"].value.toString()), (n.dateFormat = t["data-date-format"].value.toString())),
        //            t["data-multiple-date"] && ((n.mode = "multiple"), (n.dateFormat = t["data-date-format"].value.toString())),
        //            t["data-range-date"] && ((n.mode = "range"), (n.dateFormat = t["data-date-format"].value.toString())),
        //            t["data-inline-date"] && ((n.inline = !0), (n.defaultDate = t["data-deafult-date"].value.toString()), (n.dateFormat = t["data-date-format"].value.toString())),
        //            t["data-disable-date"] && ((a = []).push(t["data-disable-date"].value), (n.disable = a.toString().split(","))),
        //            flatpickr(e, n))
        //        : "timepickr" == e.getAttribute("data-provider") &&
        //        ((a = {}),
        //            (n = e.attributes)["data-time-basic"] && ((a.enableTime = !0), (a.noCalendar = !0), (a.dateFormat = "H:i")),
        //            n["data-time-hrs"] && ((a.enableTime = !0), (a.noCalendar = !0), (a.dateFormat = "H:i"), (a.time_24hr = !0)),
        //            n["data-min-time"] && ((a.enableTime = !0), (a.noCalendar = !0), (a.dateFormat = "H:i"), (a.minTime = n["data-min-time"].value.toString())),
        //            n["data-max-time"] && ((a.enableTime = !0), (a.noCalendar = !0), (a.dateFormat = "H:i"), (a.minTime = n["data-max-time"].value.toString())),
        //            n["data-default-time"] && ((a.enableTime = !0), (a.noCalendar = !0), (a.dateFormat = "H:i"), (a.defaultDate = n["data-default-time"].value.toString())),
        //            n["data-time-inline"] && ((a.enableTime = !0), (a.noCalendar = !0), (a.defaultDate = n["data-time-inline"].value.toString()), (a.inline = !0)),
        //            flatpickr(e, a));
        //}),
        //Array.from(document.querySelectorAll('.dropdown-menu a[data-bs-toggle="tab"]')).forEach(function (e) {
        //    e.addEventListener("click", function (e) {
        //        e.stopPropagation(), bootstrap.Tab.getInstance(e.target).show();
        //    });
        //}),
        //(function () {
        //    y(null === b ? g : b);
        //    var e = document.getElementsByClassName("language");
        //    e &&
        //        Array.from(e).forEach(function (t) {
        //            t.addEventListener("click", function (e) {
        //                y(t.getAttribute("data-lang"));
        //            });
        //        });
        //})(),
        //p(),
        //T(),
//        window.addEventListener("resize", function () {
//            m && clearTimeout(m), (m = setTimeout(M, 2e3));
//        });
})();
var mybutton1 = document.getElementById("back-to-top");
function scrollUpFunction() {
    mybutton1.style.display = "block";
}

window.onscroll = function () {
    scrollUpFunction();
};
