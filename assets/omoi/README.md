# Omoiの掲載画像と質問データ

2026-11-26に、OmoiのBeta（v3.0.0 / `4bef94f5e8474bb8d311408c4852f07b202d348d`）と照合しました。

- `omoi-home-v3.png`: 正本の[`資料/screenshots/home.png`](https://github.com/VIUK-Light/Omoi/blob/4bef94f5e8474bb8d311408c4852f07b202d348d/資料/screenshots/home.png)を無加工で転載。
- `omoi-question-v3.png`: 正本の[`資料/screenshots/question-level3.png`](https://github.com/VIUK-Light/Omoi/blob/4bef94f5e8474bb8d311408c4852f07b202d348d/資料/screenshots/question-level3.png)を無加工で転載。
- `data/level2.json`〜`level4.json`: v3の質問・解説データをバイト単位で同期。Level 1はv3で廃止されたため収録しません。参照元、反映日、件数、SHA-256は[`data/source.json`](data/source.json)に記録。
- `data/versions.json`: カタログで選べる公開版の一覧。v3.0.0と、v2.01・v2.1・v2.0.0・v1.0.0・v0.1.0のコミット・公開日・件数を記録。v2.01とv2.1は同じコミットを参照。
- `data/versions/<commit>/`: 各版のJSONと`source.json`。過去の本文・分類・重複を修正せず保存し、各ファイルのSHA-256で照合。同じコミットのタグは保存データを共有。

質問・解説などのコンテンツデータはVIUK-LightのCC BY-SA 4.0です。正本の[README / License](https://github.com/VIUK-Light/Omoi/tree/4bef94f5e8474bb8d311408c4852f07b202d348d#license)を参照してください。v2以前の画面写真（`omoi-start.png`、`omoi-categories.png`、`omoi-question.png`、`omoi-question-20261017.png`、`omoi-hints.png`）は過去の参照用に保持しています。
