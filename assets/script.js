/* ============================================================
   CodeKaar · Shared JavaScript
   Used by all pages: index, qmr, pashtoons, services,
   portfolio, pricing, about, contact
   ============================================================ */

(function () {
  'use strict';

  /* ---------- Safe storage helpers ---------- */
  const store = {
    get(k){ try { return localStorage.getItem(k); } catch(e){ return null; } },
    set(k,v){ try { localStorage.setItem(k,v); } catch(e){} }
  };

  /* ============================================================
     1. LANGUAGE SWITCHER (i18n)
     ============================================================
     Each page defines window.PAGE_I18N = { en:{...}, ps:{...}, fa:{...} }
     BEFORE loading this script. We apply it here.
     ============================================================ */
  const i18n = window.PAGE_I18N || { en: {}, ps: {}, fa: {} };
  let currentLang = store.get('ck-lang') || 'en';

  function applyLang(lang){
    const dict = i18n[lang] || i18n.en || {};
    currentLang = lang;

    // set html lang + dir
    document.documentElement.lang = lang === 'ps' ? 'ps' : lang === 'fa' ? 'fa' : 'en';
    document.documentElement.dir  = (lang === 'ps' || lang === 'fa') ? 'rtl' : 'ltr';

    // swap all [data-i18n] elements
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (dict[key] !== undefined) el.textContent = dict[key];
    });

    // highlight active lang button
    document.querySelectorAll('.lang-switch button').forEach(b => {
      b.classList.toggle('active', b.dataset.lang === lang);
    });

    store.set('ck-lang', lang);
  }

  // wire up the language buttons
  document.querySelectorAll('.lang-switch button').forEach(btn => {
    btn.addEventListener('click', () => applyLang(btn.dataset.lang));
  });

  // apply saved language on load
  // (will run again at the end of the IIFE once DOM is ready)

  /* ============================================================
     2. LOADER
     ============================================================ */
  const loader = document.getElementById('loader');

  function hideLoader(){
    if (loader) loader.classList.add('hide');
    setTimeout(() => loader && loader.remove(), 950);
  }

  if (document.readyState === 'complete') {
    setTimeout(hideLoader, 650);
  } else {
    window.addEventListener('load', () => setTimeout(hideLoader, 650));
    setTimeout(hideLoader, 3800); // safety fallback
  }

  /* ============================================================
     3. THEME TOGGLE (dark / light)
     ============================================================ */
  const root = document.documentElement;
  const themeBtn = document.getElementById('themeBtn');

  const savedTheme = store.get('ck-theme');
  if (savedTheme === 'light' || savedTheme === 'dark') {
    root.setAttribute('data-theme', savedTheme);
  }

  function syncTheme(){
    if (!themeBtn) return;
    const dark = root.getAttribute('data-theme') === 'dark';
    themeBtn.textContent = dark ? '🌙' : '☀️';
    themeBtn.setAttribute('aria-label', dark ? 'Switch to light mode' : 'Switch to dark mode');
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', dark ? '#07070a' : '#fbfaf8');
  }
  syncTheme();

  if (themeBtn) {
    themeBtn.addEventListener('click', () => {
      const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      store.set('ck-theme', next);
      syncTheme();
    });
  }

  /* ============================================================
     4. STICKY NAV
     ============================================================ */
  const nav = document.getElementById('nav');
  if (nav) {
    const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ============================================================
     5. MOBILE MENU (burger)
     ============================================================ */
  const burger = document.getElementById('burger');
  const navLinks = document.getElementById('navLinks');

  function setMenu(open){
    if (!navLinks || !burger) return;
    navLinks.classList.toggle('open', open);
    burger.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', String(open));
    document.body.classList.toggle('lock', open);
  }

  if (burger && navLinks) {
    burger.addEventListener('click', () => setMenu(!navLinks.classList.contains('open')));
    navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setMenu(false)));
    document.addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });
  }

  /* ============================================================
     6. SCROLL REVEAL
     ============================================================ */
  const revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && revealEls.length) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    revealEls.forEach(el => io.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('in'));
  }

  /* ============================================================
     7. ACTIVE NAV LINK (scroll spy)
     ============================================================ */
  const sections = document.querySelectorAll('section[id]');
  const links = navLinks ? navLinks.querySelectorAll('a') : [];
  if ('IntersectionObserver' in window && sections.length && links.length) {
    const spy = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const id = entry.target.id;
        links.forEach(l => l.classList.toggle('active', l.getAttribute('href') === '#' + id));
      });
    }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });
    sections.forEach(s => spy.observe(s));
  }

  /* ============================================================
     8. CARD CURSOR GLOW (services page .tilt class)
     ============================================================ */
  document.querySelectorAll('.tilt').forEach(card => {
    card.addEventListener('pointermove', (e) => {
      const r = card.getBoundingClientRect();
      card.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100) + '%');
      card.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100) + '%');
    });
  });

  /* ============================================================
     9. FAQ ACCORDION
     ============================================================ */
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const q = item.querySelector('.faq-q');
    const a = item.querySelector('.faq-a');
    if (!q || !a) return;

    q.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      faqItems.forEach(other => {
        other.classList.remove('open');
        const oa = other.querySelector('.faq-a');
        if (oa) oa.style.maxHeight = null;
      });
      if (!isOpen) {
        item.classList.add('open');
        a.style.maxHeight = a.scrollHeight + 'px';
      }
    });
  });

  if (faqItems.length) {
    faqItems[0].classList.add('open');
    const firstA = faqItems[0].querySelector('.faq-a');
    if (firstA) firstA.style.maxHeight = firstA.scrollHeight + 'px';
  }

  /* ============================================================
     10. PORTFOLIO FILTER (only runs if filter bar exists)
     ============================================================ */
  const filterBtns = document.querySelectorAll('.filter-btn');
  const demoCards  = document.querySelectorAll('.demo-card[data-cat]');

  if (filterBtns.length && demoCards.length) {
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const filter = btn.dataset.filter;

        demoCards.forEach(card => {
          const cat = card.dataset.cat;
          if (filter === 'all' || cat === filter) {
            card.classList.remove('hidden');
            card.style.animation = 'none';
            void card.offsetWidth; // force reflow
            card.style.animation = 'fadeInUp .5s cubic-bezier(.22,1,.36,1) forwards';
          } else {
            card.classList.add('hidden');
          }
        });
      });
    });
  }

  /* ============================================================
     11. CONTACT FORM → WHATSAPP
     ============================================================ */
  const contactForm = document.getElementById('contactForm');
  const formMsg = document.getElementById('formMsg');

  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const name     = contactForm.name.value.trim();
      const business = contactForm.business ? contactForm.business.value.trim() : '';
      const contact  = contactForm.contact.value.trim();
      const type     = contactForm.type ? contactForm.type.value : '';
      const text     = contactForm.message.value.trim();

      if (!name || !contact || !text) {
        if (formMsg) {
          formMsg.textContent = 'Please fill in the required fields. ✦';
          formMsg.style.color = '#ff8a5c';
          formMsg.classList.add('show');
        }
        return;
      }

      const waText = encodeURIComponent(
        `Hi CodeKaar! I'd like a website.\n\n` +
        `Name: ${name}\n` +
        (business ? `Business: ${business}\n` : '') +
        `Contact: ${contact}\n` +
        (type ? `Type: ${type}\n` : '') +
        `\nMessage: ${text}`
      );

      if (formMsg) {
        formMsg.textContent = `Thanks, ${name}! Opening WhatsApp… ✦`;
        formMsg.style.color = '';
        formMsg.classList.add('show');
      }

      setTimeout(() => {
        window.open('https://wa.me/93776669400?text=' + waText, '_blank');
      }, 600);

      contactForm.reset();
      setTimeout(() => formMsg && formMsg.classList.remove('show'), 5500);
    });
  }

  /* ============================================================
     12. CURRENT YEAR IN FOOTER
     ============================================================ */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ============================================================
     13. APPLY SAVED LANGUAGE ON LOAD
     ============================================================ */
  applyLang(currentLang);

  /* ============================================================
     14. FADE-IN-UP KEYFRAME (used by portfolio filter)
     ============================================================ */
  if (!document.getElementById('ck-dyn-style')) {
    const style = document.createElement('style');
    style.id = 'ck-dyn-style';
    style.textContent = `
      @keyframes fadeInUp{
        0%{ opacity:0; transform:translateY(20px) }
        100%{ opacity:1; transform:none }
      }
      .demo-card.hidden{ display:none !important; }
    `;
    document.head.appendChild(style);
  }

})();