// LifeSync — Premium 3D Animations

(function() {
  'use strict';

  // =====================
  // THREE.JS PARTICLE BACKGROUND
  // =====================
  function initParticles() {
    if (typeof THREE === 'undefined') return;

    const canvas = document.getElementById('bg-canvas');
    if (!canvas) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const particleCount = 1000;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 20;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.02,
      transparent: true,
      opacity: 0.4,
      sizeAttenuation: true,
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);
    camera.position.z = 5;

    let mouseX = 0, mouseY = 0;
    let targetMouseX = 0, targetMouseY = 0;

    document.addEventListener('mousemove', (e) => {
      targetMouseX = (e.clientX / window.innerWidth - 0.5) * 2;
      targetMouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    });

    let scrollY = 0;
    window.addEventListener('scroll', () => { scrollY = window.pageYOffset; });

    function animate() {
      requestAnimationFrame(animate);
      mouseX += (targetMouseX - mouseX) * 0.05;
      mouseY += (targetMouseY - mouseY) * 0.05;
      particles.rotation.y = mouseX * 0.3 + scrollY * 0.0002;
      particles.rotation.x = mouseY * 0.2 + scrollY * 0.0001;
      particles.rotation.z += 0.0003;
      renderer.render(scene, camera);
    }
    animate();

    window.addEventListener('resize', () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });
  }

  initParticles();

  // =====================
  // CURSOR GLOW
  // =====================
  const cursorGlow = document.getElementById('cursorGlow');
  if (cursorGlow) {
    let glowActive = false;
    document.addEventListener('mousemove', (e) => {
      if (!glowActive) { cursorGlow.classList.add('active'); glowActive = true; }
      cursorGlow.style.left = e.clientX + 'px';
      cursorGlow.style.top = e.clientY + 'px';
    });
  }

  // =====================
  // CARD SPOTLIGHT EFFECT
  // =====================
  document.querySelectorAll('.step-card, .feature-card, .testi-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      card.style.setProperty('--mouse-x', x + '%');
      card.style.setProperty('--mouse-y', y + '%');
    });
  });

  // =====================
  // 3D TILT EFFECT ON HOVER
  // =====================
  if (window.innerWidth > 768) {
    document.querySelectorAll('[data-tilt]').forEach(el => {
      const maxTilt = parseFloat(el.dataset.tiltMax) || 10;
      let currentTiltX = 0, currentTiltY = 0;
      let targetTiltX = 0, targetTiltY = 0;
      let tiltRAF = null;

      function animateTilt() {
        currentTiltX += (targetTiltX - currentTiltX) * 0.1;
        currentTiltY += (targetTiltY - currentTiltY) * 0.1;
        el.style.transform = `perspective(800px) rotateX(${currentTiltX}deg) rotateY(${currentTiltY}deg) translateY(-8px) scale(1.02)`;
        if (Math.abs(targetTiltX - currentTiltX) > 0.01 || Math.abs(targetTiltY - currentTiltY) > 0.01) {
          tiltRAF = requestAnimationFrame(animateTilt);
        }
      }

      el.addEventListener('mousemove', (e) => {
        const rect = el.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top) / rect.height;
        targetTiltX = (y - 0.5) * maxTilt;
        targetTiltY = (x - 0.5) * -maxTilt;
        if (!tiltRAF) tiltRAF = requestAnimationFrame(animateTilt);
      });

      el.addEventListener('mouseleave', () => {
        targetTiltX = 0;
        targetTiltY = 0;
        if (tiltRAF) cancelAnimationFrame(tiltRAF);
        tiltRAF = requestAnimationFrame(function resetTilt() {
          currentTiltX += (0 - currentTiltX) * 0.1;
          currentTiltY += (0 - currentTiltY) * 0.1;
          el.style.transform = `perspective(800px) rotateX(${currentTiltX}deg) rotateY(${currentTiltY}deg) translateY(0) scale(1)`;
          if (Math.abs(currentTiltX) > 0.01 || Math.abs(currentTiltY) > 0.01) {
            tiltRAF = requestAnimationFrame(resetTilt);
          } else {
            el.style.transform = '';
            tiltRAF = null;
          }
        });
      });
    });
  }

  // =====================
  // SCROLL REVEAL (IntersectionObserver)
  // =====================

  // Simple reveal for individual elements
  const revealEls = document.querySelectorAll('.section-header, .year-phone-wrap, .wallpaper-selector, .price-tag, #paypal-button-container, .stats-inner');

  revealEls.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(40px)';
    el.style.transition = 'opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)';
  });

  const revealObs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        revealObs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.05, rootMargin: '0px 0px 50px 0px' });

  revealEls.forEach(el => revealObs.observe(el));

  // Staggered reveals for grid children
  const staggerGrids = document.querySelectorAll('.steps, .feature-grid, .testi-grid');
  staggerGrids.forEach(grid => {
    const children = Array.from(grid.children);
    children.forEach((child, i) => {
      child.style.opacity = '0';
      child.style.transform = 'translateY(50px)';
      child.style.transition = `opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1) ${i * 0.12}s, transform 0.8s cubic-bezier(0.16, 1, 0.3, 1) ${i * 0.12}s`;
    });

    const gridObs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          children.forEach(child => {
            child.style.opacity = '1';
            child.style.transform = 'translateY(0)';
          });
          gridObs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.05, rootMargin: '0px 0px 50px 0px' });

    gridObs.observe(grid);
  });

  // =====================
  // HERO ENTRANCE ANIMATION
  // =====================
  const heroTimeline = [
    { el: '.badge', delay: 200 },
    { el: '.hero-text h1 .line:first-child', delay: 350 },
    { el: '.hero-text h1 .line:last-child', delay: 500 },
    { el: '.hero-text p', delay: 650 },
    { el: '.hero-cta', delay: 800 },
    { el: '.phone-3d-wrapper', delay: 500 },
    { el: '.scroll-indicator', delay: 1200 },
  ];

  heroTimeline.forEach(({ el, delay }) => {
    const element = document.querySelector(el);
    if (!element) return;
    element.style.opacity = '0';
    element.style.transform = el.includes('phone') ? 'translateY(80px) rotateY(-20deg)' : 'translateY(30px)';
    element.style.transition = 'opacity 1s cubic-bezier(0.16, 1, 0.3, 1), transform 1s cubic-bezier(0.16, 1, 0.3, 1)';

    setTimeout(() => {
      element.style.opacity = '1';
      element.style.transform = el.includes('phone') ? 'translateY(0) rotateY(0deg)' : 'translateY(0)';
    }, delay);
  });

  // =====================
  // STAT COUNTER ANIMATION
  // =====================
  const statNums = document.querySelectorAll('.stat-num[data-count]');
  const statObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseInt(el.dataset.count);
        const duration = target > 100 ? 1500 : 800;
        const startTime = performance.now();

        function update(currentTime) {
          const elapsed = currentTime - startTime;
          const progress = Math.min(elapsed / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          el.textContent = Math.round(target * eased);
          if (progress < 1) requestAnimationFrame(update);
        }
        requestAnimationFrame(update);
        statObserver.unobserve(el);
      }
    });
  }, { threshold: 0.5 });

  statNums.forEach(el => statObserver.observe(el));

  // =====================
  // NAV HIDE/SHOW ON SCROLL
  // =====================
  let lastScroll = 0;
  const nav = document.getElementById('mainNav');

  window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    if (currentScroll > 100) nav.classList.add('scrolled');
    else nav.classList.remove('scrolled');

    if (currentScroll > lastScroll && currentScroll > 200) nav.classList.add('hidden');
    else nav.classList.remove('hidden');

    lastScroll = currentScroll;
  });

  // =====================
  // HERO PHONE MOUSE PARALLAX (3D)
  // =====================
  const darkPhone = document.getElementById('darkPhone');
  const lightPhone = document.getElementById('lightPhone');

  if (darkPhone && lightPhone && window.innerWidth > 768) {
    let phoneMouseX = 0, phoneMouseY = 0;
    let phoneScrollFactor = 0;

    function updatePhoneTransforms() {
      darkPhone.style.transform = `rotateY(${-15 + phoneMouseX * 8}deg) rotateX(${5 + phoneMouseY * -5}deg) translateZ(20px) translateY(${-phoneScrollFactor}px)`;
      lightPhone.style.transform = `rotateY(${10 + phoneMouseX * 8}deg) rotateX(${-3 + phoneMouseY * -5}deg) translateZ(-10px) translateY(${-phoneScrollFactor * 0.6}px)`;
    }

    document.addEventListener('mousemove', (e) => {
      phoneMouseX = (e.clientX / window.innerWidth - 0.5) * 2;
      phoneMouseY = (e.clientY / window.innerHeight - 0.5) * 2;
      updatePhoneTransforms();
    });

    window.addEventListener('scroll', () => {
      phoneScrollFactor = window.pageYOffset * 0.15;
      updatePhoneTransforms();
    });
  }

  // =====================
  // SMOOTH SCROLL FOR ANCHOR LINKS
  // =====================
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      if (href && href.length > 1 && href.startsWith('#')) {
        const target = document.querySelector(href);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    });
  });

})();
