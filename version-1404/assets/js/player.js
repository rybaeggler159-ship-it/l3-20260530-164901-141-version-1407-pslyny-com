(function () {
  async function attachHls(video, source) {
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      await video.play();
      return;
    }

    const hlsModule = await import('./hls-vendor-dru42stk.js');
    const Hls = hlsModule.H;

    if (!Hls || !Hls.isSupported()) {
      video.src = source;
      await video.play();
      return;
    }

    const hls = new Hls({
      enableWorker: true,
      lowLatencyMode: true,
      backBufferLength: 90
    });

    window.__movieSiteHls = window.__movieSiteHls || [];
    window.__movieSiteHls.push(hls);

    hls.loadSource(source);
    hls.attachMedia(video);

    await new Promise(function (resolve) {
      hls.on(Hls.Events.MANIFEST_PARSED, resolve);
    });

    await video.play();
  }

  function initPlayer(container) {
    const video = container.querySelector('[data-video]');
    const button = container.querySelector('[data-play-button]');
    const source = container.dataset.src;

    if (!video || !button || !source) {
      return;
    }

    let started = false;

    async function start() {
      if (started) {
        video.play();
        return;
      }

      started = true;
      button.classList.add('is-hidden');

      try {
        await attachHls(video, source);
      } catch (error) {
        started = false;
        button.classList.remove('is-hidden');
        button.querySelector('strong').textContent = '点击继续播放';
        video.src = source;
      }
    }

    button.addEventListener('click', start);
    video.addEventListener('click', function () {
      if (video.paused) {
        start();
      }
    });
    video.addEventListener('play', function () {
      button.classList.add('is-hidden');
    });
  }

  document.querySelectorAll('[data-player]').forEach(initPlayer);
})();
