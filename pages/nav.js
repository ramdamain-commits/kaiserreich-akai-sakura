/**
 * nav.js — 赤い桜 設定資料集 共通ナビゲーションスクリプト
 *
 * 担当機能:
 *   1. ページ内 TOC（h2/h3 から自動生成、折りたたみ可能）
 *   2. 見出しへのアンカーリンク追加（URLで特定セクションを共有可能に）
 *   3. 現在読んでいるセクションの TOC ハイライト（IntersectionObserver）
 *   4. トップに戻るボタン（スクロール時に表示）
 *   5. ページ末尾の前ページ/次ページリンク
 */

(function () {
  'use strict';

  /* ------------------------------------------------------------------ */
  /* ページ順序の定義                                                     */
  /* ------------------------------------------------------------------ */
  const PAGE_ORDER = [
    { file: 'world-setting.html',  label: '世界設定' },
    { file: 'japan-setting.html',  label: '日本設定' },
    { file: 'federation.html',     label: '連邦制度リファレンス' },
    { file: 'scenario.html',       label: 'シナリオ構成' },
  ];

  /** 現在のファイル名を取得 */
  function currentFile() {
    const parts = location.pathname.split('/');
    return parts[parts.length - 1] || 'index.html';
  }

  /* ------------------------------------------------------------------ */
  /* 1. 見出しにアンカーリンクを追加                                     */
  /* ------------------------------------------------------------------ */
  function addHeadingAnchors() {
    const headings = document.querySelectorAll('.content h2, .content h3');
    headings.forEach(function (h) {
      /* 既に id が付いていない場合のみ生成 */
      if (!h.id) {
        /* テキストから id を生成: 記号除去・スペース→ハイフン */
        const raw = h.textContent.trim()
          .replace(/[^\p{L}\p{N}\s]/gu, '')
          .trim()
          .replace(/\s+/g, '-')
          .toLowerCase();
        h.id = raw || ('heading-' + Math.random().toString(36).slice(2, 7));
      }
      /* 既にアンカーボタンが入っている場合はスキップ */
      if (h.querySelector('.heading-anchor')) return;

      const a = document.createElement('a');
      a.className = 'heading-anchor';
      a.href = '#' + h.id;
      a.setAttribute('aria-label', 'このセクションへのリンク');
      a.textContent = '#';
      h.appendChild(a);
    });
  }

  /* ------------------------------------------------------------------ */
  /* 2. ページ内 TOC を生成                                              */
  /* ------------------------------------------------------------------ */
  function buildTOC() {
    const content = document.querySelector('.content');
    if (!content) return;

    const headings = Array.from(content.querySelectorAll('h2, h3')).filter(function (h) {
      /* 「目次」という見出し自体はTOCに含めない（手書き目次と重複するため）
         アンカー追加後は textContent に "#" が含まれるため、childNodes[0] のテキストで判定する */
      const label = h.childNodes[0] ? h.childNodes[0].textContent.trim() : h.textContent.trim();
      return label !== '目次';
    });
    /* h2 が 2 つ未満ならTOCは不要 */
    if (headings.filter(function (h) { return h.tagName === 'H2'; }).length < 2) return;

    /* TOC コンテナを作成 */
    const nav = document.createElement('nav');
    nav.className = 'page-toc';
    nav.setAttribute('aria-label', 'ページ内目次');

    /* ヘッダー行（タイトル + 折りたたみボタン） */
    const header = document.createElement('div');
    header.className = 'toc-header';

    const title = document.createElement('span');
    title.className = 'toc-title';
    title.textContent = '目次';

    const toggle = document.createElement('button');
    toggle.className = 'toc-toggle';
    toggle.setAttribute('aria-expanded', 'true');
    toggle.setAttribute('aria-controls', 'toc-list');
    toggle.textContent = '折りたたむ';

    header.appendChild(title);
    header.appendChild(toggle);
    nav.appendChild(header);

    /* TOCリスト */
    const list = document.createElement('ol');
    list.id = 'toc-list';
    list.className = 'toc-list';

    headings.forEach(function (h) {
      const li = document.createElement('li');
      li.className = h.tagName === 'H3' ? 'toc-item toc-item--h3' : 'toc-item toc-item--h2';

      const a = document.createElement('a');
      a.href = '#' + h.id;
      /* アンカーボタン（#）のテキストを除いた見出しテキストだけ取得 */
      a.textContent = h.childNodes[0]
        ? h.childNodes[0].textContent.trim()
        : h.textContent.trim();
      a.dataset.tocTarget = h.id;

      /* クリック時にスムーズスクロール */
      a.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.getElementById(h.id);
        if (target) {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
          /* URLのハッシュを更新（履歴は追加しない） */
          history.replaceState(null, '', '#' + h.id);
        }
      });

      li.appendChild(a);
      list.appendChild(li);
    });

    nav.appendChild(list);

    /* 折りたたみトグル処理 */
    toggle.addEventListener('click', function () {
      const isExpanded = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!isExpanded));
      toggle.textContent = isExpanded ? '展開する' : '折りたたむ';
      list.classList.toggle('toc-list--collapsed', isExpanded);
    });

    /* モバイルではデフォルトで折りたたむ */
    if (window.matchMedia('(max-width: 600px)').matches) {
      toggle.setAttribute('aria-expanded', 'false');
      toggle.textContent = '展開する';
      list.classList.add('toc-list--collapsed');
    }

    /* コンテンツの最初の hr（セクション区切り）の直後に挿入する。
       hr がない場合は h1 の直後にフォールバックする。
       これにより h1 直後の intro blockquote の後に TOC が表示される。 */
    const h1 = content.querySelector('h1');
    const firstHr = content.querySelector('hr');
    if (firstHr && firstHr.nextSibling) {
      content.insertBefore(nav, firstHr.nextSibling);
    } else if (h1 && h1.nextSibling) {
      content.insertBefore(nav, h1.nextSibling);
    } else {
      content.prepend(nav);
    }
  }

  /* ------------------------------------------------------------------ */
  /* 3. IntersectionObserver で TOC アクティブ項目をハイライト           */
  /* ------------------------------------------------------------------ */
  function setupTOCHighlight() {
    const tocLinks = document.querySelectorAll('.toc-list a[data-toc-target]');
    if (!tocLinks.length) return;

    /* ナビゲーションの高さ分オフセット（sticky nav 対策） */
    const navHeight = (document.querySelector('.site-nav') || {}).offsetHeight || 60;

    const observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            /* 全リンクのアクティブクラスを外す */
            tocLinks.forEach(function (link) {
              link.classList.remove('toc-link--active');
            });
            /* 現在交差中の見出しに対応するリンクをアクティブに */
            const activeLink = document.querySelector(
              '.toc-list a[data-toc-target="' + entry.target.id + '"]'
            );
            if (activeLink) {
              activeLink.classList.add('toc-link--active');
            }
          }
        });
      },
      {
        rootMargin: '-' + (navHeight + 16) + 'px 0px -70% 0px',
        threshold: 0,
      }
    );

    document.querySelectorAll('.content h2, .content h3').forEach(function (h) {
      if (h.id) observer.observe(h);
    });
  }

  /* ------------------------------------------------------------------ */
  /* 4. トップに戻るボタン                                               */
  /* ------------------------------------------------------------------ */
  function buildBackToTopButton() {
    const btn = document.createElement('button');
    btn.className = 'back-to-top';
    btn.setAttribute('aria-label', 'ページ先頭に戻る');
    btn.innerHTML = '&#9650;';
    document.body.appendChild(btn);

    btn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    /* スクロール量に応じて表示/非表示 */
    window.addEventListener('scroll', function () {
      if (window.scrollY > 400) {
        btn.classList.add('back-to-top--visible');
      } else {
        btn.classList.remove('back-to-top--visible');
      }
    }, { passive: true });
  }

  /* ------------------------------------------------------------------ */
  /* 5a. ページ上部の章間ナビバー（site-nav 直後に挿入）               */
  /* ------------------------------------------------------------------ */
  function buildTopChapterNav() {
    const file = currentFile();
    const idx = PAGE_ORDER.findIndex(function (p) { return p.file === file; });
    /* 対象外ページ（index.html など）はスキップ */
    if (idx === -1) return;

    const prev = PAGE_ORDER[idx - 1] || null;
    const next = PAGE_ORDER[idx + 1] || null;
    const current = PAGE_ORDER[idx];

    const nav = document.createElement('nav');
    nav.className = 'chapter-nav chapter-nav--top';
    nav.setAttribute('aria-label', '章ナビゲーション（上部）');

    /* 前の章リンク */
    if (prev) {
      const a = document.createElement('a');
      a.href = prev.file;
      a.className = 'chapter-link chapter-link--prev';
      a.innerHTML = '<span class="chapter-link__arrow">&larr;</span><span class="chapter-link__label">' + prev.label + '</span>';
      nav.appendChild(a);
    } else {
      const span = document.createElement('span');
      span.className = 'chapter-link chapter-link--placeholder';
      nav.appendChild(span);
    }

    /* 現在の章タイトル + 目次へのリンク */
    const center = document.createElement('div');
    center.className = 'chapter-nav__center';
    const indexLink = document.createElement('a');
    indexLink.href = 'index.html';
    indexLink.className = 'chapter-nav__index-link';
    indexLink.setAttribute('aria-label', '目次へ戻る');
    indexLink.textContent = '目次';
    const sep1 = document.createElement('span');
    sep1.className = 'chapter-nav__sep';
    sep1.setAttribute('aria-hidden', 'true');
    sep1.textContent = '|';
    const currentSpan = document.createElement('span');
    currentSpan.className = 'chapter-nav__current';
    currentSpan.setAttribute('aria-current', 'page');
    currentSpan.textContent = current.label;
    center.appendChild(indexLink);
    center.appendChild(sep1);
    center.appendChild(currentSpan);
    nav.appendChild(center);

    /* 次の章リンク */
    if (next) {
      const a = document.createElement('a');
      a.href = next.file;
      a.className = 'chapter-link chapter-link--next';
      a.innerHTML = '<span class="chapter-link__label">' + next.label + '</span><span class="chapter-link__arrow">&rarr;</span>';
      nav.appendChild(a);
    } else {
      const span = document.createElement('span');
      span.className = 'chapter-link chapter-link--placeholder';
      nav.appendChild(span);
    }

    /* site-nav の直後に挿入する */
    const siteNav = document.querySelector('.site-nav');
    if (siteNav && siteNav.nextSibling) {
      siteNav.parentNode.insertBefore(nav, siteNav.nextSibling);
    } else if (siteNav) {
      siteNav.parentNode.appendChild(nav);
    }
  }

  /* ------------------------------------------------------------------ */
  /* 5b. ページ下部の章間ナビ（本文末尾に挿入）                         */
  /* ------------------------------------------------------------------ */
  function buildPageNavigation() {
    const file = currentFile();
    const idx = PAGE_ORDER.findIndex(function (p) { return p.file === file; });
    /* 対象外ページ（index.html など）はスキップ */
    if (idx === -1) return;

    const prev = PAGE_ORDER[idx - 1] || null;
    const next = PAGE_ORDER[idx + 1] || null;

    const nav = document.createElement('nav');
    nav.className = 'page-sibling-nav';
    nav.setAttribute('aria-label', '前後ページナビゲーション');

    if (prev) {
      const a = document.createElement('a');
      a.href = prev.file;
      a.className = 'sibling-link sibling-link--prev';
      a.innerHTML = '&larr; ' + prev.label;
      nav.appendChild(a);
    } else {
      /* スペーサー */
      const span = document.createElement('span');
      nav.appendChild(span);
    }

    /* 目次へ戻るリンク（中央） */
    const indexLink = document.createElement('a');
    indexLink.href = 'index.html';
    indexLink.className = 'sibling-link sibling-link--index';
    indexLink.textContent = '目次へ';
    nav.appendChild(indexLink);

    if (next) {
      const a = document.createElement('a');
      a.href = next.file;
      a.className = 'sibling-link sibling-link--next';
      a.innerHTML = next.label + ' &rarr;';
      nav.appendChild(a);
    } else {
      const span = document.createElement('span');
      nav.appendChild(span);
    }

    /* main コンテンツの末尾に挿入 */
    const main = document.querySelector('main.content');
    if (main) {
      const hr = document.createElement('hr');
      main.appendChild(hr);
      main.appendChild(nav);
    }
  }

  /* ------------------------------------------------------------------ */
  /* 初期化                                                               */
  /* ------------------------------------------------------------------ */
  /**
   * 手書き目次セクション（<h2>目次</h2> + その後の ol/h3）を非表示にする。
   * JSのTOCで代替するため、重複を避ける。
   */
  function hideStaticTOC() {
    const content = document.querySelector('.content');
    if (!content) return;
    /* "目次" テキストの h2 を探す（アンカー追加後は textContent に "#" が含まれるため childNodes[0] で判定） */
    const toc_h2 = Array.from(content.querySelectorAll('h2')).find(function (h) {
      const label = h.childNodes[0] ? h.childNodes[0].textContent.trim() : h.textContent.trim();
      return label === '目次';
    });
    if (!toc_h2) return;
    toc_h2.style.display = 'none';
    /* 直後の兄弟要素（h3, ol, hr が来るまで）を非表示にする */
    let node = toc_h2.nextElementSibling;
    while (node) {
      /* 次のセクション h2（目次以外）が来たら停止 */
      if (node.tagName === 'H2') break;
      /* hr も非表示にして見切れを防ぐ */
      if (node.tagName === 'HR') {
        node.style.display = 'none';
        break;
      }
      node.style.display = 'none';
      node = node.nextElementSibling;
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    addHeadingAnchors();
    /* 手書き目次を隠してからTOCを生成する */
    hideStaticTOC();
    buildTOC();
    setupTOCHighlight();
    buildBackToTopButton();
    buildTopChapterNav();   /* ページ上部の章間ナビバー */
    buildPageNavigation();  /* ページ下部の前後ナビ */
  });

}());
