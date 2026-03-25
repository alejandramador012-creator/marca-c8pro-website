import '../css/main.css'
import '../css/animations.css'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'

gsap.registerPlugin(ScrollTrigger)

// ============================================================
// 1. LENIS — Smooth Scroll
// ============================================================
const lenis = new Lenis({
  duration: 1.25,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  smoothWheel: true,
})

lenis.on('scroll', ScrollTrigger.update)
gsap.ticker.add((time) => { lenis.raf(time * 1000) })
gsap.ticker.lagSmoothing(0)

document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener('click', (e) => {
    const target = document.querySelector(anchor.getAttribute('href'))
    if (target) {
      e.preventDefault()
      lenis.scrollTo(target, { duration: 1.4, easing: (t) => 1 - Math.pow(1 - t, 4) })
    }
  })
})

// ============================================================
// 2. CUSTOM CURSOR
// ============================================================
const cursor = document.querySelector('.custom-cursor')

if (cursor && window.matchMedia('(pointer: fine)').matches) {
  const pos   = { x: window.innerWidth / 2, y: window.innerHeight / 2 }
  const mouse = { x: pos.x, y: pos.y }
  const SPEED = 0.13

  gsap.set(cursor, { xPercent: -50, yPercent: -50 })
  const xSetter = gsap.quickSetter(cursor, 'x', 'px')
  const ySetter = gsap.quickSetter(cursor, 'y', 'px')

  window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX
    mouse.y = e.clientY
    cursor.classList.remove('cursor--hidden')
  })
  window.addEventListener('mouseleave', () => cursor.classList.add('cursor--hidden'))
  window.addEventListener('mouseenter', () => cursor.classList.remove('cursor--hidden'))

  gsap.ticker.add(() => {
    const dt = 1 - Math.pow(1 - SPEED, gsap.ticker.deltaRatio())
    pos.x += (mouse.x - pos.x) * dt
    pos.y += (mouse.y - pos.y) * dt
    xSetter(pos.x)
    ySetter(pos.y)
  })

  document.querySelectorAll('a, button, summary, .benefit-card, .feature-card').forEach((el) => {
    el.addEventListener('mouseenter', () => cursor.classList.add('cursor--hover'))
    el.addEventListener('mouseleave', () => cursor.classList.remove('cursor--hover'))
  })
}

// ============================================================
// 3. NAVBAR
// ============================================================
const navbar = document.querySelector('.navbar')
lenis.on('scroll', ({ scroll }) => {
  navbar?.classList.toggle('navbar--scrolled', scroll > 50)
})

// ============================================================
// 4. HERO — Masked Reveal + Char Glow
// ============================================================
gsap.set('.line-text',     { y: '110%', opacity: 0 })
gsap.set('.hero-eyebrow',  { opacity: 0 })
gsap.set('.hero-subtitle', { y: 28, opacity: 0 })
gsap.set('.btn-hero',      { y: 20, opacity: 0 })

const heroTl = gsap.timeline({ delay: 0.3, defaults: { ease: 'power4.out' } })
heroTl
  .to('.hero-eyebrow',  { opacity: 1, duration: 0.6 })
  .to('.line-text',     { y: '0%', opacity: 1, duration: 1.1, stagger: 0.14 }, '-=0.3')
  .to('.hero-subtitle', { opacity: 1, y: 0, duration: 0.9 }, '-=0.55')
  .to('.btn-hero',      { opacity: 1, y: 0, duration: 0.7 }, '-=0.55')
  .call(setupHeroGlow) // activa el glow al terminar el reveal

