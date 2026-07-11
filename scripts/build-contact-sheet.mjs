#!/usr/bin/env node
/**
 * 取得済み素材(PR Times / API看板 / ローカル)をシリーズ別に一覧するコンタクトシートHTMLを生成。
 * 出力: assets/contact-sheet.html
 */
import { readdir, writeFile, readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const products = JSON.parse(await readFile(join(ROOT, 'data', 'products.json'), 'utf8'));

const SERIES = ['srd', 'carlink', 'multipump', 'portable', 'airduster'];
const SNAME = { srd: 'スマートライドダッシュボード', carlink: 'スマートカーリンク', multipump: 'スマートエアーマルチポンプ', portable: 'スマートポータブル', airduster: 'スマートエアダスター' };

async function ls(dir) {
  try { return (await readdir(join(ROOT, dir))).filter((f) => /\.(jpg|png|webp|jpeg)$/i.test(f)).sort(); }
  catch { return []; }
}

let cards = '';
for (const slug of SERIES) {
  const pt = await ls(`assets/prtimes/${slug}`);
  const local = await ls(`assets/local/${slug}`);
  const moto = await ls(`assets/motomegane/${slug}`);
  const mains = (products.series[slug]?.products || []).map((p) => ({ id: p.id, name: p.name, price: p.price, file: `assets/products/${p.id}/main.jpg` }));

  const tile = (src, cap) => `<figure><img loading="lazy" src="${src}"><figcaption>${cap}</figcaption></figure>`;
  cards += `<section><h2>${SNAME[slug]} <small>(${slug})</small></h2>`;
  cards += `<h3>API看板 (メインPDP ${mains.length})</h3><div class="grid">${mains.map((m) => tile(m.file, `${m.id}<br>${m.name}<br>¥${m.price ?? '-'}`)).join('')}</div>`;
  cards += `<h3>PR Times (${pt.length})</h3><div class="grid">${pt.map((f) => tile(`assets/prtimes/${slug}/${f}`, f)).join('')}</div>`;
  if (moto.length) cards += `<h3>motomegane レビュー (${moto.length})</h3><div class="grid">${moto.map((f) => tile(`assets/motomegane/${slug}/${f}`, f)).join('')}</div>`;
  if (local.length) cards += `<h3>ローカル素材 (${local.length})</h3><div class="grid">${local.map((f) => tile(`assets/local/${slug}/${f}`, f)).join('')}</div>`;
  cards += `</section>`;
}

const html = `<!doctype html><html lang="ja"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Smart Series 素材コンタクトシート</title>
<style>
body{font-family:-apple-system,"Hiragino Kaku Gothic ProN",sans-serif;margin:0;background:#0f1115;color:#e8eaed}
header{padding:24px 32px;border-bottom:1px solid #2a2e37}
h1{margin:0;font-size:20px}h2{margin:8px 0;font-size:18px;color:#ffd54a}h3{margin:18px 0 8px;font-size:13px;color:#9aa0aa;font-weight:600}
small{color:#6b7280;font-weight:400}
section{padding:20px 32px;border-bottom:1px solid #1c1f26}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:10px}
figure{margin:0;background:#171a21;border:1px solid #262a33;border-radius:8px;overflow:hidden}
img{width:100%;height:120px;object-fit:contain;background:#fff;display:block}
figcaption{padding:6px 8px;font-size:10px;line-height:1.35;color:#aeb4be;word-break:break-all}
</style></head><body>
<header><h1>Smart Series 素材コンタクトシート</h1><p style="color:#9aa0aa;margin:6px 0 0;font-size:13px">API看板 + PR Times + ローカル素材。ページ制作のヒーロー/セクション画像選定用。</p></header>
${cards}</body></html>`;

await writeFile(join(ROOT, 'assets', 'contact-sheet.html'), html);
console.log('wrote assets/contact-sheet.html');
