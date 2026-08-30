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
| 共通表示 | `style.css` |
| 公式ナビゲーション | `site-nav.js` |
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

JavaScriptを変更した場合は、次も実行します。

```sh
node --check site-nav.js
node --check docs.js
```

## 内容の扱い

- Omoiの質問文・detail・質問データは、対応するOmoiリポジトリを正本として扱います。
- Omoi for seriesの質問・実装・出典情報は、Take-forリポジトリを正本として扱います。
- Kizunaの対応環境・依存関係・実装状態は、Kizunaリポジトリを正本として扱います。
- 法律、医療、統計、対応環境など更新され得る情報は、公開前に一次情報または正本リポジトリで確認してください。

## Pull Request

変更の目的、対象ページ、確認した画面幅、必要ならスクリーンショットを説明してください。大きな見た目の変更では、色や装飾を増やす前に、情報の優先順位と利用者の導線が改善されているかを確認します。
