# Smart Series ブランドサイト 構成書

- **ドメイン**: smartseries.customjapan.net
- **性格**: 単一LPではなく、カスタムジャパン自社「Smart Series」5シリーズを束ねる**ブランドポータル**
- **方式**: eXs-ReBranding 2/exs と同じ **API方式**（`api-e` / `api-i`、initベース認証、商品IDでカート投入）
- **土台方針**: 新規構築。**API層（`assets/js/services/*` + `api-client.js`）だけeXsから流用**、HTML/CSS/ブランドは新規に5シリーズ横断ハブへ最適化
- **確定事項**: フル・ブランドポータル / SRDはシリーズページ＋個別PDP / 新規構築（構造のみ流用）

---

## 1. シリーズ・製品マスタ（maker=126）— ✅ API取得済み

`scripts/fetch-smart-catalog.mjs`（Algoliaプロキシ, [[asmax-cj-catalog]] 同方式）で取得。マスタ = `data/products.json`。

**メインPDP対象（商品ID・税込価格 確定）**

| slug | シリーズ | モデル | 商品ID | 税込 | makerNo |
|---|---|---|---|---|---|
| `srd` | スマートライドダッシュボード | SRD 5 | `28002239` | ¥26,800 | SRD5 |
| | | SRD 5 Basic | `28113034` | ¥16,800 | SRD5 Basic |
| | | SRD 5 Pro | `28186915` | ¥34,800 | SRD5 Pro |
| | | SRD 5 Slim | `28186922` | ¥15,620 | SRD5 Slim |
| `carlink` | スマートカーリンク | スマートカーリンク | `29290741` | ¥11,600 | CA450 |
| `multipump` | スマートエアーマルチポンプ | SAP2000 | `28089018` | ¥3,586 | SAP2000 |
| `portable` | スマートポータブル | 01 高圧洗浄機 本体 | `29044375` | ¥9,878 | — |
| | | 01 専用バッテリー | `29315956` | ¥5,500 | — |
| | | 01 本体+バッテリー セット | `29465934` | ¥14,619 | — |
| `airduster` | スマートエアダスター | スマートエアダスター | `29290758` | ¥6,028 | — |

- **SRDは付属品23点**（ブラケット/電源ケーブル/カメラセット/TPMSセンサー/交換パーツ等）を `data/products.json` の `accessories` に保持 → 各PDPの付属品セクションで使用。
- 看板画像は `assets/products/{id}/main.jpg` `thumb.jpg` にDL済み（全121件）。
- maker=126はカスタムジャパン全体（ボルト/グローブ等85点＋その他）を含むため、**5シリーズ該当のみ抽出**して master 化済み。

---

## 2. サイトマップ / IA

```
/                          ブランドトップ（Smart Series ハブ / 5シリーズ横断）
├─ /series/srd/            スマートライドダッシュボード（4モデル比較・選択）
│   ├─ /product/srd-5/          PDP + APIカート
│   ├─ /product/srd-5-basic/    PDP + APIカート
│   ├─ /product/srd-5-pro/      PDP + APIカート
│   └─ /product/srd-5-slim/     PDP + APIカート
├─ /series/carlink/        スマートカーリンク（1製品＝シリーズページがPDP兼用）
├─ /series/multipump/      スマートエアーマルチポンプ（同上）
├─ /series/portable/       スマートポータブル（01高圧洗浄機。将来02..を同階層に追加）
├─ /series/airduster/      スマートエアダスター（同上）
├─ /cart.html             APIカート（eXs cart.html / cart-page.js 流用）
├─ /about.html            ブランドストーリー（Smart Seriesとは / 開発思想）
├─ /company.html          会社情報（カスタムジャパン）
├─ /support.html          サポート・保証・お問い合わせ導線
├─ /faq.html              よくある質問（シリーズ横断）
├─ /news.html             お知らせ（PR Timesリリース連携）
├─ /contact.html (+.php)  問い合わせフォーム → /thanks.html /form-error.html
└─ /policy.html           プライバシーポリシー / 特商法
```

**階層ルール**
- **SRDのみ二層**: `/series/srd/`（4モデル比較オーバービュー）＋ `/product/srd-*/`（各PDP・独立URL）。SEO/被リンク/カート導線が明確。
- **単一製品の4シリーズ**: `/series/<slug>/` がそのままPDP（購入モジュール内包）。階層を浅く保つ。
- **スマートポータブルは拡張前提**: `/product/portable-01/` 形式で将来02/03を同階層に追加できる器にする（当面は `/series/portable/` にPDP内包でも可、製品増加時に切り出し）。

---

## 3. グローバルナビ

```
[Smart Series ロゴ]   SERIES ▾   ABOUT   SUPPORT   NEWS   CONTACT   [🛒 CART]
                       └ スマートライドダッシュボード
                         スマートカーリンク
                         スマートエアーマルチポンプ
                         スマートポータブル
                         スマートエアダスター
```
- ヘッダ/フッタは `components.js` で共通描画（eXsパターン踏襲、デザインは新規）。
- CARTアイコン → `/cart.html`（APIカート）。

---

## 4. API統合（eXs方式）

**流用するファイル（そのまま or 微修正）**
```
assets/js/api-client.js                     … initApiClient / init / addItemsToCart / fetchCart 等
assets/js/services/base-api-requester.js    … 認証・共通リクエスト基底
assets/js/services/cart-api-requester.js    … cart / cart/details PUT・削除
assets/js/services/product-api-requester.js … 商品・価格取得
assets/js/services/*-init.js                … init API（api-i）系
assets/js/cart-page.js                      … /cart.html のカート表示・数量変更
assets/js/api-price-display.js              … 価格の非同期表示
```

