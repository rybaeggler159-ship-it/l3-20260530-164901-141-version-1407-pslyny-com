(function () {
  const nav = document.querySelector('[data-main-nav]');
  const toggle = document.querySelector('[data-menu-toggle]');

  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      nav.classList.toggle('open');
    });
  }

  document.querySelectorAll('[data-search-form]').forEach(function (form) {
    form.addEventListener('submit', function () {
      const input = form.querySelector('input[name="q"]');
      if (input) {
        input.value = input.value.trim();
      }
    });
  });

  const hero = document.querySelector('[data-hero]');
  if (hero) {
    const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
    let current = 0;

    function show(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === current);
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.dataset.heroDot || 0));
      });
    });

    setInterval(function () {
      show(current + 1);
    }, 5200);
  }

  const list = document.querySelector('[data-card-list]');
  if (list) {
    const keywordInputs = Array.from(document.querySelectorAll('[data-card-search]'));
    const yearFilter = document.querySelector('[data-year-filter]');
    const regionFilter = document.querySelector('[data-region-filter]');
    const categoryFilter = document.querySelector('[data-category-filter]');
    const reset = document.querySelector('[data-reset-filter]');
    const empty = document.querySelector('[data-empty-state]');
    const cards = Array.from(list.children);
    const params = new URLSearchParams(window.location.search);
    const initialQuery = params.get('q') || '';

    keywordInputs.forEach(function (input) {
      if (input.hasAttribute('data-sync-query')) {
        input.value = initialQuery;
      }
      input.addEventListener('input', function () {
        keywordInputs.forEach(function (other) {
          if (other !== input) {
            other.value = input.value;
          }
        });
        applyFilters();
      });
    });

    [yearFilter, regionFilter, categoryFilter].forEach(function (select) {
      if (select) {
        select.addEventListener('change', applyFilters);
      }
    });

    if (reset) {
      reset.addEventListener('click', function () {
        keywordInputs.forEach(function (input) {
          input.value = '';
        });
        [yearFilter, regionFilter, categoryFilter].forEach(function (select) {
          if (select) {
            select.value = '';
          }
        });
        applyFilters();
      });
    }

    function textOf(card) {
      return [
        card.dataset.title || '',
        card.dataset.tags || '',
        card.dataset.year || '',
        card.dataset.region || '',
        card.dataset.category || '',
        card.textContent || ''
      ].join(' ').toLowerCase();
    }

    function applyFilters() {
      const query = (keywordInputs[0] ? keywordInputs[0].value : '').trim().toLowerCase();
      const year = yearFilter ? yearFilter.value : '';
      const region = regionFilter ? regionFilter.value : '';
      const category = categoryFilter ? categoryFilter.value : '';
      let visible = 0;

      cards.forEach(function (card) {
        const matchesQuery = !query || textOf(card).includes(query);
        const matchesYear = !year || card.dataset.year === year;
        const matchesRegion = !region || card.dataset.region === region;
        const matchesCategory = !category || card.dataset.category === category;
        const shouldShow = matchesQuery && matchesYear && matchesRegion && matchesCategory;
        card.hidden = !shouldShow;
        if (shouldShow) {
          visible += 1;
        }
      });

      if (empty) {
        empty.hidden = visible !== 0;
      }
    }

    applyFilters();
  }

  const backTop = document.querySelector('[data-back-top]');
  if (backTop) {
    window.addEventListener('scroll', function () {
      backTop.classList.toggle('show', window.scrollY > 600);
    });
    backTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
})();
