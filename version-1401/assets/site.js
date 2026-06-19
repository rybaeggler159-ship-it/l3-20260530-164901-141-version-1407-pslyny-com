(function () {
  var menuButton = document.querySelector('[data-menu-button]');
  var mobilePanel = document.querySelector('[data-mobile-panel]');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      mobilePanel.classList.toggle('open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  var heroIndex = 0;

  function showHero(index) {
    if (!slides.length) {
      return;
    }

    heroIndex = (index + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('active', slideIndex === heroIndex);
    });

    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('active', dotIndex === heroIndex);
    });
  }

  dots.forEach(function (dot, index) {
    dot.addEventListener('click', function () {
      showHero(index);
    });
  });

  if (slides.length > 1) {
    window.setInterval(function () {
      showHero(heroIndex + 1);
    }, 5200);
  }

  var filterRoot = document.querySelector('[data-filter-root]');

  if (filterRoot) {
    var searchInput = filterRoot.querySelector('[data-filter-search]');
    var yearSelect = filterRoot.querySelector('[data-filter-year]');
    var regionSelect = filterRoot.querySelector('[data-filter-region]');
    var cards = Array.prototype.slice.call(filterRoot.querySelectorAll('.movie-card'));
    var emptyState = filterRoot.querySelector('[data-empty-state]');

    function applyFilter() {
      var q = searchInput ? searchInput.value.trim().toLowerCase() : '';
      var year = yearSelect ? yearSelect.value : '';
      var region = regionSelect ? regionSelect.value : '';
      var shown = 0;

      cards.forEach(function (card) {
        var title = (card.getAttribute('data-title') || '').toLowerCase();
        var tags = (card.getAttribute('data-tags') || '').toLowerCase();
        var cardYear = card.getAttribute('data-year') || '';
        var cardRegion = card.getAttribute('data-region') || '';
        var matched = true;

        if (q && title.indexOf(q) === -1 && tags.indexOf(q) === -1) {
          matched = false;
        }

        if (year && cardYear !== year) {
          matched = false;
        }

        if (region && cardRegion !== region) {
          matched = false;
        }

        card.style.display = matched ? '' : 'none';

        if (matched) {
          shown += 1;
        }
      });

      if (emptyState) {
        emptyState.style.display = shown ? 'none' : 'block';
      }
    }

    [searchInput, yearSelect, regionSelect].forEach(function (node) {
      if (node) {
        node.addEventListener('input', applyFilter);
        node.addEventListener('change', applyFilter);
      }
    });

    applyFilter();
  }

  var searchPage = document.querySelector('[data-search-page]');

  if (searchPage && window.MOVIE_INDEX) {
    var params = new URLSearchParams(window.location.search);
    var initial = params.get('q') || '';
    var input = searchPage.querySelector('[data-search-input]');
    var results = searchPage.querySelector('[data-search-results]');
    var empty = searchPage.querySelector('[data-search-empty]');

    if (input) {
      input.value = initial;
    }

    function renderSearch() {
      var q = input ? input.value.trim().toLowerCase() : '';
      var list = window.MOVIE_INDEX.filter(function (movie) {
        var haystack = [movie.title, movie.region, movie.type, movie.year, movie.genre, movie.tags].join(' ').toLowerCase();
        return !q || haystack.indexOf(q) !== -1;
      }).slice(0, 120);

      if (!results) {
        return;
      }

      results.innerHTML = list.map(function (movie) {
        return [
          '<article class="movie-card">',
          '  <a class="poster-link" href="' + movie.url + '">',
          '    <img src="' + movie.image + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
          '    <span class="poster-shade"></span>',
          '    <span class="duration">' + movie.duration + '</span>',
          '  </a>',
          '  <div class="card-body">',
          '    <div class="card-tags"><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.type) + '</span></div>',
          '    <h3><a href="' + movie.url + '">' + escapeHtml(movie.title) + '</a></h3>',
          '    <p>' + escapeHtml(movie.oneLine) + '</p>',
          '    <div class="card-meta"><span>' + movie.year + '</span><span>' + escapeHtml(movie.genre) + '</span></div>',
          '  </div>',
          '</article>'
        ].join('');
      }).join('');

      if (empty) {
        empty.style.display = list.length ? 'none' : 'block';
      }
    }

    function escapeHtml(value) {
      return String(value || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    }

    if (input) {
      input.addEventListener('input', renderSearch);
    }

    renderSearch();
  }

  Array.prototype.slice.call(document.querySelectorAll('.video-player-box')).forEach(function (box) {
    var video = box.querySelector('video');
    var button = box.querySelector('.play-control');
    var source = video ? video.getAttribute('data-src') : '';
    var loaded = false;

    function start() {
      if (!video || !source) {
        return;
      }

      if (!loaded) {
        if (window.Hls && window.Hls.isSupported()) {
          var hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });

          hls.loadSource(source);
          hls.attachMedia(video);
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = source;
        } else {
          video.src = source;
        }

        loaded = true;
      }

      box.classList.add('playing');
      video.setAttribute('controls', 'controls');
      var playPromise = video.play();

      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {
          box.classList.remove('playing');
        });
      }
    }

    if (button) {
      button.addEventListener('click', start);
    }

    box.addEventListener('click', function (event) {
      if (event.target === video && loaded) {
        return;
      }

      start();
    });
  });
})();
