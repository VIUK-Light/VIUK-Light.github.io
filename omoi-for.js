(() => {
  const page = document.querySelector('.omoi-for-page');
  if (!page) return;
  const subnav = page.querySelector('.project-subnav');
  if (subnav) {
    const sections = [...subnav.querySelectorAll('a')].flatMap(link => {
      const href = link.getAttribute('href');
      const target = href === 'omoi-for.html' ? page.querySelector('.for-hero')
        : href?.startsWith('#') ? page.querySelector(href) : null;
      return target ? [{ link, target }] : [];
    });
    const updateSubnav = () => {
      const headerHeight = document.querySelector('.site-header')?.getBoundingClientRect().height || 0;
      const navHeight = subnav.getBoundingClientRect().height;
      const marker = headerHeight + navHeight + 24;
      let active = sections[0];
      sections.forEach(section => {
        if (section.target.getBoundingClientRect().top <= marker) active = section;
      });
      sections.forEach(section => {
        if (section === active) section.link.setAttribute('aria-current', 'location');
        else section.link.removeAttribute('aria-current');
      });
    };
    window.addEventListener('scroll', updateSubnav, { passive: true });
    window.addEventListener('resize', updateSubnav);
    updateSubnav();
  }
  const cards = [...page.querySelectorAll('[data-for-card]')];
  const tabs = [...page.querySelectorAll('[data-for-tab]')];
  const panels = [...page.querySelectorAll('[data-for-panel]')];
  const picker = page.querySelector('[data-for-picker]');
  const hero = page.querySelector('.for-hero');
  const demo = page.querySelector('[data-for-demo-card]');
  const flipButton = page.querySelector('[data-for-flip]');
  if (!tabs.length || tabs.length !== panels.length || !picker) return;

  const root = document.documentElement;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const series = panels.map(panel => ({ key: panel.dataset.series, name: panel.dataset.series }));
  const visualOrder = ['friends', 'family', 'couples', 'adults', 'self-care'];
  const animations = new Set();
  const state = { series: 'couples', intensity: 'lite', style: 'deep', flipped: false };
  const seriesFromHash = () => {
    const key = window.location.hash.startsWith('#for-series-')
      ? window.location.hash.slice('#for-series-'.length) : null;
    return series.some(item => item.key === key) ? key : null;
  };
  const replaceSeriesHash = key => {
    window.history.replaceState(window.history.state, '', '#for-series-' + key);
  };
  let manualSelection = false;
  let heroInView = false;
  let timer;

  const motionEnabled = () => !document.hidden && !reducedMotion.matches &&
    root.dataset.motionPaused !== 'true';
  const cancelAnimations = () => {
    animations.forEach(animation => animation.cancel());
    animations.clear();
  };
  const animate = (element, frames, duration = 700, delay = 0) => {
    if (!motionEnabled() || element.contains(document.activeElement) ||
        typeof element.animate !== 'function') return;
    const animation = element.animate(frames, {
      duration, delay, easing: 'cubic-bezier(.22, 1, .36, 1)', fill: 'backwards'
    });
    animations.add(animation);
    animation.addEventListener('finish', () => animations.delete(animation), { once: true });
    animation.addEventListener('cancel', () => animations.delete(animation), { once: true });
  };
  const clearCycle = () => { window.clearTimeout(timer); timer = undefined; };
  const canCycle = () => {
    const active = document.activeElement;
    const noReadingFocus = !active || active === document.body ||
      active.closest('.site-motion-control');
    return motionEnabled() && !manualSelection && heroInView && noReadingFocus;
  };
  const scheduleCycle = () => {
    clearCycle();
    if (!canCycle()) return;
    timer = window.setTimeout(() => {
      if (!canCycle()) return;
      const index = series.findIndex(item => item.key === state.series);
      selectSeries(series[(index + 1) % series.length].key, false);
      scheduleCycle();
    }, 4800);
  };
  const markManual = () => {
    manualSelection = true;
    clearCycle();
    cancelAnimations();
  };

  const renderDemo = () => {
    if (!demo || !flipButton) return;
    const selected = series.find(item => item.key === state.series);
    const intensityName = state.intensity === 'lite' ? 'Lite' : 'Deep';
    const styleName = state.style === 'normal' ? '通常' : '深掘り';
    page.querySelectorAll('[data-for-current-name]').forEach(node => { node.textContent = selected.name; });
    page.querySelectorAll('[data-for-intensity]').forEach(button => {
      button.setAttribute('aria-pressed', String(button.dataset.forIntensity === state.intensity));
    });
    page.querySelectorAll('[data-for-style]').forEach(button => {
      button.setAttribute('aria-pressed', String(button.dataset.forStyle === state.style));
    });
    if (state.style === 'normal') state.flipped = false;
    demo.classList.toggle('is-flipped', state.flipped);
    flipButton.hidden = state.style === 'normal';
    flipButton.setAttribute('aria-pressed', String(state.flipped));
    page.querySelector('[data-for-flip-label]').textContent =
      state.flipped ? '表に戻す' : 'カードをめくる';
    page.querySelector('[data-for-demo-intensity-label]').textContent =
      intensityName + (state.series === 'adults' ? ' · 18歳以上向け' : '');
    page.querySelector('[data-for-demo-status]').textContent =
      intensityName + '・' + styleName + ' / ' + (state.flipped ? '裏面' : '表面');
    page.querySelector('[data-for-demo-help]').textContent = state.style === 'normal'
      ? (state.intensity === 'lite' ? '気軽な話題を、一枚ずつ。' : '気持ちや価値観に、一枚ずつ向き合う。')
      : (state.intensity === 'lite' ? '気軽な問いにも、もう一つの視点を。' : '深い話にも、もう一つの視点を。');
    page.dataset.demoIntensity = state.intensity;
    page.dataset.demoStyle = state.style;
    page.dataset.demoSide = state.flipped ? 'back' : 'front';
  };

  function selectSeries(key, shouldAnimate = true) {
    if (!series.some(item => item.key === key)) return;
    state.series = key;
    page.dataset.selectedSeries = key;
    const selectedPosition = visualOrder.indexOf(key);
    cards.forEach(card => {
      let slot = visualOrder.indexOf(card.dataset.series) - selectedPosition;
      if (slot > 2) slot -= 5;
      if (slot < -2) slot += 5;
      card.style.setProperty('--slot', String(slot));
      card.style.setProperty('--card-z', String(5 - Math.abs(slot)));
      card.style.setProperty('--card-y', Math.abs(slot) * 12 + 'px');
      card.classList.toggle('is-selected', card.dataset.series === key);
    });
    tabs.forEach(tab => {
      const selected = tab.dataset.series === key;
      tab.classList.toggle('is-selected', selected);
      tab.setAttribute('aria-selected', String(selected));
      tab.tabIndex = selected ? 0 : -1;
    });
    panels.forEach(panel => { panel.hidden = panel.dataset.series !== key; });
    state.flipped = false;
    renderDemo();
    const panel = panels.find(item => item.dataset.series === key);
    const bounds = panel.getBoundingClientRect();
    if (shouldAnimate && bounds.top < window.innerHeight && bounds.bottom > 0) {
      animate(panel, [
        { opacity: 0, transform: 'translateY(16px)' },
        { opacity: 1, transform: 'translateY(0)' }
      ]);
    }
  }

  picker.setAttribute('role', 'tablist');
  tabs.forEach(tab => {
    tab.setAttribute('role', 'tab');
    tab.setAttribute('aria-controls', 'for-series-' + tab.dataset.series);
    tab.addEventListener('click', event => {
      event.preventDefault();
      markManual();
      selectSeries(tab.dataset.series);
      replaceSeriesHash(tab.dataset.series);
    });
  });
  panels.forEach(panel => {
    panel.setAttribute('role', 'tabpanel');
    panel.setAttribute('aria-labelledby', 'for-tab-' + panel.dataset.series);
  });
  picker.addEventListener('keydown', event => {
    const tab = event.target.closest('[data-for-tab]');
    if (!tab) return;
    let index = tabs.indexOf(tab);
    if (event.key === 'ArrowRight') index = (index + 1) % tabs.length;
    else if (event.key === 'ArrowLeft') index = (index - 1 + tabs.length) % tabs.length;
    else if (event.key === 'Home') index = 0;
    else if (event.key === 'End') index = tabs.length - 1;
    else return;
    event.preventDefault();
    markManual();
    selectSeries(tabs[index].dataset.series);
    replaceSeriesHash(tabs[index].dataset.series);
    tabs[index].focus({ preventScroll: true });
    // Keep keyboard selection visible inside the mobile strip without moving the page.
    const track = picker.getBoundingClientRect();
    const target = tabs[index].getBoundingClientRect();
    if (target.left < track.left) picker.scrollLeft -= track.left - target.left + 8;
    else if (target.right > track.right) picker.scrollLeft += target.right - track.right + 8;
  });
  page.querySelectorAll('.for-shot-gallery').forEach(gallery => {
    gallery.addEventListener('focusin', event => {
      const link = event.target.closest('a');
      if (!link || !gallery.contains(link)) return;
      const track = gallery.getBoundingClientRect();
      const target = link.getBoundingClientRect();
      // Keep the focused screenshot and its outline inside the horizontal gallery.
      if (target.left < track.left + 10) gallery.scrollLeft -= track.left + 10 - target.left;
      else if (target.right > track.right - 10) gallery.scrollLeft += target.right - track.right + 10;
    });
  });
  cards.forEach(card => card.addEventListener('click', () => {
    markManual();
    selectSeries(card.dataset.series);
  }));
  page.querySelectorAll('[data-for-intensity]').forEach(button => {
    button.addEventListener('click', () => {
      markManual();
      state.intensity = button.dataset.forIntensity;
      state.flipped = false;
      renderDemo();
    });
  });
  page.querySelectorAll('[data-for-style]').forEach(button => {
    button.addEventListener('click', () => {
      markManual();
      state.style = button.dataset.forStyle;
      state.flipped = false;
      renderDemo();
    });
  });
  flipButton?.addEventListener('click', () => {
    if (state.style !== 'deep') return;
    markManual();
    state.flipped = !state.flipped;
    renderDemo();
  });
  page.addEventListener('focusin', event => {
    animations.forEach(animation => {
      if (animation.effect?.target?.contains(event.target)) animation.cancel();
    });
    if (event.target.closest('.for-hero, .for-showcase, .for-experience')) markManual();
  });

  page.classList.add('for-enhanced');
  const initialSeries = seriesFromHash();
  if (initialSeries) manualSelection = true;
  selectSeries(initialSeries || 'couples', false);
  // Read the final card poses before starting any of the entrance animations.
  const poses = cards.map(card => getComputedStyle(card).transform);
  cards.forEach((card, i) => animate(card, [
    { opacity: 0, transform: 'translate(-50%, -35%) rotate(0) scale(.86)' },
    { opacity: 1, transform: poses[i] }
  ], 1200, i * 70));

  if (hero && 'IntersectionObserver' in window) {
    const heroObserver = new IntersectionObserver(entries => {
      const entry = entries.find(item => item.target === hero);
      if (!entry) return;
      heroInView = entry.isIntersecting && entry.intersectionRatio >= .35;
      scheduleCycle();
    }, { threshold: [0, .35] });
    heroObserver.observe(hero);
    const revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        revealObserver.unobserve(entry.target);
        animate(entry.target, [
          { opacity: 0, transform: 'translateY(24px)' },
          { opacity: 1, transform: 'translateY(0)' }
        ], 900);
      });
    }, { threshold: .1 });
    page.querySelectorAll('[data-for-reveal]').forEach(node => revealObserver.observe(node));
  }
  const updatePolicy = () => {
    if (!motionEnabled()) cancelAnimations();
    scheduleCycle();
  };
  document.addEventListener('site-motion-change', updatePolicy);
  document.addEventListener('visibilitychange', updatePolicy);
  reducedMotion.addEventListener('change', updatePolicy);
  window.addEventListener('hashchange', () => {
    const key = seriesFromHash();
    if (!key || key === state.series) return;
    markManual();
    selectSeries(key, false);
  });
})();
