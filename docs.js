(() => {
  // Product labels and links are authored in HTML, so each documentation set
  // stays correct before JavaScript runs and when scripting is unavailable.
  const compact = window.matchMedia('(max-width: 900px)');
  document.querySelectorAll('[data-doc-mobile-nav]').forEach((menu) => {
    const sync = () => { menu.open = !compact.matches; };
    sync();
    compact.addEventListener('change', sync);
  });

  const narrowToc = window.matchMedia('(max-width: 1199px)');
  document.querySelectorAll('.page-toc details').forEach((menu) => {
    const sync = () => { menu.open = !narrowToc.matches; };
    sync();
    narrowToc.addEventListener('change', sync);
  });

  document.querySelectorAll('[data-doc-filter]').forEach((input) => {
    const sidebar = input.closest('.docs-sidebar');
    const links = Array.from(sidebar.querySelectorAll('[data-doc-link]'));
    const groups = Array.from(sidebar.querySelectorAll('[data-doc-group]'));
    const status = sidebar.querySelector('[data-doc-search-status]');
    input.addEventListener('input', () => {
      const query = input.value.trim().toLocaleLowerCase('ja-JP');
      let count = 0;
      links.forEach((link) => {
        const matches = !query || link.textContent.toLocaleLowerCase('ja-JP').includes(query);
        link.hidden = !matches;
        if (matches) count += 1;
      });
      groups.forEach((group) => {
        group.hidden = !group.querySelector('[data-doc-link]:not([hidden])');
      });
      if (status) status.textContent = query ? (count ? `${count}件の資料が見つかりました。` : '一致する資料はありません。別の言葉で検索してください。') : '';
    });
    document.addEventListener('keydown', (event) => {
      const active = document.activeElement;
      const editing = active instanceof HTMLElement && (active.matches('input, textarea, select') || active.isContentEditable);
      if (event.key === '/' && !event.metaKey && !event.ctrlKey && !event.altKey && !editing) {
        event.preventDefault();
        const menu = input.closest('details');
        if (menu) menu.open = true;
        input.focus();
      }
    });
  });

  // Progressive enhancement only: anchor navigation also works without this.
  const tocLinks = Array.from(document.querySelectorAll('.page-toc a[href^="#"]'));
  const sections = tocLinks.map((link) => document.getElementById(decodeURIComponent(link.hash.slice(1)))).filter(Boolean);
  if (sections.length && 'IntersectionObserver' in window) {
    const visible = new Set();
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => entry.isIntersecting ? visible.add(entry.target.id) : visible.delete(entry.target.id));
      const first = sections.find((section) => visible.has(section.id));
      if (!first) return;
      tocLinks.forEach((link) => {
        if (decodeURIComponent(link.hash.slice(1)) === first.id) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
    }, { rootMargin: '-8% 0px -45% 0px' });
    sections.forEach((section) => observer.observe(section));
  }
})();
