#!/usr/bin/env python3
"""Sync Omoi main and public tags, or verify all bundled versions offline."""
import argparse
from datetime import datetime
from hashlib import sha256
from html import escape
import json
from pathlib import Path
import re
from urllib.parse import quote
from urllib.request import Request, urlopen
from zoneinfo import ZoneInfo

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / 'assets/omoi/data'
ARCHIVE = DATA / 'versions'
REPOSITORY = 'VIUK-Light/Omoi'
CATALOG = ROOT / 'omoi-question-catalog.html'
SCRIPT = ROOT / 'omoi-question-catalog.js'
NAMES = [f'level{level}.json' for level in range(1, 5)]


def fetch(url):
    request = Request(url, headers={'User-Agent': 'VIUK-Light-question-catalog'})
    with urlopen(request, timeout=30) as response:
        return response.read()


def collection(resource):
    items = []
    page = 1
    while True:
        batch = json.loads(fetch(f'https://api.github.com/repos/{REPOSITORY}/{resource}?per_page=100&page={page}'))
        if not isinstance(batch, list):
            raise ValueError(f'Invalid GitHub {resource} response')
        items.extend(batch)
        if len(batch) < 100:
            return items
        page += 1


def describe(files, strict=True):
    seen = set()
    result = []
    for level, (name, content) in enumerate(files.items(), 1):
        questions = json.loads(content)
        if not isinstance(questions, list) or not questions:
            raise ValueError(f'{name}: expected a nonempty question array')
        for question in questions:
            if not isinstance(question, dict):
                raise ValueError(f'{name}: expected a question object')
            ident = question.get('id')
            if not isinstance(ident, str) or not ident.strip():
                raise ValueError(f'{name}: missing question ID')
            if strict and (ident in seen or question.get('level') != level):
                raise ValueError(f'{name}: duplicate ID or mismatched level: {ident}')
            if question.get('level') not in (1, 2, 3, 4) or not isinstance(question.get('question'), str) or not question['question'].strip():
                raise ValueError(f'{name}: invalid level or question: {ident}')
            seen.add(ident)
        result.append({'file': name, 'count': len(questions), 'sha256': sha256(content).hexdigest()})
    return result


def legacy_warnings(files):
    ids = []
    mismatches = 0
    for level, content in enumerate(files.values(), 1):
        for question in json.loads(content):
            ids.append(question['id'])
            mismatches += question['level'] != level
    warnings = {'duplicate_ids': len(ids) - len(set(ids)), 'file_level_mismatches': mismatches}
    return {key: count for key, count in warnings.items() if count}


def validate_snapshot(metadata, files, strict=False):
    assert metadata['repository'] == REPOSITORY
    assert re.fullmatch(r'[0-9a-f]{40}', metadata['commit'])
    assert metadata['license'] == 'CC BY-SA 4.0'
    assert describe(files, strict) == metadata['files'], 'Data differs from source.json'
    assert sum(file['count'] for file in metadata['files']) == metadata['total']
    assert metadata.get('legacy_warnings', {}) == legacy_warnings(files)
    datetime.fromisoformat(metadata['synced_at'])


def read_snapshot(directory, strict=False):
    metadata = json.loads((directory / 'source.json').read_text())
    files = {name: (directory / name).read_bytes() for name in NAMES}
    validate_snapshot(metadata, files, strict)
    return metadata, files


def version(metadata):
    return f"{metadata['synced_at'].replace('-', '')}-main-{metadata['commit'][:7]}-catalog-v2"


def replace_once(pattern, replacement, text):
    updated, count = re.subn(pattern, lambda match: replacement, text)
    if count != 1:
        raise ValueError(f'Expected one catalog marker: {pattern}')
    return updated


