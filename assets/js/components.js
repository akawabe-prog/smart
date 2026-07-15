/* =========================================================================
   components.js — 全ページ共通のヘッダー/フッターを注入。
   <div id="site-header"></div> / <div id="site-footer"></div> に描画。
   data-root 属性でルート相対パス(サブディレクトリ対応)を渡す。
   例: <body data-root="../../"> → series/srd/ からの相対
   ========================================================================= */
import { SERIES } from './products.js';

const ROOT = document.body.getAttribute('data-root') || '';
const url = (p) => `${ROOT}${p}`;
// ルート直下ページ(data-root="")では url('') が空href=自己リロードになるため、
// ホームへのリンクは必ず "./"(ルート時) か ROOT を使う
const HOME = ROOT || './';

const seriesMenu = SERIES.map((s) => `
  <a href="${url(`series/${s.slug}/`)}">
    <span>${s.name}</span><em>${s.tagline}</em>
  </a>`).join('');

const headerHTML = `
<div class="topbar">
  <div class="topbar__inner">
    <a class="topbar__cj" href="https://www.customjapan.net/" target="_blank" rel="noopener" aria-label="カスタムジャパン公式サイト（メーカー）">
      <span class="topbar__cap">Manufacturer</span>
      <img src="${url('assets/images/cj-logo-h-text.svg')}" alt="Custom Japan">
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17 17 7M8 7h9v9"/></svg>
    </a>
  </div>
</div>
<header class="site-header">
  <div class="site-header__inner">
    <a class="brand" href="${HOME}">SMART<b>SERIES</b></a>
    <nav class="nav">
      <div class="nav__has-menu">
        <a href="${HOME}#series">SERIES ▾</a>
        <div class="nav__menu">${seriesMenu}</div>
      </div>
      <a href="${url('products.html')}">PRODUCT</a>
      <a href="${url('about.html')}">ABOUT</a>
      <a href="${url('support.html')}">SUPPORT</a>
      <a href="${url('news.html')}">NEWS</a>
      <a href="${url('contact.html')}">CONTACT</a>
    </nav>
    <div class="header-actions">
      <a class="cart-link" href="${url('cart.html')}" aria-label="カート">
        <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
        <span class="count" id="cart-count">0</span>
      </a>
      <button class="nav-toggle" id="nav-toggle" aria-label="メニュー">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
      </button>
    </div>
  </div>
</header>
<div class="drawer" id="drawer">
  <div class="drawer__scrim" data-close></div>
  <div class="drawer__panel">
    <button class="drawer__close" data-close aria-label="閉じる">✕</button>
    <div style="clear:both;height:8px"></div>
    ${SERIES.map((s) => `<a href="${url(`series/${s.slug}/`)}">${s.name}</a>`).join('')}
    <a href="${url('products.html')}">PRODUCT</a>
    <a href="${url('about.html')}">ABOUT</a>
    <a href="${url('support.html')}">SUPPORT</a>
    <a href="${url('faq.html')}">FAQ</a>
    <a href="${url('news.html')}">NEWS</a>
    <a href="${url('contact.html')}">CONTACT</a>
    <a href="${url('cart.html')}">CART</a>
    <a href="https://www.customjapan.net/" target="_blank" rel="noopener">CUSTOM JAPAN ↗</a>
  </div>
</div>`;

const footerHTML = `
<footer class="site-footer">
  <div class="wrap">
    <div class="footer-grid">
      <div class="footer-brand">
        <b>SMART<i>SERIES</i></b>
        <p>「ノル人をツクる」をコンセプトに、カスタムジャパンが独自開発したスマートプロダクト・シリーズ。</p>
      </div>
      <div>
        <h4>Series</h4>
        <ul>${SERIES.map((s) => `<li><a href="${url(`series/${s.slug}/`)}">${s.name}</a></li>`).join('')}
        <li><a href="${url('products.html')}">商品一覧</a></li></ul>
      </div>
      <div>
        <h4>Support</h4>
        <ul>
          <li><a href="${url('support.html')}">サポート</a></li>
          <li><a href="${url('faq.html')}">よくある質問</a></li>
          <li><a href="${url('contact.html')}">お問い合わせ</a></li>
        </ul>
      </div>
      <div>
        <h4>Company</h4>
        <ul>
          <li><a href="${url('about.html')}">ブランドについて</a></li>
          <li><a href="https://www.customjapan.net/" target="_blank" rel="noopener">Custom Japan</a></li>
          <li><a href="${url('policy.html')}">プライバシーポリシー</a></li>
        </ul>
      </div>
    </div>
    <div class="footer-bottom">
      <span>© ${'2026'} Custom Japan Co., Ltd. All rights reserved.</span>
      <span>SMART SERIES — smartseries.customjapan.net</span>
    </div>
  </div>
</footer>`;

const hEl = document.getElementById('site-header');
const fEl = document.getElementById('site-footer');
if (hEl) hEl.outerHTML = headerHTML;
if (fEl) fEl.outerHTML = footerHTML;

// mobile drawer
const drawer = document.getElementById('drawer');
document.getElementById('nav-toggle')?.addEventListener('click', () => drawer?.classList.add('open'));
drawer?.querySelectorAll('[data-close]').forEach((el) => el.addEventListener('click', () => drawer.classList.remove('open')));
