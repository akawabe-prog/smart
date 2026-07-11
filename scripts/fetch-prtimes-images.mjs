#!/usr/bin/env node
/**
 * PR Times (company_id=70755 カスタムジャパン) の各リリースから製品/ライフスタイル画像を取得。
 * 画像は prcdn.freetls.fastly.net/release_image/70755/{release}/... 形式。
 * 同一hashで複数サイズがある場合は最大幅のみ採用。
 * 出力: assets/prtimes/{slug}/{release}_{nn}.{ext}
 * 使い方: node scripts/fetch-prtimes-images.mjs
 */
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36';

// release番号 → シリーズslug（1シリーズに複数リリース可）
const RELEASES = [
  { release: '43', slug: 'srd',       label: 'SRD 5' },
  { release: '54', slug: 'srd',       label: 'SRD 5 Basic' },
  { release: '59', slug: 'srd',       label: 'SRD 5 Pro' },
  { release: '68', slug: 'srd',       label: 'SRD 5 Slim' },
  { release: '84', slug: 'carlink',   label: 'スマートカーリンク' },
  { release: '70', slug: 'portable',  label: 'スマートポータブル01 高圧洗浄機' },
  { release: '53', slug: 'multipump', label: 'スマートエアーマルチポンプ' },
];
const COMPANY = '70755';

async function fetchHtml(release) {
  const url = `https://prtimes.jp/main/html/rd/p/000000${release.padStart(3, '0')}.000070755.html`;
  const res = await fetch(url, { headers: { 'User-Agent': UA } });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res.text();
}

// hash → {width, url, ext} 最大幅を保持
function extractImages(html, release) {
  const re = new RegExp(`https://prcdn\\.freetls\\.fastly\\.net/release_image/${COMPANY}/${release}/${COMPANY}-${release}-([a-f0-9]+)-(\\d+)x(\\d+)\\.(jpg|jpeg|png|webp)`, 'g');
  const best = new Map();
  let m;
  while ((m = re.exec(html)) !== null) {
    const [url, hash, w, , ext] = m;
    const width = Number(w);
    const cur = best.get(hash);
    if (!cur || width > cur.width) best.set(hash, { width, url, ext });
  }
  // 小さいサムネ(<600px)は除外、掲載順を維持
  return [...best.values()].filter((x) => x.width >= 600);
}

async function download(url, dest) {
  const res = await fetch(url, { headers: { 'User-Agent': UA } });
  if (!res.ok) return false;
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length < 2000) return false;
  await writeFile(dest, buf);
  return true;
}

const manifest = {};
for (const { release, slug, label } of RELEASES) {
  const html = await fetchHtml(release);
  const imgs = extractImages(html, release);
  const dir = join(ROOT, 'assets', 'prtimes', slug);
  await mkdir(dir, { recursive: true });
  let n = 0;
  const saved = [];
  for (const img of imgs) {
    n += 1;
    const fname = `${release}_${String(n).padStart(2, '0')}.${img.ext === 'jpeg' ? 'jpg' : img.ext}`;
    const ok = await download(img.url, join(dir, fname));
    if (ok) saved.push({ file: `assets/prtimes/${slug}/${fname}`, width: img.width, src: img.url });
    console.log(`${ok ? '✓' : '✗'} [${slug}] ${label} ${fname} (${img.width}px)`);
  }
  (manifest[slug] ??= []).push({ release, label, images: saved });
}

await writeFile(join(ROOT, 'data', 'prtimes-images.json'), JSON.stringify(manifest, null, 2));
const total = Object.values(manifest).flat().reduce((a, r) => a + r.images.length, 0);
console.log(`\n完了: ${total} 枚DL → data/prtimes-images.json`);
