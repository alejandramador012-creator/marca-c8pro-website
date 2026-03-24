/**
 * MARCA C8 PRO - main.js v3
 * Scroll-driven animations + interactividad
 */

document.addEventListener('DOMContentLoaded', () => {

  // ============================================
  // NAVBAR - Scroll effect
  // ============================================
  const navbar = document.querySelector('.navbar');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      navbar?.classList.add('navbar--scrolled');
    } else {
      navbar?.classList.remove('navbar--scrolled');
    }
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
  // MARQUEE - Duplicate content for infinite loop
  // ============================================
  const marqueeTrack = document.querySelector('.marquee-track');
  if (marqueeTrack) {
    const clone = marqueeTrack.cloneNode(true);
    marqueeTrack.parentElement.appendChild(clone);
  }

  // ============================================
  // SCROLL REVEAL ANIMATION
  // The 3 cards rise from the bottom, the MARCAC8PRO
  // text sweeps upward over them like a reveal effect.
  // All driven purely by scroll position.
  // ============================================
  const revealSection = document.getElementById('scroll-reveal');
  const revealCards = document.getElementById('revealCards');
  const revealText = document.getElementById('revealText');

  if (revealSection && revealCards && revealText) {

    // Initial state: cards start off-screen at the bottom,
    // text starts at center of viewport (will sweep up)
    revealCards.style.transform = 'translateY(100vh)';
    revealCards.style.opacity = '0';
    revealText.style.transform = 'translateY(60vh)';
    revealText.style.opacity = '0';

    const updateReveal = () => {
      const rect = revealSection.getBoundingClientRect();
      const sectionHeight = revealSection.offsetHeight;
      const viewH = window.innerHeight;

      // How far we've scrolled INTO the sticky section (0 to 1)
      // progress 0 = just entered, progress 1 = about to leave
      const scrolled = -rect.top; // px scrolled past section start
      const total = sectionHeight - viewH; // total scrollable range
      const progress = Math.max(0, Math.min(1, scrolled / total));

      // ---- Phase 1 (0 → 0.4): Cards rise from below + fade in ----
      const p1 = Math.max(0, Math.min(1, progress / 0.4));
      const cardsY = (1 - p1) * 100; // from 100vh → 0vh
      const cardsOpacity = p1;

      // ---- Phase 2 (0.2 → 0.65): Text sweeps upward from center ----
      const p2 = Math.max(0, Math.min(1, (progress - 0.2) / 0.45));
      const textY = 60 - p2 * 140; // from 60vh → -80vh
      const textOpacity = p2 < 0.1 ? p2 * 10 : (p2 > 0.85 ? (1 - p2) / 0.15 : 1);

      // ---- Phase 3 (0.7 → 1.0): Everything fades out + rises away ----
      const p3 = Math.max(0, Math.min(1, (progress - 0.7) / 0.3));
      const exitY = -p3 * 40; // slight upward exit
      const exitOpacity = 1 - p3;

      // Apply to cards
      revealCards.style.transform = `translateY(calc(${cardsY}vh + ${exitY}vh))`;
      revealCards.style.opacity = cardsOpacity * exitOpacity;

      // Apply to text (already has its own movement, just apply exit fade)
      revealText.style.transform = `translateY(${textY}vh)`;
      revealText.style.opacity = Math.min(textOpacity, exitOpacity);
    };

    window.addEventListener('scroll', updateReveal, { passive: true });
    updateReveal(); // run once on load
  }

  // ============================================
  // BENEFITS CARDS - Tilt effect on hover
  // ============================================
  document.querySelectorAll('.benefit-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const rotateX = ((y - rect.height / 2) / rect.height) * 5;
      const rotateY = ((x - rect.width / 2) / rect.width) * -5;
      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });

  // ============================================
  // FAQ - Animated accordion
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
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

  document.querySelectorAll(
    '.about-section, .video-section, .pain-section, .benefits-section, .presence-section, .faq-section, .cta-final'
  ).forEach(section => {
    section.classList.add('fade-in');
    observer.observe(section);
  });

  document.querySelectorAll('.feature-item, .pain-card, .benefit-card, .faq-item').forEach((card, i) => {
    card.classList.add('fade-in');
    card.style.transitionDelay = `${i * 0.08}s`;
    observer.observe(card);
  });

  // ============================================
  // VIDEO - Play on scroll into view
  // ============================================
  const video = document.querySelector('.video-wrapper video');
  if (video) {
    new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          video.play().catch(() => {});
        } else {
          video.pause();
        }
      });
    }, { threshold: 0.3 }).observe(video);
  }

  // ============================================
  // CTA FINAL - Staggered line reveal
  // ============================================
  const ctaLines = document.querySelectorAll('.cta-text p');
  ctaLines.forEach((line, i) => {
    line.style.opacity = '0';
    line.style.transform = 'translateY(20px)';
    line.style.transition = `opacity 0.6s ease ${0.5 + i * 0.3}s, transform 0.6s ease ${0.5 + i * 0.3}s`;
  });

  const ctaSection = document.querySelector('.cta-final');
  if (ctaSection) {
    new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          ctaLines.forEach(line => {
            line.style.opacity = '1';
            line.style.transform = 'translateY(0)';
          });
        }
      });
    }, { threshold: 0.3 }).observe(ctaSection);
  }

});

// ============================================
// CSS injection for JS-powered animations
// ============================================
const animationStyles = document.createElement('style');
animationStyles.textContent = `
  .fade-in {
    opacity: 0;
    transform: translateY(30px);
    transition: opacity 0.7s ease, transform 0.7s ease;
  }
  .fade-in.is-visible {
    opacity: 1;
    transform: translateY(0);
  }
  .navbar--scrolled {
    background: rgba(0, 0, 0, 0.97) !important;
  }
  .benefit-card {
    transition: transform 0.3s ease;
  }
  #revealCards {
    transition: none;
  }
  #revealText {
    transition: none;
  }
`;
document.head.appendChild(animationStyles);
