/* =========================================================
   MAISON NAJM — interactive layer
   ========================================================= */
(() => {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- NAV SCROLL STATE ---------- */
  const nav = document.getElementById('nav');
  const onScroll = () => {
    if (window.scrollY > 40) nav.classList.add('scrolled');
    else nav.classList.remove('scrolled');
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- HAMBURGER ---------- */
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobileMenu');
  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', () => {
      const isOpen = hamburger.classList.toggle('open');
      mobileMenu.classList.toggle('open', isOpen);
      hamburger.setAttribute('aria-expanded', String(isOpen));
      mobileMenu.setAttribute('aria-hidden', String(!isOpen));
    });
    mobileMenu.querySelectorAll('a').forEach((a) =>
      a.addEventListener('click', () => {
        hamburger.classList.remove('open');
        mobileMenu.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
        mobileMenu.setAttribute('aria-hidden', 'true');
      })
    );
  }

  /* ---------- REVEAL ON SCROLL ---------- */
  const revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -60px 0px' }
    );
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('visible'));
  }

  /* ---------- CUSTOM CURSOR ---------- */
  const dot = document.querySelector('.cursor-dot');
  const ring = document.querySelector('.cursor-ring');
  if (dot && ring && window.matchMedia('(hover: hover)').matches) {
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let ringX = mouseX;
    let ringY = mouseY;

    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      dot.style.transform = `translate(${mouseX}px, ${mouseY}px) translate(-50%, -50%)`;
    });

    const animateRing = () => {
      ringX += (mouseX - ringX) * 0.14;
      ringY += (mouseY - ringY) * 0.14;
      ring.style.transform = `translate(${ringX}px, ${ringY}px) translate(-50%, -50%)`;
      requestAnimationFrame(animateRing);
    };
    animateRing();

    // Hover states
    const hoverables = document.querySelectorAll('a, button, .card, input');
    hoverables.forEach((el) => {
      el.addEventListener('mouseenter', () => ring.classList.add('hover'));
      el.addEventListener('mouseleave', () => ring.classList.remove('hover'));
    });

    window.addEventListener('mouseleave', () => {
      dot.style.opacity = '0';
      ring.style.opacity = '0';
    });
    window.addEventListener('mouseenter', () => {
      dot.style.opacity = '1';
      ring.style.opacity = '1';
    });
  }


  /* ---------- HERO CANVAS: GOLD PARTICLES + BURSTS ---------- */
  const canvas = document.getElementById('heroCanvas');
  if (canvas && !prefersReducedMotion) {
    const ctx = canvas.getContext('2d', { alpha: true });
    let w = 0;
    let h = 0;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);

    const particles = [];
    const bursts = [];

    const resize = () => {
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const createParticles = () => {
      particles.length = 0;
      const count = Math.min(120, Math.floor((w * h) / 14000));
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * w,
          y: Math.random() * h,
          r: Math.random() * 1.4 + 0.3,
          vx: (Math.random() - 0.5) * 0.15,
          vy: (Math.random() - 0.5) * 0.12 - 0.05,
          a: Math.random() * 0.5 + 0.15,
          tw: Math.random() * Math.PI * 2, // twinkle phase
        });
      }
    };

    resize();
    createParticles();
    window.addEventListener('resize', () => {
      resize();
      createParticles();
    });

    const spawnBurst = () => {
      const cx = w * (0.35 + Math.random() * 0.3);
      const cy = h * (0.3 + Math.random() * 0.4);
      const count = 22 + Math.floor(Math.random() * 14);
      const color = Math.random() > 0.7 ? '#8B0000' : '#C9A84C';
      for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 * i) / count + Math.random() * 0.3;
        const speed = 1 + Math.random() * 2.2;
        bursts.push({
          x: cx,
          y: cy,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 1,
          decay: 0.008 + Math.random() * 0.01,
          r: Math.random() * 1.6 + 0.6,
          color,
        });
      }
    };

    // Random bursts
    const scheduleBurst = () => {
      const delay = 4200 + Math.random() * 5200;
      setTimeout(() => {
        spawnBurst();
        scheduleBurst();
      }, delay);
    };
    scheduleBurst();
    setTimeout(spawnBurst, 2200);

    let frame = 0;
    const render = () => {
      frame++;
      // Trail fade
      ctx.fillStyle = 'rgba(10,10,10,0.12)';
      ctx.fillRect(0, 0, w, h);

      // Drifting particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.tw += 0.02;

        if (p.x < -10) p.x = w + 10;
        if (p.x > w + 10) p.x = -10;
        if (p.y < -10) p.y = h + 10;
        if (p.y > h + 10) p.y = -10;

        const twinkle = 0.6 + Math.sin(p.tw) * 0.4;
        const alpha = p.a * twinkle;

        // Gold glow
        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 6);
        grad.addColorStop(0, `rgba(201, 168, 76, ${alpha})`);
        grad.addColorStop(1, 'rgba(201, 168, 76, 0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * 6, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = `rgba(240, 237, 230, ${alpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }

      // Bursts
      for (let i = bursts.length - 1; i >= 0; i--) {
        const b = bursts[i];
        b.x += b.vx;
        b.y += b.vy;
        b.vx *= 0.985;
        b.vy *= 0.985;
        b.life -= b.decay;
        if (b.life <= 0) {
          bursts.splice(i, 1);
          continue;
        }
        const alpha = Math.max(b.life, 0);
        const [r, g, bl] = b.color === '#8B0000' ? [139, 0, 0] : [201, 168, 76];
        const grad = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r * 8);
        grad.addColorStop(0, `rgba(${r}, ${g}, ${bl}, ${alpha})`);
        grad.addColorStop(1, `rgba(${r}, ${g}, ${bl}, 0)`);
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r * 8, 0, Math.PI * 2);
        ctx.fill();
      }

      requestAnimationFrame(render);
    };
    render();
  }

  /* ---------- LAZY SECTIONS BELOW FOLD ---------- */
  // Defer paint of offscreen SVG heavy nodes via content-visibility if supported.
  if ('CSS' in window && CSS.supports && CSS.supports('content-visibility', 'auto')) {
    document.querySelectorAll('.collection, .story, .statement, .atelier').forEach((s) => {
      s.style.contentVisibility = 'auto';
      s.style.containIntrinsicSize = '900px';
    });
  }
})();
