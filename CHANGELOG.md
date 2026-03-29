# Changelog

## 2026-03-29

### Added

- GitHub Pages に全19篇分の HTML ページを追加（`pages/ch-*.html`、プロローグ＋本編17章＋終章）
- `build-pages.js` に `CHAPTERS` 配列と `buildChapterPage()` を追加し、原稿 Markdown → HTML 変換に対応
- `pages/index.html` に「本編」セクションを追加（章カード一覧）
- `pages/nav.js` に `CHAPTER_ORDER` を追加し、章ページでも前後ナビ・TOC・トップへ戻るが動作するように拡張
- `pages/nav.css` に `.section-heading` スタイルを追加
- `README.md` を新規作成

### Notes

- 既存の設定資料ページ（world-setting, japan-setting, federation, scenario）は変更なし
- 章ページは `nav.css` / `nav.js` を外部ファイルとして読み込む構成（設定資料ページのインライン CSS とは別系統）
