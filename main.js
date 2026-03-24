/**
 * MARCA C8 PRO - main.js
 * Interactividad de la página web
 */

document.addEventListener('DOMContentLoaded', () => {

  // ============================================
  // NAVBAR - Scroll effect
  // ============================================
  const navbar = document.querySelector('.navbar');
  
  const handleScroll = () => {
    if (window.scrollY > 50) {
      navbar?.classList.add('navbar--scrolled');
    } else {
      navbar?.classList.remove('navbar--scrolled');
    }
  };

  window.addEventListener('scroll', handleScroll, { passive: true });

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
    // Clone track content for seamless loop
    const clone = marqueeTrack.cloneNode(true);
    marqueeTrack.parentElement.appendChild(clone);
  }

  // ============================================
  // BENEFITS CARDS - Tilt effect on hover
  // ============================================
  document.querySelectorAll('.benefit-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = ((y - centerY) / centerY) * 5;
      const rotateY = ((x - centerX) / centerX) * -5;
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
        // Close other open items
        document.querySelectorAll('.faq-item[open]').forEach(other => {
          if (other !== item) {
            other.removeAttribute('open');
          }
        });
      }
    });
  });

  // ============================================
  // GALLERY SECTION - Parallax scrolling
  // ============================================
  const galleryCards = document.querySelectorAll('.gallery-card');
  
  const handleParallax = () => {
    const scrollY = window.scrollY;
    galleryCards.forEach((card, i) => {
      const speed = i === 1 ? 0.05 : 0.03 * (i % 2 === 0 ? 1 : -1);
      const translateY = scrollY * speed;
      card.style.transform = `translateY(${translateY}px)`;
    });
  };

  window.addEventListener('scroll', handleParallax, { passive: true });

  // ============================================
  // INTERSECTION OBSERVER - Fade in sections
  // ============================================
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  // Observe sections for fade-in animation
  const sections = document.querySelectorAll(
    '.about-section, .video-section, .pain-section, .benefits-section, .presence-section, .faq-section, .cta-final'
  );
  sections.forEach(section => {
    section.classList.add('fade-in');
    observer.observe(section);
  });

  // Observe individual cards
  const cards = document.querySelectorAll('.feature-item, .pain-card, .benefit-card, .faq-item');
  cards.forEach((card, i) => {
    card.classList.add('fade-in');
    card.style.transitionDelay = `${i * 0.08}s`;
    observer.observe(card);
  });

  // ============================================
  // VIDEO - Play on scroll into view
  // ============================================
  const video = document.querySelector('.video-wrapper video');
  if (video) {
    const videoObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          video.play().catch(() => {});
        } else {
          video.pause();
        }
      });
    }, { threshold: 0.3 });
    
    videoObserver.observe(video);
  }

  // ============================================
  // CTA FINAL - Typewriter effect
  // ============================================
  const ctaLines = document.querySelectorAll('.cta-text p');
  ctaLines.forEach((line, i) => {
    line.style.opacity = '0';
    line.style.transform = 'translateY(20px)';
    line.style.transition = `opacity 0.6s ease ${0.5 + i * 0.3}s, transform 0.6s ease ${0.5 + i * 0.3}s`;
  });

  const ctaObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        ctaLines.forEach(line => {
          line.style.opacity = '1';
          line.style.transform = 'translateY(0)';
        });
        ctaObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });

  const ctaSection = document.querySelector('.cta-final');
  if (ctaSection) ctaObserver.observe(ctaSection);

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
    border-bottom-color: rgba(255,255,255,0.12) !important;
  }
  .benefit-card {
    transition: transform 0.3s ease;
  }
`;
document.head.appendChild(animationStyles);