def check():
    metadata, files = read_snapshot(DATA, strict=True)
    assert metadata['branch'] == 'main'
    index = json.loads((DATA / 'versions.json').read_text())
    assert index['schema_version'] == 1 and index['versions']
    entries = {entry['id']: entry for entry in index['versions']}
    assert len(entries) == len(index['versions']), 'Duplicate version IDs'
    assert index['default'] in entries
    current = entries[index['default']]
    assert current['commit'] == metadata['commit']
    for entry in entries.values():
        assert re.fullmatch(r'[0-9a-f]{40}', entry['commit'])
        archived, archived_files = read_snapshot(ARCHIVE / entry['commit'])
        assert archived['commit'] == entry['commit'] and archived['total'] == entry['total']
        if entry['commit'] == metadata['commit']:
            assert archived_files == files, 'Latest data differs from its archive'
        if entry.get('same_as'):
            assert entries[entry['same_as']]['commit'] == entry['commit']
    assert f"const DATA_VERSION = '{version(metadata)}';" in SCRIPT.read_text()
    html = CATALOG.read_text()
    assert f'omoi-question-catalog.js?v={version(metadata)}' in html
    assert f"https://github.com/{REPOSITORY}/tree/{metadata['commit']}" in html
    assert f"反映日：{metadata['synced_at']}" in html
    assert f"質問件数: {metadata['total']}件" in html
    assert f'<option value="{escape(current["id"], quote=True)}">' in html
    print(f"PASS: {len(entries)} catalog versions; {metadata['total']} latest questions; hashes, counts, provenance and cache version.")


