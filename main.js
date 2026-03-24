/**
 * MARCA C8 PRO - main.js v5
 * Scroll-driven animations + interactividad
 */

document.addEventListener('DOMContentLoaded', () => {

  // ============================================
  // NAVBAR - Scroll effect
  // ============================================
  const navbar = document.querySelector('.navbar');
  window.addEventListener('scroll', () => {
    navbar?.classList.toggle('navbar--scrolled', window.scrollY > 50);
  }, { passive: true });

  // ============================================
  // SMOOTH SCROLL - Internal links
  // ============================================
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // ============================================
  // MARQUEE - Duplicate for infinite loop
  // ============================================
  const marqueeTrack = document.querySelector('.marquee-track');
  if (marqueeTrack) {
    marqueeTrack.parentElement.appendChild(marqueeTrack.cloneNode(true));
  }

  // ============================================
  // SCROLL REVEAL ANIMATION
  //
  // .reveal-cards: absolute positioned left:0 right:0, flex centered
  //   JS applies translateY only (no X override needed)
  // .reveal-marquee-text: absolute, sweeps from bottom upward
  //
  // Phases (progress 0→1):
  //   0.00–0.50: Cards rise from 110vh→0, fade in
  //   0.15–0.70: MARCAC8PRO text sweeps 80vh→-130vh over cards
  //   0.65–1.00: Everything exits (fade out + rise)
  // ============================================
  const revealSection = document.getElementById('scroll-reveal');
  const revealCards   = document.getElementById('revealCards');
  const revealText    = document.getElementById('revealText');

  if (revealSection && revealCards && revealText) {

    const updateReveal = () => {
      const rect     = revealSection.getBoundingClientRect();
      const totalH   = revealSection.offsetHeight - window.innerHeight;
      const progress = Math.max(0, Math.min(1, -rect.top / totalH));

      // Phase 1: Cards rise (0 → 0.50)
      const p1     = Math.min(1, progress / 0.50);
      const cardY  = (1 - easeOut(p1)) * 110; // 110vh → 0

      // Phase 2: Text sweeps (0.15 → 0.70)
      const p2        = Math.max(0, Math.min(1, (progress - 0.15) / 0.55));
      const textY     = 80 - easeInOut(p2) * 210; // 80vh → -130vh
      const textAlpha = p2 > 0 ? 1 : 0;

      // Phase 3: Exit (0.65 → 1.0)
      const p3          = Math.max(0, Math.min(1, (progress - 0.65) / 0.35));
      const exitOpacity = 1 - easeIn(p3);
      const exitY       = easeIn(p3) * -25;

      // Cards: translateY only
      revealCards.style.transform = 'translateY(calc(' + (cardY + exitY) + 'vh))';
      revealCards.style.opacity   = String(Math.max(0, easeOut(p1) * exitOpacity));

      // Text: sweep Y + exit fade
      revealText.style.transform = 'translateY(' + textY + 'vh)';
      revealText.style.opacity   = String(Math.max(0, textAlpha * exitOpacity));
    };

    window.addEventListener('scroll', updateReveal, { passive: true });
    updateReveal();
  }

  // Easing helpers
  function easeOut(t)    { return 1 - Math.pow(1 - t, 3); }
  function easeIn(t)     { return t * t * t; }
  function easeInOut(t)  { return t < 0.5 ? 4*t*t*t : 1 - Math.pow(-2*t+2,3)/2; }

  // ============================================
  // BENEFITS CARDS - Tilt effect on hover
  // ============================================
  document.querySelectorAll('.benefit-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const rotateX = ((e.clientY - rect.top  - rect.height/2) / rect.height) *  5;
      const rotateY = ((e.clientX - rect.left - rect.width /2) / rect.width ) * -5;
      card.style.transform = 'perspective(1000px) rotateX(' + rotateX + 'deg) rotateY(' + rotateY + 'deg) scale(1.02)';
    });
    card.addEventListener('mouseleave', () => { card.style.transform = ''; });
  });

  // ============================================
  // FAQ - Single open accordion
  // ============================================
  document.querySelectorAll('.faq-item').forEach(item => {
    item.addEventListener('toggle', () => {
      if (item.open) {
        document.querySelectorAll('.faq-item[open]').forEach(other => {
          if (other !== item) other.removeAttribute('open');
        });
      }
    });
  });

  // ============================================
  // INTERSECTION OBSERVER - Fade in sections
  // ============================================
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('is-visible'); obs.unobserve(e.target); }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

  document.querySelectorAll(
    '.about-section,.video-section,.pain-section,.benefits-section,.presence-section,.faq-section,.cta-final'
  ).forEach(s => { s.classList.add('fade-in'); obs.observe(s); });

  document.querySelectorAll('.feature-item,.pain-card,.benefit-card,.faq-item').forEach((c, i) => {
    c.classList.add('fade-in');
    c.style.transitionDelay = (i * 0.08) + 's';
    obs.observe(c);
  });

  // ============================================
  // VIDEO - Play on scroll into view
  // ============================================
  const video = document.querySelector('.video-wrapper video');
  if (video) {
    new IntersectionObserver((entries) => {
      entries.forEach(e => e.isIntersecting ? video.play().catch(()=>{}) : video.pause());
    }, { threshold: 0.3 }).observe(video);
  }

  // ============================================
  // CTA FINAL - Staggered line reveal
  // ============================================
  const ctaLines = document.querySelectorAll('.cta-text p');
  ctaLines.forEach((line, i) => {
    line.style.cssText = 'opacity:0;transform:translateY(20px);transition:opacity .6s ease ' + (0.5 + i*0.3) + 's,transform .6s ease ' + (0.5 + i*0.3) + 's';
  });
  const ctaSection = document.querySelector('.cta-final');
  if (ctaSection) {
    new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) ctaLines.forEach(l => { l.style.opacity='1'; l.style.transform='translateY(0)'; });
      });
    }, { threshold: 0.3 }).observe(ctaSection);
  }

});

// ============================================
// CSS injected by JS
// ============================================
const styleTag = document.createElement('style');
styleTag.textContent = `
  .fade-in { opacity:0; transform:translateY(30px); transition:opacity .7s ease,transform .7s ease; }
  .fade-in.is-visible { opacity:1; transform:translateY(0); }
  .navbar--scrolled { background:rgba(0,0,0,.97) !important; }
  .benefit-card { transition:transform .3s ease; }
  #revealCards { will-change:transform,opacity; }
  #revealText  { will-change:transform,opacity; }
`;
document.head.appendChild(styleTag);
