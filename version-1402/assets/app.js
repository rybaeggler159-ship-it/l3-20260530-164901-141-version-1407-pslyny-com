(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function setupMenus() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var panel = document.querySelector("[data-mobile-panel]");
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener("click", function () {
      panel.classList.toggle("open");
    });
  }

  function setupSearchForms() {
    document.querySelectorAll("[data-search-form]").forEach(function (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        var input = form.querySelector("input[name='q']");
        var value = input ? input.value.trim() : "";
        var root = form.getAttribute("data-root") || "./";
        if (value) {
          window.location.href = root + "search.html?q=" + encodeURIComponent(value);
        }
      });
    });
  }

  function setupCarousel() {
    document.querySelectorAll("[data-carousel]").forEach(function (carousel) {
      var slides = Array.prototype.slice.call(carousel.querySelectorAll(".hero-slide"));
      var dots = Array.prototype.slice.call(carousel.querySelectorAll(".hero-dot"));
      if (slides.length < 2) {
        return;
      }
      var index = 0;
      function show(next) {
        index = (next + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle("active", slideIndex === index);
        });
        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle("active", dotIndex === index);
        });
      }
      dots.forEach(function (dot) {
        dot.addEventListener("click", function () {
          var next = Number(dot.getAttribute("data-slide-to"));
          show(next);
        });
      });
      window.setInterval(function () {
        show(index + 1);
      }, 5200);
    });
  }

  function normalize(value) {
    return (value || "").toString().toLowerCase();
  }

  function setupLocalFilters() {
    var lists = document.querySelectorAll("[data-card-list]");
    if (!lists.length) {
      return;
    }
    var urlQuery = new URLSearchParams(window.location.search).get("q") || "";
    var input = document.querySelector("[data-filter-input]");
    var sort = document.querySelector("[data-sort-select]");
    var chips = Array.prototype.slice.call(document.querySelectorAll(".filter-chip"));
    var activeField = "all";
    var activeValue = "";
    if (input && urlQuery) {
      input.value = urlQuery;
    }
    function apply() {
      var query = normalize(input ? input.value : "");
      var visibleTotal = 0;
      lists.forEach(function (list) {
        var cards = Array.prototype.slice.call(list.querySelectorAll(".movie-card"));
        cards.forEach(function (card) {
          var haystack = normalize([
            card.getAttribute("data-title"),
            card.getAttribute("data-region"),
            card.getAttribute("data-type"),
            card.getAttribute("data-genre"),
            card.getAttribute("data-keywords"),
            card.getAttribute("data-year")
          ].join(" "));
          var matchesText = !query || haystack.indexOf(query) !== -1;
          var matchesChip = true;
          if (activeField !== "all" && activeValue) {
            matchesChip = normalize(card.getAttribute("data-" + activeField)).indexOf(normalize(activeValue)) !== -1;
          }
          var visible = matchesText && matchesChip;
          card.classList.toggle("is-hidden", !visible);
          if (visible) {
            visibleTotal += 1;
          }
        });
      });
      var empty = document.querySelector("[data-empty-state]");
      if (empty) {
        empty.hidden = visibleTotal !== 0;
      }
    }
    function applySort() {
      if (!sort) {
        return;
      }
      var value = sort.value;
      lists.forEach(function (list) {
        var cards = Array.prototype.slice.call(list.querySelectorAll(".movie-card"));
        cards.sort(function (a, b) {
          if (value === "year-asc") {
            return Number(a.getAttribute("data-year")) - Number(b.getAttribute("data-year"));
          }
          if (value === "title-asc") {
            return normalize(a.getAttribute("data-title")).localeCompare(normalize(b.getAttribute("data-title")), "zh-Hans-CN");
          }
          return Number(b.getAttribute("data-year")) - Number(a.getAttribute("data-year"));
        });
        cards.forEach(function (card) {
          list.appendChild(card);
        });
      });
      apply();
    }
    if (input) {
      input.addEventListener("input", apply);
    }
    if (sort) {
      sort.addEventListener("change", applySort);
    }
    chips.forEach(function (chip) {
      chip.addEventListener("click", function () {
        chips.forEach(function (item) {
          item.classList.remove("active");
        });
        chip.classList.add("active");
        activeField = chip.getAttribute("data-filter-field") || "all";
        activeValue = chip.getAttribute("data-filter-value") || "";
        apply();
      });
    });
    applySort();
  }

  function setupPlayers() {
    document.querySelectorAll(".player-shell").forEach(function (shell) {
      var video = shell.querySelector("video[data-src]");
      var button = shell.querySelector(".play-layer");
      if (!video || !button) {
        return;
      }
      var loaded = false;
      function loadVideo() {
        if (loaded) {
          return Promise.resolve();
        }
        var src = video.getAttribute("data-src");
        var Hls = window.Hls;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = src;
          loaded = true;
          return Promise.resolve();
        }
        if (Hls && Hls.isSupported()) {
          var hls = new Hls({ enableWorker: true, lowLatencyMode: true });
          hls.loadSource(src);
          hls.attachMedia(video);
          shell.hlsInstance = hls;
          loaded = true;
          return new Promise(function (resolve) {
            video.addEventListener("loadedmetadata", resolve, { once: true });
            window.setTimeout(resolve, 900);
          });
        }
        video.src = src;
        loaded = true;
        return Promise.resolve();
      }
      function play() {
        loadVideo().then(function () {
          shell.classList.add("is-playing");
          video.controls = true;
          var promise = video.play();
          if (promise && typeof promise.catch === "function") {
            promise.catch(function () {
              video.controls = true;
            });
          }
        });
      }
      button.addEventListener("click", play);
      video.addEventListener("click", function () {
        if (video.paused) {
          play();
        }
      });
    });
  }

  ready(function () {
    setupMenus();
    setupSearchForms();
    setupCarousel();
    setupLocalFilters();
    setupPlayers();
  });
})();
