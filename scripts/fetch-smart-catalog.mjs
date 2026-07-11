#!/usr/bin/env node
/**
 * Smart Series (Custom Japan maker=126) カタログ取得
 * 方式は ASMAX_ReBranding/scripts/fetch-cj-asmax.mjs と同一 (eXs方式):
 *   1. api-i /init (Origin 必須) → guid/authorization/cid cookie
 *   2. api-a Algolia プロキシ → maker.id:126 全件
 *   3. img.customjapan.net/items/{id}_1.jpg(看板大) / {id}_s.jpg(サムネ)
 * 出力:
 *   data/raw/algolia-126.json        … 生レスポンス
 *   data/catalog-smart.json          … 正規化カタログ(シリーズ別グループ含む)
 *   assets/products/{id}/main.jpg    … 看板画像(大)
 *   assets/products/{id}/thumb.jpg   … サムネ
 * 使い方: node scripts/fetch-smart-catalog.mjs
 */
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const MAKER_ID = '126'; // Custom Japan (Smart Series)
const ORIGIN = 'https://www.customjapan.net';
const INIT_URL = 'https://api-i.customjapan.net/api/v1/init';
const ALGOLIA_URL = 'https://api-a.customjapan.net/1/indexes/*/queries';
const IMG_BASE = 'https://img.customjapan.net/items';

// series ID → slug (STRUCTURE.md 準拠)
const SERIES_SLUG = {
  '1261010': 'srd',
  '1261015': 'carlink',
  '1261020': 'multipump',
  '1261030': 'portable',
  '1261040': 'airduster',
};

async function authenticate() {
  const res = await fetch(INIT_URL, { method: 'GET', headers: { Origin: ORIGIN, 'x-site': 'ec' } });
  if (!res.ok) throw new Error(`init failed: HTTP ${res.status}`);
  const setCookies = res.headers.getSetCookie?.() ?? [];
  const cookie = setCookies.map((c) => c.split(';')[0]).join('; ');
  if (!cookie.includes('guid=')) throw new Error('init: no auth cookies returned');
  console.log('✓ init OK');
  return cookie;
}

async function fetchAllHits(cookie) {
  const body = {
    requests: [{
      indexName: 'item',
      params: {
        query: '',
        facetFilters: [[`maker.id:${MAKER_ID}`]],
        hitsPerPage: 1000,
        attributesToHighlight: [],
        facets: ['category.name', 'category.tree.lvl0', 'series.id', 'series.name'],
      },
    }],
  };
  const res = await fetch(ALGOLIA_URL, {
    method: 'POST',
    headers: { Origin: ORIGIN, 'Content-Type': 'application/json', Cookie: cookie },
    body: JSON.stringify(body),
  });
  const json = await res.json();
  if (json.result === 'error') throw new Error(`algolia: ${JSON.stringify(json.errors)}`);
  const r = json.results[0];
  await mkdir(join(ROOT, 'data', 'raw'), { recursive: true });
  await writeFile(join(ROOT, 'data', 'raw', `algolia-${MAKER_ID}.json`), JSON.stringify(json, null, 2));
  console.log(`✓ ${r.nbHits} 件の商品を取得`);
  return r.hits;
}

function seriesInfo(h) {
  // series はオブジェクト or 配列の可能性があるため両対応
  const s = Array.isArray(h.series) ? h.series[0] : h.series;
  const id = s?.id != null ? String(s.id) : null;
  return { id, name: s?.name ?? null, slug: id ? (SERIES_SLUG[id] ?? null) : null };
}

function normalize(h) {
  const price = h.price?.regular?.pc ?? {};
  const s = seriesInfo(h);
  return {
    id: h.objectID,
    name: h.name ?? '',
    maker: h.maker?.nameMain ?? h.maker?.name ?? 'Custom Japan',
    seriesId: s.id,
    seriesName: s.name,
    seriesSlug: s.slug,
    category: h.category?.name ?? null,
    price: { taxIn: price.taxIn ?? null, taxEx: price.taxEx ?? null },
    status: h.status ?? null,
    jan: h.jan ?? null,
    makerNo: h.makerNo?.origin ?? null,
    color: h.color?.main?.value ?? null,
    img: { s: h.img?.s ?? null, l: h.img?.l ?? null },
    url: `https://www.customjapan.net/item/${h.objectID}`,
  };
}

async function downloadImage(url, dest) {
  const res = await fetch(url, { headers: { Origin: ORIGIN } });
  if (!res.ok) return false;
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length < 1000) return false; // プレースホルダ除外
  await writeFile(dest, buf);
  return true;
}

const cookie = await authenticate();
const hits = await fetchAllHits(cookie);
const catalog = hits.map(normalize);

let ok = 0, ng = 0;
for (const p of catalog) {
  const dir = join(ROOT, 'assets', 'products', p.id);
  await mkdir(dir, { recursive: true });
  const gotMain = await downloadImage(p.img.l?.startsWith('http') ? p.img.l : `${IMG_BASE}/${p.id}_1.jpg`, join(dir, 'main.jpg'));
  const gotThumb = await downloadImage(p.img.s?.startsWith('http') ? p.img.s : `${IMG_BASE}/${p.id}_s.jpg`, join(dir, 'thumb.jpg'));
  p.localMain = gotMain ? `assets/products/${p.id}/main.jpg` : null;
  p.localThumb = gotThumb ? `assets/products/${p.id}/thumb.jpg` : null;
  gotMain ? ok++ : ng++;
  console.log(`${gotMain ? '✓' : '✗'} [${p.seriesSlug ?? '—'}] ${p.id} ${p.name} ¥${p.price.taxIn ?? '-'}`);
}

// シリーズ別グループ
const bySeries = {};
for (const p of catalog) {
  const key = p.seriesSlug ?? p.seriesId ?? 'unknown';
  (bySeries[key] ??= []).push({ id: p.id, name: p.name, price: p.price.taxIn, status: p.status });
}

await writeFile(join(ROOT, 'data', 'catalog-smart.json'), JSON.stringify({ catalog, bySeries }, null, 2));
console.log(`\n完了: 看板画像 ${ok} 件DL / 失敗 ${ng} 件 → data/catalog-smart.json`);
console.log('シリーズ別件数:', Object.fromEntries(Object.entries(bySeries).map(([k, v]) => [k, v.length])));
