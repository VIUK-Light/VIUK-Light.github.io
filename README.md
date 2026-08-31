# VIUK-Light

VIUK-Lightは、GitHub Organizationとして活動する、**法人ではない独立したオープンソース開発組織**です。
現在は、社会や価値観、身近な関係について対話するための**Omoiシリーズ**を中心に開発しています。

[公式サイトを見る](https://viuk-light.org/) · [Projects](https://viuk-light.org/projects.html) · [Principles](https://viuk-light.org/principles.html) · [Contributing](CONTRIBUTING.md) · [GitHub Organization](https://github.com/VIUK-Light)

## Projects

| Project | Status | What it is | Links |
| --- | --- | --- | --- |
| Omoi | **Active development** | 社会・倫理・価値観・人生について話すための質問カード | [公式ページ](https://viuk-light.org/omoi.html) · [Repository](https://github.com/VIUK-Light/Omoi) |
| Omoi for series | **Active development** | Couples・Family・Friendsに合わせて会話の入口を選ぶWebシリーズ | [公式ページ](https://viuk-light.org/omoi-for.html) · [Open](https://omoi-for.viuk-light.org/) |
| Kizuna | **Maintenance** | AIキャラクターとの会話・関係・物語を、利用者のペースで育てるiOS / macOSアプリ。新機能開発は最小限とし、主に重大な不具合やセキュリティ上の問題に対応します。 | [公式ページ](https://viuk-light.org/kizuna.html) · [Repository](https://github.com/VIUK-Light/Kizuna) |

## Principles

公開するプロダクトでは、安全性、透明性、プライバシー、利用者の選択を判断基準にしています。

[判断基準を読む](https://viuk-light.org/principles.html)

## Contribute

コード以外にも、使いにくさの報告、文章や翻訳の改善、質問やデザインへの意見、テストがプロジェクトを前へ進めます。

[参加方法を見る](https://viuk-light.org/contribute.html)

## Development

このリポジトリはVIUK-Light公式サイトの静的ソースです。HTML / CSS / JavaScriptで構成し、GitHub Pagesから公開しています。

主な入口は、`index.html`（Home）、`projects.html`（公開プロジェクト）、`style.css`（共通表示）、`site-nav.js`（公式ナビゲーション）、`docs.js`（Documentationの補助機能）です。

ローカル確認は、リポジトリ直下で次を実行します。

```sh
python3 -m http.server 8000
```

その後、`http://127.0.0.1:8000/` を開きます。

## Contributing

文章、リンク、表示、アクセシビリティ、ドキュメントの改善を歓迎します。詳細は [CONTRIBUTING.md](CONTRIBUTING.md) を参照してください。

## License

Source code is available under the MIT License.
