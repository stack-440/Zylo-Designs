/* ============================================================
   ZYLO-FURN — scripts/router.js
   Lightweight SPA hash router.
   Views: home | products | about | contact
   Each view maps to a <div data-view="name"> wrapper.
   ============================================================ */

'use strict';

const VIEWS = ['home', 'products', 'about', 'contact'];

/* ── Show a view by name ──────────────────────────────────── */
function showView(name) {
  if (!VIEWS.includes(name)) name = 'home';

  // Toggle sections
  VIEWS.forEach(v => {
    const el = document.querySelector(`[data-view="${v}"]`);
    if (el) el.classList.toggle('view-active', v === name);
  });

  // Update nav active state
  document.querySelectorAll('.nav-links a, .mobile-menu a').forEach(a => {
    const href = a.getAttribute('href') || '';
    // match  #home → view 'home', #products → 'products', etc.
    const viewName = href.replace('#', '');
    a.classList.toggle('nav-active', viewName === name);
  });

  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'instant' });

  // Re-run reveal on visible section
  initReveal();

  // If switching to products page, re-render with current filter
  if (name === 'products') {
    renderFilteredProducts();
  }
}

/* ── Read hash and route ──────────────────────────────────── */
function route() {
  const hash = window.location.hash.replace('#', '') || 'home';
  showView(hash);
}

/* ── Init router ──────────────────────────────────────────── */
function initRouter() {
  window.addEventListener('hashchange', route);
  route(); // run on first load
}