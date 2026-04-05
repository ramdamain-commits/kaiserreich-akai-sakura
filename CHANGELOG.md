# Changelog

## 2026-04-05 — 5稿改稿

### Changed

- **R2制約修正（5箇所）**: ch05 L177「考えていた」→身体動作、ch09 L91 認識断定→沈黙、ch14 L95「信じた」→身体比喩、ch14 L109「意思」→反復、ch15 L253「信じた」→身体比喩（検証時に追加発見）
- **ch14 §2.5 圧縮**: 台湾陳情員・通訳・評議会の重複叙述を約22行削減。感覚描写と主題核に集中
- **ch07b 改題**: 「第七章　東京」→「第七章之二　東京」（ch07との章番号重複を解消）
- **ch13 連邦憲法モチーフ補強**: 「連邦の基本文書」→「連邦憲法の草稿」に明示化。紙モチーフの連鎖を接続
- **ch11 カネト主体性補強**: 「山に入った」に道具選択（鉈・干した鹿肉）と控え紙の意図的放置を追加
- **author-note**: 「何が描かれなかったか」節にマレー系不在を明示追加

### Removed

- `revision-plan-3rd.md`（3稿計画・完了済）
- `review-codex.md`（2稿レビュー・完了済）
- `docs/superpowers/plans/2026-04-04-expansion-ensemble-plan.md`（4稿実装計画・完了済）
- `docs/superpowers/specs/2026-04-04-expansion-ensemble-design.md`（4稿設計書・完了済）

### Notes

- 改稿計画は `revision-plan-5th.md` に移行
- CLAUDE.md の参照先・紙モチーフ・.gitignore 記述を5稿対応に更新
- GitHub Pages（`pages/`）は未更新。5稿安定後にビルド予定

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
