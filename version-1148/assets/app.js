(function () {
    var menuButton = document.querySelector('.menu-button');
    var mobileNav = document.querySelector('.mobile-nav');

    if (menuButton && mobileNav) {
        menuButton.addEventListener('click', function () {
            var isOpen = mobileNav.classList.toggle('is-open');
            menuButton.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
    var currentSlide = 0;
    var slideTimer = null;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }

        currentSlide = (index + slides.length) % slides.length;

        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle('is-active', slideIndex === currentSlide);
        });

        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle('is-active', dotIndex === currentSlide);
        });
    }

    function startSlider() {
        if (slides.length < 2) {
            return;
        }

        clearInterval(slideTimer);
        slideTimer = setInterval(function () {
            showSlide(currentSlide + 1);
        }, 5200);
    }

    dots.forEach(function (dot) {
        dot.addEventListener('click', function () {
            showSlide(Number(dot.getAttribute('data-slide-to')) || 0);
            startSlider();
        });
    });

    var prevButton = document.querySelector('[data-hero-prev]');
    var nextButton = document.querySelector('[data-hero-next]');

    if (prevButton) {
        prevButton.addEventListener('click', function () {
            showSlide(currentSlide - 1);
            startSlider();
        });
    }

    if (nextButton) {
        nextButton.addEventListener('click', function () {
            showSlide(currentSlide + 1);
            startSlider();
        });
    }

    startSlider();

    function normalizeText(value) {
        return String(value || '').toLowerCase().trim();
    }

    function filterCards(input) {
        var selector = input.getAttribute('data-target') || '.movie-card';
        var cards = Array.prototype.slice.call(document.querySelectorAll(selector));
        var keyword = normalizeText(input.value);

        cards.forEach(function (card) {
            var text = normalizeText(card.getAttribute('data-search') || card.textContent);
            card.classList.toggle('is-hidden', keyword && text.indexOf(keyword) === -1);
        });
    }

    Array.prototype.slice.call(document.querySelectorAll('.site-search')).forEach(function (input) {
        input.addEventListener('input', function () {
            filterCards(input);
        });
    });

    var filterButtons = Array.prototype.slice.call(document.querySelectorAll('[data-filter]'));
    var homeCards = Array.prototype.slice.call(document.querySelectorAll('.home-card'));

    filterButtons.forEach(function (button) {
        button.addEventListener('click', function () {
            var filter = button.getAttribute('data-filter');

            filterButtons.forEach(function (item) {
                item.classList.toggle('is-active', item === button);
            });

            homeCards.forEach(function (card) {
                var match = filter === 'all' || card.getAttribute('data-category') === filter;
                card.classList.toggle('is-hidden', !match);
            });
        });
    });
})();

function setupMoviePlayer(source) {
    var video = document.getElementById('videoPlayer');
    var trigger = document.getElementById('playTrigger');
    var loaded = false;
    var hlsInstance = null;

    if (!video) {
        return;
    }

    function attachSource() {
        if (loaded) {
            return;
        }

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
        } else if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hlsInstance.loadSource(source);
            hlsInstance.attachMedia(video);
        } else {
            video.src = source;
        }

        loaded = true;
    }

    function playMovie() {
        attachSource();

        if (trigger) {
            trigger.classList.add('is-hidden');
        }

        var playResult = video.play();

        if (playResult && typeof playResult.catch === 'function') {
            playResult.catch(function () {});
        }
    }

    if (trigger) {
        trigger.addEventListener('click', playMovie);
    }

    video.addEventListener('click', function () {
        if (!loaded) {
            playMovie();
        }
    });

    video.addEventListener('play', function () {
        if (trigger) {
            trigger.classList.add('is-hidden');
        }
    });

    window.addEventListener('beforeunload', function () {
        if (hlsInstance) {
            hlsInstance.destroy();
        }
    });
}
