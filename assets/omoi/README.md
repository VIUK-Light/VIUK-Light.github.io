# Omoiの掲載画像と質問データ

2026-11-08に、Omoiの公開元main（v2.1 / `3eeff5a9618ba1503d2716c6fe89d47d30bd710d`）と照合しました。

- `omoi-start-20261103.png`: 正本の[`docs/screenshots/home.png`](https://github.com/VIUK-Light/Omoi/blob/3eeff5a9618ba1503d2716c6fe89d47d30bd710d/docs/screenshots/home.png)を無加工で転載。
- `omoi-question-20261103.png`: 正本の[`docs/screenshots/question-level3.png`](https://github.com/VIUK-Light/Omoi/blob/3eeff5a9618ba1503d2716c6fe89d47d30bd710d/docs/screenshots/question-level3.png)を無加工で転載。
- `data/level1.json`〜`level4.json`: 同じ公開コミットの質問・解説データをバイト単位で同期。参照元、反映日、件数、SHA-256は[`data/source.json`](data/source.json)に記録。
- `data/versions.json`: カタログで選べる公開版の一覧。各タグのコミット・公開日・件数を記録。v2.01とv2.1は同じコミットを参照。
- `data/versions/<commit>/`: 各版の4つのJSONと`source.json`。過去の本文・分類・重複を修正せず保存し、各ファイルのSHA-256で照合。同じコミットのタグは保存データを共有。

質問・解説などのコンテンツデータはVIUK-LightのCC BY-SA 4.0です。正本の[README / License](https://github.com/VIUK-Light/Omoi/tree/3eeff5a9618ba1503d2716c6fe89d47d30bd710d#license)を参照してください。以前の画像は過去の参照用に保持しています。
