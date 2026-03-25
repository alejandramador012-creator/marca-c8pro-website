/**
 * MARCA C8 PRO — animations.js v2.0 (CDN build)
 * Requiere: gsap, gsap/ScrollTrigger y Lenis cargados como scripts globales
 *
 * Módulos:
 *  1. Lenis smooth scroll
 *  2. Custom cursor
 *  3. Navbar scroll effect
 *  4. Hero masked reveal
 *  5. Scroll-reveal cards (300vh section)
 *  6. Sticky sections — fade-in con ScrollTrigger
 *  7. Benefit cards — tilt 3D
 *  8. FAQ accordion
 *  9. Video autoplay/pause
 * 10. CTA final stagger
 */

(function () {
  'use strict';

  // Esperar a que GSAP y Lenis estén disponibles
  if (typeof gsap === 'undefined' || typeof Lenis === 'undefined') {
    console.warn('GSAP o Lenis no disponibles');
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  // ============================================================
  // 1. LENIS — Smooth Scroll
  // ============================================================
  const lenis = new Lenis({
    duration: 1.25,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    orientation: 'vertical',
    smoothWheel: true,
  });

  lenis.on('scroll', ScrollTrigger.update);

  gsap.ticker.add((time) => { lenis.raf(time * 1000); });
  gsap.ticker.lagSmoothing(0);

  // Smooth scroll a anclas internas
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        e.preventDefault();
        lenis.scrollTo(target, { duration: 1.4, easing: (t) => 1 - Math.pow(1 - t, 4) });
      }
    });
  });

  // ============================================================
  // 2. CUSTOM CURSOR
  // ============================================================
  const cursor = document.querySelector('.custom-cursor');

  if (cursor && window.matchMedia('(pointer: fine)').matches) {
    const pos   = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const mouse = { x: pos.x, y: pos.y };
    const SPEED = 0.13;

    gsap.set(cursor, { xPercent: -50, yPercent: -50 });

    const xSetter = gsap.quickSetter(cursor, 'x', 'px');
    const ySetter = gsap.quickSetter(cursor, 'y', 'px');

    window.addEventListener('mousemove', (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      cursor.classList.remove('cursor--hidden');
    });
    window.addEventListener('mouseleave', () => cursor.classList.add('cursor--hidden'));
    window.addEventListener('mouseenter', () => cursor.classList.remove('cursor--hidden'));

    gsap.ticker.add(() => {
      const dt = 1 - Math.pow(1 - SPEED, gsap.ticker.deltaRatio());
      pos.x += (mouse.x - pos.x) * dt;
      pos.y += (mouse.y - pos.y) * dt;
      xSetter(pos.x);
      ySetter(pos.y);
    });

    document.querySelectorAll('a, button, summary, .benefit-card').forEach((el) => {
      el.addEventListener('mouseenter', () => cursor.classList.add('cursor--hover'));
      el.addEventListener('mouseleave', () => cursor.classList.remove('cursor--hover'));
    });
  }

  // ============================================================
  // 3. NAVBAR
  // ============================================================
  const navbar = document.querySelector('.navbar');
  lenis.on('scroll', ({ scroll }) => {
    navbar && navbar.classList.toggle('navbar--scrolled', scroll > 50);
  });

  // ============================================================
  // 4. HERO — Masked Reveal
  // ============================================================
  gsap.set('.hero-subtitle', { y: 24 });
  gsap.set('.btn-hero',      { y: 20 });

  const heroTl = gsap.timeline({ delay: 0.2, defaults: { ease: 'power4.out' } });
  heroTl
    .to('.hero-eyebrow',  { opacity: 1, duration: 0.6 })
    .to('.line-text',     { yPercent: 0, opacity: 1, duration: 1.1, stagger: 0.13 }, '-=0.3')
    .to('.hero-subtitle', { opacity: 1, y: 0, duration: 0.9 }, '-=0.55')
    .to('.btn-hero',      { opacity: 1, y: 0, duration: 0.7 }, '-=0.55');

  // ============================================================
  // 5. SCROLL REVEAL SECTION (300vh, sticky inner)
  // ============================================================
  const revealSection = document.getElementById('scroll-reveal');
  const revealCards   = document.getElementById('revealCards');
  const revealText    = document.getElementById('revealText');

  function easeOut(t)   { return 1 - Math.pow(1 - t, 3); }
  function easeIn(t)    { return t * t * t; }
  function easeInOut(t) { return t < 0.5 ? 4*t*t*t : 1 - Math.pow(-2*t+2, 3)/2; }

  if (revealSection && revealCards && revealText) {
    ScrollTrigger.create({
      trigger: revealSection,
      start: 'top top',
      end: 'bottom bottom',
      scrub: 1.2,
      onUpdate: (self) => {
        const p = self.progress;

        const p1    = Math.min(1, p / 0.45);
        const cardY = (1 - easeOut(p1)) * 110;

        const p2    = Math.max(0, Math.min(1, (p - 0.40) / 0.35));
        const textY = 100 - easeInOut(p2) * 180;
        const textIn = Math.min(1, p2 / 0.08);

        const p3       = Math.max(0, Math.min(1, (p - 0.75) / 0.25));
        const exitY    = easeIn(p3) * -80;
        const exitFade = 1 - easeIn(p3);

        revealCards.style.transform = 'translateY(calc(' + (cardY + exitY) + 'vh))';
        revealCards.style.opacity   = String(Math.min(1, easeOut(Math.min(1, p1 / 0.15))) * exitFade);
        revealText.style.transform  = 'translateY(calc(' + textY + 'vh + ' + exitY + 'vh))';
        revealText.style.opacity    = String(textIn * exitFade);
      },
    });
  }

  // ============================================================
  // 6. STICKY SECTIONS — fade-in con ScrollTrigger
  // ============================================================
  // About section
  gsap.fromTo(
    '.about-label, .about-title, .about-desc, .features-label, .features-title',
    { y: 50, opacity: 0 },
    { y: 0, opacity: 1, duration: 0.9, stagger: 0.1, ease: 'power3.out',
      scrollTrigger: { trigger: '.about-section', start: 'top 70%', toggleActions: 'play none none reverse' } }
  );
  gsap.fromTo(
    '.feature-item',
    { y: 36, opacity: 0 },
    { y: 0, opacity: 1, duration: 0.75, stagger: 0.09, ease: 'power3.out',
      scrollTrigger: { trigger: '.features-grid', start: 'top 75%', toggleActions: 'play none none reverse' } }
  );

  // Video section
  gsap.fromTo(
    '.video-label, .btn-agenda',
    { y: 32, opacity: 0 },
    { y: 0, opacity: 1, duration: 0.8, stagger: 0.12, ease: 'power3.out',
      scrollTrigger: { trigger: '.video-section', start: 'top 75%' } }
  );

  // Pain section
  gsap.fromTo('.pain-title',
    { y: 40, opacity: 0 },
    { y: 0, opacity: 1, duration: 0.85, ease: 'power3.out',
      scrollTrigger: { trigger: '.pain-section', start: 'top 70%' } }
  );
  gsap.fromTo('.pain-card',
    { y: 48, opacity: 0 },
    { y: 0, opacity: 1, duration: 0.8, stagger: 0.1, ease: 'power3.out',
      scrollTrigger: { trigger: '.pain-grid', start: 'top 75%' } }
  );

  // Benefits (sticky layer 1)
  gsap.fromTo('.benefits-title',
    { y: 48, opacity: 0 },
    { y: 0, opacity: 1, duration: 0.9, ease: 'power3.out',
      scrollTrigger: { trigger: '.benefits-section', start: 'top 70%', toggleActions: 'play none none reverse' } }
  );
  gsap.fromTo('.benefit-card',
    { y: 60, opacity: 0 },
    { y: 0, opacity: 1, duration: 0.85, stagger: 0.1, ease: 'power3.out',
      scrollTrigger: { trigger: '.benefits-section', start: 'top 65%', toggleActions: 'play none none reverse' } }
  );

  // Presence (sticky layer 2)
  gsap.fromTo('.presence-title, .presence-sub',
    { y: 40, opacity: 0 },
    { y: 0, opacity: 1, duration: 0.85, stagger: 0.12, ease: 'power3.out',
      scrollTrigger: { trigger: '.presence-section', start: 'top 70%', toggleActions: 'play none none reverse' } }
  );
  gsap.fromTo('.presence-logos img, .client-logos img',
    { y: 32, opacity: 0 },
    { y: 0, opacity: 1, duration: 0.6, stagger: 0.07, ease: 'power3.out',
      scrollTrigger: { trigger: '.presence-section', start: 'top 65%', toggleActions: 'play none none reverse' } }
  );

  // FAQ (sticky layer 3)
  gsap.fromTo('.faq-title, .faq-category',
    { y: 40, opacity: 0 },
    { y: 0, opacity: 1, duration: 0.85, stagger: 0.12, ease: 'power3.out',
      scrollTrigger: { trigger: '.faq-section', start: 'top 70%', toggleActions: 'play none none reverse' } }
  );
  gsap.fromTo('.faq-item',
    { y: 28, opacity: 0 },
    { y: 0, opacity: 1, duration: 0.6, stagger: 0.07, ease: 'power3.out',
      scrollTrigger: { trigger: '.faq-section', start: 'top 65%', toggleActions: 'play none none reverse' } }
  );

  // CTA final (sticky layer 4)
  gsap.fromTo('.cta-text p',
    { y: 40, opacity: 0 },
    { y: 0, opacity: 1, duration: 0.85, stagger: 0.18, ease: 'power3.out',
      scrollTrigger: { trigger: '.cta-final', start: 'top 65%', toggleActions: 'play none none reverse' } }
  );
  gsap.fromTo('.btn-cta-final',
    { y: 24, opacity: 0 },
    { y: 0, opacity: 1, duration: 0.7, ease: 'power3.out',
      scrollTrigger: { trigger: '.cta-final', start: 'top 60%', toggleActions: 'play none none reverse' } }
  );

  // ============================================================
  // 7. BENEFIT CARDS — tilt 3D
  // ============================================================
  document.querySelectorAll('.benefit-card').forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const r  = card.getBoundingClientRect();
      const rx = ((e.clientY - r.top  - r.height / 2) / r.height) *  6;
      const ry = ((e.clientX - r.left - r.width  / 2) / r.width)  * -6;
      gsap.to(card, { rotationX: rx, rotationY: ry, scale: 1.02, duration: 0.4, ease: 'power2.out', transformPerspective: 1000 });
    });
    card.addEventListener('mouseleave', () => {
      gsap.to(card, { rotationX: 0, rotationY: 0, scale: 1, duration: 0.5, ease: 'power3.out' });
    });
  });

  // ============================================================
  // 8. FAQ — single open
  // ============================================================
  document.querySelectorAll('.faq-item').forEach((item) => {
    item.addEventListener('toggle', () => {
      if (item.open) {
        document.querySelectorAll('.faq-item[open]').forEach((o) => {
          if (o !== item) o.removeAttribute('open');
        });
      }
    });
  });

  // ============================================================
  // 9. VIDEO — play/pause por visibilidad
  // ============================================================
  const video = document.querySelector('.video-wrapper video');
  if (video) {
    new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting ? video.play().catch(() => {}) : video.pause()),
      { threshold: 0.3 }
    ).observe(video);
  }

})();
