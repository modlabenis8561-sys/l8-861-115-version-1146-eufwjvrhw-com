(function () {
  "use strict";

  function selectAll(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function select(selector, root) {
    return (root || document).querySelector(selector);
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function setupMobileMenu() {
    var toggle = select("[data-mobile-toggle]");
    var menu = select("[data-mobile-menu]");

    if (!toggle || !menu) {
      return;
    }

    toggle.addEventListener("click", function () {
      var isHidden = menu.hasAttribute("hidden");
      if (isHidden) {
        menu.removeAttribute("hidden");
        document.body.classList.add("menu-open");
      } else {
        menu.setAttribute("hidden", "hidden");
        document.body.classList.remove("menu-open");
      }
    });
  }

  function setupHeroSlider() {
    var slider = select("[data-hero-slider]");
    if (!slider) {
      return;
    }

    var slides = selectAll("[data-hero-slide]", slider);
    var dots = selectAll("[data-hero-dot]", slider);
    var index = 0;
    var timer = null;

    function showSlide(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === index);
      });
    }

    function start() {
      if (slides.length <= 1) {
        return;
      }
      timer = window.setInterval(function () {
        showSlide(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        stop();
        showSlide(Number(dot.getAttribute("data-hero-dot") || "0"));
        start();
      });
    });

    slider.addEventListener("mouseenter", stop);
    slider.addEventListener("mouseleave", start);
    showSlide(0);
    start();
  }

  function setupRedirectSearch() {
    selectAll("[data-redirect-search]").forEach(function (form) {
      form.addEventListener("submit", function (event) {
        var input = select("input[name='q']", form);
        if (!input) {
          return;
        }
        var query = input.value.trim();
        if (!query) {
          return;
        }
        event.preventDefault();
        var action = form.getAttribute("action") || "search.html";
        window.location.href = action + "?q=" + encodeURIComponent(query);
      });
    });
  }

  function setupCardFilters() {
    selectAll("[data-card-filter-root]").forEach(function (root) {
      var input = select("[data-card-filter]", root);
      var yearFilter = select("[data-year-filter]", root);
      var regionFilter = select("[data-region-filter]", root);
      var typeFilter = select("[data-type-filter]", root);
      var cards = selectAll("[data-movie-card]", root);
      var empty = select("[data-empty-message]", root);

      function applyFilter() {
        var keyword = input ? input.value.trim().toLowerCase() : "";
        var year = yearFilter ? yearFilter.value : "";
        var region = regionFilter ? regionFilter.value : "";
        var type = typeFilter ? typeFilter.value : "";
        var visibleCount = 0;

        cards.forEach(function (card) {
          var searchText = (card.getAttribute("data-search") || "").toLowerCase();
          var cardYear = card.getAttribute("data-year") || "";
          var cardRegion = card.getAttribute("data-region") || "";
          var cardType = card.getAttribute("data-type") || "";
          var matches = true;

          if (keyword && searchText.indexOf(keyword) === -1) {
            matches = false;
          }
          if (year && cardYear !== year) {
            matches = false;
          }
          if (region && cardRegion !== region) {
            matches = false;
          }
          if (type && cardType !== type) {
            matches = false;
          }

          card.hidden = !matches;
          if (matches) {
            visibleCount += 1;
          }
        });

        if (empty) {
          empty.hidden = visibleCount !== 0;
        }
      }

      [input, yearFilter, regionFilter, typeFilter].forEach(function (element) {
        if (element) {
          element.addEventListener("input", applyFilter);
          element.addEventListener("change", applyFilter);
        }
      });
    });
  }

  function setupSearchPage() {
    var page = select("[data-search-page]");
    var results = select("#search-results");
    var empty = select("#search-empty");
    var input = select("#movie-search-input");
    var category = select("#movie-search-category");
    var year = select("#movie-search-year");

    if (!page || !results || !input || !window.MOVIES) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var queryFromUrl = params.get("q") || "";
    input.value = queryFromUrl;

    function cardTemplate(movie) {
      var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
        return "<span>" + escapeHtml(tag) + "</span>";
      }).join("");

      return "" +
        "<article class="movie-card">" +
          "<a class="movie-card-link" href="" + escapeHtml(movie.url) + "">" +
            "<span class="poster-frame">" +
              "<img src="" + escapeHtml(movie.cover) + "" alt="" + escapeHtml(movie.title) + "" loading="lazy">" +
              "<span class="poster-badge">HD</span>" +
              "<span class="poster-year">" + escapeHtml(movie.year) + "</span>" +
            "</span>" +
            "<span class="movie-card-body">" +
              "<strong>" + escapeHtml(movie.title) + "</strong>" +
              "<span class="movie-meta-line">" + escapeHtml(movie.region) + " · " + escapeHtml(movie.type) + " · " + escapeHtml(movie.genre) + "</span>" +
              "<span class="movie-one-line">" + escapeHtml(movie.oneLine) + "</span>" +
              "<span class="tag-row">" + tags + "</span>" +
            "</span>" +
          "</a>" +
        "</article>";
    }

    function render() {
      var keyword = input.value.trim().toLowerCase();
      var categoryValue = category ? category.value : "";
      var yearValue = year ? year.value.trim() : "";

      var matches = window.MOVIES.filter(function (movie) {
        var haystack = [
          movie.title,
          movie.region,
          movie.type,
          movie.year,
          movie.genre,
          movie.category,
          movie.oneLine,
          (movie.tags || []).join(" ")
        ].join(" ").toLowerCase();

        if (keyword && haystack.indexOf(keyword) === -1) {
          return false;
        }
        if (categoryValue && movie.category !== categoryValue) {
          return false;
        }
        if (yearValue && String(movie.year).indexOf(yearValue) === -1) {
          return false;
        }
        return true;
      }).slice(0, 240);

      results.innerHTML = matches.map(cardTemplate).join("");
      if (empty) {
        empty.hidden = matches.length !== 0;
      }
    }

    [input, category, year].forEach(function (element) {
      if (element) {
        element.addEventListener("input", render);
        element.addEventListener("change", render);
      }
    });

    render();
  }

  function setupPlayers() {
    selectAll("[data-player]").forEach(function (player) {
      var video = select("video", player);
      var button = select("[data-player-start]", player);
      var status = select("[data-player-status]", player);
      var hlsInstance = null;

      if (!video || !button) {
        return;
      }

      function setStatus(message) {
        if (status) {
          status.textContent = message || "";
        }
      }

      function playVideo() {
        var source = video.getAttribute("data-video-src");
        if (!source) {
          setStatus("播放源暂不可用。");
          return;
        }

        player.classList.add("is-playing");
        setStatus("正在加载播放源...");

        if (hlsInstance) {
          hlsInstance.destroy();
          hlsInstance = null;
        }

        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hlsInstance.loadSource(source);
          hlsInstance.attachMedia(video);
          hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
            setStatus("");
            video.play().catch(function () {
              setStatus("请再次点击播放器开始播放。");
            });
          });
          hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
            if (!data || !data.fatal) {
              return;
            }
            if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
              setStatus("网络波动，正在重新加载...");
              hlsInstance.startLoad();
            } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
              setStatus("媒体解析异常，正在恢复...");
              hlsInstance.recoverMediaError();
            } else {
              setStatus("播放失败，请刷新页面后重试。");
              hlsInstance.destroy();
            }
          });
          return;
        }

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = source;
          video.addEventListener("loadedmetadata", function () {
            setStatus("");
            video.play().catch(function () {
              setStatus("请再次点击播放器开始播放。");
            });
          }, { once: true });
          return;
        }

        player.classList.remove("is-playing");
        setStatus("当前浏览器需要 HLS 支持，请使用新版浏览器访问。");
      }

      button.addEventListener("click", playVideo);
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    setupMobileMenu();
    setupHeroSlider();
    setupRedirectSearch();
    setupCardFilters();
    setupSearchPage();
    setupPlayers();
  });
})();
