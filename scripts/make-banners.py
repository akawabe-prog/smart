#!/usr/bin/env python3
"""customjapan.net 掲載用 シリーズ誘導バナー(1200×630)を banners/ に生成する。
黒×ゴールドのブランドトーン + 白カードの商品画像 + CustomJapanロゴ(白チップ)。
依存: Pillow。ロゴPNGは qlmanage で事前変換(引数1: 黒ロゴPNG)。
実行: python3 scripts/make-banners.py <cj-logo-h-black.png>
"""
import os, sys
from PIL import Image, ImageDraw, ImageFilter, ImageFont

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "banners")
os.makedirs(OUT, exist_ok=True)

W, H = 1200, 630
BG = (10, 10, 11)
GOLD = (200, 162, 78)
WHITE = (255, 255, 255)
SOFT = (212, 214, 218)
MUTED = (154, 156, 161)

EN_FONT = "/System/Library/Fonts/HelveticaNeue.ttc"
JP_FONT = "/System/Library/Fonts/ヒラギノ角ゴシック W6.ttc"

def font_en(size, bold=True):
    # HelveticaNeue.ttc: index 1 = Bold 系を探す
    for idx in ([1, 8, 0] if bold else [0]):
        try:
            f = ImageFont.truetype(EN_FONT, size, index=idx)
            if not bold or "Bold" in f.getname()[1] or idx != 0:
                return f
        except Exception:
            continue
    return ImageFont.truetype(EN_FONT, size)

def font_jp(size):
    return ImageFont.truetype(JP_FONT, size)

def tracked(draw, xy, text, font, fill, tracking=0):
    """簡易レタースペーシング描画。最終x座標を返す"""
    x, y = xy
    for ch in text:
        draw.text((x, y), ch, font=font, fill=fill)
        x += draw.textlength(ch, font=font) + tracking
    return x

def rounded(size, radius, color):
    im = Image.new("RGBA", size, (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    d.rounded_rectangle([0, 0, size[0] - 1, size[1] - 1], radius=radius, fill=color)
    return im

SERIES = [
    dict(slug="srd",       en=["Smart Ride", "Dashboard"], ja="スマートライドダッシュボード",
         tag="バイク用スマートモニター", img="assets/products/28002239/main.jpg"),
    dict(slug="carlink",   en=["Smart", "Car Link"], ja="スマートカーリンク",
         tag="CarPlay / Android Auto アダプター", img="assets/products/29290741/main.jpg"),
    dict(slug="multipump", en=["Smart Air", "Multi Pump"], ja="スマートエアーマルチポンプ",
         tag="バイク特化の電動エアーポンプ", img="assets/products/28089018/main.jpg"),
    dict(slug="portable",  en=["Smart", "Portable"], ja="スマートポータブル",
         tag="ポータブル高圧洗浄機", img="assets/products/29465934/main.jpg"),
    dict(slug="airduster", en=["Smart", "Air Duster"], ja="スマートエアダスター",
         tag="コードレスエアダスター", img="assets/products/29290758/main.jpg"),
]

# ロゴ(黒・白背景レンダリング)をトリミング
logo_src = Image.open(sys.argv[1]).convert("RGBA")
bbox = logo_src.convert("L").point(lambda v: 255 if v < 245 else 0).getbbox()
logo = logo_src.crop(bbox)

for s in SERIES:
    im = Image.new("RGB", (W, H), BG)

    # 右上にゴールドのグロー
    glow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    gd = ImageDraw.Draw(glow)
    gd.ellipse([W - 560, -260, W + 240, 320], fill=GOLD + (46,))
    glow = glow.filter(ImageFilter.GaussianBlur(120))
    im.paste(Image.alpha_composite(im.convert("RGBA"), glow).convert("RGB"), (0, 0))
    d = ImageDraw.Draw(im)

    # 上辺のゴールドライン
    d.rectangle([0, 0, W, 4], fill=GOLD)

    # 白カード + 商品画像(右)
    card_x, card_y, card_s = 730, 130, 400
    shadow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    sd = ImageDraw.Draw(shadow)
    sd.rounded_rectangle([card_x + 8, card_y + 18, card_x + card_s + 8, card_y + card_s + 18],
                         radius=28, fill=(0, 0, 0, 140))
    shadow = shadow.filter(ImageFilter.GaussianBlur(22))
    im = Image.alpha_composite(im.convert("RGBA"), shadow).convert("RGB")
    card = rounded((card_s, card_s), 28, (255, 255, 255, 255))
    prod = Image.open(os.path.join(ROOT, s["img"])).convert("RGB")
    pad = 34
    prod.thumbnail((card_s - pad * 2, card_s - pad * 2), Image.LANCZOS)
    card.paste(prod, ((card_s - prod.width) // 2, (card_s - prod.height) // 2))
    im.paste(card, (card_x, card_y), card)
    d = ImageDraw.Draw(im)

    # ロゴチップ(左上・白 → サイトヘッダーと同じ見え方)
    chip_h = 54
    lg = logo.copy(); lg.thumbnail((260, 26), Image.LANCZOS)
    chip_w = lg.width + 40
    chip = rounded((chip_w, chip_h), 12, (255, 255, 255, 255))
    chip.paste(lg, (20, (chip_h - lg.height) // 2), lg.split()[3].point(lambda a: a))
    im.paste(chip, (72, 48), chip)
    d = ImageDraw.Draw(im)

    tx = 76
    # eyebrow
    y = 168
    d.rectangle([tx, y + 10, tx + 34, y + 12], fill=GOLD)
    tracked(d, (tx + 48, y), "CUSTOM JAPAN SMART SERIES", font_en(21), GOLD, tracking=4)

    # 英名(2行)
    y = 210
    f_big = font_en(72)
    for line in s["en"]:
        d.text((tx, y), line, font=f_big, fill=WHITE)
        y += 80

    # 和名 + タグライン
    y += 14
    d.text((tx, y), s["ja"], font=font_jp(30), fill=(236, 237, 237))
    y += 48
    d.text((tx, y), s["tag"], font=font_jp(21), fill=MUTED)

    # CTA
    y = 545
    end_x = tracked(d, (tx, y), "VIEW MORE", font_en(20), GOLD, tracking=4)
    ay = y + 13
    d.line([end_x + 14, ay, end_x + 74, ay], fill=GOLD, width=3)
    d.line([end_x + 62, ay - 8, end_x + 74, ay], fill=GOLD, width=3)
    d.line([end_x + 62, ay + 8, end_x + 74, ay], fill=GOLD, width=3)

    # URL(右下)
    url = f"smartseries.customjapan.net/series/{s['slug']}"
    ul = d.textlength(url, font=font_en(17, bold=False))
    d.text((W - 72 - ul, 578), url, font=font_en(17, bold=False), fill=MUTED)

    out = os.path.join(OUT, f"banner-{s['slug']}-1200x630.jpg")
    im.save(out, "JPEG", quality=90, optimize=True)
    print("ok", out)
print("done")
