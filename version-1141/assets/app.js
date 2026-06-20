(function() {
  var toggle = document.querySelector(".menu-toggle");
  var panel = document.querySelector(".mobile-panel");
  if (toggle && panel) {
    toggle.addEventListener("click", function() {
      var opened = !panel.hasAttribute("hidden");
      if (opened) {
        panel.setAttribute("hidden", "");
        toggle.setAttribute("aria-expanded", "false");
      } else {
        panel.removeAttribute("hidden");
        toggle.setAttribute("aria-expanded", "true");
      }
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
  var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
  if (slides.length > 1) {
    var current = 0;
    var show = function(index) {
      current = index % slides.length;
      slides.forEach(function(slide, i) {
        slide.classList.toggle("active", i === current);
      });
      dots.forEach(function(dot, i) {
        dot.classList.toggle("active", i === current);
      });
    };
    dots.forEach(function(dot, i) {
      dot.addEventListener("click", function() {
        show(i);
      });
    });
    setInterval(function() {
      show(current + 1);
    }, 5200);
  }

  var filterInput = document.querySelector(".page-filter");
  var filterScope = document.querySelector(".filter-scope");
  if (filterInput && filterScope) {
    filterInput.addEventListener("input", function() {
      var query = filterInput.value.trim().toLowerCase();
      var cards = filterScope.querySelectorAll(".movie-card");
      cards.forEach(function(card) {
        var value = (card.getAttribute("data-filter") || "").toLowerCase();
        card.classList.toggle("hidden-by-filter", query && value.indexOf(query) === -1);
      });
    });
  }

  var resultBox = document.getElementById("search-results");
  var summary = document.getElementById("search-summary");
  var input = document.getElementById("search-input");
  if (resultBox && summary && Array.isArray(globalThis.movieSearchData)) {
    var params = new URLSearchParams(location.search);
    var q = (params.get("q") || "").trim();
    if (input) {
      input.value = q;
    }
    if (q) {
      var words = q.toLowerCase().split(/\s+/).filter(Boolean);
      var found = globalThis.movieSearchData.filter(function(item) {
        var hay = item.search.toLowerCase();
        return words.every(function(word) {
          return hay.indexOf(word) !== -1;
        });
      }).slice(0, 96);
      summary.textContent = found.length ? "搜索结果" : "未找到相关影片";
      resultBox.innerHTML = found.map(function(item) {
        return '<article class="movie-card" data-filter="' + escapeHtml(item.search) + '">' +
          '<a class="poster-wrap" href="./' + item.file + '" aria-label="' + escapeHtml(item.title) + '">' +
          '<img src="' + item.cover + '" alt="' + escapeHtml(item.title) + '" loading="lazy">' +
          '<span class="poster-region">' + escapeHtml(item.region) + '</span>' +
          '<span class="poster-play">播放</span>' +
          '</a>' +
          '<div class="movie-info">' +
          '<h3><a href="./' + item.file + '">' + escapeHtml(item.title) + '</a></h3>' +
          '<div class="movie-meta"><span>' + escapeHtml(item.year) + '</span><span>' + escapeHtml(item.type) + '</span><span>' + escapeHtml(item.genre) + '</span></div>' +
          '<p>' + escapeHtml(item.oneLine) + '</p>' +
          '<div class="tag-row">' + item.tags.slice(0, 3).map(function(tag) { return '<span>' + escapeHtml(tag) + '</span>'; }).join("") + '</div>' +
          '</div>' +
          '</article>';
      }).join("");
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
})();
