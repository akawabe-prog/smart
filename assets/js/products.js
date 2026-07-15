/* =========================================
   products.js — Smart Series 商品データ（中心マスタ）
   data/products.json（API取得）から確定した商品ID・価格をハンドキュレート。
   価格はページ側で data-api-price-item-id によりAPIから動的表示するため、
   ここの price は fallback（API失敗時のみ使用）。
   ========================================= */

export const SITE = 'smart';

export const SERIES = [
  {
    slug: 'srd',
    name: 'スマートライドダッシュボード',
    short: 'SRD',
    tagline: 'バイク用スマートモニター',
    lead: 'ミラーレス時代のライディングを支える、国内仕様のスマートディスプレイ。',
    // 4モデル比較シリーズ
    products: [
      { id: '28002239', slug: 'srd-5',       name: 'SRD 5',       badge: 'STANDARD', price: 26800, msrp: 29800, size: '5inch', img: 'assets/products/28002239/main.jpg', tags: ['bike'], note: 'ドラレコ・TPMS・GPS 全部入り', href: 'product/srd-5/' },
      { id: '28113034', slug: 'srd-5-basic', name: 'SRD 5 Basic', badge: 'ENTRY',    price: 16800, msrp: 19800, size: '5inch', img: 'assets/products/28113034/main.jpg', tags: ['bike'], note: 'CarPlay対応のエントリー', href: 'product/srd-5-basic/' },
      { id: '28186915', slug: 'srd-5-pro',   name: 'SRD 5 Pro',   badge: 'FLAGSHIP', price: 34800, msrp: 49800, size: '5inch', img: 'assets/products/28186915/main.jpg', tags: ['bike'], note: '1000nit・IP67 の最上位', href: 'product/srd-5-pro/' },
      { id: '28186922', slug: 'srd-5-slim',  name: 'SRD 5 Slim',  badge: 'SLIM',     price: 15620, msrp: 15800, size: '5inch', img: 'assets/products/28186922/main.jpg', tags: ['bike'], note: '薄型タッチのコスパ機', href: 'product/srd-5-slim/' },
    ],
  },
  {
    slug: 'carlink',
    name: 'スマートカーリンク',
    short: 'CAR LINK',
    tagline: 'CarPlay / Android Auto アダプター',
    lead: '差すだけでスマホ連携。純正ナビが最新のコネクテッド環境に変わる。',
    products: [
      { id: '29290741', slug: 'carlink', name: 'スマートカーリンク', price: 11600, msrp: 19580, img: 'assets/products/29290741/main.jpg', tags: ['car'], note: '差すだけでスマホ連携・履歴を残さない', href: 'series/carlink/', isNew: true },
    ],
  },
  {
    slug: 'multipump',
    name: 'スマートエアーマルチポンプ',
    short: 'MULTI PUMP',
    tagline: 'バイク特化の電動エアーポンプ',
    lead: '入力してねじ込むだけ。目標空気圧まで自動充填、コンパクト＆パワフル。',
    products: [
      { id: '28089018', slug: 'multipump', name: 'スマートエアーマルチポンプ SAP2000', price: 3586, msrp: 5980, img: 'assets/products/28089018/main.jpg', tags: ['bike', 'bicycle', 'car', 'daily'], note: '目標空気圧まで自動充填。自転車・車・ボールにも', href: 'series/multipump/' },
    ],
  },
  {
    slug: 'portable',
    name: 'スマートポータブル',
    short: 'PORTABLE',
    tagline: 'ポータブル高圧洗浄機',
    lead: '電源も水道も選ばない。どこでも高圧洗浄を持ち出せる01シリーズ。',
    products: [
      { id: '29044375', slug: 'portable-01',         name: 'スマートポータブル01 高圧洗浄機',        price: 9878, msrp: 14801,  img: 'assets/products/29044375/main.jpg', tags: ['bike', 'car', 'daily'], note: '電源・水栓不要。本体のみ（バッテリー別売）', href: 'series/portable/' },
      { id: '29315956', slug: 'portable-01-battery',  name: '01 専用バッテリー',                       price: 5500,  img: 'assets/products/29315956/main.jpg', tags: ['bike', 'car', 'daily'], note: 'モバイルバッテリーとしても使える予備電源', href: 'series/portable/' },
      { id: '29465934', slug: 'portable-01-set',      name: '01 本体＋専用バッテリー セット',          price: 14619, msrp: 14801, img: 'assets/products/29465934/main.jpg', badge: 'SET', tags: ['bike', 'car', 'daily'], note: 'はじめてならこれ。お得なフルセット', href: 'series/portable/' },
    ],
  },
  {
    slug: 'airduster',
    name: 'スマートエアダスター',
    short: 'AIR DUSTER',
    tagline: 'コードレスエアダスター',
    lead: '微風から最大35m/sまで無段階。271gで、洗車も日常もこれ一台。',
    products: [
      { id: '29290758', slug: 'airduster', name: 'スマートエアダスター', price: 6028, msrp: 7480, img: 'assets/products/29290758/main.jpg', tags: ['bike', 'car', 'daily'], note: '洗車の水滴からPCの埃まで、風で解決', href: 'series/airduster/', isNew: true },
    ],
  },
];

export const seriesBySlug = (slug) => SERIES.find((s) => s.slug === slug);
export const allProducts = () => SERIES.flatMap((s) => s.products.map((p) => ({ ...p, series: s.slug })));
export const productById = (id) => allProducts().find((p) => p.id === String(id));

/* D2C 売れ筋ランキング（TOP「BEST SELLERS」用）。href はルート相対 */
export const POPULAR = [
  { id: '28002239', href: 'product/srd-5/',      note: 'ドラレコ・TPMS・GPS 全部入り' },
  { id: '29290758', href: 'series/airduster/',   note: '洗車も日常も、これ一台' },
  { id: '28089018', href: 'series/multipump/',   note: '目標空気圧まで自動充填' },
  { id: '28186922', href: 'product/srd-5-slim/', note: '薄型タッチのコスパ機' },
  { id: '29465934', href: 'series/portable/',    note: '本体＋バッテリーのセット' },
  { id: '29290741', href: 'series/carlink/',     note: '差すだけでスマホ連携' },
];
