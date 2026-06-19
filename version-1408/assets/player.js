(() => {
  document.querySelectorAll('[data-player]').forEach((panel) => {
    const video = panel.querySelector('video');
    const button = panel.querySelector('[data-player-start]');
    const source = panel.dataset.videoSrc;
    let loaded = false;

    const loadAndPlay = () => {
      if (!video || !source) return;

      if (!loaded) {
        if (window.Hls && window.Hls.isSupported()) {
          const hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true,
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

      if (button) button.classList.add('hidden');
      const playPromise = video.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(() => {
          video.controls = true;
        });
      }
    };

    if (button) button.addEventListener('click', loadAndPlay);
    if (video) {
      video.addEventListener('play', () => {
        if (button) button.classList.add('hidden');
      });
    }
  });
})();
