/* =========================================================================
   motion.js — サイト共通モーション
   1) スクロールリビール: 主要要素へ .rv を自動付与し、視界に入ったら .in
      （同一親内で 70ms ずつスタガー）
   2) ショーケース/フルブリード背景の微視差（scale(1.12) の余白内で translateY）
   3) [data-count] カウントアップ
   prefers-reduced-motion 時はすべて無効。
   ========================================================================= */

const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---- 1. scroll reveal ---- */
const REVEAL_SELECTOR = [
  '.eyebrow', 'h1', 'h2', 'h3:not(.site-footer h3)', '.lead', '.stack-cta',
  '.showcase__index', '.showcase__title', '.showcase__sub', '.showcase__cta',
  '.stat', '.lineup__item', '.feature', '.split__media', '.big-card', '.pop-card', '.voice', '.press-item', '.exhibit-note', '.stile',
  '.compare-wrap', '.spec-grid', '.buy', '.gallery__main', '.breadcrumb',
].join(',');

function setupReveal() {
  const els = [...document.querySelectorAll(REVEAL_SELECTOR)]
    .filter((el) => !el.closest('.site-header, .site-footer, .drawer, .nav__menu'));

  // 同一親ごとにインデックスを振ってスタガー
  const groups = new Map();
  els.forEach((el) => {
    const p = el.parentElement;
    const idx = groups.get(p) || 0;
    groups.set(p, idx + 1);
    el.classList.add('rv');
    el.style.setProperty('--rv-delay', `${Math.min(idx, 5) * 0.07}s`);
  });

  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
  els.forEach((el) => io.observe(el));
}

/* ---- 2. parallax（背景メディアを ±5% ゆっくり流す） ---- */
function setupParallax() {
  const medias = [...document.querySelectorAll('.showcase__bg img, .showcase__bg video, .feature-full__bg img, .feature-full__bg video')];
  if (medias.length === 0) return;
  let ticking = false;
  const update = () => {
    ticking = false;
    const vh = window.innerHeight;
    medias.forEach((m) => {
      const host = m.closest('.showcase, .feature-full');
      if (!host) return;
      const r = host.getBoundingClientRect();
      if (r.bottom < 0 || r.top > vh) return;
      const progress = (r.top + r.height / 2 - vh / 2) / (vh + r.height); // -0.5〜0.5
      m.style.transform = `scale(1.12) translateY(${(-progress * 6).toFixed(2)}%)`;
    });
  };
  const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } };
  window.addEventListener('scroll', onScroll, { passive: true });
  update();
}

/* ---- 3. count-up ---- */
function setupCountUp() {
  const els = [...document.querySelectorAll('[data-count]')];
  if (els.length === 0) return;
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      io.unobserve(e.target);
      const el = e.target;
      const target = Number(el.dataset.count);
      const dur = 1200; const t0 = performance.now();
      const ease = (t) => 1 - Math.pow(1 - t, 3);
      const tick = (now) => {
        const p = Math.min(1, (now - t0) / dur);
        el.textContent = Math.round(target * ease(p)).toLocaleString();
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
  }, { threshold: 0.5 });
  els.forEach((el) => io.observe(el));
}

if (!REDUCED) {
  setupReveal();
  setupParallax();
  setupCountUp();
}
