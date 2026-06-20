(function () {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }

  function setupMenu() {
    var button = document.querySelector("[data-menu-button]");
    var menu = document.querySelector("[data-mobile-menu]");
    if (!button || !menu) return;
    button.addEventListener("click", function () {
      menu.classList.toggle("open");
    });
  }

  function setupHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
    if (!slides.length || !dots.length) return;
    var index = 0;
    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("active", i === index);
      });
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
      });
    });
    window.setInterval(function () {
      show(index + 1);
    }, 5200);
  }

  function setupFilters() {
    var input = document.querySelector(".js-filter");
    var year = document.querySelector(".js-year-filter");
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-filter-grid] .movie-card"));
    if (!cards.length) return;
    function run() {
      var q = normalize(input && input.value);
      var y = normalize(year && year.value);
      cards.forEach(function (card) {
        var text = normalize([
          card.getAttribute("data-title"),
          card.getAttribute("data-genre"),
          card.getAttribute("data-region"),
          card.getAttribute("data-tags")
        ].join(" "));
        var cardYear = normalize(card.getAttribute("data-year"));
        var ok = (!q || text.indexOf(q) !== -1) && (!y || cardYear === y);
        card.hidden = !ok;
      });
    }
    if (input) input.addEventListener("input", run);
    if (year) year.addEventListener("change", run);
  }

  function cardHtml(movie) {
    var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
      return "<span>" + escapeHtml(tag) + "</span>";
    }).join("");
    return "<article class=\"movie-card\">" +
      "<a class=\"poster-link\" href=\"" + escapeHtml(movie.url) + "\" aria-label=\"" + escapeHtml(movie.title) + " 在线观看\">" +
      "<img src=\"" + escapeHtml(movie.cover) + "\" alt=\"" + escapeHtml(movie.title) + " 在线观看\" loading=\"lazy\">" +
      "<span class=\"play-mark\">▶</span></a>" +
      "<div class=\"movie-card-body\">" +
      "<div class=\"movie-meta-line\"><span>" + escapeHtml(movie.year) + "</span><span>" + escapeHtml(movie.region) + "</span><span>" + escapeHtml(movie.type) + "</span></div>" +
      "<h3><a href=\"" + escapeHtml(movie.url) + "\">" + escapeHtml(movie.title) + "</a></h3>" +
      "<p>" + escapeHtml(movie.oneLine) + "</p>" +
      "<div class=\"tag-row\">" + tags + "</div></div></article>";
  }

  function setupSearch() {
    var results = document.querySelector("[data-search-results]");
    var form = document.querySelector("[data-search-form]");
    var input = document.querySelector("[data-search-input]");
    if (!results || !form || !input || !window.SEARCH_MOVIES) return;
    var params = new URLSearchParams(window.location.search);
    input.value = params.get("q") || "";
    function render() {
      var q = normalize(input.value);
      var rows = window.SEARCH_MOVIES.filter(function (movie) {
        if (!q) return true;
        var text = normalize([
          movie.title,
          movie.year,
          movie.region,
          movie.type,
          movie.genre,
          movie.category,
          (movie.tags || []).join(" ")
        ].join(" "));
        return text.indexOf(q) !== -1;
      }).slice(0, 240);
      results.innerHTML = rows.map(cardHtml).join("");
    }
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var q = input.value.trim();
      var url = q ? "./search.html?q=" + encodeURIComponent(q) : "./search.html";
      window.history.replaceState(null, "", url);
      render();
    });
    input.addEventListener("input", render);
    render();
  }

  window.initMoviePlayer = function (url) {
    var video = document.getElementById("moviePlayer");
    var overlay = document.querySelector(".play-overlay");
    if (!video || !url) return;
    var started = false;
    function begin() {
      if (started) {
        video.play();
        return;
      }
      started = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = url;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({ enableWorker: true });
        hls.loadSource(url);
        hls.attachMedia(video);
      } else {
        video.src = url;
      }
      if (overlay) overlay.classList.add("hidden");
      var play = video.play();
      if (play && typeof play.catch === "function") {
        play.catch(function () {});
      }
    }
    if (overlay) overlay.addEventListener("click", begin);
    video.addEventListener("click", function () {
      if (video.paused) begin();
    });
  };

  ready(function () {
    setupMenu();
    setupHero();
    setupFilters();
    setupSearch();
  });
})();
