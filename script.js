/* =============================================
   DABLU KUMAR PORTFOLIO — SCRIPT.JS
   Theme Switcher · Animations · Interactions
============================================= */

'use strict';

// ====== THEME TOGGLER (Initialize immediately) ======
function initTheme() {
  const toggleBtn = document.getElementById('themeToggleBtn');
  
  // Get stored theme or detect system preference (defaults to dark for modern developer feel)
  const savedTheme = localStorage.getItem('portfolio_theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const initialTheme = savedTheme ? savedTheme : (prefersDark ? 'dark' : 'dark');

  setTheme(initialTheme);

  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      setTheme(newTheme);
      
      // Haptic/visual micro-interaction
      toggleBtn.style.transform = 'scale(0.88) rotate(35deg)';
      setTimeout(() => {
        toggleBtn.style.transform = '';
      }, 300);
    });
  }

  // Listen to system theme changes
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
    if (!localStorage.getItem('portfolio_theme')) {
      setTheme(e.matches ? 'dark' : 'light');
    }
  });
}

function setTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  document.body.setAttribute('data-theme', theme);
  localStorage.setItem('portfolio_theme', theme);
  
  const toggleBtn = document.getElementById('themeToggleBtn');
  if (toggleBtn) {
    toggleBtn.setAttribute('title', theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode');
    toggleBtn.setAttribute('aria-label', theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode');
  }

  if (window.updateParticleTheme) {
    window.updateParticleTheme(theme);
  }
}

// Run theme setup immediately to prevent theme flash
initTheme();

// ====== LOADER ======
window.addEventListener('load', () => {
  setTimeout(() => {
    const loader = document.getElementById('loader');
    if (loader) {
      loader.classList.add('hidden');
      document.body.classList.remove('loading');
      initAnimations();
    }
  }, 1600);
});

// Prevent scroll during load
document.body.classList.add('loading');

// ====== PARTICLE CANVAS ======
function initParticles() {
  const canvas = document.getElementById('particleCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let particles = [];
  let mouse = { x: null, y: null };
  let animId;

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);
  window.addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; });

  const darkColors = ['rgba(108,99,255,', 'rgba(0,212,255,', 'rgba(255,101,132,', 'rgba(255,217,61,'];
  const lightColors = ['rgba(79,70,229,', 'rgba(2,132,199,', 'rgba(225,29,72,', 'rgba(217,119,6,'];

  function getThemeColors() {
    const isLight = document.documentElement.getAttribute('data-theme') === 'light';
    return isLight ? lightColors : darkColors;
  }

  class Particle {
    constructor() { this.reset(); }
    reset() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.size = Math.random() * 2 + 0.5;
      this.baseX = this.x;
      this.baseY = this.y;
      this.vx = (Math.random() - 0.5) * 0.3;
      this.vy = (Math.random() - 0.5) * 0.3;
      const palette = getThemeColors();
      this.color = palette[Math.floor(Math.random() * palette.length)];
      this.alpha = Math.random() * 0.5 + 0.15;
      this.life = Math.random() * 200 + 100;
      this.maxLife = this.life;
    }
    update() {
      this.x += this.vx;
      this.y += this.vy;
      this.life--;
      if (this.life <= 0 || this.x < 0 || this.x > canvas.width || this.y < 0 || this.y > canvas.height) {
        this.reset();
      }
      // Mouse repel
      if (mouse.x !== null) {
        const dx = this.x - mouse.x;
        const dy = this.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 100) {
          const force = (100 - dist) / 100;
          this.x += (dx / dist) * force * 2;
          this.y += (dy / dist) * force * 2;
        }
      }
    }
    draw() {
      const lifeRatio = this.life / this.maxLife;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = this.color + (this.alpha * lifeRatio) + ')';
      ctx.fill();
    }
  }

  // Create particles
  const count = Math.min(120, Math.floor(window.innerWidth / 12));
  for (let i = 0; i < count; i++) particles.push(new Particle());

  window.updateParticleTheme = function() {
    particles.forEach(p => {
      const palette = getThemeColors();
      p.color = palette[Math.floor(Math.random() * palette.length)];
    });
  };

  // Draw connections
  function drawConnections() {
    const isLight = document.documentElement.getAttribute('data-theme') === 'light';
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 120) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = isLight
            ? `rgba(79,70,229,${(1 - dist / 120) * 0.12})`
            : `rgba(108,99,255,${(1 - dist / 120) * 0.08})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => { p.update(); p.draw(); });
    drawConnections();
    animId = requestAnimationFrame(animate);
  }
  animate();
}

// ====== CUSTOM CURSOR ======
function initCursor() {
  const cursor = document.getElementById('cursor');
  const follower = document.getElementById('cursorFollower');
  if (!cursor || !follower) return;

  let fx = 0, fy = 0;
  let mx = 0, my = 0;

  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    cursor.style.left = mx + 'px';
    cursor.style.top = my + 'px';
  });

  function animateCursor() {
    fx += (mx - fx) * 0.12;
    fy += (my - fy) * 0.12;
    follower.style.left = fx + 'px';
    follower.style.top = fy + 'px';
    requestAnimationFrame(animateCursor);
  }
  animateCursor();

  // Hover effects
  document.querySelectorAll('a, button, .skill-card, .tool-card, .project-card, .edu-card').forEach(el => {
    el.addEventListener('mouseenter', () => {
      cursor.style.width = '20px';
      cursor.style.height = '20px';
      cursor.style.background = 'var(--accent-2)';
      follower.style.width = '52px';
      follower.style.height = '52px';
    });
    el.addEventListener('mouseleave', () => {
      cursor.style.width = '12px';
      cursor.style.height = '12px';
      cursor.style.background = 'var(--accent-1)';
      follower.style.width = '36px';
      follower.style.height = '36px';
    });
  });

  // Hide on mobile
  if ('ontouchstart' in window) {
    cursor.style.display = 'none';
    follower.style.display = 'none';
  }
}

// ====== TYPED TEXT ======
function initTyped() {
  // Typed name
  const nameEl = document.getElementById('typedName');
  if (nameEl) {
    const name = 'Dablu Kumar';
    let i = 0;
    function typeName() {
      if (i < name.length) {
        nameEl.textContent += name[i++];
        setTimeout(typeName, 100);
      }
    }
    typeName();
  }

  // Typed roles
  const roleEl = document.getElementById('typedRole');
  if (roleEl) {
    const roles = [
      'Full Stack Developer',
      'MERN Stack Expert',
      'React.js Developer',
      'Node.js Engineer',
      'Python & Django Dev',
      'UI/UX Enthusiast'
    ];
    let ri = 0, ci = 0, deleting = false;
    function typeRole() {
      const current = roles[ri];
      if (!deleting) {
        roleEl.textContent = current.substring(0, ci + 1);
        ci++;
        if (ci === current.length) {
          deleting = true;
          setTimeout(typeRole, 2000);
          return;
        }
      } else {
        roleEl.textContent = current.substring(0, ci - 1);
        ci--;
        if (ci === 0) {
          deleting = false;
          ri = (ri + 1) % roles.length;
        }
      }
      setTimeout(typeRole, deleting ? 45 : 90);
    }
    typeRole();
  }
}

// ====== NAVBAR ======
function initNavbar() {
  const navbar = document.getElementById('navbar');
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('navLinks');
  if (!navbar) return;

  // Scroll effect
  function handleScroll() {
    if (window.scrollY > 60) navbar.classList.add('scrolled');
    else navbar.classList.remove('scrolled');
  }
  window.addEventListener('scroll', handleScroll, { passive: true });

  // Hamburger
  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('active');
      navLinks.classList.toggle('open');
    });
    // Close on link click
    navLinks.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navLinks.classList.remove('open');
      });
    });
    // Close on outside click
    document.addEventListener('click', e => {
      if (!navbar.contains(e.target)) {
        hamburger.classList.remove('active');
        navLinks.classList.remove('open');
      }
    });
  }

  // Active link on scroll
  const sections = document.querySelectorAll('section[id]');
  const links = document.querySelectorAll('.nav-link');
  function updateActive() {
    let current = '';
    sections.forEach(sec => {
      if (window.scrollY >= sec.offsetTop - 100) current = sec.id;
    });
    links.forEach(link => {
      link.classList.remove('active-nav');
      if (link.getAttribute('href') === '#' + current) link.classList.add('active-nav');
    });
  }
  window.addEventListener('scroll', updateActive, { passive: true });
}

// ====== COUNTER ANIMATION ======
function animateCounter(el) {
  const target = parseInt(el.dataset.target);
  const duration = 1800;
  const start = performance.now();
  function update(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 4);
    el.textContent = Math.floor(eased * target);
    if (progress < 1) requestAnimationFrame(update);
    else el.textContent = target;
  }
  requestAnimationFrame(update);
}

// ====== SKILLS TABS ======
function initSkillTabs() {
  const tabs = document.querySelectorAll('.skill-tab');
  const panels = document.querySelectorAll('.tab-panel');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const targetPanel = tab.dataset.tab;
      tabs.forEach(t => t.classList.remove('active'));
      panels.forEach(p => p.classList.remove('active'));
      tab.classList.add('active');
      const panel = document.querySelector(`[data-panel="${targetPanel}"]`);
      if (panel) {
        panel.classList.add('active');
        // Animate skill bars
        setTimeout(() => animateSkillBars(panel), 100);
      }
    });
  });
}

function animateSkillBars(container = document) {
  container.querySelectorAll('.skill-fill').forEach(fill => {
    const width = fill.dataset.width;
    fill.style.width = width + '%';
  });
}

// ====== INTERSECTION OBSERVER ======
function initReveal() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.classList.add('visible');

          // Animate counters
          const counters = entry.target.querySelectorAll('.stat-number');
          counters.forEach(c => animateCounter(c));

          // Animate skill bars
          animateSkillBars(entry.target);
        }, i * 60);

        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll(
    '.reveal, .reveal-left, .reveal-right, .glass-card, .skill-card, .tool-card, .project-card, .edu-card, .timeline-item'
  ).forEach(el => observer.observe(el));
}

// ====== COUNTER TRIGGER ======
function initCounterObserver() {
  const heroStats = document.querySelector('.hero-stats');
  if (!heroStats) return;
  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.querySelectorAll('.stat-number').forEach(c => animateCounter(c));
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });
  obs.observe(heroStats);
}

// ====== CONTACT FORM ======
function handleFormSubmit(e) {
  e.preventDefault();
  const btn = document.getElementById('submitBtn');
  const success = document.getElementById('formSuccess');
  if (!btn) return;

  btn.innerHTML = '<span>Sending...</span>';
  btn.style.opacity = '0.8';
  btn.disabled = true;

  // Simulate send (link to Formspree or EmailJS in production)
  setTimeout(() => {
    btn.innerHTML = `<span>Send Message</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>`;
    btn.style.opacity = '1';
    btn.disabled = false;
    if (success) success.style.display = 'block';
    document.getElementById('contactForm').reset();
    setTimeout(() => { if (success) success.style.display = 'none'; }, 5000);
  }, 1800);
}

// ====== BACK TO TOP ======
function initBackToTop() {
  const btn = document.getElementById('backToTop');
  if (!btn) return;
  window.addEventListener('scroll', () => {
    if (window.scrollY > 500) btn.classList.add('visible');
    else btn.classList.remove('visible');
  }, { passive: true });
  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

// ====== HERO BG PARALLAX ======
function initParallax() {
  const heroBg = document.querySelector('.hero-bg-grid');
  if (!heroBg) return;
  window.addEventListener('scroll', () => {
    heroBg.style.transform = `translateY(${window.scrollY * 0.15}px)`;
  }, { passive: true });
}

// ====== TILT EFFECT ON CARDS ======
function initTilt() {
  document.querySelectorAll('.project-card, .glass-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width - 0.5) * 10;
      const y = ((e.clientY - rect.top) / rect.height - 0.5) * -10;
      card.style.transform = `perspective(800px) rotateX(${y}deg) rotateY(${x}deg) translateY(-4px)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
      card.style.transition = 'transform 0.5s ease';
      setTimeout(() => { card.style.transition = ''; }, 500);
    });
  });
}

