(() => {
  const page = document.querySelector('[data-motion-page]');
  if (!page || !('IntersectionObserver' in window)) return;
  const root = document.documentElement;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const wideStory = window.matchMedia('(min-width: 761px) and (min-height: 650px)');
  const ease = 'cubic-bezier(.22, 1, .36, 1)';
  const runningAnimations = new Set();
  let paused = false;
  let frame = 0;
  const progress = document.createElement('div');
  progress.className = 'site-scroll-progress';
  progress.setAttribute('aria-hidden', 'true');
  progress.innerHTML = '<span></span>';
  page.appendChild(progress);
  const control = document.createElement('button');
  control.type = 'button';
  control.className = 'site-motion-control';
  control.innerHTML = '<svg class="motion-pause-icon" viewBox="0 0 16 16" aria-hidden="true"><path d="M4 3h3v10H4zm5 0h3v10H9z"/></svg><svg class="motion-play-icon" viewBox="0 0 16 16" aria-hidden="true"><path d="m4 2 10 6-10 6z"/></svg><span>動きを停止</span>';
  control.setAttribute('aria-label', 'ページのアニメーションを停止');
  page.appendChild(control);
  const enabled = () => !paused && !reducedMotion.matches;
  const cancelAnimations = () => {
    runningAnimations.forEach((animation) => animation.cancel());
    runningAnimations.clear();
  };
  const animate = (element, frames, duration, delay = 0) => {
    if (!enabled() || element.contains(document.activeElement) ||
        typeof element.animate !== 'function') return;
    const animation = element.animate(frames, { duration, delay, easing: ease, fill: 'backwards' });
    runningAnimations.add(animation);
    animation.addEventListener('finish', () => runningAnimations.delete(animation), { once: true });
    animation.addEventListener('cancel', () => runningAnimations.delete(animation), { once: true });
  };
  const nav = page.querySelector('.project-subnav');
  const depthItems = [...page.querySelectorAll('.project-hero-media, .home-product-media, .project-directory-media')]
    .map((element) => { element.classList.add('motion-depth'); return element; });
  const stories = [...page.querySelectorAll('[data-motion-story]')].map((element) => ({
    element,
    track: element.querySelector('.motion-story-steps'),
    steps: [...element.querySelectorAll('[data-story-step]')],
    screens: [...element.querySelectorAll('[data-story-screen]')],
    links: [...page.querySelectorAll('[data-story-link]')],
    active: -1
  }));
  const setStoryStep = (story, index) => {
    if (story.active === index) return;
    story.active = index;
    story.element.dataset.activeStep = String(index + 1);
    story.steps.forEach((step, i) => step.classList.toggle('is-active', i === index));
    story.screens.forEach((screen, i) => screen.classList.toggle('is-active', i === index));
    story.links.forEach((link, i) => {
      if (i === index) link.setAttribute('aria-current', 'step');
      else link.removeAttribute('aria-current');
    });
    story.element.style.setProperty('--story-progress', String((index + 1) / story.steps.length));
  };
  const renderScroll = () => {
    frame = 0;
    if (document.hidden) return;
    // Read geometry first; write styles only after measurements are complete.
    const height = window.innerHeight;
    const distance = root.scrollHeight - height;
    const pageProgress = distance > 0 ? Math.min(1, Math.max(0, window.scrollY / distance)) : 0;
    const navRect = nav?.getBoundingClientRect();
    const depthUpdates = depthItems.map((element) => {
      const rect = element.getBoundingClientRect();
      const inView = rect.bottom > -80 && rect.top < height + 80;
      const amount = enabled() && inView
        ? Math.max(-20, Math.min(20, (height * .5 - (rect.top + rect.height * .5)) * .055))
        : 0;
      return { element, amount };
    });
    const storyUpdates = stories.map((story) => {
      const rects = story.steps.map((step) => step.getBoundingClientRect());
      let index = 0;
      if (wideStory.matches && !reducedMotion.matches) {
        rects.forEach((rect, i) => { if (rect.top <= height * .55) index = i; });
      } else if (!reducedMotion.matches) {
        const left = story.track.getBoundingClientRect().left;
        const distances = rects.map((rect) => Math.abs(rect.left - left));
        index = distances.indexOf(Math.min(...distances));
      }
      return { story, index };
    });
    progress.style.setProperty('--page-progress', String(pageProgress));
    if (navRect) {
      root.style.setProperty('--motion-nav-height', navRect.height + 'px');
      nav.classList.toggle('is-stuck', navRect.top <= 1);
    }
    depthUpdates.forEach(({ element, amount }) => {
      element.style.setProperty('--motion-depth-y', amount.toFixed(2) + 'px');
    });
    storyUpdates.forEach(({ story, index }) => setStoryStep(story, index));
  };
  const queueFrame = () => {
    if (!frame && !document.hidden) frame = window.requestAnimationFrame(renderScroll);
  };
  const updatePreference = () => {
    root.classList.toggle('motion-reduced', reducedMotion.matches);
    root.classList.toggle('motion-paused', paused);
    root.dataset.motionPaused = String(paused);
    control.querySelector('span').textContent = paused ? '動きを再開' : '動きを停止';
    control.setAttribute('aria-label', paused ? 'ページのアニメーションを再開' : 'ページのアニメーションを停止');
    if (!enabled()) cancelAnimations();
    document.dispatchEvent(new CustomEvent('site-motion-change', { detail: { enabled: enabled() } }));
    queueFrame();
  };
  control.addEventListener('click', () => { paused = !paused; updatePreference(); });
  reducedMotion.addEventListener('change', updatePreference);
  wideStory.addEventListener('change', queueFrame);
  root.classList.add('motion-ready');
  updatePreference();
  const seriesGallery = page.querySelector('.home-product-media-gallery--omoi-for');
  seriesGallery?.addEventListener('focusin', event => {
    const link = event.target.closest('a');
    if (!link || !seriesGallery.contains(link) || seriesGallery.scrollWidth <= seriesGallery.clientWidth) return;
    const track = seriesGallery.getBoundingClientRect();
    const target = link.getBoundingClientRect();
    if (target.left < track.left + 8) seriesGallery.scrollLeft -= track.left + 8 - target.left;
    else if (target.right > track.right - 8) seriesGallery.scrollLeft += target.right - track.right + 8;
  });
  const hero = page.querySelector('.project-hero, .home-intro, .projects-intro');
  if (hero) {
    const introItems = [...hero.querySelectorAll('h1, .project-catch, .project-intro, .action-row, .home-intro-tagline, .hero-lead')];
    introItems.forEach((element, i) => animate(element, [
      { opacity: 0, transform: 'translateY(28px)', filter: 'blur(5px)' },
      { opacity: 1, transform: 'translateY(0)', filter: 'blur(0)' }
    ], 1000, 70 + i * 100));
    const image = hero.querySelector('.project-hero-media > img, .product-screen-group');
    if (image) animate(image, [
      { opacity: 0, transform: 'translateY(38px) rotateX(7deg) scale(.94)' },
      { opacity: 1, transform: 'translateY(0) rotateX(0) scale(1)' }
    ], 1400, 160);
  }
  const revealItems = [...page.querySelectorAll(
    '.project-overview-heading, .project-overview-copy, .project-journey-heading, ' +
    '.product-resources > *, .for-series-section > .section-header, .for-series-card, ' +
    '.for-flow-list > li, .project-directory-copy, .project-directory-media > *, ' +
    '.home-showcase-heading, .home-product-copy, .home-product-media > *, .home-news'
  )];
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const element = entry.target;
      element.dataset.motionRevealed = 'true';
      observer.unobserve(element);
      const stagger = Number(element.dataset.motionOrder || 0) % 3;
      animate(element, [
        { opacity: 0, transform: 'translateY(32px) scale(.985)' },
        { opacity: 1, transform: 'translateY(0) scale(1)' }
      ], 950, stagger * 85);
    });
  }, { threshold: .08, rootMargin: '0px 0px -5% 0px' });
  revealItems.forEach((element, i) => {
    element.dataset.motionOrder = String(i);
    observer.observe(element);
  });
  page.addEventListener('focusin', (event) => {
    runningAnimations.forEach((animation) => {
      const element = animation.effect?.target;
      if (element instanceof Element && element.contains(event.target)) animation.cancel();
    });
  });
  stories.forEach((story) => story.track.addEventListener('scroll', queueFrame, { passive: true }));
  window.addEventListener('scroll', queueFrame, { passive: true });
  window.addEventListener('resize', queueFrame, { passive: true });
  document.fonts?.addEventListener('loadingdone', queueFrame);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      if (frame) window.cancelAnimationFrame(frame);
      frame = 0;
      cancelAnimations();
    } else queueFrame();
  });
  queueFrame();
})();
