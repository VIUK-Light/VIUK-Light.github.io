#!/usr/bin/env python3
"""Dependency-free checks for local links, document structure and product navigation."""
from collections import Counter
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit

ROOT = Path(__file__).resolve().parent.parent

class Page(HTMLParser):
    def __init__(self, path):
        super().__init__(convert_charrefs=True)
        self.path = path
        self.ids = []
        self.links = []
        self.headings = []
        self.doc_links = []
        self.title_links = []
        self.in_main = False
        self.product = None
        self.feed(path.read_text())

    def handle_starttag(self, tag, values):
        attrs = dict(values)
        if tag == 'main':
            self.in_main = True
        if tag == 'body':
            self.product = attrs.get('data-product')
        if 'id' in attrs:
            self.ids.append(attrs['id'])
        for key in ('href', 'src'):
            if attrs.get(key):
                self.links.append(attrs[key])
        if tag in ('h1', 'h2', 'h3', 'h4', 'h5', 'h6') and self.in_main:
            self.headings.append(int(tag[1]))
        if tag == 'a' and 'data-doc-link' in attrs:
            self.doc_links.append(attrs)
        if 'docs-title-link' in attrs.get('class', '').split():
            self.title_links.append(attrs.get('href'))

    def handle_endtag(self, tag):
        if tag == 'main':
            self.in_main = False

pages = {p.name: Page(p) for p in ROOT.glob('*.html')}
errors = []
for name, page in pages.items():
    for ident, count in Counter(page.ids).items():
        if count > 1:
            errors.append(f'{name}: duplicate id {ident}')
    if page.headings.count(1) != 1:
        errors.append(f'{name}: expected one main h1')
    previous = 0
    for level in page.headings:
        if level > previous + 1:
            errors.append(f'{name}: heading jump h{previous} -> h{level}')
        previous = level
    for link in page.links:
        parsed = urlsplit(link)
        if parsed.scheme or parsed.netloc:
            continue
        target = unquote(parsed.path) or name
        if not (ROOT / target).exists():
            errors.append(f'{name}: missing local target {link}')
        if parsed.fragment and target in pages and unquote(parsed.fragment) not in pages[target].ids:
            errors.append(f'{name}: missing anchor {link}')
    if page.product:
        expected = f'{page.product}-docs.html'
        if page.title_links != [expected]:
            errors.append(f'{name}: incorrect documentation title link')
        current = [a.get('href') for a in page.doc_links if a.get('aria-current') == 'page']
        if current != [name]:
            errors.append(f'{name}: incorrect current documentation link')
        for link in page.doc_links:
            target = pages.get(link.get('href'))
            if target is None or target.product != page.product:
                errors.append(f'{name}: cross-product documentation link {link.get("href")}')

if errors:
    print('\n'.join(errors))
    raise SystemExit(1)
print(f'PASS: {len(pages)} pages; {sum(bool(p.product) for p in pages.values())} documentation pages; links, anchors, IDs, headings and product navigation.')
