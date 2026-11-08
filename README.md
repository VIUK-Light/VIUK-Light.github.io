# VIUK-Light

VIUK-Lightは、**法人ではない独立したオープンソース開発組織**です。GitHubに限らず活動し、GitHubはソースコードや開発情報を公開する場の一つです。
現在は、社会や価値観、身近な関係について対話するための**Omoiシリーズ**を中心に開発しています。

[公式サイトを見る](https://viuk-light.org/) · [News](https://viuk-light.org/news.html) · [Projects](https://viuk-light.org/projects.html) · [Principles](https://viuk-light.org/principles.html) · [Contributing](CONTRIBUTING.md) · [GitHub](https://github.com/VIUK-Light)

## Projects

| Project | Status | What it is | Links |
| --- | --- | --- | --- |
| SafeSearch 4 — X-filtering system | **Published** | Microsoft Edge向けのローカルWebフィルタリング拡張機能 | [公式ページ](https://viuk-light.org/x-filtering-system.html) · [Repository](https://github.com/VIUK-Light/X-filtering-system) |
| Omoi | **Active development** | 社会・倫理・価値観・人生について話すための質問カード | [公式ページ](https://viuk-light.org/omoi.html) · [Repository](https://github.com/VIUK-Light/Omoi) |
| Omoi for series | **Active development** | Couples・Family・Friends・Adults・Self-Careから、対話や振り返りの入口を選ぶWebシリーズ | [公式ページ](https://viuk-light.org/omoi-for.html) · [Open](https://omoi-for.viuk-light.org/) |
| Kizuna | **Maintenance** | AIキャラクターとの会話・関係・物語を、利用者のペースで育てるiOS / macOSアプリ。新機能開発は最小限とし、主に重大な不具合やセキュリティ上の問題に対応します。 | [公式ページ](https://viuk-light.org/kizuna.html) · [Repository](https://github.com/VIUK-Light/Kizuna) |

## Principles

公開するプロダクトでは、安全性、透明性、プライバシー、利用者の選択を判断基準にしています。

[判断基準を読む](https://viuk-light.org/principles.html)

## Contribute

コード以外にも、使いにくさの報告、文章や翻訳の改善、質問やデザインへの意見、テストがプロジェクトを前へ進めます。

[参加方法を見る](https://viuk-light.org/contribute.html)

## Development

このリポジトリはVIUK-Light公式サイトの静的ソースです。HTML / CSS / JavaScriptで構成し、GitHub Pagesから公開しています。

主な入口は、`index.html`（Home・直近のお知らせ）、`news.html`（News一覧）、`projects.html`（公開プロジェクト）、`style.css`（Homeの表示）、`interior.css`（組織・製品紹介・Documentationの表示）、`site-nav.js` / `site-nav.css`（日本語ナビゲーションとモバイルメニュー）、`docs.js`（Documentationの補助機能）です。

ローカル確認は、リポジトリ直下で次を実行します。

```sh
python3 -m http.server 8000
```

その後、`http://127.0.0.1:8000/` を開きます。

リンク、ページ内アンカー、見出し階層、Documentationの製品別ナビゲーションは、依存パッケージなしで確認できます。

```sh
python3 tools/check-site.py
python3 tools/sync-omoi-data.py --check
```

## 質問カタログの更新

Omoiの質問JSONは、公開元mainと公開タグの特定コミットからそのまま同期します。カタログではv2.01・v2.1・v2.0.0・v1.0.0・v0.1.0を切り替えられます。

```sh
python3 tools/sync-omoi-data.py
```

各版の4ファイルを同じコミットから取得して検査した後、最新JSONと`assets/omoi/data/source.json`、版一覧の`versions.json`、`versions/<commit>/`の保存データ、カタログの参照情報とキャッシュ版を更新します。同じコミットを指すタグは、保存データを共有します。既存の保存データは上書きせず、タグの付け替えを検出した場合は更新を中止します。

`--check`ではネットワークを使わず、全保存版の件数・SHA-256・参照情報と、最新JSONのID・Levelを確認します。過去版に含まれる重複やLevelの不一致は修正せず、当時のデータのまま保存し、`legacy_warnings`に件数を記録します。集計や画面の操作説明、Newsは正本と照合して別途更新してください。

`omoi-question-catalog.html?version=v2.01`のように選択した版を共有でき、再読み込みやブラウザーの戻る・進むでも版を復元します。v2.01とv2.1は現在同じコミットの906件です。

2026-11-08の確認元はOmoiの[`3eeff5a`](https://github.com/VIUK-Light/Omoi/tree/3eeff5a9618ba1503d2716c6fe89d47d30bd710d)（906問）とOmoi for Seriesの[`3449535`](https://github.com/VIUK-Light/Omoi-for-Series/tree/3449535067632f20b312fa00fb9ba292c29e7f74)（611問）です。

## Contributing

文章、リンク、表示、アクセシビリティ、ドキュメントの改善を歓迎します。詳細は [CONTRIBUTING.md](CONTRIBUTING.md) を参照してください。

## License

Source code is available under the MIT License.
