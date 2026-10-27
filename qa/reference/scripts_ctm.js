

$(function () {

    "use strict";


    /* ===============================  Navbar Menu  =============================== */

    var wind = $(window);

    wind.on("scroll", function () {

        var bodyScroll = wind.scrollTop(),
            navbar = $(".topnav");

        if (bodyScroll > 0) {

            navbar.addClass("nav-scroll");

        } else {

            navbar.removeClass("nav-scroll");
        }
    });
});

/* ===============================  Hide / show navbar  =============================== */

var didScroll;
var lastScrollTop = 0;
var delta = 5;
var navbarHeight = $('#navi').outerHeight();
$(window).on("scroll", function (event) {
    didScroll = true;
});

setInterval(function () {
    if (didScroll) {
        hasScrolled();
        didScroll = false;
    }
}, 250);

function hasScrolled() {
    var st = $(this).scrollTop();

    if (Math.abs(lastScrollTop - st) <= delta)
        return;

    if (st > lastScrollTop && st > navbarHeight) {
        $('#navi').css('top', '-100px');

    } else {

        if (st + $(window).height() < $(document).height()) {
            $('#navi').css('top', '0');
        }
    }

    lastScrollTop = st;
}

/* ===============================  Scroll back to top  =============================== */

$(document).ready(function () {
    "use strict";

    //Scroll back to top

    var progressPath = document.querySelector('.progress-wrap path');
    var pathLength = progressPath.getTotalLength();
    progressPath.style.transition = progressPath.style.WebkitTransition = 'none';
    progressPath.style.strokeDasharray = pathLength + ' ' + pathLength;
    progressPath.style.strokeDashoffset = pathLength;
    progressPath.getBoundingClientRect();
    progressPath.style.transition = progressPath.style.WebkitTransition = 'stroke-dashoffset 10ms linear';
    var updateProgress = function () {
        var scroll = $(window).scrollTop();
        var height = $(document).height() - $(window).height();
        var progress = pathLength - (scroll * pathLength / height);
        progressPath.style.strokeDashoffset = progress;
    }
    updateProgress();
    $(window).scroll(updateProgress);
    var offset = 150;
    var duration = 550;
    $(window).on('scroll', function () {
        if ($(this).scrollTop() > offset) {
            $('.progress-wrap').addClass('active-progress');
        } else {
            $('.progress-wrap').removeClass('active-progress');
        }
    });
    $('.progress-wrap').on('click', function (event) {
        event.preventDefault();
        $('html, body').animate({ scrollTop: 0 }, duration);
        return false;
    });


});




var $ = jQuery.noConflict();
	$(document).ready(function () {

	    $('.nav-toggle-sm').on('click', function(){
	        if ($('html').hasClass('body-menu-opened')) {
	            $('html').removeClass('body-menu-opened').addClass('body-menu-close');
	        } else {
	            $('html').addClass('body-menu-opened').removeClass('body-menu-close');
	        }
	    });

    });
$(document).on("click", ".navbar-toggler", function () {
      $("#navbarNavDropdown").slideToggle();
});

// $("#carouselExampleControls").carousel({
//       interval: 1700,
//       cycle: true,
//       pause: false,
// });

var $ = jQuery.noConflict();
    $(document).ready(function () {
      $(".nav-toggle-sm").on("click", function () {
        if ($("html").hasClass("body-menu-opened")) {
          $("html")
            .removeClass("body-menu-opened")
            .addClass("body-menu-close");
        } else {
          $("html")
            .addClass("body-menu-opened")
            .removeClass("body-menu-close");
        }
      });
    });