// ====== SMOOTH ANCHOR OFFSET ======
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const id = a.getAttribute('href').slice(1);
      const target = document.getElementById(id);
      if (target) {
        e.preventDefault();
        const top = target.getBoundingClientRect().top + window.scrollY - 80;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });
}

// ====== GLOW FOLLOW MOUSE ======
function initGlowFollow() {
  const hero = document.querySelector('.hero');
  if (!hero) return;
  hero.addEventListener('mousemove', e => {
    const rect = hero.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    hero.style.background = `radial-gradient(600px at ${x}px ${y}px, rgba(108,99,255,0.07), transparent 60%)`;
  });
  hero.addEventListener('mouseleave', () => { hero.style.background = ''; });
}

// ====== SKILL CARD 3D HOVER ======
function initSkillHover() {
  document.querySelectorAll('.skill-card').forEach(card => {
    card.addEventListener('mouseenter', () => {
      card.style.transition = 'all 0.3s ease';
    });
  });
}

// ====== ACTIVE NAV LINK STYLE ======
const style = document.createElement('style');
style.textContent = `
  .nav-link.active-nav { color: var(--accent-1) !important; }
  .nav-link.active-nav::after { left: 14px !important; right: 14px !important; }
`;
document.head.appendChild(style);

// ====== INIT ALL ======
function initAnimations() {
  initParticles();
  initCursor();
  initTyped();
  initNavbar();
  initSkillTabs();
  initReveal();
  initCounterObserver();
  initBackToTop();
  initParallax();
  initTilt();
  initSmoothScroll();
  initGlowFollow();
  initSkillHover();
  // Animate initial skill bars after a short delay
  setTimeout(() => animateSkillBars(document.querySelector('.tab-panel.active')), 600);
}

// Expose form handler
window.handleFormSubmit = handleFormSubmit;
