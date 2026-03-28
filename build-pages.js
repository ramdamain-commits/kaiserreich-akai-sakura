/**
 * build-pages.js
 * Markdown ファイルを HTML に変換して pages/ ディレクトリに出力するスクリプト。
 * 使い方: node build-pages.js
 */

const fs = require('fs');
const path = require('path');
const { marked } = require('marked');

// ---- 設定 ----------------------------------------------------------------

const ROOT = __dirname;
const PAGES_DIR = path.join(ROOT, 'pages');

/** 変換対象ドキュメント */
const DOCS = [
  {
    src: 'kaiserreich-world-setting.md',
    out: 'world-setting.html',
    title: '世界設定',
    desc: '国際関係・勢力・イデオロギー・年表',
  },
  {
    src: 'kaiserreich-japan-setting.md',
    out: 'japan-setting.html',
    title: '日本設定',
    desc: '国内政治・軍閥・経済構造',
  },
  {
    src: 'kaiserreich-federation-reference.md',
    out: 'federation.html',
    title: '連邦制度リファレンス',
    desc: '赤い共栄圏の統治構造',
  },
  {
    src: 'kaiserreich-akai-sakura-scenario.md',
    out: 'scenario.html',
    title: 'シナリオ構成',
    desc: '物語の構造・テーマ設計',
  },
];

// ---- CSS -----------------------------------------------------------------

const CSS = `
:root {
  --bg: #0f172a;
  --card-bg: #1e293b;
  --text: #e2e8f0;
  --text-muted: #94a3b8;
  --accent: #3b82f6;
  --accent-hover: #60a5fa;
  --border: #334155;
  --code-bg: #0d1117;
  --nav-bg: #1e293b;
}

*, *::before, *::after {
  box-sizing: border-box;
}

body {
  font-family: system-ui, -apple-system, "Segoe UI", sans-serif;
  background: var(--bg);
  color: var(--text);
  margin: 0;
  padding: 0;
  line-height: 1.8;
  font-size: 16px;
}

/* ナビゲーションヘッダー */
.site-nav {
  position: sticky;
  top: 0;
  z-index: 100;
  background: var(--nav-bg);
  border-bottom: 1px solid var(--border);
  padding: 0.6rem 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.site-nav a {
  color: var(--text-muted);
  text-decoration: none;
  font-size: 0.85rem;
  transition: color 0.2s;
  white-space: nowrap;
}

.site-nav a:hover {
  color: var(--accent-hover);
}

.site-nav .nav-home {
  color: var(--accent);
  font-weight: 600;
  font-size: 0.9rem;
}

.site-nav .nav-sep {
  color: var(--border);
  user-select: none;
}

.site-nav .nav-current {
  color: var(--text);
  font-size: 0.85rem;
}

/* メインコンテンツ */
.content {
  max-width: 800px;
  margin: 0 auto;
  padding: 2.5rem 1.5rem 4rem;
}

/* 見出し */
h1 {
  font-size: 1.8rem;
  font-weight: 700;
  color: var(--text);
  border-bottom: 2px solid var(--accent);
  padding-bottom: 0.5rem;
  margin: 2rem 0 1rem;
}

h2 {
  font-size: 1.4rem;
  font-weight: 600;
  color: var(--text);
  border-left: 3px solid var(--accent);
  padding-left: 0.75rem;
  margin: 2.5rem 0 0.75rem;
}

h3 {
  font-size: 1.15rem;
  font-weight: 600;
  color: var(--text);
  margin: 1.8rem 0 0.5rem;
}

h4, h5, h6 {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-muted);
  margin: 1.5rem 0 0.4rem;
}

/* 段落・リスト */
p {
  margin: 0.75rem 0;
  color: var(--text);
}

ul, ol {
  padding-left: 1.5rem;
  margin: 0.75rem 0;
}

li {
  margin: 0.3rem 0;
}

/* テーブル */
table {
  width: 100%;
  border-collapse: collapse;
  margin: 1.25rem 0;
  font-size: 0.9rem;
  overflow-x: auto;
  display: block;
}

th {
  background: var(--card-bg);
  color: var(--text);
  font-weight: 600;
  padding: 0.6rem 0.9rem;
  border: 1px solid var(--border);
  text-align: left;
  white-space: nowrap;
}

td {
  padding: 0.55rem 0.9rem;
  border: 1px solid var(--border);
  color: var(--text);
  vertical-align: top;
}

tr:nth-child(even) td {
  background: rgba(255, 255, 255, 0.02);
}

tr:hover td {
  background: rgba(59, 130, 246, 0.05);
}

/* blockquote */
blockquote {
  border-left: 3px solid var(--accent);
  margin: 1.25rem 0;
  padding: 0.6rem 1.25rem;
  background: var(--card-bg);
  border-radius: 0 6px 6px 0;
  color: var(--text-muted);
}

blockquote p {
  margin: 0.3rem 0;
  color: var(--text-muted);
}

/* コード */
code {
  background: var(--code-bg);
  border: 1px solid var(--border);
  border-radius: 4px;
  padding: 0.1em 0.45em;
  font-family: "Consolas", "Fira Code", monospace;
  font-size: 0.88em;
  color: #7dd3fc;
}

pre {
  background: var(--code-bg);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 1.25rem;
  overflow-x: auto;
  margin: 1.25rem 0;
}

pre code {
  background: none;
  border: none;
  padding: 0;
  font-size: 0.875rem;
  color: #e2e8f0;
}

/* リンク */
a {
  color: var(--accent);
  text-decoration: none;
  transition: color 0.2s;
}

a:hover {
  color: var(--accent-hover);
  text-decoration: underline;
}

/* 水平線 */
hr {
  border: none;
  border-top: 1px solid var(--border);
  margin: 2rem 0;
}

/* 強調 */
strong {
  color: var(--text);
  font-weight: 600;
}

em {
  color: var(--text-muted);
}

/* レスポンシブ */
@media (max-width: 600px) {
  .content {
    padding: 1.5rem 1rem 3rem;
  }

  h1 {
    font-size: 1.4rem;
  }

  h2 {
    font-size: 1.2rem;
  }

  .site-nav {
    padding: 0.5rem 1rem;
    gap: 0.6rem;
  }
}

/* ---- 目次ページ専用 ---- */
.index-hero {
  text-align: center;
  padding: 3rem 0 2rem;
  border-bottom: 1px solid var(--border);
  margin-bottom: 2.5rem;
}

.index-hero h1 {
  font-size: 2rem;
  border: none;
  padding: 0;
  margin: 0 0 0.5rem;
}

.index-hero .subtitle {
  color: var(--text-muted);
  font-size: 1rem;
}

.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.25rem;
  margin-top: 1.5rem;
}

.card {
  background: var(--card-bg);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 1.5rem;
  text-decoration: none;
  display: block;
  transition: border-color 0.2s, background 0.2s, transform 0.15s;
}

.card:hover {
  border-color: var(--accent);
  background: #263248;
  transform: translateY(-2px);
  text-decoration: none;
}

.card-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text);
  margin-bottom: 0.4rem;
}

.card-desc {
  font-size: 0.875rem;
  color: var(--text-muted);
  line-height: 1.6;
}

.card-arrow {
  margin-top: 1rem;
  font-size: 0.85rem;
  color: var(--accent);
}
`;

