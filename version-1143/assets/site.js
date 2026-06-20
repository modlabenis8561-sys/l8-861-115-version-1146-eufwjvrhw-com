(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }

  function initImages() {
    document.querySelectorAll("img").forEach(function (image) {
      image.addEventListener("error", function () {
        var frame = image.closest(".poster-frame") || image.closest(".hero-slide");
        if (frame) {
          frame.classList.add("has-missing-image");
        }
      });
    });
  }

  function initMobileMenu() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var menu = document.querySelector("[data-mobile-menu]");
    if (!toggle || !menu) {
      return;
    }
    toggle.addEventListener("click", function () {
      menu.classList.toggle("is-open");
    });
  }

  function initHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
    if (slides.length <= 1) {
      return;
    }
    var index = 0;
    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, position) {
        slide.classList.toggle("is-active", position === index);
      });
      dots.forEach(function (dot, position) {
        dot.classList.toggle("is-active", position === index);
      });
    }
    dots.forEach(function (dot, position) {
      dot.addEventListener("click", function () {
        show(position);
      });
    });
    setInterval(function () {
      show(index + 1);
    }, 5600);
  }

  function initCardFilters() {
    var panel = document.querySelector("[data-filter-panel]");
    var grid = document.querySelector("[data-filter-grid]");
    if (!panel || !grid) {
      return;
    }
    var keyword = panel.querySelector("[data-filter-keyword]");
    var type = panel.querySelector("[data-filter-type]");
    var year = panel.querySelector("[data-filter-year]");
    var genre = panel.querySelector("[data-filter-genre]");
    var cards = Array.prototype.slice.call(grid.querySelectorAll(".movie-card"));
    function run() {
      var q = normalize(keyword && keyword.value);
      var t = normalize(type && type.value);
      var y = normalize(year && year.value);
      var g = normalize(genre && genre.value);
      cards.forEach(function (card) {
        var text = normalize(card.getAttribute("data-search"));
        var keep = true;
        if (q && text.indexOf(q) === -1) {
          keep = false;
        }
        if (t && normalize(card.getAttribute("data-type")) !== t) {
          keep = false;
        }
        if (y && normalize(card.getAttribute("data-year")) !== y) {
          keep = false;
        }
        if (g && normalize(card.getAttribute("data-genre")).indexOf(g) === -1) {
          keep = false;
        }
        card.style.display = keep ? "" : "none";
      });
    }
    [keyword, type, year, genre].forEach(function (node) {
      if (node) {
        node.addEventListener("input", run);
        node.addEventListener("change", run);
      }
    });
  }

  function attachVideo(video, src) {
    if (!src) {
      return Promise.resolve();
    }
    if (window.Hls && window.Hls.isSupported()) {
      if (video._hlsInstance) {
        video._hlsInstance.destroy();
      }
      var hls = new window.Hls();
      video._hlsInstance = hls;
      hls.loadSource(src);
      hls.attachMedia(video);
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = src;
    } else {
      video.src = src;
    }
    return video.play();
  }

  function initPlayers() {
    document.querySelectorAll(".player-shell").forEach(function (shell) {
      var video = shell.querySelector("video");
      var button = shell.querySelector("[data-play-button]");
      if (!video || !button) {
        return;
      }
      var started = false;
      function start() {
        shell.classList.add("is-playing");
        if (started) {
          video.play();
          return;
        }
        started = true;
        attachVideo(video, video.getAttribute("data-src")).catch(function () {
          shell.classList.remove("is-playing");
          started = false;
        });
      }
      button.addEventListener("click", start);
      video.addEventListener("click", function () {
        if (!started || video.paused) {
          start();
        }
      });
      video.addEventListener("play", function () {
        shell.classList.add("is-playing");
      });
    });
  }

  function initSearchPage() {
    var root = document.querySelector("[data-search-page]");
    if (!root || !window.MOVIE_INDEX) {
      return;
    }
    var input = root.querySelector("[data-search-input]");
    var category = root.querySelector("[data-search-category]");
    var type = root.querySelector("[data-search-type]");
    var year = root.querySelector("[data-search-year]");
    var results = root.querySelector("[data-search-results]");
    var empty = root.querySelector("[data-search-empty]");
    var params = new URLSearchParams(window.location.search);
    var query = params.get("q") || "";
    if (input) {
      input.value = query;
    }
    function card(movie) {
      return [
        '<article class="movie-card group bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all hover:-translate-y-1">',
        '<a class="block" href="' + movie.url + '">',
        '<div class="poster-frame">',
        '<span class="poster-badge">' + movie.type + '</span>',
        '<img src="' + movie.cover + '" alt="' + movie.title + '" loading="lazy">',
        '</div>',
        '<div class="p-4">',
        '<p class="text-xs text-primary-600 font-semibold mb-2">' + movie.category + '</p>',
        '<h3 class="text-lg font-bold text-secondary-900 mb-2 line-clamp-2 group-hover:text-primary-700 transition-colors">' + movie.title + '</h3>',
        '<p class="text-secondary-600 text-sm line-clamp-2 mb-3">' + movie.oneLine + '</p>',
        '<div class="flex flex-wrap gap-2 text-xs text-secondary-500"><span>' + movie.year + '</span><span>' + movie.region + '</span><span>' + movie.genre + '</span></div>',
        '</div>',
        '</a>',
        '</article>'
      ].join("");
    }
    function run() {
      var q = normalize(input && input.value);
      var c = normalize(category && category.value);
      var t = normalize(type && type.value);
      var y = normalize(year && year.value);
      var found = window.MOVIE_INDEX.filter(function (movie) {
        var text = normalize(movie.title + " " + movie.oneLine + " " + movie.region + " " + movie.genre + " " + movie.tags);
        if (q && text.indexOf(q) === -1) {
          return false;
        }
        if (c && normalize(movie.categorySlug) !== c) {
          return false;
        }
        if (t && normalize(movie.type) !== t) {
          return false;
        }
        if (y && normalize(movie.year) !== y) {
          return false;
        }
        return true;
      }).slice(0, 96);
      results.innerHTML = found.map(card).join("");
      initImages();
      empty.classList.toggle("is-visible", found.length === 0);
    }
    [input, category, type, year].forEach(function (node) {
      if (node) {
        node.addEventListener("input", run);
        node.addEventListener("change", run);
      }
    });
    run();
  }

  ready(function () {
    initImages();
    initMobileMenu();
    initHero();
    initCardFilters();
    initPlayers();
    initSearchPage();
  });
})();
