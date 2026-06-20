(function () {
  function selectAll(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function setupMobileMenu() {
    var button = document.querySelector('.mobile-menu-button');
    var menu = document.querySelector('.mobile-nav');

    if (!button || !menu) {
      return;
    }

    button.addEventListener('click', function () {
      var opened = menu.classList.toggle('open');
      button.setAttribute('aria-expanded', opened ? 'true' : 'false');
    });
  }

  function setupHero() {
    var slides = selectAll('[data-hero-slide]');
    var dots = selectAll('[data-hero-dot]');
    var next = document.querySelector('[data-hero-next]');
    var previous = document.querySelector('[data-hero-prev]');

    if (slides.length <= 1) {
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
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        show(index);
        start();
      });
    });

    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
        start();
      });
    }

    if (previous) {
      previous.addEventListener('click', function () {
        show(current - 1);
        start();
      });
    }

    start();
  }

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function setupCardFilters() {
    selectAll('[data-card-filter]').forEach(function (form) {
      var input = form.querySelector('input');
      var list = document.querySelector('[data-card-list]');

      if (!input || !list) {
        return;
      }

      input.addEventListener('input', function () {
        var keyword = normalize(input.value);
        selectAll('.movie-card', list).forEach(function (card) {
          var haystack = normalize(card.getAttribute('data-title') + ' ' + card.getAttribute('data-meta'));
          card.style.display = !keyword || haystack.indexOf(keyword) !== -1 ? '' : 'none';
        });
      });

      form.addEventListener('submit', function (event) {
        event.preventDefault();
      });
    });
  }

  function buildResultCard(movie) {
    var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
      return '<span>' + escapeHtml(tag) + '</span>';
    }).join('');

    return [
      '<article class="movie-card">',
      '  <a class="movie-cover" href="' + escapeAttribute(movie.url) + '">',
      '    <img src="' + escapeAttribute(movie.cover) + '" alt="' + escapeAttribute(movie.title) + '" loading="lazy">',
      '    <span class="movie-type">' + escapeHtml(movie.type) + '</span>',
      '  </a>',
      '  <div class="movie-card-body">',
      '    <a class="movie-title" href="' + escapeAttribute(movie.url) + '">' + escapeHtml(movie.title) + '</a>',
      '    <p class="movie-line">' + escapeHtml(movie.oneLine) + '</p>',
      '    <div class="movie-meta">',
      '      <span>' + escapeHtml(movie.year) + '</span>',
      '      <span>' + escapeHtml(movie.region) + '</span>',
      '      <span>' + escapeHtml(movie.genre) + '</span>',
      '    </div>',
      '    <div class="tag-row">' + tags + '</div>',
      '  </div>',
      '</article>'
    ].join('');
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function escapeAttribute(value) {
    return escapeHtml(value).replace(/`/g, '&#096;');
  }

  function setupSearchPage() {
    var panel = document.getElementById('searchPanel');
    var input = document.getElementById('searchInput');
    var type = document.getElementById('searchType');
    var results = document.getElementById('searchResults');
    var status = document.getElementById('searchStatus');
    var data = globalThis.SiteMovieData || [];

    if (!panel || !input || !results || !status) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var initial = params.get('q') || '';
    input.value = initial;

    function render() {
      var keyword = normalize(input.value);
      var typeValue = normalize(type ? type.value : '');
      var matches = data.filter(function (movie) {
        var text = normalize([
          movie.title,
          movie.region,
          movie.type,
          movie.year,
          movie.genre,
          movie.oneLine,
          (movie.tags || []).join(' ')
        ].join(' '));
        var matchesKeyword = !keyword || text.indexOf(keyword) !== -1;
        var matchesType = !typeValue || normalize(movie.type + ' ' + movie.genre).indexOf(typeValue) !== -1;
        return matchesKeyword && matchesType;
      }).slice(0, 120);

      if (!keyword && !typeValue) {
        matches = data.slice(0, 60);
      }

      results.innerHTML = matches.map(buildResultCard).join('');
      status.textContent = matches.length ? '已为你找到相关视频。' : '没有找到匹配内容。';
    }

    panel.addEventListener('submit', function (event) {
      event.preventDefault();
      render();
    });

    input.addEventListener('input', render);

    if (type) {
      type.addEventListener('change', render);
    }

    render();
  }

  function setupPlayers() {
    selectAll('.video-player').forEach(function (player) {
      var video = player.querySelector('video');
      var button = player.querySelector('.player-overlay');
      var url = player.getAttribute('data-video-url');
      var started = false;

      if (!video || !url) {
        return;
      }

      function playVideo() {
        if (!started) {
          started = true;
          attachSource(video, url, function () {
            var action = video.play();
            if (action && typeof action.catch === 'function') {
              action.catch(function () {
                player.classList.remove('is-playing');
              });
            }
          });
        } else {
          video.play();
        }
        player.classList.add('is-playing');
      }

      if (button) {
        button.addEventListener('click', playVideo);
      }

      video.addEventListener('click', function () {
        if (video.paused) {
          playVideo();
        }
      });

      video.addEventListener('play', function () {
        player.classList.add('is-playing');
      });

      video.addEventListener('pause', function () {
        if (!video.ended) {
          player.classList.remove('is-playing');
        }
      });
    });
  }

  function attachSource(video, url, done) {
    if (globalThis.Hls && globalThis.Hls.isSupported()) {
      var hls = new globalThis.Hls({
        enableWorker: true,
        lowLatencyMode: false
      });
      hls.loadSource(url);
      hls.attachMedia(video);
      hls.on(globalThis.Hls.Events.MANIFEST_PARSED, function () {
        done();
      });
      hls.on(globalThis.Hls.Events.ERROR, function (event, data) {
        if (data && data.fatal) {
          hls.destroy();
          video.src = url;
          done();
        }
      });
      return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = url;
      video.addEventListener('loadedmetadata', done, { once: true });
      return;
    }

    video.src = url;
    done();
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupMobileMenu();
    setupHero();
    setupCardFilters();
    setupSearchPage();
    setupPlayers();
  });
})();