// ---- ナビゲーションリンク生成 -------------------------------------------

/**
 * 指定ドキュメント用のナビゲーション HTML を生成する。
 * @param {object} currentDoc - 現在のドキュメント情報（DOCS の要素）
 * @returns {string} nav 要素の HTML
 */
function buildNav(currentDoc) {
  const links = DOCS
    .filter((d) => d.out !== currentDoc.out)
    .map((d) => `<a href="${d.out}">${d.title}</a>`)
    .join('<span class="nav-sep"> | </span>');

  return `
<nav class="site-nav" aria-label="サイトナビゲーション">
  <a href="index.html" class="nav-home">赤い桜 — 設定資料集</a>
  <span class="nav-sep">/</span>
  <span class="nav-current">${currentDoc.title}</span>
  <span class="nav-sep" style="flex:1"></span>
  ${links}
</nav>`.trim();
}

// ---- HTML テンプレート ---------------------------------------------------

/**
 * ドキュメントページの完全な HTML を生成する。
 * @param {object} doc - ドキュメント情報
 * @param {string} bodyHtml - marked で変換済みの本文 HTML
 * @returns {string}
 */
function buildDocPage(doc, bodyHtml) {
  const nav = buildNav(doc);
  return `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${doc.title} — 赤い桜 設定資料集</title>
  <style>${CSS}</style>
</head>
<body>
  ${nav}
  <main class="content" id="main-content">
    ${bodyHtml}
  </main>
</body>
</html>`;
}

/**
 * 目次（index.html）の HTML を生成する。
 * @returns {string}
 */
function buildIndexPage() {
  const cards = DOCS.map((d) => `
    <a href="${d.out}" class="card" aria-label="${d.title}のページへ">
      <div class="card-title">${d.title}</div>
      <div class="card-desc">${d.desc}</div>
      <div class="card-arrow">続きを読む &rarr;</div>
    </a>`).join('\n');

  return `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>赤い桜 — 世界設定資料集</title>
  <style>${CSS}</style>
</head>
<body>
  <nav class="site-nav" aria-label="サイトナビゲーション">
    <span class="nav-current" style="font-weight:600;">赤い桜 — 設定資料集</span>
  </nav>
  <main class="content" id="main-content">
    <div class="index-hero">
      <h1>赤い桜 — 世界設定資料集</h1>
      <p class="subtitle">カイザーライヒ世界の設定資料</p>
    </div>
    <div class="card-grid">
      ${cards}
    </div>
  </main>
</body>
</html>`;
}

// ---- メイン処理 ----------------------------------------------------------

/**
 * pages/ ディレクトリを作成し、全ページを生成する。
 */
function main() {
  // pages/ ディレクトリを作成（既存であれば何もしない）
  if (!fs.existsSync(PAGES_DIR)) {
    fs.mkdirSync(PAGES_DIR, { recursive: true });
    console.log('pages/ ディレクトリを作成しました');
  }

  // 目次ページを生成
  const indexHtml = buildIndexPage();
  const indexOut = path.join(PAGES_DIR, 'index.html');
  fs.writeFileSync(indexOut, indexHtml, 'utf-8');
  console.log('生成: pages/index.html');

  // 各ドキュメントページを生成
  for (const doc of DOCS) {
    const srcPath = path.join(ROOT, doc.src);

    if (!fs.existsSync(srcPath)) {
      console.warn(`警告: ${doc.src} が見つかりません。スキップします。`);
      continue;
    }

    const md = fs.readFileSync(srcPath, 'utf-8');

    // marked でパース（GFM テーブルを有効化）
    const bodyHtml = marked.parse(md, {
      gfm: true,
      breaks: false,
    });

    const html = buildDocPage(doc, bodyHtml);
    const outPath = path.join(PAGES_DIR, doc.out);
    fs.writeFileSync(outPath, html, 'utf-8');
    console.log(`生成: pages/${doc.out}`);
  }

  console.log('\n全ページの生成が完了しました。');
  console.log('ブラウザで pages/index.html を開いて確認してください。');
}

main();