// ─── Hero character glow (proximity effect) ───────────────
function setupHeroGlow() {
  const heroTitle = document.getElementById('heroTitle')
  if (!heroTitle) return

  // Dividir cada .line-text en spans de caracteres
  heroTitle.querySelectorAll('.line-text').forEach((el) => {
    const isItalic = el.tagName === 'EM'
    const text = el.textContent
    el.innerHTML = text.split('').map((char) => {
      if (char === ' ') return '<span class="h-char h-char--space">&nbsp;</span>'
      return `<span class="h-char"${isItalic ? ' style="font-style:italic"' : ''}>${char}</span>`
    }).join('')
  })

  heroTitle.addEventListener('mousemove', (e) => {
    heroTitle.querySelectorAll('.h-char:not(.h-char--space)').forEach((char) => {
      const r    = char.getBoundingClientRect()
      const cx   = r.left + r.width / 2
      const cy   = r.top  + r.height / 2
      const dist = Math.hypot(e.clientX - cx, e.clientY - cy)
      const prox = Math.max(0, 1 - dist / 150)

      if (prox > 0.01) {
        gsap.to(char, {
          textShadow: `0 0 ${prox * 28}px rgba(200,145,90,${prox * 0.9}), 0 0 ${prox * 60}px rgba(200,145,90,0.25)`,
          filter:     `brightness(${1 + prox * 0.55})`,
          duration:   0.2, overwrite: 'auto',
        })
      } else {
        gsap.to(char, {
          textShadow: 'none', filter: 'none',
          duration: 0.45, overwrite: 'auto',
        })
      }
    })
  })

  heroTitle.addEventListener('mouseleave', () => {
    gsap.to(heroTitle.querySelectorAll('.h-char'), {
      textShadow: 'none', filter: 'none', duration: 0.5, stagger: 0.008,
    })
  })
}

// ============================================================
// 5. SCROLL REVEAL — Stagger secuencial izq → centro → der
// ============================================================
const revealSection = document.getElementById('scroll-reveal')
const revealCards   = document.getElementById('revealCards')
const revealText    = document.getElementById('revealText')

function easeOut(t)   { return 1 - Math.pow(1 - t, 3) }
function easeIn(t)    { return t * t * t }
function easeInOut(t) { return t < 0.5 ? 4*t*t*t : 1 - Math.pow(-2*t+2, 3)/2 }

if (revealSection && revealCards && revealText) {
  // Inicializar cada tarjeta individualmente
  const cards = [
    document.getElementById('revealCard0'),
    document.getElementById('revealCard1'),
    document.getElementById('revealCard2'),
  ].filter(Boolean)

  cards.forEach((card) => {
    card.style.transform = 'translateY(110vh)'
    card.style.opacity   = '0'
  })
  revealText.style.opacity   = '0'
  revealText.style.transform = 'translateY(100vh)'

  // Timing individual por tarjeta:
  // Izq (0): 0.00 → 0.28
  // Centro (1): 0.10 → 0.38
  // Der (2): 0.20 → 0.48
  // MARCAC8PRO: 0.40 → 0.75
  // Exit: 0.75 → 1.00
  const cardTimings = [
    { start: 0,    end: 0.28 },
    { start: 0.10, end: 0.38 },
    { start: 0.20, end: 0.48 },
  ]

  ScrollTrigger.create({
    trigger: revealSection,
    start: 'top top',
    end: 'bottom bottom',
    scrub: 1.2,
    onUpdate: (self) => {
      const p = self.progress

      // ── Fase 3: Salida (0.75 → 1.0) ──
      const p3       = Math.max(0, Math.min(1, (p - 0.75) / 0.25))
      const exitY    = easeIn(p3) * -80
      const exitFade = 1 - easeIn(p3)

      // Contenedor solo se mueve en fase de salida
      revealCards.style.transform = `translateY(${exitY}vh)`
      revealCards.style.opacity   = String(exitFade)

      // ── Fase 1: Tarjetas con stagger ──
      cards.forEach((card, i) => {
        const { start, end } = cardTimings[i]
        const pCard = Math.max(0, Math.min(1, (p - start) / (end - start)))
        const cardY = (1 - easeOut(pCard)) * 110
        const fadeIn = Math.min(1, pCard / 0.18)

        card.style.transform = `translateY(${cardY}vh)`
        card.style.opacity   = String(fadeIn)
      })

      // ── Fase 2: MARCAC8PRO sube (0.40 → 0.75) ──
      const p2     = Math.max(0, Math.min(1, (p - 0.40) / 0.35))
      const textY  = 100 - easeInOut(p2) * 180
      const textIn = Math.min(1, p2 / 0.08)

      revealText.style.transform = `translateY(calc(${textY}vh + ${exitY}vh))`
      revealText.style.opacity   = String(textIn * exitFade)
    },
  })
}

