#!/usr/bin/env bash
# build-deploy.sh — 作業コピーから本番アップロード用 smartseries/ を生成する。
# 本番: https://smartseries.customjapan.net （eXs と同じ拡張子なしキー配信。
#       /series/srd/ のようなディレクトリURLは 404 になるため、eXs 本番と同じ
#       「フラット .html + クリーンURLリンク」構成に変換する。アップロード時に
#       .html 拡張子を除去してキー登録する運用も eXs と同一）
#   1) HTML同期 + ネスト(index.html)のフラット化 (series/srd/index.html → series/srd.html)
#   2) リンク書き換え（ルート絶対クリーンURL化・data-root="/"・インラインJS）
#   3) JS書き換え（components/products 等の .html / 末尾スラッシュ除去）
#   4) 参照アセットのみ同期（未使用の画像・動画は含めない）
#   5) 画像・動画の軽量化
#   6) sitemap.xml / robots.txt 生成
# 依存: python3 (+Pillow任意), ffmpeg任意。 実行: bash scripts/build-deploy.sh
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
DEST="smartseries"
DOMAIN="https://smartseries.customjapan.net"

echo "[1/6] HTML同期・フラット化・リンク書き換え"
rm -rf "$DEST"
mkdir -p "$DEST/series" "$DEST/product"

python3 - "$ROOT" "$DEST" "$DOMAIN" << 'PY'
import os, re, sys, shutil, glob
root, dest, domain = sys.argv[1], sys.argv[2], sys.argv[3]

# ---- ページマップ: 元パス → (出力パス, 元のURLディレクトリ, クリーンURL) ----
pages = {}
for f in glob.glob(os.path.join(root, "*.html")):
    b = os.path.basename(f)
    if b in ("contact.html", "cart.html"):  # 旧フォーム/自前カート: 本番はCJカートへ遷移のため除外
        continue
    clean = "/" if b == "index.html" else "/" + b[:-5]
    pages[f] = (os.path.join(dest, b), "", clean)
pages[os.path.join(root, "series/index.html")] = (os.path.join(dest, "series.html"), "series/", "/series")
for slug in ["srd", "carlink", "multipump", "portable", "airduster"]:
    pages[os.path.join(root, f"series/{slug}/index.html")] = (
        os.path.join(dest, f"series/{slug}.html"), f"series/{slug}/", f"/series/{slug}")
for slug in ["srd-5", "srd-5-basic", "srd-5-pro", "srd-5-slim"]:
    pages[os.path.join(root, f"product/{slug}/index.html")] = (
        os.path.join(dest, f"product/{slug}.html"), f"product/{slug}/", f"/product/{slug}")

# ---- ディレクトリURL → フラットURL の対応 ----
DIRMAP = {"/series/": "/series"}
for slug in ["srd", "carlink", "multipump", "portable", "airduster"]:
    DIRMAP[f"/series/{slug}/"] = f"/series/{slug}"
for slug in ["srd-5", "srd-5-basic", "srd-5-pro", "srd-5-slim"]:
    DIRMAP[f"/product/{slug}/"] = f"/product/{slug}"

def resolve(base_dir, url):
    """相対URLを元ページ位置で解決し、サイト絶対パスに"""
    path = os.path.normpath(os.path.join("/", base_dir, url))
    if url.endswith("/") and not path.endswith("/"):
        path += "/"
    return path.replace("//", "/")

def clean_path(p):
    """サイト絶対パスをクリーンURLへ（?クエリ・#フラグメントは保持）"""
    q = ""
    if "#" in p:
        p, q = p.split("#", 1); q = "#" + q
    if "?" in p:
        p, q2 = p.split("?", 1); q = "?" + q2 + q
    if p in DIRMAP: return DIRMAP[p] + q
    if p.endswith("/index.html"): p = p[:-10]  # → ディレクトリ
    if p in DIRMAP: return DIRMAP[p] + q
    if p == "/index.html" or p == "/index": p = "/"
    if p.endswith(".html"): p = p[:-5]
    return (p or "/") + q

