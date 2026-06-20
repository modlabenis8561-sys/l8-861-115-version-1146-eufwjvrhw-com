(function () {
    'use strict';

    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    function initMobileMenu() {
        var button = document.querySelector('[data-menu-toggle]');
        var nav = document.querySelector('[data-mobile-nav]');
        if (!button || !nav) {
            return;
        }
        button.addEventListener('click', function () {
            nav.classList.toggle('open');
        });
    }

    function initHero() {
        var hero = document.querySelector('[data-hero]');
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var prev = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        if (!slides.length) {
            return;
        }
        var current = 0;
        var timer = null;

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === current);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5000);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                show(index);
                start();
            });
        });
        if (prev) {
            prev.addEventListener('click', function () {
                show(current - 1);
                start();
            });
        }
        if (next) {
            next.addEventListener('click', function () {
                show(current + 1);
                start();
            });
        }
        hero.addEventListener('mouseenter', stop);
        hero.addEventListener('mouseleave', start);
        show(0);
        start();
    }

    function normalize(value) {
        return String(value || '').toLowerCase().trim();
    }

    function initCardFilters() {
        var lists = Array.prototype.slice.call(document.querySelectorAll('[data-card-list]'));
        lists.forEach(function (list) {
            var section = list.closest('.content-section') || document;
            var input = section.querySelector('.js-card-search');
            var buttons = Array.prototype.slice.call(section.querySelectorAll('[data-filter-type]'));
            var countNode = section.querySelector('[data-result-count]');
            var cards = Array.prototype.slice.call(list.querySelectorAll('.movie-card'));
            var currentType = 'all';

            function update() {
                var query = normalize(input ? input.value : '');
                var visible = 0;
                cards.forEach(function (card) {
                    var text = normalize(card.getAttribute('data-search'));
                    var type = card.getAttribute('data-type') || '';
                    var matchesQuery = !query || text.indexOf(query) !== -1;
                    var matchesType = currentType === 'all' || type === currentType;
                    var shouldShow = matchesQuery && matchesType;
                    card.classList.toggle('is-hidden', !shouldShow);
                    if (shouldShow) {
                        visible += 1;
                    }
                });
                if (countNode) {
                    countNode.textContent = '显示 ' + visible + ' 部影片';
                }
            }

            if (input) {
                input.addEventListener('input', update);
            }
            buttons.forEach(function (button) {
                button.addEventListener('click', function () {
                    currentType = button.getAttribute('data-filter-type') || 'all';
                    buttons.forEach(function (item) {
                        item.classList.toggle('active', item === button);
                    });
                    update();
                });
            });
            update();
        });
    }

    function createSearchCard(item) {
        var tags = (item.tags || []).slice(0, 3).map(function (tag) {
            return '<span>' + escapeHtml(tag) + '</span>';
        }).join('');
        return [
            '<article class="movie-card">',
            '    <a class="poster-link" href="' + escapeAttribute(item.url) + '" aria-label="观看 ' + escapeAttribute(item.title) + '">',
            '        <span class="poster-frame">',
            '            <img src="./' + escapeAttribute(item.image) + '" alt="' + escapeAttribute(item.title) + '" loading="lazy">',
            '            <span class="poster-overlay">立即观看</span>',
            '            <span class="region-badge">' + escapeHtml(item.region) + '</span>',
            '            <span class="year-badge">' + escapeHtml(item.year) + '</span>',
            '        </span>',
            '    </a>',
            '    <div class="movie-card-body">',
            '        <h3><a href="' + escapeAttribute(item.url) + '">' + escapeHtml(item.title) + '</a></h3>',
            '        <p>' + escapeHtml(item.oneLine) + '</p>',
            '        <div class="movie-meta-row"><span>' + escapeHtml(item.type) + '</span><span>' + escapeHtml(item.genre) + '</span></div>',
            '        <div class="tag-row">' + tags + '</div>',
            '    </div>',
            '</article>'
        ].join('\n');
    }

    function escapeHtml(value) {
        return String(value == null ? '' : value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    function escapeAttribute(value) {
        return escapeHtml(value).replace(/`/g, '&#096;');
    }

    function initGlobalSearch() {
        var input = document.getElementById('global-search-input');
        var results = document.getElementById('global-search-results');
        var count = document.getElementById('global-search-count');
        var button = document.querySelector('[data-global-search-button]');
        var index = window.MOVIE_SEARCH_INDEX || [];
        if (!input || !results || !index.length) {
            return;
        }

        function render() {
            var query = normalize(input.value);
            var matched;
            if (!query) {
                matched = index.slice(0, 36);
                if (count) {
                    count.textContent = '默认展示 36 部推荐影片，输入关键词可检索全部 ' + index.length + ' 部影片。';
                }
            } else {
                matched = index.filter(function (item) {
                    return normalize(item.search).indexOf(query) !== -1;
                }).slice(0, 240);
                if (count) {
                    count.textContent = '找到 ' + matched.length + ' 部相关影片' + (matched.length >= 240 ? '，已显示前 240 部。' : '。');
                }
            }
            results.innerHTML = matched.map(createSearchCard).join('\n');
        }

        var params = new URLSearchParams(window.location.search);
        var q = params.get('q');
        if (q) {
            input.value = q;
        }
        input.addEventListener('input', render);
        if (button) {
            button.addEventListener('click', render);
        }
        render();
    }

    function initPlayers() {
        var players = Array.prototype.slice.call(document.querySelectorAll('.js-hls-player'));
        players.forEach(function (player) {
            var video = player.querySelector('video');
            var button = player.querySelector('.video-play-overlay');
            var status = player.querySelector('.video-status');
            var source = player.getAttribute('data-src');
            var hls = null;
            var initialized = false;

            function setStatus(message) {
                if (status) {
                    status.textContent = message || '';
                }
            }

            function startPlayback() {
                if (!video || !source) {
                    setStatus('未找到播放源');
                    return;
                }
                if (!initialized) {
                    initialized = true;
                    setStatus('正在加载播放源...');
                    if (window.Hls && window.Hls.isSupported()) {
                        hls = new window.Hls({
                            enableWorker: true,
                            lowLatencyMode: true
                        });
                        hls.loadSource(source);
                        hls.attachMedia(video);
                        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                            player.classList.add('is-ready');
                            setStatus('播放源已就绪');
                            video.play().catch(function () {
                                setStatus('请再次点击播放');
                            });
                        });
                        hls.on(window.Hls.Events.ERROR, function (event, data) {
                            if (data && data.fatal) {
                                setStatus('视频加载失败，请刷新重试');
                            }
                        });
                    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                        video.src = source;
                        video.addEventListener('loadedmetadata', function () {
                            player.classList.add('is-ready');
                            setStatus('播放源已就绪');
                            video.play().catch(function () {
                                setStatus('请再次点击播放');
                            });
                        }, { once: true });
                    } else {
                        setStatus('当前浏览器不支持 HLS 播放');
                    }
                } else {
                    video.play().catch(function () {
                        setStatus('请再次点击播放');
                    });
                }
            }

            if (button) {
                button.addEventListener('click', startPlayback);
            }
            if (video) {
                video.addEventListener('play', function () {
                    player.classList.add('is-playing');
                    setStatus('正在播放');
                });
                video.addEventListener('pause', function () {
                    player.classList.remove('is-playing');
                });
            }
            window.addEventListener('beforeunload', function () {
                if (hls) {
                    hls.destroy();
                }
            });
        });
    }

    function initImageFallback() {
        document.addEventListener('error', function (event) {
            var target = event.target;
            if (target && target.tagName === 'IMG') {
                var frame = target.closest('.poster-frame, .hero-poster, .category-cover, .category-collage, .poster-side-card');
                if (frame) {
                    frame.classList.add('poster-missing');
                }
            }
        }, true);
    }

    function initScrollPlayerLinks() {
        var links = Array.prototype.slice.call(document.querySelectorAll('[data-scroll-player]'));
        links.forEach(function (link) {
            link.addEventListener('click', function (event) {
                var player = document.querySelector('.player-card');
                if (player) {
                    event.preventDefault();
                    player.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            });
        });
    }

    ready(function () {
        initMobileMenu();
        initHero();
        initCardFilters();
        initGlobalSearch();
        initPlayers();
        initImageFallback();
        initScrollPlayerLinks();
    });
}());
