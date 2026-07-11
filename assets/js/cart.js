/* =========================================================================
   cart.js — /cart.html 専用。eXs cart-page.js の smart 簡約版。
   fetchCart → 明細描画 / 数量変更 / 削除 / 合計。
   商品名・画像は products.js を優先し、無ければ API の item 情報へフォールバック。
   購入手続きは customjapan.net のカートへ（認証Cookieは同一ドメイン系で共有）。
   ========================================================================= */
import { initApiClient, init, fetchCart, deleteCartItem } from './api-client.js';
import { CartApiRequester } from './services/cart-api-requester.js';
import { ProductApiRequester } from './services/product-api-requester.js';
import { productById } from './products.js';

const listEl = document.getElementById('cart-list');
const totalEl = document.getElementById('cart-total');
const countEl = document.getElementById('cart-count');
const emptyEl = document.getElementById('cart-empty');
const summaryEl = document.getElementById('cart-summary');

const yen = (n) => `¥${Number(n || 0).toLocaleString('ja-JP')}`;

// APIのitem情報から税込価格を取れる範囲で拾う（api-price-display 簡約）
const apiPrice = (raw) => {
  const p = raw?.price || {};
  const cands = [p.regular?.pc?.taxIn, p.taxIn, raw?.priceTaxIn, raw?.sellingPrice, typeof raw?.price === 'number' ? raw.price : null];
  for (const v of cands) { const n = Number(v); if (Number.isFinite(n) && n > 0) return n; }
  return null;
};

let cartDetails = [];      // APIの明細（削除・数量変更にそのまま返す）
const itemInfo = new Map(); // id -> {name, price, img}

async function loadItemInfo(ids) {
  // products.js に無いIDのみAPIへ
  const missing = ids.filter((id) => !productById(id) && !itemInfo.has(id));
  if (missing.length === 0) return;
  try {
    const payload = await ProductApiRequester.fetchItems(missing);
    const arr = payload?.data || payload?.items || (Array.isArray(payload) ? payload : []);
    arr.forEach((it) => {
      const raw = it?.item || it;
      const id = String(raw?.id || raw?.itemId || '').trim();
      if (id) itemInfo.set(id, { name: raw?.name || `商品 ${id}`, price: apiPrice(raw), img: null });
    });
  } catch (e) { console.warn('[cart] item info fetch failed', e); }
}

function resolve(id, detail) {
  const local = productById(id);
  if (local) return { name: local.name, price: detail?.price ?? local.price, img: local.img };
  const api = itemInfo.get(id);
  return { name: api?.name || `商品 ${id}`, price: detail?.price ?? api?.price ?? 0, img: api?.img };
}

function detailId(d) { return String(d?.id ?? d?.itemId ?? d?.productId ?? '').trim(); }
function detailQty(d) { return Number(d?.quantity ?? d?.qty ?? 1); }
function detailPrice(d) { return apiPrice(d) ?? apiPrice(d?.item) ?? null; }

function render() {
  if (!cartDetails.length) {
    emptyEl.style.display = '';
    listEl.innerHTML = '';
    summaryEl.style.display = 'none';
    countEl.textContent = '0点';
    return;
  }
  emptyEl.style.display = 'none';
  summaryEl.style.display = '';

  let total = 0, count = 0;
  listEl.innerHTML = cartDetails.map((d, i) => {
    const id = detailId(d);
    const qty = detailQty(d);
    const info = resolve(id, { price: detailPrice(d) });
    const line = (info.price || 0) * qty;
    total += line; count += qty;
    return `
    <div class="cart-row" data-index="${i}">
      <div class="cr-media">${info.img ? `<img src="${info.img}" alt="">` : `<div class="cr-noimg">IMG</div>`}</div>
      <div class="cr-body">
        <div class="cr-name">${info.name}</div>
        <div class="cr-unit">${info.price ? yen(info.price) : '価格はレジで確定'} <span>/ 個</span></div>
      </div>
      <div class="qty">
        <button type="button" data-act="dec">−</button>
        <input type="number" value="${qty}" min="1" data-act="qty" inputmode="numeric">
        <button type="button" data-act="inc">＋</button>
      </div>
      <div class="cr-line">${line ? yen(line) : '—'}</div>
      <button class="cr-del" data-act="del" aria-label="削除">✕</button>
    </div>`;
  }).join('');

  totalEl.textContent = yen(total);
  countEl.textContent = `${count}点`;
}

async function reload() {
  const cart = await fetchCart();
  cartDetails = cart?.details || cart?.items || [];
  await loadItemInfo(cartDetails.map(detailId).filter(Boolean));
  render();
}

async function changeQty(index, qty) {
  const d = cartDetails[index];
  if (!d) return;
  try {
    await CartApiRequester.changeCartDetailQuantity([{ ...d, quantity: Math.max(1, qty) }]);
  } catch (e) { console.error('[cart] qty change failed', e); }
  await reload();
}

async function removeRow(index) {
  const d = cartDetails[index];
  if (!d) return;
  try { await deleteCartItem([d]); } catch (e) { console.error('[cart] delete failed', e); }
  await reload();
}

listEl.addEventListener('click', (e) => {
  const btn = e.target.closest('[data-act]');
  if (!btn) return;
  const row = btn.closest('.cart-row');
  const i = Number(row.dataset.index);
  const input = row.querySelector('[data-act=qty]');
  if (btn.dataset.act === 'inc') changeQty(i, Number(input.value) + 1);
  if (btn.dataset.act === 'dec') changeQty(i, Number(input.value) - 1);
  if (btn.dataset.act === 'del') removeRow(i);
});
listEl.addEventListener('change', (e) => {
  if (e.target.dataset.act !== 'qty') return;
  const i = Number(e.target.closest('.cart-row').dataset.index);
  changeQty(i, Number(e.target.value));
});

(async () => {
  initApiClient();
  try {
    await init();
    await reload();
  } catch (e) {
    console.warn('[cart] init failed（本番ドメインで解決）', e);
    emptyEl.style.display = '';
    summaryEl.style.display = 'none';
    document.getElementById('cart-note').textContent = 'カート情報を取得できませんでした。時間をおいて再度お試しください。';
  }
})();