// ============================================================
// 6. SCROLL ANIMATIONS — secciones
// ============================================================
const fadeIn = (targets, trigger, extra = {}) =>
  gsap.fromTo(targets, { y: 48, opacity: 0 }, {
    y: 0, opacity: 1, duration: 0.85, stagger: 0.1, ease: 'power3.out',
    scrollTrigger: { trigger, start: 'top 72%', toggleActions: 'play none none reverse' },
    ...extra,
  })

fadeIn('.about-label, .about-title, .about-desc, .features-label, .features-title', '.about-section')
fadeIn('.feature-card', '.features-grid', { stagger: 0.08 })
fadeIn('.video-label', '.video-section')
fadeIn('.pain-title', '.pain-section')
fadeIn('.benefits-title', '.benefits-section')
fadeIn('.benefit-card', '.benefits-section', { stagger: 0.1 })
fadeIn('.presence-title, .presence-sub', '.presence-section')
fadeIn('.flag-item', '.presence-section', { stagger: 0.06 })
fadeIn('.client-logos img', '.presence-section', { stagger: 0.07 })
fadeIn('.faq-title, .faq-category', '.faq-section')
fadeIn('.faq-item', '.faq-section', { stagger: 0.07 })
fadeIn('.cta-text p', '.cta-final', { stagger: 0.14 })
fadeIn('.btn-cta-final', '.cta-final')

// ============================================================
// 7. PAIN — Deck effect (escala tarjetas previas al apilar)
// ============================================================
const painCards = gsap.utils.toArray('.pain-card')

painCards.forEach((card, i) => {
  if (i === 0) return

  // Cuando la siguiente tarjeta sube, escalar y oscurecer la anterior
  ScrollTrigger.create({
    trigger: card,
    start: `top top+=${92 + 20}`,  // cuando llega al sticky top
    onEnter: () => {
      // Escalar ligeramente hacia atrás las tarjetas anteriores
      painCards.slice(0, i).forEach((prev, j) => {
        const depth = i - j
        gsap.to(prev, {
          scale:  1 - depth * 0.035,
          filter: `brightness(${1 - depth * 0.12})`,
          duration: 0.5,
          ease:     'power2.out',
          overwrite: 'auto',
        })
      })
    },
    onLeaveBack: () => {
      // Restaurar la tarjeta inmediatamente anterior
      const prev = painCards[i - 1]
      gsap.to(prev, { scale: 1, filter: 'brightness(1)', duration: 0.4, overwrite: 'auto' })
    },
  })
})

// ============================================================
// 8. BENEFIT CARDS — tilt 3D
// ============================================================
document.querySelectorAll('.benefit-card').forEach((card) => {
  card.addEventListener('mousemove', (e) => {
    const r  = card.getBoundingClientRect()
    const rx = ((e.clientY - r.top  - r.height / 2) / r.height) *  6
    const ry = ((e.clientX - r.left - r.width  / 2) / r.width)  * -6
    gsap.to(card, { rotationX: rx, rotationY: ry, scale: 1.02, duration: 0.4, ease: 'power2.out', transformPerspective: 1000 })
  })
  card.addEventListener('mouseleave', () => {
    gsap.to(card, { rotationX: 0, rotationY: 0, scale: 1, duration: 0.5, ease: 'power3.out' })
  })
})