**エンドポイント**
- 商品/カート: `https://api-e.customjapan.net/api/v1`
- 認証init: `https://api-i.customjapan.net/api/v1`

**カート投入（PDP側 product-<slug>.js）**
```js
import { initApiClient, init } from '../api-client.js';
initApiClient();                 // api-e / api-i をセット
await init();                    // guid/authorization/cid を Cookie付与
await CartApiRequester.addItemsToCart({ id: <商品ID>, quantity: 1, site: '<SITE>' });
// → /cart.html へ遷移
```

**APIパラメータ**
1. `site` の値 — ✅ **`'smart'` で確定**（2026-07-11）。
2. 各モデルの**商品ID**（addItemsToCartのkey）— APIまたはカタログ取得で確定（要取得）。
3. init/カートのCookieドメイン共有範囲（`smartseries.customjapan.net` で `api-e/api-i` 認証が通るCORS/Cookie設定）— 要確認。

---

## 5. ディレクトリ構成（新規構築）

```
smartseries/
├─ index.html
├─ series/{srd,carlink,multipump,portable,airduster}/index.html
├─ product/{srd-5,srd-5-basic,srd-5-pro,srd-5-slim}/index.html
├─ cart.html
├─ about.html  company.html  support.html  faq.html  news.html
├─ contact.html  contact.php  thanks.html  form-error.html  policy.html
└─ assets/
   ├─ css/style.css                 （新規デザインシステム）
   ├─ js/
   │  ├─ api-client.js              （流用）
   │  ├─ services/…                 （流用）
   │  ├─ cart-page.js               （流用）
   │  ├─ api-price-display.js       （流用）
   │  ├─ components.js              （新規: 共通ヘッダ/フッタ/ナビ）
   │  └─ product-<slug>.js          （新規: 各PDPのカラー選択・カート投入）
   ├─ images/  （SRD5Pro等・製品写真）
   └─ videos/  （SmartCarLink.mp4 / SmartAirDuster.mp4 等 既存素材）
```

**素材インベントリ（✅ 取得済み）** — 一覧は `assets/contact-sheet.html`

| 種別 | 所在 | 内容 |
|---|---|---|
| API看板画像 | `assets/products/{id}/main.jpg`(1600px) `thumb.jpg` | 全121件（5シリーズ該当＋付属品） |
| PR Times 画像 | `assets/prtimes/{slug}/{release}_{nn}` | **98枚**（srd56 / carlink18 / portable15 / multipump9）製品・ライフスタイル・比較図。max3900px |
| motomegane レビュー | `assets/motomegane/airduster/` | **15枚**（実写レビュー: 洗車/PC/カメラ/エアマット等）＋本文コピー `data/copy/airduster.md` |
| 動画(Web最適化済) | `assets/videos/` | srd-hero(2.5M) / carlink-hero(7.3M) / airduster-hero(1M) / multipump-hero(2.7M) ※1280幅・無音・faststart。srd-basic(5.6M) / carlink-unbox(120M・未最適化) |
| ブランド動画(未使用/素材) | ~/Desktop/整理済み_動画/ | 村井社長インタビュー(プライベートブランド/20周年 等) — About強化用の一次素材 |
| ローカル画像 | `assets/local/{slug}/` | srd5pro-tools.png / srd5pro.webp / portable01-lifestyle.webp / airduster-motomegane.jpg |

- 取得スクリプト: `scripts/fetch-smart-catalog.mjs`(API看板) / `scripts/fetch-prtimes-images.mjs`(PR Times) / `scripts/build-contact-sheet.mjs`(一覧生成)
- マニフェスト: `data/prtimes-images.json`（各画像の元URL・解像度）
- **airdusterはPR Timesリリース無し** → API看板＋ローカル(motomegane画像/hero動画)で対応。
- 本番配信前に大容量PNG/JPEGは webp化・リサイズ推奨（PR Timesは最大3900px）。

---

## 6. ページ別コンテンツ要件（骨子）

- **トップ**: ヒーロー（Smart Seriesの世界観）→ 5シリーズカード（各slugへ）→ ブランド訴求 → 最新News。
- **SRDシリーズ**: 4モデル比較表（Basic/無印/Pro/Slim: 画面サイズ・機能・価格）→ 各PDPへ。
- **各PDP**: ヒーロー動画/画像 → 特徴 → スペック → 価格（API）→ カート投入 → 保証/サポート。
- **単一製品シリーズ**: シリーズページ内にPDP要素一式（購入モジュール含む）。
- **About/Company/Support/FAQ/News/Contact/Policy**: eXs構成準拠、コピーは新規。

---

## 7. ビルド順（推奨フェーズ）

1. **足場**: ディレクトリ生成 + eXsからAPI層コピー + `site`/商品ID確認
2. **共通**: `components.js`（ヘッダ/フッタ/ナビ）+ `style.css` デザイン基盤
3. **カート**: `cart.html` + `cart-page.js` 動作確認（API疎通）
4. **PDP**: SRD 4モデル → 残り4シリーズ（1製品ずつ）
5. **シリーズページ**: SRD比較表 → 各シリーズLP
6. **トップ**: 5シリーズハブ
7. **共通ページ**: about/company/support/faq/news/contact/policy
8. **デプロイ**: クリーンURL配信（[[spc-deploy-clean-urls]] 方式を踏襲するか要確認）
