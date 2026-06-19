(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function initMenu() {
    var button = document.querySelector("[data-menu-button]");
    var nav = document.querySelector("[data-mobile-nav]");
    if (!button || !nav) {
      return;
    }
    button.addEventListener("click", function () {
      nav.classList.toggle("open");
      document.body.classList.toggle("menu-open", nav.classList.contains("open"));
    });
  }

  function initHero() {
    var carousel = document.querySelector("[data-hero-carousel]");
    if (!carousel) {
      return;
    }
    var slides = Array.prototype.slice.call(carousel.querySelectorAll(".hero-slide"));
    var next = document.querySelector("[data-hero-next]");
    var prev = document.querySelector("[data-hero-prev]");
    var index = 0;
    var timer = null;

    function show(target) {
      if (!slides.length) {
        return;
      }
      index = (target + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === index);
      });
    }

    function startTimer() {
      stopTimer();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5600);
    }

    function stopTimer() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        startTimer();
      });
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        startTimer();
      });
    }

    carousel.addEventListener("mouseenter", stopTimer);
    carousel.addEventListener("mouseleave", startTimer);
    show(0);
    startTimer();
  }

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  function initFiltering() {
    var input = document.querySelector("[data-filter-input]");
    var region = document.querySelector("[data-filter-region]");
    var genre = document.querySelector("[data-filter-genre]");
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-movie-card]"));
    var empty = document.querySelector("[data-empty-state]");
    if (!cards.length) {
      return;
    }

    var urlQuery = new URLSearchParams(window.location.search).get("q");
    if (input && urlQuery) {
      input.value = urlQuery;
    }

    function apply() {
      var keyword = normalize(input ? input.value : "");
      var regionValue = normalize(region ? region.value : "");
      var genreValue = normalize(genre ? genre.value : "");
      var shown = 0;

      cards.forEach(function (card) {
        var haystack = normalize([
          card.dataset.title,
          card.dataset.year,
          card.dataset.region,
          card.dataset.genre,
          card.dataset.type
        ].join(" "));
        var okKeyword = !keyword || haystack.indexOf(keyword) !== -1;
        var okRegion = !regionValue || normalize(card.dataset.region).indexOf(regionValue) !== -1;
        var okGenre = !genreValue || normalize(card.dataset.genre).indexOf(genreValue) !== -1;
        var visible = okKeyword && okRegion && okGenre;
        card.style.display = visible ? "" : "none";
        if (visible) {
          shown += 1;
        }
      });

      if (empty) {
        empty.style.display = shown ? "none" : "block";
      }
    }

    [input, region, genre].forEach(function (control) {
      if (control) {
        control.addEventListener("input", apply);
        control.addEventListener("change", apply);
      }
    });

    apply();
  }

  function initHomeSearch() {
    var form = document.querySelector("[data-home-search]");
    if (!form) {
      return;
    }
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var input = form.querySelector("input");
      var query = input ? input.value.trim() : "";
      var target = "categories.html";
      if (query) {
        target += "?q=" + encodeURIComponent(query);
      }
      window.location.href = target;
    });
  }

  function initPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));
    players.forEach(function (box) {
      var video = box.querySelector("video");
      var button = box.querySelector(".play-trigger");
      var source = box.getAttribute("data-video-url");
      var hls = null;
      var attached = false;

      if (!video || !source) {
        return;
      }

      function attachSource() {
        if (attached) {
          return;
        }
        attached = true;

        if (window.Hls && window.Hls.isSupported && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(source);
          hls.attachMedia(video);
        } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = source;
        } else {
          video.src = source;
        }
      }

      function play() {
        attachSource();
        box.classList.add("is-playing");
        var promise = video.play();
        if (promise && promise.catch) {
          promise.catch(function () {
            box.classList.remove("is-playing");
          });
        }
      }

      if (button) {
        button.addEventListener("click", function (event) {
          event.preventDefault();
          play();
        });
      }

      box.addEventListener("click", function (event) {
        if (event.target === video) {
          return;
        }
        if (event.target.closest && event.target.closest(".play-trigger")) {
          return;
        }
        if (!box.classList.contains("is-playing")) {
          play();
        }
      });

      video.addEventListener("play", function () {
        box.classList.add("is-playing");
      });

      video.addEventListener("pause", function () {
        if (video.currentTime === 0) {
          box.classList.remove("is-playing");
        }
      });

      window.addEventListener("beforeunload", function () {
        if (hls && hls.destroy) {
          hls.destroy();
        }
      });
    });
  }

  ready(function () {
    initMenu();
    initHero();
    initFiltering();
    initHomeSearch();
    initPlayers();
  });
})();