ATTR = re.compile(r'((?:href|src|poster|data-src)=")([^"#][^"]*)(")')
def rewrite_attr(m, base_dir):
    pre, url, post = m.group(1), m.group(2), m.group(3)
    if re.match(r'^(https?:|mailto:|tel:|//|#|data:)', url):
        return m.group(0)
    if "${" in url:  # テンプレートはJSパスで処理
        return m.group(0)
    return pre + clean_path(resolve(base_dir, url)) + post

for src, (out, base_dir, clean) in sorted(pages.items()):
    s = open(src, encoding="utf-8").read()
    # 1) 属性の書き換え（元位置基準で解決 → クリーンURL）
    s = ATTR.sub(lambda m: rewrite_attr(m, base_dir), s)
    # 2) data-root はルート絶対に
    s = re.sub(r'data-root="[^"]*"', 'data-root="/"', s)
    # 3) インラインJSのパス文字列
    s = re.sub(r"""(['"`])(?:\.\./|\./)*assets/""", r"\1/assets/", s)       # import等
    s = s.replace("'../../product/", "'/product/")                            # cross-sell
    s = re.sub(r"'\.\./([a-z0-9-]+)/'", r"'/series/\1'", s)                  # 同階層シリーズ
    s = s.replace('href="${s.slug}/"', 'href="/series/${s.slug}"')           # series.html 行
    s = s.replace('href="../${m.slug}/"', 'href="/product/${m.slug}"')       # 他モデル
    s = s.replace('href="../../product/${m.slug}/"', 'href="/product/${m.slug}"')
    s = s.replace('`series/${s.slug}/`', '`series/${s.slug}`')               # url() 内
    s = s.replace('href="series/${s.slug}/"', 'href="/series/${s.slug}"')    # TOP/aboutタイル
    s = s.replace('href="product/${', 'href="/product/${')
    # 4) <video src> → <source type="video/mp4">（運用マニュアル 2.4）
    s = re.sub(r'<video([^>]*?)\s+src="([^"]+\.mp4)"([^>]*)>',
               r'<video\1\3><source src="\2" type="video/mp4">', s)
    open(out, "w", encoding="utf-8").write(s)
print(f"pages: {len(pages)}")

# ---- JS/CSS を同期して書き換え ----
shutil.copytree(os.path.join(root, "assets/js"), os.path.join(dest, "assets/js"))
shutil.copytree(os.path.join(root, "assets/css"), os.path.join(dest, "assets/css"))
shutil.copytree(os.path.join(root, "assets/vendor"), os.path.join(dest, "assets/vendor"))
for f in glob.glob(os.path.join(dest, "assets/js", "**", "*.js"), recursive=True):
    s = open(f, encoding="utf-8").read(); o = s
    o = re.sub(r"'([a-z0-9-]+)\.html'", r"'\1'", o)          # url('about.html')→url('about')
    o = o.replace("`series/${s.slug}/`", "`series/${s.slug}`")
    o = o.replace("url('series/')", "url('series')")
    o = re.sub(r"'(series|product)/([a-z0-9-]+)/'", r"'\1/\2'", o)  # products.js href
    if o != s: open(f, "w", encoding="utf-8").write(o)

# ---- 参照アセットのみ同期 ----
refs = set()
scan = glob.glob(os.path.join(dest, "*.html")) + \
       glob.glob(os.path.join(dest, "*/*.html")) + \
       glob.glob(os.path.join(dest, "assets/js/**/*.js"), recursive=True) + \
       glob.glob(os.path.join(dest, "assets/css/*.css"))
rx = re.compile(r"assets/[A-Za-z0-9_\-./]+?\.(?:jpe?g|png|webp|svg|gif|mp4|ico)")
for f in scan:
    for mt in rx.findall(open(f, encoding="utf-8").read()):
        refs.add(mt)
copied = 0
for r in sorted(refs):
    src_f = os.path.join(root, r)
    if not os.path.exists(src_f):
        print("  [警告] 参照切れ:", r); continue
    dst_f = os.path.join(dest, r)
    os.makedirs(os.path.dirname(dst_f), exist_ok=True)
    shutil.copy2(src_f, dst_f); copied += 1
print(f"assets: {copied} files (参照ベース)")

