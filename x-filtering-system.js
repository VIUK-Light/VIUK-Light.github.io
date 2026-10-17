(() => {
  const page = document.querySelector('.xfilter-body');
  if (!page) return;
  const root = document.documentElement;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const animations = new Set();
  const canAnimate = () => !reducedMotion.matches && !root.classList.contains('motion-paused') && !document.hidden;
  const animate = (element, frames, duration) => {
    if (!canAnimate() || typeof element.animate !== 'function' || element.contains(document.activeElement)) return;
    const animation = element.animate(frames, { duration, easing: 'cubic-bezier(.22, 1, .36, 1)', fill: 'backwards' });
    animations.add(animation);
    const forget = () => animations.delete(animation);
    animation.addEventListener('finish', forget, { once: true });
    animation.addEventListener('cancel', forget, { once: true });
  };
  const preview = page.querySelector('[data-xf-preview]');
  if (preview) {
    const tabs = [...preview.querySelectorAll('[data-xf-tab]')];
    const panels = tabs.map(tab => document.getElementById(tab.getAttribute('aria-controls')));
    let current = -1;
    const activate = (index, focus = false) => {
      if (index === current) {
        if (focus) tabs[index].focus();
        return;
      }
      current = index;
      tabs.forEach((tab, i) => {
        tab.setAttribute('aria-selected', String(i === index));
        tab.tabIndex = i === index ? 0 : -1;
        panels[i].hidden = i !== index;
      });
      if (focus) tabs[index].focus();
      animate(panels[index], [{ opacity: .3, transform: 'translateY(6px)' }, { opacity: 1, transform: 'translateY(0)' }], 320);
    };
    panels.forEach((panel, index) => {
      panel.setAttribute('role', 'tabpanel');
      panel.setAttribute('aria-labelledby', tabs[index].id);
      panel.tabIndex = 0;
    });
    tabs.forEach((tab, index) => {
      tab.addEventListener('click', () => activate(index));
      tab.addEventListener('keydown', event => {
        let next = index;
        if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
        else if (event.key === 'ArrowLeft') next = (index + tabs.length - 1) % tabs.length;
        else if (event.key === 'Home') next = 0;
        else if (event.key === 'End') next = tabs.length - 1;
        else return;
        event.preventDefault();
        activate(next, true);
      });
    });
    preview.querySelector('.xf-tabs').hidden = false;
    activate(0);
  }
  const visibleFlows = new Set();
  const flows = [...page.querySelectorAll('[data-xf-flow]')];
  const updateMotion = () => {
    const enabled = canAnimate();
    if (!enabled) {
      animations.forEach(animation => animation.cancel());
      animations.clear();
    }
    flows.forEach(flow => { flow.dataset.active = String(enabled && visibleFlows.has(flow)); });
  };
  if ('IntersectionObserver' in window) {
    const reveal = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        reveal.unobserve(entry.target);
        animate(entry.target, [{ opacity: 0, transform: 'translateY(22px)' }, { opacity: 1, transform: 'translateY(0)' }], 800);
      });
    }, { threshold: .08 });
    page.querySelectorAll('[data-xf-reveal]').forEach(element => reveal.observe(element));
    const bars = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        bars.unobserve(entry.target);
        animate(entry.target, [{ transform: 'scaleX(0)' }, { transform: `scaleX(${entry.target.dataset.score})` }], 1200);
      });
    }, { threshold: .2 });
    page.querySelectorAll('[data-xf-bar]').forEach(element => bars.observe(element));
    const flowObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) visibleFlows.add(entry.target);
        else visibleFlows.delete(entry.target);
      });
      updateMotion();
    }, { threshold: .15 });
    flows.forEach(flow => flowObserver.observe(flow));
  }
  page.addEventListener('focusin', event => {
    animations.forEach(animation => {
      const target = animation.effect?.target;
      if (target instanceof Element && target.contains(event.target)) animation.cancel();
    });
  });
  document.addEventListener('site-motion-change', updateMotion);
  document.addEventListener('visibilitychange', updateMotion);
  reducedMotion.addEventListener('change', updateMotion);
  updateMotion();
})();
