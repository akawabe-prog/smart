/* =========================================================================
   components.js — 全ページ共通のヘッダー/フッターを注入。
   <div id="site-header"></div> / <div id="site-footer"></div> に描画。
   data-root 属性でルート相対パス(サブディレクトリ対応)を渡す。
   例: <body data-root="../../"> → series/srd/ からの相対
   ========================================================================= */
import { SERIES } from './products.js?v=13';

const ROOT = document.body.getAttribute('data-root') || '';
const url = (p) => `${ROOT}${p}`;
// ルート直下ページ(data-root="")では url('') が空href=自己リロードになるため、
// ホームへのリンクは必ず "./"(ルート時) か ROOT を使う
const HOME = ROOT || './';

// SNS導線。url が空の項目は表示しない（ブランド公式ハンドルが決まり次第 url を入れる）
const SOCIAL = [
  { name: 'YouTube',   url: 'https://www.youtube.com/@CustomJapan39', icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M23 12s0-3.8-.5-5.6a2.9 2.9 0 0 0-2-2C18.7 4 12 4 12 4s-6.7 0-8.5.4a2.9 2.9 0 0 0-2 2C1 8.2 1 12 1 12s0 3.8.5 5.6a2.9 2.9 0 0 0 2 2C5.3 20 12 20 12 20s6.7 0 8.5-.4a2.9 2.9 0 0 0 2-2C23 15.8 23 12 23 12zM10 15.5v-7l6 3.5z"/></svg>' },
  { name: 'Instagram', url: 'https://www.instagram.com/customjapan/', icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg>' },
  { name: 'X',         url: 'https://x.com/39boy_thankU', icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18.9 2H22l-7.4 8.4L23 22h-6.8l-5.3-6.9L4.8 22H2l7.9-9L1.6 2h6.9l4.8 6.3zM17.7 20.1h1.7L7.4 3.8H5.6z"/></svg>' },
].filter((s) => s.url);

const seriesMenu = SERIES.map((s) => `
  <a href="${url(`series/${s.slug}/`)}">
    <span class="nav__thumb"><img src="${url(s.products[0].img)}" alt="" loading="lazy"></span>
    <span class="nav__menu-txt"><span>${s.name}</span><em>${s.tagline}</em></span>
  </a>`).join('');

const headerHTML = `
<header class="site-header">
  <div class="site-header__inner">
    <a class="brand" href="${HOME}" aria-label="Custom Japan SMART SERIES ホーム">
      <img class="brand__logo" src="${url('assets/images/cj-logo-h-black.svg')}" alt="Custom Japan">
      <span class="brand__series">SMART&nbsp;SERIES</span>
    </a>
    <nav class="nav">
      <div class="nav__has-menu">
        <a href="${url('series/')}">SERIES ▾</a>
        <div class="nav__menu">
          <a href="${url('series/')}" class="nav__menu-all"><span>シリーズ一覧</span><em>5つのシリーズをまとめて見る</em></a>
          ${seriesMenu}
        </div>
      </div>
      <a href="${url('products.html')}">PRODUCT</a>
      <a href="${url('about.html')}">ABOUT</a>
      <a href="${url('support.html')}">SUPPORT</a>
      <a href="${url('news.html')}">NEWS</a>
      <a href="https://www.customjapan.net/h/inquiry" target="_blank" rel="noopener">CONTACT</a>
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
    <a href="${url('series/')}">シリーズ一覧</a>
    ${SERIES.map((s) => `<a href="${url(`series/${s.slug}/`)}">${s.name}</a>`).join('')}
    <a href="${url('products.html')}">PRODUCT</a>
    <a href="${url('stores.html')}">取扱店・購入方法</a>
    <a href="${url('about.html')}">ABOUT</a>
    <a href="${url('support.html')}">SUPPORT</a>
    <a href="${url('faq.html')}">FAQ</a>
    <a href="${url('news.html')}">NEWS</a>
    <a href="https://www.customjapan.net/h/inquiry" target="_blank" rel="noopener">CONTACT</a>
    <a href="${url('cart.html')}">CART</a>
    <a href="https://www.customjapan.net/" target="_blank" rel="noopener">CUSTOM JAPAN ↗</a>
  </div>
</div>`;

const footerHTML = `
<footer class="site-footer">
  <div class="wrap">
    <div class="footer-grid">
      <div class="footer-brand">
        <a href="https://www.customjapan.net/" target="_blank" rel="noopener" aria-label="カスタムジャパン公式サイト"><img class="footer-logo" src="${url('assets/images/cj-logo-h-white.svg')}" alt="Custom Japan"></a>
        <span class="footer-series">SMART SERIES</span>
        <p>「ノル人をツクる」をコンセプトに、カスタムジャパンが独自開発した Smart Series（スマートシリーズ）。</p>
      </div>
      <div>
        <h4>Series</h4>
        <ul><li><a href="${url('series/')}">シリーズ一覧</a></li>
        ${SERIES.map((s) => `<li><a href="${url(`series/${s.slug}/`)}">${s.name}</a></li>`).join('')}
        <li><a href="${url('products.html')}">商品一覧</a></li></ul>
      </div>
      <div>
        <h4>Support</h4>
        <ul>
          <li><a href="${url('support.html')}">サポート</a></li>
          <li><a href="${url('guide.html')}">ご利用ガイド（配送・返品）</a></li>
          <li><a href="${url('faq.html')}">よくある質問</a></li>
          <li><a href="https://www.customjapan.net/h/inquiry" target="_blank" rel="noopener">お問い合わせ</a></li>
        </ul>
      </div>
      <div>
        <h4>Company</h4>
        <ul>
          <li><a href="${url('about.html')}">ブランドについて</a></li>
          <li><a href="${url('stores.html')}">取扱店・購入方法</a></li>
          <li><a href="https://www.customjapan.net/" target="_blank" rel="noopener">Custom Japan</a></li>
          <li><a href="${url('policy.html')}">プライバシーポリシー</a></li>
        </ul>
      </div>
    </div>
    ${SOCIAL.length ? `<div class="footer-social">
      <span class="footer-social__label">Follow</span>
      ${SOCIAL.map((s) => `<a href="${s.url}" target="_blank" rel="noopener" aria-label="${s.name}">${s.icon}</a>`).join('')}
    </div>` : ''}
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