# ---- 残留 .html 参照の監査 ----
bad = []
for f in glob.glob(os.path.join(dest, "**", "*.html"), recursive=True):
    s = open(f, encoding="utf-8").read()
    for m in re.finditer(r'(?:href|src)="([^"]*\.html[^"]*)"', s):
        bad.append((f, m.group(1)))
for f in glob.glob(os.path.join(dest, "assets/js/**/*.js"), recursive=True):
    s = open(f, encoding="utf-8").read()
    for m in re.finditer(r"'[a-z0-9-]+\.html'", s):
        bad.append((f, m.group(0)))
if bad:
    print("[警告] .html 参照が残っています:")
    for f, u in bad: print("  ", f, u)
else:
    print("audit: .html 参照なし ✓")
PY

echo "[2/6] sitemap.xml / robots.txt"
python3 - "$DEST" "$DOMAIN" << 'PY'
import sys, datetime
dest, domain = sys.argv[1], sys.argv[2]
urls = ["/", "/about", "/products", "/stores", "/guide", "/support", "/faq",
        "/news", "/policy", "/series"]
urls += [f"/series/{s}" for s in ["srd","carlink","multipump","portable","airduster"]]
urls += [f"/product/{s}" for s in ["srd-5","srd-5-basic","srd-5-pro","srd-5-slim"]]
today = datetime.date.today().isoformat()
items = "\n".join(
    f"  <url><loc>{domain}{u}</loc><lastmod>{today}</lastmod></url>" for u in urls)
open(f"{dest}/sitemap.xml", "w").write(
    f'<?xml version="1.0" encoding="UTF-8"?>\n'
    f'<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n{items}\n</urlset>\n')
open(f"{dest}/robots.txt", "w").write(
    f"User-agent: *\nAllow: /\n\nSitemap: {domain}/sitemap.xml\n")
print("sitemap:", len(urls), "URLs")
PY

echo "[3/6] 画像最適化（JPG: 最大1600px/q82・PNG再圧縮）"
python3 - "$DEST/assets" << 'PY' || echo "  (Pillow なしのためスキップ)"
import os, sys, glob
from PIL import Image, ImageOps
root = sys.argv[1]; MAX = 1600; Q = 82
for f in glob.glob(root + "/**/*", recursive=True):
    lf = f.lower()
    try:
        if lf.endswith(('.jpg', '.jpeg')):
            b = os.path.getsize(f)
            with Image.open(f) as im:
                w, h = im.size
                if max(w, h) <= MAX and b <= 180_000: continue
                im = ImageOps.exif_transpose(im).convert("RGB")
                if max(w, h) > MAX:
                    s = MAX / max(w, h); im = im.resize((round(w*s), round(h*s)), Image.LANCZOS)
                im.save(f, "JPEG", quality=Q, optimize=True, progressive=True)
        elif lf.endswith('.png') and os.path.getsize(f) >= 80_000:
            with Image.open(f) as im: im.copy().save(f, "PNG", optimize=True)
    except Exception as e: print("img skip", f, e)
PY

echo "[4/6] 動画最適化（H.264 CRF26 / faststart / 無音）"
if command -v ffmpeg >/dev/null; then
  while IFS= read -r f; do
    tmp="${f%.mp4}.__opt.mp4"; b=$(stat -f%z "$f")
    ffmpeg -nostdin -y -loglevel error -i "$f" -c:v libx264 -crf 26 -preset medium \
      -vf "scale='min(1280,iw)':-2" -an -movflags +faststart -pix_fmt yuv420p "$tmp" </dev/null || { rm -f "$tmp"; continue; }
    if [ -f "$tmp" ] && [ "$(stat -f%z "$tmp")" -lt "$b" ]; then mv -f "$tmp" "$f"; else rm -f "$tmp"; fi
  done < <(find "$DEST/assets" -iname '*.mp4')
else
  echo "  (ffmpeg なしのためスキップ)"
fi

echo "[5/6] 掃除"
find "$DEST" -name .DS_Store -delete 2>/dev/null || true

echo "[6/6] 完了"
du -sh "$DEST"
echo "→ $DEST/ をアップロードしてください（eXs と同じく .html 拡張子を除去してキー登録）"
