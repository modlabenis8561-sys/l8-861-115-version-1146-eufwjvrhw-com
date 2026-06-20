(function () {
  var menuButton = document.querySelector('.menu-toggle');
  var nav = document.querySelector('.site-nav');

  if (menuButton && nav) {
    menuButton.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;

    function showSlide(nextIndex) {
      if (!slides.length) {
        return;
      }

      index = (nextIndex + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    function startTimer() {
      stopTimer();
      timer = window.setInterval(function () {
        showSlide(index + 1);
      }, 5200);
    }

    function stopTimer() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(index - 1);
        startTimer();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(index + 1);
        startTimer();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
        startTimer();
      });
    });

    hero.addEventListener('mouseenter', stopTimer);
    hero.addEventListener('mouseleave', startTimer);
    showSlide(0);
    startTimer();
  }

  document.querySelectorAll('.filter-panel').forEach(function (panel) {
    var scopeSelector = panel.getAttribute('data-filter-scope');
    var scope = scopeSelector ? document.querySelector(scopeSelector) : document;

    if (!scope) {
      return;
    }

    var input = panel.querySelector('.filter-input');
    var region = panel.querySelector('.filter-region');
    var type = panel.querySelector('.filter-type');
    var year = panel.querySelector('.filter-year');
    var empty = panel.querySelector('.filter-empty');
    var cards = Array.prototype.slice.call(scope.querySelectorAll('.movie-card'));

    function valueOf(element) {
      return element ? element.value.trim().toLowerCase() : '';
    }

    function filterCards() {
      var keyword = valueOf(input);
      var regionValue = valueOf(region);
      var typeValue = valueOf(type);
      var yearValue = valueOf(year);
      var visible = 0;

      cards.forEach(function (card) {
        var text = (card.getAttribute('data-index') || '').toLowerCase();
        var cardRegion = (card.getAttribute('data-region') || '').toLowerCase();
        var cardType = (card.getAttribute('data-type') || '').toLowerCase();
        var cardYear = (card.getAttribute('data-year') || '').toLowerCase();
        var matched = true;

        if (keyword && text.indexOf(keyword) === -1) {
          matched = false;
        }

        if (regionValue && cardRegion !== regionValue) {
          matched = false;
        }

        if (typeValue && cardType !== typeValue) {
          matched = false;
        }

        if (yearValue && cardYear !== yearValue) {
          matched = false;
        }

        card.hidden = !matched;

        if (matched) {
          visible += 1;
        }
      });

      if (empty) {
        empty.hidden = visible !== 0;
      }
    }

    [input, region, type, year].forEach(function (element) {
      if (element) {
        element.addEventListener('input', filterCards);
        element.addEventListener('change', filterCards);
      }
    });
  });

  document.querySelectorAll('[data-player]').forEach(function (player) {
    var video = player.querySelector('video');
    var button = player.querySelector('.play-toggle');
    var stream = player.getAttribute('data-stream');
    var hlsInstance = null;

    if (!video || !stream) {
      return;
    }

    function bindStream(autoplay) {
      if (player.getAttribute('data-ready') === '1') {
        if (autoplay) {
          video.play().catch(function () {});
        }
        return;
      }

      player.setAttribute('data-ready', '1');

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
        video.load();

        if (autoplay) {
          video.play().catch(function () {});
        }
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: false,
          backBufferLength: 60
        });
        hlsInstance.loadSource(stream);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
          if (autoplay) {
            video.play().catch(function () {});
          }
        });
      } else {
        video.src = stream;
        video.load();

        if (autoplay) {
          video.play().catch(function () {});
        }
      }
    }

    function startPlay() {
      if (button) {
        button.classList.add('is-hidden');
      }

      bindStream(true);
    }

    if (button) {
      button.addEventListener('click', startPlay);
    }

    video.addEventListener('click', function () {
      bindStream(false);
    });

    video.addEventListener('play', function () {
      if (button) {
        button.classList.add('is-hidden');
      }
    });

    video.addEventListener('ended', function () {
      if (button) {
        button.classList.remove('is-hidden');
      }
    });

    window.addEventListener('pagehide', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
        hlsInstance = null;
      }
    });
  });
})();
