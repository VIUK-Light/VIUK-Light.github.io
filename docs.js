(() => {
  const isOmoiDocumentation = window.location.pathname.split('/').pop()?.startsWith('omoi-');
  const topbar = document.querySelector('.docs-topbar');

  if (isOmoiDocumentation && topbar) {
    const brand = topbar.querySelector('.docs-brand');
    const actions = topbar.querySelector('.docs-top-actions');
    if (brand && !topbar.querySelector('.docs-title-link')) {
      const titleLink = document.createElement('a');
      titleLink.className = 'docs-title-link';
      titleLink.href = 'omoi-docs.html';
      titleLink.textContent = 'Omoi Documentation';
      brand.after(titleLink);
    }
    const omoiLink = actions?.querySelector('a[href="omoi.html"]');
    if (omoiLink) {
      omoiLink.href = 'https://omoi.viuk-light.org/';
      omoiLink.classList.add('external');
      omoiLink.textContent = 'Omoiを開く';
    }
  }

  const essentialsGroup = Array.from(document.querySelectorAll('[data-doc-group]')).find((group) => group.querySelector('a[href="omoi-details.html"]'));
  if (essentialsGroup) {
    const label = essentialsGroup.querySelector('.docs-group-label');
    if (label) label.textContent = 'はじめに';
    const essentialsDocs = [
      ['omoi-docs.html', 'Overview'],
      ['omoi-concept.html', 'Omoi（重い・想い・思い）'],
      ['omoi-details.html', 'Omoiについて'],
      ['omoi-getting-started.html', 'はじめる']
    ];
    essentialsGroup.querySelectorAll('[data-doc-link]').forEach((link) => link.removeAttribute('aria-current'));
    essentialsDocs.forEach(([href, label]) => {
      let link = essentialsGroup.querySelector(`a[href="${href}"]`);
      if (!link) {
        link = document.createElement('a');
        link.href = href;
        link.dataset.docLink = '';
      }
      link.textContent = label;
      if (window.location.pathname.endsWith(`/${href}`)) link.setAttribute('aria-current', 'page');
      essentialsGroup.appendChild(link);
    });
  }

  const usingGroup = Array.from(document.querySelectorAll('[data-doc-group]')).find((group) => group.querySelector('a[href="omoi-levels.html"]'));
  if (usingGroup) {
    const label = usingGroup.querySelector('.docs-group-label');
    if (label) label.textContent = '使い方';
  }

  const referenceGroup = Array.from(document.querySelectorAll('[data-doc-group]')).find((group) => group.querySelector('a[href="omoi-technical.html"]'));
  if (referenceGroup) {
    const label = referenceGroup.querySelector('.docs-group-label');
    if (label) label.textContent = 'データと品質';

    const referenceDocs = [
      ['omoi-question-catalog.html', '質問カタログ'],
      ['omoi-data.html', 'データ構造'],
      ['omoi-editorial.html', '編集方針'],
      ['omoi-accessibility.html', 'アクセシビリティ'],
      ['omoi-validation.html', '検証と公開'],
      ['omoi-technical.html', '技術仕様'],
      ['omoi-safety.html', '安全設計']
    ];

    referenceGroup.querySelectorAll('[data-doc-link]').forEach((link) => link.removeAttribute('aria-current'));
    referenceDocs.forEach(([href, linkLabel]) => {
      let link = referenceGroup.querySelector(`a[href="${href}"]`);
      if (!link) {
        link = document.createElement('a');
        link.href = href;
        link.dataset.docLink = '';
      }
      link.textContent = linkLabel;
      if (window.location.pathname.endsWith(`/${href}`)) link.setAttribute('aria-current', 'page');
      referenceGroup.appendChild(link);
    });

    let participationGroup = Array.from(document.querySelectorAll('[data-doc-group]')).find((group) => group.querySelector('a[href="omoi-contributing.html"]'));
    if (!participationGroup) {
      participationGroup = document.createElement('div');
      participationGroup.className = 'docs-group';
      participationGroup.dataset.docGroup = '';
      const groupLabel = document.createElement('p');
      groupLabel.className = 'docs-group-label';
      groupLabel.textContent = '参加する';
      const link = document.createElement('a');
      link.href = 'omoi-contributing.html';
      link.dataset.docLink = '';
      link.textContent = '質問データに参加する';
      participationGroup.append(groupLabel, link);
      referenceGroup.after(participationGroup);
    }
    const participationLink = participationGroup.querySelector('a[href="omoi-contributing.html"]');
    if (participationLink && window.location.pathname.endsWith('/omoi-contributing.html')) {
      participationLink.setAttribute('aria-current', 'page');
    }
  }

  const helpGroup = Array.from(document.querySelectorAll('[data-doc-group]')).find((group) => group.querySelector('a[href="omoi-help.html"]'));
  if (helpGroup) {
    const label = helpGroup.querySelector('.docs-group-label');
    if (label) label.textContent = 'ヘルプ';
  }

  if (window.location.pathname.endsWith('/omoi-docs.html')) {
    const overviewIndex = document.querySelector('[data-doc-overview-index]');
    if (overviewIndex) {
      const overviewDocs = [
        ['omoi-concept.html', 'Omoi（重い・想い・思い）', '名前に重なる3つの意味と、作った理由'],
        ['omoi-details.html', 'Omoiについて', '背景と使い方'],
        ['omoi-getting-started.html', 'はじめる', '開始から最初の質問まで'],
        ['omoi-levels.html', '話の深さと問題数', 'Level 1〜4と3〜15問'],
        ['omoi-question.html', '質問画面', '次へ・スキップ・解説'],
        ['omoi-question-catalog.html', '質問カタログ', '643問の質問・Level・詳細文'],
        ['omoi-data.html', 'データ構造', 'JSON・カテゴリ・視点・警告metadata'],
        ['omoi-editorial.html', '編集方針', '問題文・detail・Level・重複'],
        ['omoi-accessibility.html', 'アクセシビリティ', '長文・キーボード・既知の制約'],
        ['omoi-validation.html', '検証と公開', '自動検査・ブラウザ・同期・公開'],
        ['omoi-technical.html', '技術仕様', 'コードと表示ロジック'],
        ['omoi-safety.html', '安全設計', '止める・離れる・知る'],
        ['omoi-contributing.html', '質問データに参加する', '提案・編集・検証・レビュー'],
        ['omoi-help.html', 'ヘルプ', 'FAQと問題報告']
      ];

      overviewDocs.forEach(([href, title, description]) => {
        let link = overviewIndex.querySelector(`a[href="${href}"]`);
        if (!link) {
          link = document.createElement('a');
          link.href = href;
        }
        link.replaceChildren();
        const strong = document.createElement('strong');
        strong.textContent = title;
        const span = document.createElement('span');
        span.textContent = description;
        link.append(strong, span);
        overviewIndex.appendChild(link);
      });
    }
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
      const activeElement = document.activeElement;
      const isEditing = activeElement instanceof HTMLElement &&
        (activeElement.matches('input, textarea, select') || activeElement.isContentEditable);
      if (event.key === '/' && !event.metaKey && !event.ctrlKey && !event.altKey && !isEditing) {
        event.preventDefault();
        input.focus();
      }
    });
  });

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (!reducedMotion.matches && 'IntersectionObserver' in window) {
    const revealTargets = document.querySelectorAll('.docs-hero, .docs-page-content > h2, .docs-page-content > p, .docs-scope-list, .docs-index, .docs-page-content > .spec-table, .docs-page-content > .rule-list, .docs-page-content > .link-list, .docs-page-content > .notice');
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
})();
