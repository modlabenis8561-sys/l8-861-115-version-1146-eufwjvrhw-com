(function () {
    function all(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function one(selector, root) {
        return (root || document).querySelector(selector);
    }

    function openMobileMenu() {
        var button = one('[data-menu-button]');
        var nav = one('[data-mobile-nav]');

        if (!button || !nav) {
            return;
        }

        button.addEventListener('click', function () {
            nav.classList.toggle('is-open');
        });
    }

    function setupHero() {
        var slides = all('[data-hero-slide]');
        var dots = all('[data-hero-dot]');
        var previous = one('[data-hero-prev]');
        var next = one('[data-hero-next]');
        var index = 0;
        var timer = null;

        if (slides.length < 2) {
            return;
        }

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === index);
            });

            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === index);
            });
        }

        function play() {
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        function restart() {
            if (timer) {
                window.clearInterval(timer);
            }
            play();
        }

        if (previous) {
            previous.addEventListener('click', function () {
                show(index - 1);
                restart();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
                restart();
            });
        }

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener('click', function () {
                show(dotIndex);
                restart();
            });
        });

        show(0);
        play();
    }

    function setupFilters() {
        all('[data-filter-form]').forEach(function (form) {
            var cards = all('[data-card]');
            var empty = one('[data-empty-state]');
            var params = new URLSearchParams(window.location.search);
            var q = params.get('q') || '';
            var keyword = one('[name="q"]', form);
            var category = one('[name="category"]', form);
            var year = one('[name="year"]', form);

            if (keyword && q) {
                keyword.value = q;
            }

            function apply() {
                var term = keyword ? keyword.value.trim().toLowerCase() : '';
                var selectedCategory = category ? category.value : '';
                var selectedYear = year ? year.value : '';
                var visible = 0;

                cards.forEach(function (card) {
                    var matchesTerm = !term || (card.dataset.search || '').indexOf(term) !== -1;
                    var matchesCategory = !selectedCategory || card.dataset.category === selectedCategory;
                    var matchesYear = !selectedYear || card.dataset.year === selectedYear;
                    var shouldShow = matchesTerm && matchesCategory && matchesYear;

                    card.style.display = shouldShow ? '' : 'none';

                    if (shouldShow) {
                        visible += 1;
                    }
                });

                if (empty) {
                    empty.classList.toggle('is-visible', visible === 0);
                }
            }

            ['input', 'change'].forEach(function (eventName) {
                form.addEventListener(eventName, apply);
            });

            apply();
        });
    }

    window.initMoviePlayer = function (settings) {
        var video = document.getElementById(settings.videoId);
        var button = document.getElementById(settings.buttonId);
        var streamUrl = settings.streamUrl;
        var player = null;

        if (!video || !streamUrl) {
            return;
        }

        function attachStream() {
            if (video.dataset.ready === '1') {
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                player = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: false
                });
                player.loadSource(streamUrl);
                player.attachMedia(video);
            } else {
                video.src = streamUrl;
            }

            video.dataset.ready = '1';
        }

        function start() {
            attachStream();

            if (button) {
                button.classList.add('is-hidden');
            }

            var promise = video.play();

            if (promise && typeof promise.catch === 'function') {
                promise.catch(function () {});
            }
        }

        if (button) {
            button.addEventListener('click', start);
        }

        video.addEventListener('click', function () {
            if (video.dataset.ready !== '1') {
                start();
            }
        });

        video.addEventListener('play', function () {
            if (button) {
                button.classList.add('is-hidden');
            }
        });

        window.addEventListener('pagehide', function () {
            if (player && typeof player.destroy === 'function') {
                player.destroy();
            }
        });
    };

    document.addEventListener('DOMContentLoaded', function () {
        openMobileMenu();
        setupHero();
        setupFilters();
    });
}());
