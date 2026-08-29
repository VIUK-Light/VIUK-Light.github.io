(() => {
  const referenceGroup = Array.from(document.querySelectorAll('[data-doc-group]')).find((group) => group.querySelector('a[href="omoi-technical.html"]'));
  if (referenceGroup) {
    const referenceDocs = [
      ['omoi-question-catalog.html', '質問カタログ'],
      ['omoi-safety.html', '安全設計']
    ];
    referenceDocs.forEach(([href, label]) => {
      if (referenceGroup.querySelector(`a[href="${href}"]`)) return;
      const link = document.createElement('a');
      link.href = href;
      link.dataset.docLink = '';
      link.textContent = label;
      if (window.location.pathname.endsWith(`/${href}`)) link.setAttribute('aria-current', 'page');
      referenceGroup.appendChild(link);
    });
  }

  document.querySelectorAll('[data-doc-mobile-nav]').forEach((menu) => {
    const media = window.matchMedia('(max-width: 860px)');
    const sync = () => { menu.open = !media.matches; };
    sync();
    media.addEventListener('change', sync);
  });

  document.querySelectorAll('.docs-footer').forEach((footer) => {
    if (footer.querySelector('a[href="privacy.html"]')) return;
    const item = document.createElement('span');
    const link = document.createElement('a');
    link.href = 'privacy.html';
    link.textContent = 'Privacy';
    item.append(link);
    footer.append(item);
  });

  const filters = document.querySelectorAll('[data-doc-filter]');

  filters.forEach((input) => {
    const links = Array.from(document.querySelectorAll('[data-doc-link]'));
    const groups = Array.from(document.querySelectorAll('[data-doc-group]'));

    input.addEventListener('input', () => {
      const query = input.value.trim().toLocaleLowerCase('ja-JP');
      links.forEach((link) => {
        const visible = !query || link.textContent.toLocaleLowerCase('ja-JP').includes(query);
        link.hidden = !visible;
      });
      groups.forEach((group) => {
        group.hidden = !group.querySelector('[data-doc-link]:not([hidden])');
      });
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === '/' && document.activeElement !== input) {
        event.preventDefault();
        input.focus();
      }
    });
  });
})();
