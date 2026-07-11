/* ============================================================
   PORTFOLIO — main.js
   ============================================================ */

// ── Dark mode toggle ───────────────────────────────────────
const themeBtn = document.getElementById('theme-toggle');
if (localStorage.getItem('theme') === 'dark') document.body.classList.add('dark-mode');
themeBtn.addEventListener('click', () => {
  document.body.classList.toggle('dark-mode');
  localStorage.setItem('theme', document.body.classList.contains('dark-mode') ? 'dark' : 'light');
});

// ── Hamburger menu ─────────────────────────────────────────
const hamburger  = document.getElementById('nav-hamburger');
const navMenu    = document.getElementById('nav-links');

hamburger.addEventListener('click', () => {
  const isOpen = hamburger.classList.toggle('is-open');
  navMenu.classList.toggle('is-open', isOpen);
  hamburger.setAttribute('aria-expanded', String(isOpen));
});

navMenu.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    hamburger.classList.remove('is-open');
    navMenu.classList.remove('is-open');
    hamburger.setAttribute('aria-expanded', 'false');
  });
});

// ── Nav: scrolled shadow ───────────────────────────────────
const nav = document.querySelector('.nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('nav--scrolled', window.scrollY > 20);
}, { passive: true });

// ── Intersection Observer: fade-in on scroll ──────────────
const fadeEls = document.querySelectorAll('.project, .skills-group, .stat, .about__text p');
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

fadeEls.forEach((el, i) => {
  el.style.setProperty('--delay', `${i * 60}ms`);
  el.classList.add('fade-up');
  observer.observe(el);
});

// ── Contact form ───────────────────────────────────────────
const form = document.querySelector('.contact__form');
if (form) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn  = form.querySelector('button[type="submit"]');
    const name = form.querySelector('#name').value.trim();

    if (!name) { shakeField(form.querySelector('#name')); return; }

    btn.textContent = 'Sending…';
    btn.disabled = true;

    try {
      const res = await fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { 'Accept': 'application/json' }
      });
      if (res.ok) {
        btn.textContent = 'Message sent ✓';
        btn.style.background = '#2d7a4f';
        btn.style.borderColor = '#2d7a4f';
        form.reset();
        setTimeout(() => {
          btn.textContent = 'Send message';
          btn.style.background = '';
          btn.style.borderColor = '';
          btn.disabled = false;
        }, 3500);
      } else { throw new Error(); }
    } catch {
      btn.textContent = 'Failed — try again';
      btn.style.background = '#c0392b';
      btn.style.borderColor = '#c0392b';
      btn.disabled = false;
      setTimeout(() => {
        btn.textContent = 'Send message';
        btn.style.background = '';
        btn.style.borderColor = '';
      }, 3000);
    }
  });
}

function shakeField(input) {
  input.classList.add('shake');
  input.addEventListener('animationend', () => input.classList.remove('shake'), { once: true });
}

// ── Lightbox ───────────────────────────────────────────────
const lightbox      = document.getElementById('lightbox');
const lightboxImg   = document.getElementById('lightbox-img');
const lightboxClose = document.getElementById('lightbox-close');
const lightboxPrev  = document.getElementById('lightbox-prev');
const lightboxNext  = document.getElementById('lightbox-next');
let lightboxSrcs    = [];
let lightboxIndex   = 0;

function openLightbox(srcs, index) {
  if (!srcs[index]) return;
  lightboxSrcs  = srcs;
  lightboxIndex = index;
  lightboxImg.src = srcs[index];
  lightbox.classList.add('is-open');
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  lightbox.classList.remove('is-open');
  document.body.style.overflow = '';
}

function lightboxStep(dir) {
  lightboxIndex = (lightboxIndex + dir + lightboxSrcs.length) % lightboxSrcs.length;
  lightboxImg.src = lightboxSrcs[lightboxIndex];
}

