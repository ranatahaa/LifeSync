// LifeSync — Scroll Reveal Animations

(function() {
  // Add reveal classes to sections
  const revealSections = [
    '.stats-bar',
    '.how .section-label',
    '.how h2',
    '.story .section-label',
    '.story h2',
    '.story .story-sub',
    '.features .section-label',
    '.features h2',
    '.testimonials .section-label',
    '.testimonials h2',
    '.download h2',
    '.download p',
    '.wallpaper-selector',
    '.price-tag',
    '#paypal-button-container',
  ];

  revealSections.forEach(sel => {
    const el = document.querySelector(sel);
    if (el) el.classList.add('reveal');
  });

  // Add stagger to grids
  const staggerGrids = [
    '.steps',
    '.feature-grid',
    '.testi-grid',
  ];

  staggerGrids.forEach(sel => {
    const el = document.querySelector(sel);
    if (el) el.classList.add('reveal-stagger');
  });

  // Intersection Observer for reveals
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, {
    threshold: 0.15,
    rootMargin: '0px 0px -40px 0px'
  });

  document.querySelectorAll('.reveal, .reveal-stagger, .year-phone-wrap').forEach(el => {
    observer.observe(el);
  });

  // Animate stat numbers counting up
  const statNums = document.querySelectorAll('.stat-num');
  const statObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const text = el.textContent;

        if (text === '365') {
          animateNumber(el, 0, 365, 1200);
        } else if (text === '2') {
          animateNumber(el, 0, 2, 600);
        }
        // '1' and '∞' stay static

        statObserver.unobserve(el);
      }
    });
  }, { threshold: 0.5 });

  statNums.forEach(el => statObserver.observe(el));

  function animateNumber(el, start, end, duration) {
    const startTime = performance.now();
    function update(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(start + (end - start) * eased);
      el.textContent = current;
      if (progress < 1) requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
  }

  // Smooth scroll for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
})();
