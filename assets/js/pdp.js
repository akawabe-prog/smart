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

initApiClient();
wireAddToCart();
wireGallery();
refreshCartCount();
