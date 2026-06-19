(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
      return;
    }
    document.addEventListener("DOMContentLoaded", fn);
  }

  function initMenu() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var nav = document.querySelector("[data-mobile-nav]");
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener("click", function () {
      nav.classList.toggle("is-open");
      document.body.classList.toggle("menu-open", nav.classList.contains("is-open"));
    });
  }

  function initHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    if (slides.length < 2) {
      return;
    }
    var active = 0;
    var timer = null;

    function show(index) {
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === active);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === active);
      });
    }

    function start() {
      timer = window.setInterval(function () {
        show(active + 1);
      }, 5200);
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        window.clearInterval(timer);
        show(i);
        start();
      });
    });

    show(0);
    start();
  }

  function createResultCard(movie) {
    var tags = movie.tags.slice(0, 4).map(function (tag) {
      return "<span>" + escapeHtml(tag) + "</span>";
    }).join("");
    return [
      "<a class=\"movie-card\" href=\"" + movie.url + "\" title=\"" + escapeHtml(movie.title) + "\">",
      "<div class=\"movie-cover tone-" + movie.tone + "\">",
      "<span class=\"cover-label\">" + escapeHtml(movie.category) + "</span>",
      "<strong>" + escapeHtml(movie.title) + "</strong>",
      "<em>" + escapeHtml(movie.year) + " · " + escapeHtml(movie.region) + "</em>",
      "<span class=\"cover-play\">▶</span>",
      "</div>",
      "<div class=\"movie-card-body\">",
      "<h3>" + escapeHtml(movie.title) + "</h3>",
      "<p>" + escapeHtml(movie.oneLine) + "</p>",
      "<div class=\"movie-meta\"><span>" + escapeHtml(movie.year) + "</span><span>" + escapeHtml(movie.type) + "</span><span>" + escapeHtml(movie.rating) + " 分</span></div>",
      "<div class=\"tag-row\">" + tags + "</div>",
      "</div>",
      "</a>"
    ].join("");
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function initSearch() {
    var input = document.getElementById("searchInput");
    var results = document.getElementById("searchResults");
    var status = document.getElementById("searchStatus");
    if (!input || !results || !window.MOVIE_SEARCH_DATA) {
      return;
    }
    var category = document.getElementById("categoryFilter");
    var type = document.getElementById("typeFilter");
    var region = document.getElementById("regionFilter");

    function run() {
      var query = input.value.trim().toLowerCase();
      var categoryValue = category ? category.value : "";
      var typeValue = type ? type.value : "";
      var regionValue = region ? region.value : "";
      var list = window.MOVIE_SEARCH_DATA.filter(function (movie) {
        var text = [movie.title, movie.oneLine, movie.genre, movie.region, movie.type, movie.category, movie.tags.join(" ")].join(" ").toLowerCase();
        return (!query || text.indexOf(query) !== -1)
          && (!categoryValue || movie.category === categoryValue)
          && (!typeValue || movie.type === typeValue)
          && (!regionValue || movie.region === regionValue);
      });
      var visible = list.slice(0, 60);
      results.innerHTML = visible.map(createResultCard).join("");
      if (status) {
        status.textContent = "找到 " + list.length + " 部内容，当前显示 " + visible.length + " 部";
      }
    }

    [input, category, type, region].forEach(function (element) {
      if (element) {
        element.addEventListener("input", run);
        element.addEventListener("change", run);
      }
    });
    run();
  }

  ready(function () {
    initMenu();
    initHero();
    initSearch();
  });
})();
