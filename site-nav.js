(() => {
  const nav = document.querySelector('.site-nav');
  if (!nav || nav.dataset.enhanced === 'true') return;

  const header = nav.closest('.site-header');
  if (header) {
    if (!nav.id) nav.id = 'site-nav';
    const compact = window.matchMedia('(max-width: 1000px)');

    const mobileToggle = document.createElement('button');
    mobileToggle.type = 'button';
    mobileToggle.className = 'site-nav-mobile-toggle';
    mobileToggle.setAttribute('aria-expanded', 'false');
    mobileToggle.setAttribute('aria-controls', nav.id);
    mobileToggle.innerHTML = '<span class="site-nav-mobile-label">メニュー</span><svg class="site-nav-menu-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 8h16M4 16h16"/></svg><svg class="site-nav-close-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18"/></svg>';

    const closeMobileNav = (restoreFocus = false) => {
      nav.classList.remove('is-mobile-open');
      mobileToggle.setAttribute('aria-expanded', 'false');
      mobileToggle.querySelector('.site-nav-mobile-label').textContent = 'メニュー';
      if (restoreFocus) mobileToggle.focus();
    };

    mobileToggle.addEventListener('click', (event) => {
      event.stopPropagation();
      const willOpen = !nav.classList.contains('is-mobile-open');
      nav.classList.toggle('is-mobile-open', willOpen);
      mobileToggle.setAttribute('aria-expanded', String(willOpen));
      mobileToggle.querySelector('.site-nav-mobile-label').textContent = willOpen ? '閉じる' : 'メニュー';
    });

    nav.addEventListener('click', (event) => {
      if (event.target.closest('a')) closeMobileNav();
    });

    document.addEventListener('click', (event) => {
      if (!header.contains(event.target)) closeMobileNav();
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && nav.classList.contains('is-mobile-open')) {
        closeMobileNav(true);
      }
    });

    header.addEventListener('focusout', (event) => {
      if (event.relatedTarget && !header.contains(event.relatedTarget)) closeMobileNav();
    });

    compact.addEventListener('change', () => {
      const focusIsInNav = nav.contains(document.activeElement);
      const focusIsToggle = document.activeElement === mobileToggle;
      closeMobileNav(compact.matches && focusIsInNav);
      if (!compact.matches && focusIsToggle) header.querySelector('.brand')?.focus();
    });

    header.insertBefore(mobileToggle, nav);
  }

  document.querySelectorAll('.footer-nav').forEach((footerNav) => {
    if (footerNav.querySelector('a[href="privacy.html"]')) return;
    const link = document.createElement('a');
    link.href = 'privacy.html';
    link.textContent = 'プライバシー';
    footerNav.append(link);
  });

  nav.dataset.enhanced = 'true';
})();
