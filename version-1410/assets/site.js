(() => {
    const mobileNav = document.querySelector('[data-mobile-nav]');
    const menuToggle = document.querySelector('[data-menu-toggle]');

    if (menuToggle && mobileNav) {
        menuToggle.addEventListener('click', () => {
            mobileNav.classList.toggle('is-open');
        });
    }

    const hero = document.querySelector('[data-hero]');

    if (hero) {
        const slides = Array.from(hero.querySelectorAll('[data-slide]'));
        const dots = Array.from(hero.querySelectorAll('[data-slide-dot]'));
        const next = hero.querySelector('[data-slide-next]');
        const prev = hero.querySelector('[data-slide-prev]');
        let index = 0;
        let timer = null;

        const show = (nextIndex) => {
            if (!slides.length) {
                return;
            }

            index = (nextIndex + slides.length) % slides.length;

            slides.forEach((slide, slideIndex) => {
                slide.classList.toggle('is-active', slideIndex === index);
            });

            dots.forEach((dot, dotIndex) => {
                dot.classList.toggle('is-active', dotIndex === index);
            });
        };

        const start = () => {
            window.clearInterval(timer);
            timer = window.setInterval(() => show(index + 1), 5200);
        };

        dots.forEach((dot) => {
            dot.addEventListener('click', () => {
                show(Number(dot.dataset.slideDot || 0));
                start();
            });
        });

        if (next) {
            next.addEventListener('click', () => {
                show(index + 1);
                start();
            });
        }

        if (prev) {
            prev.addEventListener('click', () => {
                show(index - 1);
                start();
            });
        }

        show(0);
        start();
    }

    const searchInput = document.querySelector('[data-search-input]');
    const clearSearch = document.querySelector('[data-clear-search]');
    const cards = Array.from(document.querySelectorAll('[data-card]'));
    const emptyState = document.querySelector('[data-empty-state]');

    const applySearch = () => {
        if (!searchInput || !cards.length) {
            return;
        }

        const value = searchInput.value.trim().toLowerCase();
        let visible = 0;

        cards.forEach((card) => {
            const haystack = (card.dataset.search || '').toLowerCase();
            const matched = !value || haystack.includes(value);
            card.hidden = !matched;

            if (matched) {
                visible += 1;
            }
        });

        if (emptyState) {
            emptyState.classList.toggle('is-visible', visible === 0);
        }
    };

    if (searchInput) {
        const params = new URLSearchParams(window.location.search);
        const query = params.get('q');

        if (query) {
            searchInput.value = query;
        }

        searchInput.addEventListener('input', applySearch);
        applySearch();
    }

    if (clearSearch && searchInput) {
        clearSearch.addEventListener('click', () => {
            searchInput.value = '';
            applySearch();
            searchInput.focus();
        });
    }

    const loadHls = (() => {
        let promise = null;

        return () => {
            if (window.Hls) {
                return Promise.resolve(window.Hls);
            }

            if (!promise) {
                promise = new Promise((resolve, reject) => {
                    const script = document.createElement('script');
                    script.src = 'https://cdn.jsdelivr.net/npm/hls.js@latest';
                    script.async = true;
                    script.onload = () => resolve(window.Hls);
                    script.onerror = reject;
                    document.head.appendChild(script);
                });
            }

            return promise;
        };
    })();

    const players = Array.from(document.querySelectorAll('[data-player]'));

    players.forEach((player) => {
        const video = player.querySelector('video');
        const button = player.querySelector('[data-play]');
        const stream = player.dataset.stream;
        let prepared = false;
        let hls = null;

        if (!video || !stream) {
            return;
        }

        const markPlaying = () => {
            player.classList.add('is-playing');
        };

        const playVideo = () => {
            const attempt = () => {
                const result = video.play();

                if (result && typeof result.catch === 'function') {
                    result.catch(() => {});
                }
            };

            if (prepared) {
                markPlaying();
                attempt();
                return;
            }

            prepared = true;
            markPlaying();

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = stream;
                video.load();
                attempt();
                return;
            }

            loadHls()
                .then((Hls) => {
                    if (Hls && Hls.isSupported()) {
                        hls = new Hls();
                        hls.loadSource(stream);
                        hls.attachMedia(video);
                        hls.on(Hls.Events.MANIFEST_PARSED, attempt);
                    } else {
                        video.src = stream;
                        video.load();
                        attempt();
                    }
                })
                .catch(() => {
                    video.src = stream;
                    video.load();
                    attempt();
                });
        };

        if (button) {
            button.addEventListener('click', playVideo);
        }

        video.addEventListener('click', () => {
            if (video.paused) {
                playVideo();
            }
        });

        video.addEventListener('play', markPlaying);
        video.addEventListener('ended', () => {
            player.classList.remove('is-playing');
        });

        window.addEventListener('beforeunload', () => {
            if (hls) {
                hls.destroy();
            }
        });
    });
})();
