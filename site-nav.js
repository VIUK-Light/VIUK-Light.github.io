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

  nav.dataset.enhanced = 'true';
})();
