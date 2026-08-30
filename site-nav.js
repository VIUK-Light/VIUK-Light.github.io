(() => {
  const nav = document.querySelector('.site-nav');
  if (!nav || nav.dataset.enhanced === 'true') return;

  const header = nav.closest('.site-header');
  if (header) {
    if (!nav.id) nav.id = 'site-nav';

    const mobileToggle = document.createElement('button');
    mobileToggle.type = 'button';
    mobileToggle.className = 'site-nav-mobile-toggle';
    mobileToggle.setAttribute('aria-expanded', 'false');
    mobileToggle.setAttribute('aria-controls', nav.id);
    mobileToggle.innerHTML = '<span>メニュー</span><span class="site-nav-mobile-icon" aria-hidden="true">＋</span>';

    const closeMobileNav = () => {
      nav.classList.remove('is-mobile-open');
      mobileToggle.setAttribute('aria-expanded', 'false');
      mobileToggle.querySelector('.site-nav-mobile-icon').textContent = '＋';
    };

    mobileToggle.addEventListener('click', (event) => {
      event.stopPropagation();
      const willOpen = !nav.classList.contains('is-mobile-open');
      nav.classList.toggle('is-mobile-open', willOpen);
      mobileToggle.setAttribute('aria-expanded', String(willOpen));
      mobileToggle.querySelector('.site-nav-mobile-icon').textContent = willOpen ? '−' : '＋';
    });

    nav.addEventListener('click', (event) => {
      if (event.target.closest('a')) closeMobileNav();
    });

    document.addEventListener('click', (event) => {
      if (!header.contains(event.target)) closeMobileNav();
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') closeMobileNav();
    });

    window.addEventListener('resize', () => {
      if (window.innerWidth > 600) closeMobileNav();
    });

    header.insertBefore(mobileToggle, nav);
  }

  document.querySelectorAll('.footer-nav').forEach((footerNav) => {
    if (footerNav.querySelector('a[href="privacy.html"]')) return;
    const link = document.createElement('a');
    link.href = 'privacy.html';
    link.textContent = 'Privacy';
    footerNav.append(link);
  });

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (!reducedMotion.matches && 'IntersectionObserver' in window) {
    const revealTargets = document.querySelectorAll('.home-intro, .home-product-row, .page-intro, .inner-hero, .project-directory-row, .content-layout, .project-content, .legal-page');
    if (revealTargets.length > 0) {
      document.documentElement.classList.add('motion-ready');
      revealTargets.forEach((target, index) => {
        target.dataset.reveal = '';
        if (index > 0 && index < 3) target.dataset.revealDelay = String(index);
      });

      const observer = new IntersectionObserver((entries, currentObserver) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-visible');
          currentObserver.unobserve(entry.target);
        });
      }, { threshold: 0.08 });

      revealTargets.forEach((target) => observer.observe(target));
    }
  }

  nav.dataset.enhanced = 'true';
})();