lightboxClose.addEventListener('click', closeLightbox);
lightboxPrev.addEventListener('click',  () => lightboxStep(-1));
lightboxNext.addEventListener('click',  () => lightboxStep(1));
lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });
document.addEventListener('keydown', (e) => {
  if (!lightbox.classList.contains('is-open')) return;
  if (e.key === 'Escape')     closeLightbox();
  if (e.key === 'ArrowLeft')  lightboxStep(-1);
  if (e.key === 'ArrowRight') lightboxStep(1);
});

// ── Project sliders ────────────────────────────────────────
document.querySelectorAll('.project__img-wrap').forEach((wrap) => {
  const slider = wrap.querySelector('.project__slider');
  const dots   = wrap.querySelectorAll('.slider__dot');
  const slides = wrap.querySelectorAll('.project__slide');
  const prev   = wrap.querySelector('.slider__btn--prev');
  const next   = wrap.querySelector('.slider__btn--next');
  const hint   = wrap.querySelector('.project__zoom-hint');
  let current  = 0;

  const srcs = Array.from(slides).map(s => {
    const ds = s.getAttribute('data-src');
    if (ds) return ds;
    const bg = s.style.backgroundImage || getComputedStyle(s).backgroundImage;
    const match = bg.match(/url\(["']?(.+?)["']?\)/);
    return match ? match[1] : null;
  }).filter(Boolean);

  function goTo(index) {
    current = (index + slides.length) % slides.length;
    slider.style.transform = `translateX(-${current * 100}%)`;
    dots.forEach((d, i) => d.classList.toggle('is-active', i === current));
  }

  prev.addEventListener('click',  (e) => { e.stopPropagation(); goTo(current - 1); });
  next.addEventListener('click',  (e) => { e.stopPropagation(); goTo(current + 1); });
  dots.forEach((dot, i) => dot.addEventListener('click', (e) => { e.stopPropagation(); goTo(i); }));

  [wrap, hint].forEach(el => {
    if (el) el.addEventListener('click', (e) => {
      if (e.target.closest('.slider__btn') || e.target.closest('.slider__dots')) return;
      if (srcs.length) openLightbox(srcs, current);
    });
  });
});

// ── Education logo swap ────────────────────────────────────
const eduItems = document.querySelectorAll('.edu__item[data-logo]');
const eduLogo  = document.getElementById('edu-logo-display');

if (eduLogo && eduItems.length) {
  const defaultSrc = eduLogo.getAttribute('src');
  const defaultAlt = eduLogo.alt;

  function swapLogo(src, alt) {
    eduLogo.classList.add('is-swapping');
    setTimeout(() => {
      eduLogo.setAttribute('src', src);
      eduLogo.alt = alt;
      eduLogo.classList.remove('is-swapping');
    }, 180);
  }

  eduItems.forEach((item) => {
    const logo = item.getAttribute('data-logo');
    const alt  = item.getAttribute('data-logo-alt') || '';

    item.addEventListener('mouseenter', () => {
      eduItems.forEach(i => i.classList.remove('is-active'));
      item.classList.add('is-active');
      swapLogo(logo, alt);
    });
    item.addEventListener('mouseleave', () => {
      item.classList.remove('is-active');
      swapLogo(defaultSrc, defaultAlt);
    });
    item.addEventListener('click', () => {
      const isActive = item.classList.contains('is-active');
      eduItems.forEach(i => i.classList.remove('is-active'));
      if (!isActive) { item.classList.add('is-active'); swapLogo(logo, alt); }
      else swapLogo(defaultSrc, defaultAlt);
    });
  });
}

// ── Active nav link highlight ──────────────────────────────
const sections    = document.querySelectorAll('section[id]');
const navLinkEls  = document.querySelectorAll('.nav__links a');

const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      navLinkEls.forEach((link) => {
        link.classList.toggle('nav__link--active', link.getAttribute('href') === `#${entry.target.id}`);
      });
    }
  });
}, { rootMargin: '-40% 0px -55% 0px' });

sections.forEach((s) => sectionObserver.observe(s));
