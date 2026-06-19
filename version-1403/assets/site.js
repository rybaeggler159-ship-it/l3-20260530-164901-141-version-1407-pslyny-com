(function () {
  var mobileToggle = document.querySelector('[data-mobile-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');
  if (mobileToggle && mobileNav) {
    mobileToggle.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var current = 0;
    var showSlide = function (index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === current);
      });
    };
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        showSlide(i);
      });
    });
    if (slides.length > 1) {
      setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }
  }

  var list = document.querySelector('[data-filter-list]');
  var input = document.querySelector('[data-filter-input]');
  var category = document.querySelector('[data-filter-category]');
  var sort = document.querySelector('[data-sort-select]');
  var note = document.querySelector('[data-filter-note]');

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function applyQueryFromUrl() {
    if (!input) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var q = params.get('q');
    if (q) {
      input.value = q;
    }
  }

  function filterCards() {
    if (!list) {
      return;
    }
    var q = normalize(input ? input.value : '');
    var cat = category ? category.value : '';
    var cards = Array.prototype.slice.call(list.querySelectorAll('[data-card]'));
    var visible = 0;
    cards.forEach(function (card) {
      var haystack = normalize([
        card.dataset.title,
        card.dataset.category,
        card.dataset.tags,
        card.dataset.year
      ].join(' '));
      var okQuery = !q || haystack.indexOf(q) !== -1;
      var okCategory = !cat || card.dataset.category === cat;
      var ok = okQuery && okCategory;
      card.classList.toggle('is-hidden', !ok);
      if (ok) {
        visible += 1;
      }
    });
    if (note) {
      note.textContent = visible ? '筛选结果已更新，可直接打开影片详情。' : '未找到匹配影片，可更换关键词。';
    }
  }

  function sortCards() {
    if (!list || !sort) {
      return;
    }
    var cards = Array.prototype.slice.call(list.querySelectorAll('[data-card]'));
    var mode = sort.value;
    cards.sort(function (a, b) {
      if (mode === 'year') {
        return Number(b.dataset.year || 0) - Number(a.dataset.year || 0);
      }
      if (mode === 'title') {
        return String(a.dataset.title || '').localeCompare(String(b.dataset.title || ''), 'zh-Hans-CN');
      }
      return Number(b.dataset.score || 0) - Number(a.dataset.score || 0);
    });
    cards.forEach(function (card) {
      list.appendChild(card);
    });
    filterCards();
  }

  applyQueryFromUrl();
  if (input) {
    input.addEventListener('input', filterCards);
  }
  if (category) {
    category.addEventListener('change', filterCards);
  }
  if (sort) {
    sort.addEventListener('change', sortCards);
    sortCards();
  } else {
    filterCards();
  }

  var playerWrap = document.querySelector('[data-player-wrap]');
  if (playerWrap) {
    var video = playerWrap.querySelector('video[data-hls-src]');
    var playButton = playerWrap.querySelector('[data-play-button]');
    var playerReady = false;

    function playVideo() {
      if (!video) {
        return;
      }
      var src = video.getAttribute('data-hls-src');
      if (!src) {
        return;
      }
      if (playButton) {
        playButton.classList.add('is-hidden');
      }
      if (playerReady) {
        video.play().catch(function () {});
        return;
      }
      playerReady = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = src;
        video.play().catch(function () {});
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(src);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          video.play().catch(function () {});
        });
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            try {
              hls.destroy();
            } catch (error) {}
            video.src = src;
            video.play().catch(function () {});
          }
        });
        return;
      }
      video.src = src;
      video.play().catch(function () {});
    }

    if (playButton) {
      playButton.addEventListener('click', playVideo);
    }
    if (video) {
      video.addEventListener('click', function () {
        if (!playerReady) {
          playVideo();
        }
      });
      video.addEventListener('play', function () {
        if (playButton) {
          playButton.classList.add('is-hidden');
        }
      });
      video.addEventListener('pause', function () {
        if (playButton && video.currentTime === 0) {
          playButton.classList.remove('is-hidden');
        }
      });
    }
  }
})();
