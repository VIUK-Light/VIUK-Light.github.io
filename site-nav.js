(() => {
  const nav = document.querySelector('.site-nav');
  if (!nav || nav.dataset.enhanced === 'true') return;

  const menus = {
    About: {
      href: 'about.html',
      items: [
        ['About', 'about.html', 'VIUK-Lightについて'],
        ['Projects', 'projects.html', 'OmoiとKizunaの一覧'],
        ['Principles', 'principles.html', '開発時の判断基準']
      ]
    },
    Projects: {
      href: 'projects.html',
      items: [
        ['Projects一覧', 'projects.html', '公開・開発中のプロジェクト'],
        ['Omoi', 'omoi.html', '質問カード / Web'],
        ['Omoi Documentation', 'omoi-docs.html', '使い方・技術仕様・ヘルプ'],
        ['Kizuna', 'kizuna.html', 'AIキャラクター / iOS・macOS']
      ]
    },
    Principles: {
      href: 'principles.html',
      items: [
        ['Principles', 'principles.html', '4つの判断基準'],
        ['安全性', 'principles.html#safety', '困ったときに止められるか'],
        ['透明性', 'principles.html#transparency', '仕組みと限界を説明できるか'],
        ['プライバシー', 'principles.html#privacy', '集めない・保存しない設計'],
        ['選択', 'principles.html#choice', '同意・拒否・離脱を選べるか']
      ]
    },
    Contribute: {
      href: 'contribute.html',
      items: [
        ['参加方法', 'contribute.html', 'コード以外の参加方法'],
        ['VIUK-Light GitHub', 'https://github.com/VIUK-Light', 'リポジトリとIssue一覧'],
        ['OmoiのIssue', 'https://github.com/VIUK-Light/Omoi/issues', '質問・バグ・改善提案'],
        ['KizunaのIssue', 'https://github.com/VIUK-Light/Kizuna/issues', '開発中の問題と提案']
      ]
    }
  };

  const closeMenus = (except) => {
    nav.querySelectorAll('.site-nav-menu.is-open').forEach((menu) => {
      if (menu !== except) {
        menu.classList.remove('is-open');
        menu.querySelector('.site-nav-trigger')?.setAttribute('aria-expanded', 'false');
        const panel = menu.querySelector('.site-nav-panel');
        if (panel) panel.hidden = true;
      }
    });
  };

  const supportsHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  [...nav.querySelectorAll(':scope > a')].forEach((link, index) => {
    const label = link.textContent.trim();
    const menu = menus[label];
    if (!menu) return;

    const wrapper = document.createElement('div');
    wrapper.className = 'site-nav-menu';
    if (link.getAttribute('aria-current') === 'page') wrapper.classList.add('is-current');

    const menuId = `site-nav-panel-${index}`;
    const trigger = document.createElement('button');
    trigger.type = 'button';
    trigger.className = 'site-nav-trigger';
    trigger.setAttribute('aria-expanded', 'false');
    trigger.setAttribute('aria-controls', menuId);
    if (link.getAttribute('aria-current') === 'page') trigger.setAttribute('aria-current', 'page');
    trigger.innerHTML = `<span>${label}</span><span class="site-nav-chevron" aria-hidden="true">⌄</span>`;

    const panel = document.createElement('div');
    panel.id = menuId;
    panel.className = 'site-nav-panel';
    panel.setAttribute('role', 'menu');
    panel.hidden = true;
    menu.items.forEach(([itemLabel, href, description]) => {
      const item = document.createElement('a');
      item.href = href;
      item.setAttribute('role', 'menuitem');
      if (href.startsWith('http')) {
        item.target = '_blank';
        item.rel = 'noreferrer';
      }
      item.innerHTML = `<strong>${itemLabel}</strong><small>${description}</small>`;
      item.addEventListener('click', () => closeMenus());
      panel.append(item);
    });

    const showMenu = () => {
      closeMenus(wrapper);
      wrapper.classList.add('is-open');
      trigger.setAttribute('aria-expanded', 'true');
      panel.hidden = false;
    };

    if (supportsHover) {
      wrapper.addEventListener('pointerenter', showMenu);
      wrapper.addEventListener('pointerleave', () => {
        window.setTimeout(() => {
          if (!wrapper.matches(':hover') && !wrapper.matches(':focus-within')) closeMenus();
        }, 120);
      });
    }

    trigger.addEventListener('click', (event) => {
      event.stopPropagation();
      const willOpen = !wrapper.classList.contains('is-open');
      if (willOpen) showMenu();
      else closeMenus();
      if (willOpen) panel.querySelector('a')?.focus({ preventScroll: true });
    });

    wrapper.append(trigger, panel);
    link.replaceWith(wrapper);
  });

  document.addEventListener('click', (event) => {
    if (!nav.contains(event.target)) closeMenus();
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      const openMenu = nav.querySelector('.site-nav-menu.is-open');
      const trigger = openMenu?.querySelector('.site-nav-trigger');
      closeMenus();
      trigger?.focus();
    }
  });

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
    const toggleMobileNav = () => {
      const willOpen = !nav.classList.contains('is-mobile-open');
      closeMenus();
      nav.classList.toggle('is-mobile-open', willOpen);
      mobileToggle.setAttribute('aria-expanded', String(willOpen));
      mobileToggle.querySelector('.site-nav-mobile-icon').textContent = willOpen ? '−' : '＋';
    };

    mobileToggle.addEventListener('click', (event) => {
      event.stopPropagation();
      toggleMobileNav();
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
  nav.dataset.enhanced = 'true';
})();