// ============================================================
// 9. FAQ — single open
// ============================================================
document.querySelectorAll('.faq-item').forEach((item) => {
  item.addEventListener('toggle', () => {
    if (item.open) {
      document.querySelectorAll('.faq-item[open]').forEach((o) => {
        if (o !== item) o.removeAttribute('open')
      })
    }
  })
})

// ============================================================
// 10. VIDEO — Play overlay con sonido
// ============================================================
const vslVideo    = document.getElementById('vslVideo')
const videoOverlay = document.getElementById('videoOverlay')
const videoPlayBtn = document.getElementById('videoPlayBtn')

if (vslVideo && videoOverlay && videoPlayBtn) {
  // Autoplay muted mientras no interactúan
  new IntersectionObserver(
    (entries) => entries.forEach((e) => {
      if (e.isIntersecting) vslVideo.play().catch(() => {})
      else vslVideo.pause()
    }),
    { threshold: 0.3 }
  ).observe(vslVideo)

  // Al hacer click: desmutar, reiniciar y reproducir con sonido
  videoOverlay.addEventListener('click', () => {
    vslVideo.muted   = false
    vslVideo.currentTime = 0
    vslVideo.play().catch(() => { vslVideo.muted = true; vslVideo.play() })

    gsap.to(videoOverlay, {
      opacity: 0, duration: 0.5, ease: 'power2.out',
      onComplete: () => videoOverlay.classList.add('is-hidden'),
    })
  })
}

// ============================================================
// 11. CTA FINAL — Glitch / Defragment effect
// ============================================================
function setupCtaGlitch() {
  const ctaFinal = document.querySelector('.cta-final')
  const ctaLines = document.querySelectorAll('.cta-text p')
  if (!ctaFinal || !ctaLines.length) return

  const glitchChars = '!@#%^&*ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789?/\\'
  let glitchTl       = null
  const intervals    = []

  function scrambleLine(el) {
    // Solo líneas de texto puro (sin elementos hijo)
    if (el.children.length > 0) return
    const original = el.dataset.original || el.textContent
    el.dataset.original = original
    let frame = 0
    const total = original.length * 3

    const id = setInterval(() => {
      el.textContent = original.split('').map((char, idx) => {
        if (char === ' ') return ' '
        if (idx < Math.floor(frame / 3)) return original[idx]
        return Math.random() > 0.45
          ? glitchChars[Math.floor(Math.random() * glitchChars.length)]
          : char
      }).join('')
      frame++
      if (frame > total) {
        clearInterval(id)
        el.textContent = original
      }
    }, 30)
    intervals.push(id)
  }

  ctaFinal.addEventListener('mouseenter', () => {
    intervals.forEach(clearInterval)
    intervals.length = 0

    // GSAP visual glitch para todas las líneas
    glitchTl = gsap.timeline({ repeat: -1, repeatDelay: 0.05 })
    ctaLines.forEach((line, i) => {
      glitchTl
        .to(line, {
          x:       () => (Math.random() - 0.5) * 14,
          skewX:   () => (Math.random() - 0.5) * 4,
          opacity: () => 0.6 + Math.random() * 0.4,
          color:   () => Math.random() > 0.82 ? 'var(--color-accent)' : 'var(--color-white)',
          duration: 0.06, ease: 'none',
        }, i * 0.05)
        .to(line, {
          x: 0, skewX: 0, opacity: 1, color: 'var(--color-white)',
          duration: 0.06, ease: 'none',
        }, i * 0.05 + 0.06)
    })

    // Scramble de texto en líneas puras
    ctaLines.forEach((line) => scrambleLine(line))
  })

  ctaFinal.addEventListener('mouseleave', () => {
    glitchTl?.kill()
    intervals.forEach(clearInterval)
    intervals.length = 0
    gsap.to(ctaLines, { x: 0, skewX: 0, opacity: 1, color: 'var(--color-white)', duration: 0.35 })
    // Restaurar texto original
    ctaLines.forEach((line) => {
      if (line.dataset.original) line.textContent = line.dataset.original
    })
  })
}

setupCtaGlitch()
