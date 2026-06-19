(function () {
  function setupNavigation() {
    const toggle = document.querySelector('.nav-toggle');
    const links = document.querySelector('.nav-links');
    if (!toggle || !links) {
      return;
    }
    toggle.addEventListener('click', function () {
      const open = links.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  function setupCarousel() {
    const stage = document.querySelector('[data-carousel]');
    if (!stage) {
      return;
    }
    const slides = Array.from(stage.querySelectorAll('.hero-slide'));
    const dots = Array.from(stage.querySelectorAll('.hero-dots button'));
    const prev = stage.querySelector('.hero-prev');
    const next = stage.querySelector('.hero-next');
    let index = 0;
    let timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        start();
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        start();
      });
    }
    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        show(dotIndex);
        start();
      });
    });
    stage.addEventListener('mouseenter', stop);
    stage.addEventListener('mouseleave', start);
    start();
  }

  function setupSearch() {
    const inputs = Array.from(document.querySelectorAll('.card-search'));
    inputs.forEach(function (input) {
      const targetSelector = input.getAttribute('data-target');
      const target = document.querySelector(targetSelector);
      const clear = input.closest('.filter-panel') ? input.closest('.filter-panel').querySelector('.clear-search') : null;
      if (!target) {
        return;
      }
      const items = Array.from(target.querySelectorAll('.movie-card, .ranking-row'));
      function filter() {
        const query = input.value.trim().toLowerCase();
        items.forEach(function (item) {
          const haystack = [
            item.textContent,
            item.getAttribute('data-title') || '',
            item.getAttribute('data-tags') || '',
            item.getAttribute('data-region') || '',
            item.getAttribute('data-year') || ''
          ].join(' ').toLowerCase();
          item.classList.toggle('is-hidden', query.length > 0 && haystack.indexOf(query) === -1);
        });
      }
      input.addEventListener('input', filter);
      if (clear) {
        clear.addEventListener('click', function () {
          input.value = '';
          filter();
          input.focus();
        });
      }
    });
  }

  function setupPlayer() {
    const video = document.getElementById('movie-video');
    const configNode = document.getElementById('player-config');
    const wrap = document.querySelector('.player-wrap');
    const button = document.querySelector('.play-overlay');
    const message = document.querySelector('.player-message');
    if (!video || !configNode || !wrap || !button) {
      return;
    }

    let source = '';
    try {
      source = JSON.parse(configNode.textContent).src || '';
    } catch (error) {
      source = '';
    }

    function showMessage(text) {
      if (message) {
        message.textContent = text;
      }
    }

    function load() {
      if (!source || video.getAttribute('data-ready') === '1') {
        return Boolean(source);
      }
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        video.setAttribute('data-ready', '1');
        return true;
      }
      if (window.Hls && window.Hls.isSupported()) {
        const hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            showMessage('视频暂时无法播放，请稍后再试');
            wrap.classList.remove('is-playing');
          }
        });
        video._hls = hls;
        video.setAttribute('data-ready', '1');
        return true;
      }
      showMessage('视频暂时无法播放，请稍后再试');
      return false;
    }

    function play() {
      if (!load()) {
        return;
      }
      const promise = video.play();
      if (promise && promise.catch) {
        promise.catch(function () {
          showMessage('请点击播放按钮继续观看');
        });
      }
    }

    button.addEventListener('click', play);
    video.addEventListener('click', function () {
      if (video.paused) {
        play();
      } else {
        video.pause();
      }
    });
    video.addEventListener('play', function () {
      wrap.classList.add('is-playing');
      showMessage('');
    });
    video.addEventListener('pause', function () {
      wrap.classList.remove('is-playing');
    });
    video.addEventListener('ended', function () {
      wrap.classList.remove('is-playing');
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupNavigation();
    setupCarousel();
    setupSearch();
    setupPlayer();
  });
})();
