# Contributing to VIUK-Light Official Website

VIUK-Light公式サイトの改善に関心を持ってくれてありがとうございます。このリポジトリは、公式サイトとプロダクトDocumentationを公開する静的サイトです。

## 参加できること

- 誤字、リンク切れ、古い件数や説明の報告
- 読みにくい文章、翻訳、アクセシビリティの改善
- モバイル表示、キーボード操作、画面上の分かりにくさの報告
- プロジェクトページ、技術仕様、安全設計の改善提案
- HTML、CSS、JavaScriptの修正

Issueでは、会話内容、APIキー、アクセストークン、個人情報を投稿しないでください。

## 編集する場所

| 目的 | 主なファイル |
| --- | --- |
| Home・組織ページ | `index.html`、`about.html`、`projects.html`、`principles.html`、`contribute.html` |
| News・お知らせ | `index.html`（直近8件）、`news.html`（一覧）。日付・見出し・リンク先を両方そろえて更新 |
| Homeの表示 | `style.css` |
| 組織・製品紹介・Documentationの表示 | `interior.css` |
| 公式ナビゲーション | `site-nav.js` |
| Omoi forの実画面 | `assets/omoi-for/screenshots/`（2026-10-17提供の12枚）、`omoi-for-screens.css`（画面内の表示範囲）。画像本体は加工せず、撮影時のサムネイルが入らない範囲をCSSで表示 |
| Omoi forの紹介 | `omoi-for.html`、`omoi-for.css`、`omoi-for.js`。カードカバー・シリーズ選択・体験デモ |
| 製品紹介・Homeの動き | `site-motion.css`、`site-motion.js`。`data-motion-page`のあるページへ適用 |
| Documentationの検索・モバイルメニュー・補助表示 | `docs.js` |
| Omoi Documentation | `omoi-*.html` |
| Omoi for series Documentation | `omoi-for-*.html` |
| Kizuna Documentation | `kizuna-*.html` |

## ローカル確認

依存関係のインストールは不要です。リポジトリ直下で次を実行します。

```sh
python3 -m http.server 8000
```

`http://127.0.0.1:8000/` を開き、少なくともHome、Projects、変更したDocumentation、モバイル幅を確認してください。

リンク・アンカー・見出し・製品別ナビゲーションは `python3 tools/check-site.py` で確認できます。

JavaScriptを変更した場合は、次も実行します。

```sh
node --check site-nav.js
node --check docs.js
node --check omoi-question-catalog.js
node --check site-motion.js
node --check omoi-for.js
```

## 内容の扱い

- Omoiの質問文・detail・質問データは、対応するOmoiリポジトリを正本として扱います。
- Omoi質問データの提案・編集・検証手順は、[`omoi-contributing.html`](omoi-contributing.html)にもまとめています。
- Omoi for seriesの質問・実装・出典情報は、[Omoi-for-Seriesリポジトリ](https://github.com/VIUK-Light/Omoi-for-Series)を正本として扱います。
- AdultsのDeepに含まれる質問本文・固有の追加質問・露骨な具体例・質問が読める画像は、公式サイトへ転載しません。質問JSONや非表示の埋め込みとして同梱することも避けます。Adults Deepについては、公式サイトでは18歳以上向けという概要、利用前の注意、利用先の案内までを扱います。Liteの実画面は、質問IDと現行のLite / Deep分類を照合したものを使います。
- Kizunaの対応環境・依存関係・実装状態は、Kizunaリポジトリを正本として扱います。
- Newsの日付は公開版への反映日を基本とし、Betaだけの実装日を製品のリリース日として扱いません。過去のお知らせは当時の更新記録です。各項目に案内先を設け、製品の更新には公開コミットなどの一次情報もリンクしてください。
- 法律、医療、統計、対応環境など更新され得る情報は、公開前に一次情報または正本リポジトリで確認してください。

## Pull Request

変更の目的、対象ページ、確認した画面幅、必要ならスクリーンショットを説明してください。大きな見た目の変更では、色や装飾を増やす前に、情報の優先順位と利用者の導線が改善されているかを確認します。
