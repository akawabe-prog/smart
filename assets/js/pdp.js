/* =========================================================================
   pdp.js — PDP共通: カート投入 + カート件数バッジ + 画像ギャラリー。
   マークアップ規約:
     - 追加ボタン: <button data-add-to-cart data-product-id="ID">…</button>
     - 数量:       <input data-qty type="number" value="1">   (任意)
     - ギャラリー: <div data-gallery> 内に <img data-main> と
                   <button data-thumb data-src="..."> 群 (任意)
   価格表示は api-price-display.js が [data-api-price-item-id] を処理。
   ========================================================================= */
import { initApiClient, init, addItemsToCart, fetchCart } from './api-client.js';

const SITE = 'smart';

/* ---- cart count badge ---- */
async function refreshCartCount() {
  const el = document.getElementById('cart-count');
  if (!el) return;
  try {
    const cart = await fetchCart();
    const n = (cart?.details || cart?.items || []).reduce((a, d) => a + Number(d.quantity || d.qty || 1), 0);
    if (n > 0) { el.textContent = n; el.classList.add('show'); }
    else el.classList.remove('show');
  } catch { /* 未認証/CORS時は無視 */ }
}

/* ---- add to cart ---- */
function wireAddToCart() {
  document.querySelectorAll('[data-add-to-cart]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const id = btn.dataset.productId;
      if (!id) return;
      const qtyEl = document.querySelector('[data-qty]');
      const quantity = Math.max(1, Number(qtyEl?.value || 1));

      const original = btn.innerHTML;
      btn.disabled = true;
      btn.dataset.state = 'loading';
      btn.innerHTML = '<span class="spin"></span> 追加中…';

      try {
        await addItemsToCart([{ id, quantity, site: SITE }]);
        btn.dataset.state = 'done';
        btn.innerHTML = '✓ カートに追加しました';
        await refreshCartCount();
        setTimeout(() => { btn.innerHTML = original; btn.disabled = false; btn.dataset.state = ''; }, 2200);
      } catch (e) {
        console.error('[pdp] add to cart failed', e);
        btn.dataset.state = 'error';
        btn.innerHTML = '追加に失敗しました。再試行';
        setTimeout(() => { btn.innerHTML = original; btn.disabled = false; btn.dataset.state = ''; }, 2600);
      }
    });
  });
}

/* ---- gallery ---- */
function wireGallery() {
  const g = document.querySelector('[data-gallery]');
  if (!g) return;
  const main = g.querySelector('[data-main]');
  g.querySelectorAll('[data-thumb]').forEach((t) => {
    t.addEventListener('click', () => {
      main.src = t.dataset.src;
      g.querySelectorAll('[data-thumb]').forEach((x) => x.classList.remove('is-active'));
      t.classList.add('is-active');
    });
  });
}

/* ---- 安心情報バー（配送・支払・保証・返品）を購入ブロックに注入 ---- */
function injectTrustBar() {
  const buy = document.querySelector('.buy');
  if (!buy || buy.querySelector('.buy__trust')) return;
  const ROOT = document.body.dataset.root || '';
  const ic = {
    ship: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M1 3h13v11H1zM14 7h4l3 3v4h-6M4 18a2 2 0 1 0 4 0M15 18a2 2 0 1 0 4 0"/></svg>',
    pay: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/></svg>',
    warranty: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>',
    return: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M3 7v6h6M3 13a9 9 0 1 0 3-7.7L3 8"/></svg>',
  };
  const row = document.createElement('div');
  row.className = 'buy__trust';
  row.innerHTML = `
    <a href="${ROOT}guide.html">${ic.ship}配送・送料</a>
    <a href="${ROOT}guide.html">${ic.pay}お支払い</a>
    <a href="${ROOT}support.html">${ic.warranty}メーカー保証</a>
    <a href="${ROOT}guide.html">${ic.return}返品・交換</a>`;
  buy.appendChild(row);
}

initApiClient();
wireAddToCart();
wireGallery();
injectTrustBar();
refreshCartCount();
