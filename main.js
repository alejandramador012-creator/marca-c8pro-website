/**
 * MARCA C8 PRO - main.js v7
 * Scroll-driven reveal animation + interactividad
 *
 * ANIMATION SEQUENCE (scroll-reveal section, 300vh tall):
 *
 *  Phase 1 (progress 0.00 → 0.45):
 *    3 cards rise from 110vh below → full coverage (translateY=0)
 *
 *  Phase 2 (progress 0.40 → 0.75):
 *    MARCAC8PRO sweeps from below viewport (100vh) → above top (-80vh)
 *    Visible in viewport during the middle of this range
 *    mix-blend-mode creates the "cut-through" tech effect
 *
 *  Phase 3 (progress 0.75 → 1.00):
 *    Everything exits: cards + text drift up and fade out
 */

document.addEventListener('DOMContentLoaded', () => {

  // NAVBAR
  const navbar = document.querySelector('.navbar');
  window.addEventListener('scroll', () => {
    navbar?.classList.toggle('navbar--scrolled', window.scrollY > 50);
  }, { passive: true });

  // SMOOTH SCROLL
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
    });
  });

  // ============================================
  // SCROLL REVEAL ANIMATION
  // ============================================
  const revealSection = document.getElementById('scroll-reveal');
  const revealCards   = document.getElementById('revealCards');
  const revealText    = document.getElementById('revealText');

  if (revealSection && revealCards && revealText) {
    const updateReveal = () => {
      const rect     = revealSection.getBoundingClientRect();
      const totalH   = revealSection.offsetHeight - window.innerHeight;
      const progress = Math.max(0, Math.min(1, -rect.top / totalH));

      // ---- PHASE 1: Cards rise from 110vh → 0 (0 → 0.45) ----
      const p1     = Math.min(1, progress / 0.45);
      const cardY  = (1 - easeOut(p1)) * 110; // starts 110vh below, rises to 0

      // ---- PHASE 2: Text sweeps 100vh → -80vh (0.40 → 0.75) ----
      // Total travel: 180vh over 0.35 of scroll range
      const p2     = Math.max(0, Math.min(1, (progress - 0.40) / 0.35));
      const textY  = 100 - easeInOut(p2) * 180; // 100vh (below) → -80vh (above)
      // Opacity: fade in quickly at start, stay full, no early fadeout (phase 3 handles it)
      const textIn = Math.min(1, p2 / 0.08);

      // ---- PHASE 3: Exit (0.75 → 1.0) ----
      const p3       = Math.max(0, Math.min(1, (progress - 0.75) / 0.25));
      const exitY    = easeIn(p3) * -80;   // drift everything upward
      const exitFade = 1 - easeIn(p3);     // fade out

      // Apply cards
      revealCards.style.transform = 'translateY(calc(' + (cardY + exitY) + 'vh))';
      revealCards.style.opacity   = String(Math.min(1, easeOut(Math.min(1, p1 / 0.15))) * exitFade);

      // Apply text (independent travel + exit drift)
      revealText.style.transform = 'translateY(calc(' + textY + 'vh + ' + exitY + 'vh))';
      revealText.style.opacity   = String(textIn * exitFade);
    };

    window.addEventListener('scroll', updateReveal, { passive: true });
    updateReveal();
  }

  function easeOut(t)   { return 1 - Math.pow(1 - t, 3); }
  function easeIn(t)    { return t * t * t; }
  function easeInOut(t) { return t < 0.5 ? 4*t*t*t : 1 - Math.pow(-2*t+2,3)/2; }

  // BENEFITS — tilt on hover
  document.querySelectorAll('.benefit-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const r  = card.getBoundingClientRect();
      const rx = ((e.clientY - r.top  - r.height/2) / r.height) *  5;
      const ry = ((e.clientX - r.left - r.width /2) / r.width ) * -5;
      card.style.transform = 'perspective(1000px) rotateX(' + rx + 'deg) rotateY(' + ry + 'deg) scale(1.02)';
    });
    card.addEventListener('mouseleave', () => { card.style.transform = ''; });
  });

  // FAQ — single open
  document.querySelectorAll('.faq-item').forEach(item => {
    item.addEventListener('toggle', () => {
      if (item.open) document.querySelectorAll('.faq-item[open]').forEach(o => { if (o !== item) o.removeAttribute('open'); });
    });
  });

  // FADE-IN sections
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('is-visible'); obs.unobserve(e.target); } });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
  document.querySelectorAll('.about-section,.video-section,.pain-section,.benefits-section,.presence-section,.faq-section,.cta-final').forEach(s => { s.classList.add('fade-in'); obs.observe(s); });
  document.querySelectorAll('.feature-item,.pain-card,.benefit-card,.faq-item').forEach((c, i) => { c.classList.add('fade-in'); c.style.transitionDelay = (i*0.08)+'s'; obs.observe(c); });

  // VIDEO
  const video = document.querySelector('.video-wrapper video');
  if (video) {
    new IntersectionObserver((entries) => { entries.forEach(e => e.isIntersecting ? video.play().catch(()=>{}) : video.pause()); }, { threshold: 0.3 }).observe(video);
  }

  // CTA stagger
  const ctaLines = document.querySelectorAll('.cta-text p');
  ctaLines.forEach((l, i) => { l.style.cssText = 'opacity:0;transform:translateY(20px);transition:opacity .6s ease '+(0.5+i*0.3)+'s,transform .6s ease '+(0.5+i*0.3)+'s'; });
  const ctaSection = document.querySelector('.cta-final');
  if (ctaSection) {
    new IntersectionObserver((entries) => { entries.forEach(e => { if (e.isIntersecting) ctaLines.forEach(l => { l.style.opacity='1'; l.style.transform='translateY(0)'; }); }); }, { threshold: 0.3 }).observe(ctaSection);
  }
});

const styleTag = document.createElement('style');
styleTag.textContent = `
  .fade-in { opacity:0; transform:translateY(30px); transition:opacity .7s ease,transform .7s ease; }
  .fade-in.is-visible { opacity:1; transform:translateY(0); }
  .navbar--scrolled { background:rgba(0,0,0,.97) !important; }
  .benefit-card { transition:transform .3s ease; }
  #revealCards, #revealText { will-change:transform,opacity; }
`;
document.head.appendChild(styleTag);
