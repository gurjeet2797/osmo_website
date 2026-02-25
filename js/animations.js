/**
 * Osmo Animations
 * Hero entrance sequence, scroll-triggered section reveals
 */

(function () {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function initHeroEntrance() {
    const title = document.querySelector('.hero-title');
    const divider = document.querySelector('.hero-divider');
    const tagline = document.querySelector('.hero-tagline');
    const orb = document.getElementById('particle-orb');

    if (!title) return;

    if (reducedMotion) {
      [title, divider, tagline, orb].forEach((el) => {
        if (el) el.classList.add('visible');
      });
      return;
    }

    setTimeout(() => title.classList.add('visible'), 0);
    setTimeout(() => divider?.classList.add('visible'), 600);
    setTimeout(() => tagline?.classList.add('visible'), 1000);
    setTimeout(() => orb?.classList.add('visible'), 1600);
  }

  function initScrollReveals() {
    const sections = document.querySelectorAll('.section-reveal');

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -50px 0px' }
    );

    sections.forEach((section) => observer.observe(section));
  }

  function init() {
    initHeroEntrance();
    initScrollReveals();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