def sync():
    today = datetime.now(ZoneInfo('Asia/Tokyo')).date().isoformat()
    head = json.loads(fetch(f'https://api.github.com/repos/{REPOSITORY}/commits/main'))['sha']
    tags = collection('tags')
    releases = {item['tag_name']: item for item in collection('releases') if not item.get('draft')}
    index_path = DATA / 'versions.json'
    previous = json.loads(index_path.read_text())['versions'] if index_path.exists() else []
    previous_by_id = {entry['id']: entry for entry in previous}
    snapshots = {}

    def snapshot(commit):
        if not re.fullmatch(r'[0-9a-f]{40}', commit):
            raise ValueError('Invalid commit SHA')
        if commit in snapshots:
            return snapshots[commit]
        directory = ARCHIVE / commit
        if (directory / 'source.json').exists():
            metadata, files = read_snapshot(directory)
            assert metadata['commit'] == commit
        else:
            root_source = DATA / 'source.json'
            root_metadata = json.loads(root_source.read_text()) if root_source.exists() else {}
            if root_metadata.get('commit') == commit:
                metadata, files = read_snapshot(DATA, strict=True)
            else:
                files = {name: fetch(f'https://raw.githubusercontent.com/{REPOSITORY}/{commit}/{name}') for name in NAMES}
                metadata = {'repository': REPOSITORY, 'commit': commit, 'synced_at': today,
                            'license': 'CC BY-SA 4.0', 'files': describe(files, strict=False)}
                metadata['total'] = sum(file['count'] for file in metadata['files'])
                warnings = legacy_warnings(files)
                if warnings:
                    metadata['legacy_warnings'] = warnings
        validate_snapshot(metadata, files)
        snapshots[commit] = metadata, files
        return metadata, files

    root_metadata, root_files = snapshot(head)
    root_metadata = {**root_metadata, 'branch': 'main', 'synced_at': today}
    validate_snapshot(root_metadata, root_files, strict=True)
    entries = []
    ids = set()
    for tag in tags:
        name, commit = tag['name'], tag['commit']['sha']
        label = name.removeprefix('Omoi-')
        if label[:1].isdigit():
            label = 'v' + label
        if label in ids:
            raise ValueError(f'Ambiguous normalized version: {label}')
        if label in previous_by_id and previous_by_id[label]['commit'] != commit:
            raise ValueError(f'Tag {name} moved; refusing to replace an archived version')
        ids.add(label)
        release = releases.get(name)
        release_date = (datetime.fromisoformat(release['published_at'].replace('Z', '+00:00'))
                        .astimezone(ZoneInfo('Asia/Tokyo')).date().isoformat()) if release else None
        metadata, _ = snapshot(commit)
        entries.append({'id': label, 'label': label, 'tag': name, 'commit': commit,
                        'release_date': release_date,
                        'release_url': f'https://github.com/{REPOSITORY}/releases/tag/{quote(name, safe="")}' if release else None,
                        'total': metadata['total']})
    matching = [entry for entry in entries if entry['commit'] == head]
    if matching:
        current = max(matching, key=lambda entry: releases.get(entry['tag'], {}).get('published_at') or '')
    else:
        current = {'id': f'main-{head[:12]}', 'label': f'公開元main（{today}確認）', 'tag': None,
                   'commit': head, 'release_date': None, 'release_url': None, 'total': root_metadata['total']}
        entries.append(current)
        ids.add(current['id'])
    # Previously indexed versions and their share links remain available.
    for entry in previous:
        if entry['id'] not in ids:
            snapshot(entry['commit'])
            entries.append({key: value for key, value in entry.items() if key != 'same_as'})
            ids.add(entry['id'])
    entries.sort(key=lambda entry: (entry['id'] != current['id'], entry['commit'] != head,
                                   entry['release_date'] is None,
                                   -datetime.fromisoformat(entry['release_date']).toordinal() if entry['release_date'] else 0,
                                   entry['id']))
    canonical = {}
    for entry in entries:
        if entry['commit'] in canonical:
            entry['same_as'] = canonical[entry['commit']]
        else:
            canonical[entry['commit']] = entry['id']
    index = {'schema_version': 1, 'default': current['id'], 'versions': entries}
    script = replace_once(r"const DATA_VERSION = '[^']+';", f"const DATA_VERSION = '{version(root_metadata)}';", SCRIPT.read_text())
    html = replace_once(r'omoi-question-catalog\.js\?v=[^"\s]+', f'omoi-question-catalog.js?v={version(root_metadata)}', CATALOG.read_text())
    notice = (f'<p id="questionVersionSource">反映日：{today} / 参照元：{REPOSITORY} / branch: main / commit: '
              f'<a class="external" href="https://github.com/{REPOSITORY}/tree/{head}">{head[:7]}</a>'
              f" / 質問件数: {root_metadata['total']}件 / コンテンツライセンス：CC BY-SA 4.0</p>")
    html = replace_once(r'<p id="questionVersionSource">反映日：[^<]*<a[^>]*>[^<]*</a>[^<]*</p>', notice, html)
    option = f'<select id="questionVersion" disabled=""><option value="{escape(current["id"], quote=True)}">{escape(current["label"])}（最新）</option></select>'
    html = replace_once(r'<select id="questionVersion"[^>]*>.*?</select>', option, html)
    # All network reads, validations and catalog markers are checked before writes.
    for commit, (metadata, files) in snapshots.items():
        directory = ARCHIVE / commit
        if not (directory / 'source.json').exists():
            directory.mkdir(parents=True, exist_ok=True)
            for name, content in files.items():
                (directory / name).write_bytes(content)
            (directory / 'source.json').write_text(json.dumps(metadata, ensure_ascii=False, indent=2) + '\n')
    for name, content in root_files.items():
        (DATA / name).write_bytes(content)
    (DATA / 'source.json').write_text(json.dumps(root_metadata, ensure_ascii=False, indent=2) + '\n')
    index_path.write_text(json.dumps(index, ensure_ascii=False, indent=2) + '\n')
    SCRIPT.write_text(script)
    CATALOG.write_text(html)
    check()
    print('Review related documentation, aggregate counts and news before publication.')


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--check', action='store_true', help='Verify local versions and provenance without network access')
    args = parser.parse_args()
    try:
        check() if args.check else sync()
    except (AssertionError, ValueError, KeyError, OSError, TypeError) as error:
        parser.exit(1, f'ERROR: {error}\n')
