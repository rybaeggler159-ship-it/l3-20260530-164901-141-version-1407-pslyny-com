function onReady(callback) {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", callback);
  } else {
    callback();
  }
}

function setupMenu() {
  var button = document.querySelector("[data-menu-button]");
  var nav = document.querySelector("[data-mobile-nav]");
  if (!button || !nav) {
    return;
  }
  button.addEventListener("click", function () {
    nav.classList.toggle("is-open");
  });
}

function setupBackTop() {
  document.querySelectorAll("[data-back-top]").forEach(function (button) {
    button.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  });
}

function setupHero() {
  var root = document.querySelector("[data-hero-carousel]");
  if (!root) {
    return;
  }
  var slides = Array.prototype.slice.call(root.querySelectorAll(".hero-slide"));
  var dots = Array.prototype.slice.call(root.querySelectorAll("[data-hero-dot]"));
  if (!slides.length) {
    return;
  }
  var index = 0;
  var timer = null;

  function show(next) {
    index = (next + slides.length) % slides.length;
    slides.forEach(function (slide, i) {
      slide.classList.toggle("is-active", i === index);
    });
    dots.forEach(function (dot, i) {
      dot.classList.toggle("is-active", i === index);
    });
  }

  function start() {
    timer = window.setInterval(function () {
      show(index + 1);
    }, 5600);
  }

  function stop() {
    if (timer) {
      window.clearInterval(timer);
      timer = null;
    }
  }

  dots.forEach(function (dot, i) {
    dot.addEventListener("click", function () {
      stop();
      show(i);
      start();
    });
  });

  root.addEventListener("mouseenter", stop);
  root.addEventListener("mouseleave", start);
  start();
}

function setupFilters() {
  var panels = document.querySelectorAll(".search-panel");
  panels.forEach(function (panel) {
    var scope = panel.closest("section") || document;
    var input = panel.querySelector("[data-search-input]");
    var typeFilter = panel.querySelector("[data-type-filter]");
    var yearFilter = panel.querySelector("[data-year-filter]");
    var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-search-card]"));
    var empty = scope.querySelector("[data-empty-state]");

    var params = new URLSearchParams(window.location.search);
    var query = params.get("q");
    if (query && input) {
      input.value = query;
    }

    function apply() {
      var text = input ? input.value.trim().toLowerCase() : "";
      var typeValue = typeFilter ? typeFilter.value : "";
      var yearValue = yearFilter ? yearFilter.value : "";
      var visible = 0;
      cards.forEach(function (card) {
        var haystack = [
          card.getAttribute("data-title") || "",
          card.getAttribute("data-region") || "",
          card.getAttribute("data-type") || "",
          card.getAttribute("data-year") || "",
          card.getAttribute("data-genre") || "",
          card.getAttribute("data-tags") || ""
        ].join(" ").toLowerCase();
        var typeOk = !typeValue || (card.getAttribute("data-type") || "").indexOf(typeValue) !== -1;
        var yearOk = !yearValue || (card.getAttribute("data-year") || "") === yearValue;
        var textOk = !text || haystack.indexOf(text) !== -1;
        var show = typeOk && yearOk && textOk;
        card.style.display = show ? "" : "none";
        if (show) {
          visible += 1;
        }
      });
      if (empty) {
        empty.classList.toggle("is-visible", visible === 0);
      }
    }

    [input, typeFilter, yearFilter].forEach(function (el) {
      if (el) {
        el.addEventListener("input", apply);
        el.addEventListener("change", apply);
      }
    });
    apply();
  });
}

function initMoviePlayer(videoUrl) {
  var video = document.getElementById("movieVideo");
  var playCover = document.getElementById("playCover");
  if (!video || !videoUrl) {
    return;
  }
  var attached = false;

  function attach() {
    if (attached) {
      return;
    }
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = videoUrl;
    } else if (window.Hls && Hls.isSupported()) {
      var hls = new Hls({ enableWorker: true, lowLatencyMode: false });
      hls.loadSource(videoUrl);
      hls.attachMedia(video);
    } else {
      video.src = videoUrl;
    }
    attached = true;
  }

  function start() {
    attach();
    if (playCover) {
      playCover.classList.add("is-hidden");
    }
    var promise = video.play();
    if (promise && promise.catch) {
      promise.catch(function () {});
    }
  }

  if (playCover) {
    playCover.addEventListener("click", start);
  }

  video.addEventListener("click", function () {
    if (video.paused) {
      start();
    }
  });

  video.addEventListener("play", function () {
    if (playCover) {
      playCover.classList.add("is-hidden");
    }
  });

  video.addEventListener("pause", function () {
    if (playCover && video.currentTime === 0) {
      playCover.classList.remove("is-hidden");
    }
  });
}

onReady(function () {
  setupMenu();
  setupBackTop();
  setupHero();
  setupFilters();
});
