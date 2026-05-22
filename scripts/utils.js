/* ============================================================
   ZYLO-FURN — scripts/utils.js
   Shared state, price formatter, toast, and scroll reveal
   ============================================================ */

'use strict';

/* ─────────────────────────────────────────────────────────────
   STATE  (mutated by products.js and cart.js)
───────────────────────────────────────────────────────────── */
let products = [];   // populated by products.js → loadProducts()
let cart     = [];   // populated by cart.js → addToCart()

/* ─────────────────────────────────────────────────────────────
   FORMAT PRICE
───────────────────────────────────────────────────────────── */
function fmtPrice(n) {
  return 'R ' + Number(n).toLocaleString('en-ZA');
}

/* ─────────────────────────────────────────────────────────────
   TOAST NOTIFICATIONS
───────────────────────────────────────────────────────────── */
let toastTimer;

function showToast(msg, type = '') {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.className = `toast${type ? ' ' + type : ''} show`;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 3200);
}

/* ─────────────────────────────────────────────────────────────
   SCROLL REVEAL (IntersectionObserver)
───────────────────────────────────────────────────────────── */
function initReveal() {
  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  document.querySelectorAll('.reveal').forEach(el => io.observe(el));
}