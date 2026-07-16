/* =========================================================================
   media.js — 掲載メディア・第三者評価（信頼担保）データ
   実在の掲載/レビュー/インフルエンサー投稿のみを掲載。
   ========================================================================= */

// 掲載メディア（ロゴ帯用の媒体名）
export const PRESS = [
  { name: 'PR TIMES',    kind: 'プレスリリース' },
  { name: 'MotoMegane',  kind: 'メディアレビュー' },
  { name: 'YouTube',     kind: 'インフルエンサー' },
];

// イベント・展示会出展（ビジュアル・サムネイル型で表示）
export const EVENTS = [
  {
    title: '東京モーターサイクルショー 2026',
    sub: '20周年記念・過去最大ブースでスマートシリーズを体験展示',
    date: '2026.03',
    thumb: 'assets/media/tmcs2026-booth.jpg',
    url: 'https://prtimes.jp/main/html/rd/p/000000077.000070755.html',
  },
  {
    title: '大阪モーターサイクルショー 2026',
    sub: 'ASMAX・スマートシリーズを一挙展示',
    date: '2026.03',
    thumb: 'assets/prtimes/carlink/84_17.jpg',
    url: 'https://release.traicy.com/posts/202603061065756/',
  },
];

// 第三者の声（メディア記事・YouTube）。href はルート相対 or 外部URL
export const VOICES = [
  {
    kind: 'YOUTUBE',
    source: 'げんチャんねる',
    handle: '@GEN-CH',
    product: 'series',
    title: '最新バイク用品7選！ モーターサイクルショー実写レビュー',
    quote: '“こめかみが痛くないメガネ”など、モーターサイクルショーで注目の最新バイク用品として紹介。',
    url: 'https://youtu.be/cXL8Fi7DeMU',
    thumb: 'assets/media/yt-genchannel.jpg',
    date: '2026',
  },
  {
    kind: 'MEDIA',
    source: 'MotoMegane',
    product: 'airduster',
    quote: 'バイクの洗車から日常生活まで、あらゆるシーンで活躍する。',
    url: 'https://www.motomegane.com/news-release/pickup-motorcycle/customjapan-11_20260616',
    thumb: 'assets/motomegane/airduster/IMG_0288.jpg',
    date: '2026.06',
  },
  {
    kind: 'MEDIA',
    source: 'MotoMegane',
    product: 'multipump',
    quote: '手軽に使える“神アイテム”。バイク用に特化した、コンパクト＆パワフルな電動エアポンプ。',
    url: 'https://www.motomegane.com/news-release/item-report/customjapan-6_20250430',
    thumb: 'assets/motomegane/multipump/DSC2677.jpg',
    date: '2025.04',
  },
];

export const voicesForProduct = (slug) => VOICES.filter((v) => v.product === slug || v.product === 'series');
