/* ============================================================
   ZYLO-FURN — scripts/ui.js
   Page-level UI initialisation:
   - Sticky / scrolled header
   - Hamburger / mobile menu
   - Cart button → open cart modal
   - Smooth scroll for anchor links
   - DOMContentLoaded bootstrap
   ============================================================ */

'use strict';

/* ─────────────────────────────────────────────────────────────
   STICKY HEADER
───────────────────────────────────────────────────────────── */
function initHeader() {
  const header = document.getElementById('header');
  if (!header) return;
  const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 60);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();   // apply immediately on load
}

/* ─────────────────────────────────────────────────────────────
   HAMBURGER / MOBILE MENU
───────────────────────────────────────────────────────────── */
function initMobileMenu() {
  const hamburger  = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobileMenu');
  if (!hamburger || !mobileMenu) return;

  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    mobileMenu.classList.toggle('open');
  });

  mobileMenu.querySelectorAll('.mobile-link').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('active');
      mobileMenu.classList.remove('open');
    });
  });
}

/* ─────────────────────────────────────────────────────────────
   CART BUTTON
───────────────────────────────────────────────────────────── */
function initCartButton() {
  document.getElementById('cartBtn')?.addEventListener('click', openCartModal);
}

/* ─────────────────────────────────────────────────────────────
   SMOOTH SCROLL for all anchor <a href="#..."> links
───────────────────────────────────────────────────────────── */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
}

/* ─────────────────────────────────────────────────────────────
   BOOTSTRAP — runs when DOM is ready
───────────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  initHeader();
  initMobileMenu();
  initCartButton();
  initSmoothScroll();
  initViewToggle();   // from products.js
  initReveal();       // from utils.js  — for non-product .reveal elements
  loadProducts();     // from products.js — async, fetches Sheets or uses demo data
});

/* =========================================
   VIEW ROUTER
========================================= */

const views = document.querySelectorAll("[data-view]");
const viewLinks = document.querySelectorAll("[data-view-link]");

function showView(viewName) {

    views.forEach(view => {
        view.classList.remove("view-active");
    });

    const activeView = document.querySelector(`[data-view="${viewName}"]`);

    if (activeView) {
        activeView.classList.add("view-active");
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    }

    // close mobile menu
    mobileMenu.classList.remove("open");
    hamburger.classList.remove("active");
}

viewLinks.forEach(link => {

    link.addEventListener("click", (e) => {

        e.preventDefault();

        const view = link.dataset.viewLink;

        showView(view);
    });

});

/* =========================================
   CLONE PRODUCTS GRID
========================================= */

const originalGrid = document.getElementById("productsGrid");
const clonedGrid = document.getElementById("productsGridClone");

if (originalGrid && clonedGrid) {
    clonedGrid.innerHTML = originalGrid.innerHTML;
}