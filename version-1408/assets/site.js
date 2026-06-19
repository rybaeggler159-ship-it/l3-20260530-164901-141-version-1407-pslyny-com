(() => {
  const menuButton = document.querySelector('[data-menu-button]');
  const mobileMenu = document.querySelector('[data-mobile-menu]');

  if (menuButton && mobileMenu) {
    menuButton.addEventListener('click', () => {
      mobileMenu.classList.toggle('open');
    });
  }

  const carousel = document.querySelector('[data-hero-carousel]');

  if (carousel) {
    const slides = Array.from(carousel.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(carousel.querySelectorAll('[data-hero-dot]'));
    const prev = carousel.querySelector('[data-hero-prev]');
    const next = carousel.querySelector('[data-hero-next]');
    let index = 0;
    let timer = null;

    const show = (target) => {
      if (!slides.length) return;
      index = (target + slides.length) % slides.length;
      slides.forEach((slide, i) => slide.classList.toggle('active', i === index));
      dots.forEach((dot, i) => dot.classList.toggle('active', i === index));
    };

    const start = () => {
      timer = window.setInterval(() => show(index + 1), 5600);
    };

    const restart = () => {
      window.clearInterval(timer);
      start();
    };

    dots.forEach((dot, i) => {
      dot.addEventListener('click', () => {
        show(i);
        restart();
      });
    });

    if (prev) {
      prev.addEventListener('click', () => {
        show(index - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', () => {
        show(index + 1);
        restart();
      });
    }

    start();
  }

  const normalize = (value) => String(value || '').toLowerCase().trim();

  document.querySelectorAll('[data-card-list]').forEach((list) => {
    const container = list.closest('.container') || document;
    const filter = container.querySelector('[data-card-filter]');
    const sort = container.querySelector('[data-card-sort]');

    const apply = () => {
      const keyword = normalize(filter ? filter.value : '');
      const items = Array.from(list.children);

      items.forEach((item) => {
        const haystack = normalize([
          item.dataset.title,
          item.dataset.year,
          item.dataset.region,
          item.dataset.genre,
          item.textContent,
        ].join(' '));
        item.classList.toggle('hidden-card', keyword && !haystack.includes(keyword));
      });

      if (sort) {
        const mode = sort.value;
        const visibleItems = items.sort((a, b) => {
          if (mode === 'title') {
            return String(a.dataset.title || '').localeCompare(String(b.dataset.title || ''), 'zh-Hans-CN');
          }
          if (mode === 'heat') {
            return Number(b.dataset.heat || 0) - Number(a.dataset.heat || 0);
          }
          return Number(b.dataset.year || 0) - Number(a.dataset.year || 0);
        });
        visibleItems.forEach((item) => list.appendChild(item));
      }
    };

    if (filter) filter.addEventListener('input', apply);
    if (sort) sort.addEventListener('change', apply);
  });

  const searchInput = document.querySelector('[data-global-search]');
  const searchSort = document.querySelector('[data-global-sort]');
  const searchResults = document.querySelector('[data-search-results]');
  const indexData = Array.isArray(window.MOVIE_SEARCH_INDEX) ? window.MOVIE_SEARCH_INDEX : [];

  const renderResults = () => {
    if (!searchInput || !searchResults) return;
    const keyword = normalize(searchInput.value);
    const mode = searchSort ? searchSort.value : 'heat';

    if (!keyword) {
      searchResults.innerHTML = '';
      return;
    }

    const matches = indexData
      .filter((movie) => normalize(movie.searchText).includes(keyword))
      .sort((a, b) => {
        if (mode === 'title') return String(a.title).localeCompare(String(b.title), 'zh-Hans-CN');
        if (mode === 'year') return Number(b.year || 0) - Number(a.year || 0);
        return Number(b.heat || 0) - Number(a.heat || 0);
      })
      .slice(0, 60);

    if (!matches.length) {
      searchResults.innerHTML = '<p class="empty-result">没有找到匹配影片。</p>';
      return;
    }

    const currentDepth = location.pathname.includes('/movies/') ? '../' : '';
    searchResults.innerHTML = matches.map((movie) => `
      <a class="search-result-card" href="${currentDepth}movies/movie-${movie.id}.html">
        <img src="${currentDepth}${movie.cover}.jpg" alt="${movie.title}" loading="lazy">
        <span>
          <h3>${movie.title}</h3>
          <p>${movie.year || '年份待整理'} · ${movie.region} · ${movie.genre}</p>
        </span>
      </a>
    `).join('');
  };

  if (searchInput) searchInput.addEventListener('input', renderResults);
  if (searchSort) searchSort.addEventListener('change', renderResults);
})();
