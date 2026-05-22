/* ============================================================
   ZYLO-FURN — scripts/categories.js
   Category definitions, filter bar rendering, filtered render.
   Works for both the home featured section and the
   full products page.
   ============================================================ */

'use strict';

/* ── Category definitions ─────────────────────────────────── */
const CATEGORIES = [
  { id: 'all',        label: 'All',          icon: '✦' },
  { id: 'Chairs',     label: 'Chairs',       icon: '🪑' },
  { id: 'Couches',    label: 'Couches',      icon: '🛋️' },
  { id: 'Beds',       label: 'Beds',         icon: '🛏️' },
  { id: 'Dining',     label: 'Dining',       icon: '🍽️' },
  { id: 'Office',     label: 'Office',       icon: '💼' },
  { id: 'Storage',    label: 'Storage',      icon: '📦' },
  { id: 'Living Room',label: 'Living Room',  icon: '🏡' },
  { id: 'Bedroom',    label: 'Bedroom',      icon: '🌙' },
];

/* active filter — shared across both grids */
let activeCategory = 'all';

/* ── Build category bar HTML ──────────────────────────────── */
function buildCategoryBarHTML(targetBarId) {
  return CATEGORIES.map(cat => `
    <button class="cat-btn${cat.id === activeCategory ? ' active' : ''}"
            data-cat="${cat.id}"
            data-bar="${targetBarId}"
            aria-pressed="${cat.id === activeCategory}">
      <span class="cat-icon">${cat.icon}</span>
      ${cat.label}
    </button>`
  ).join('');
}

/* ── Render a category bar into a container element ──────── */
function renderCategoryBar(containerId) {
  const el = document.getElementById(containerId);
  if (!el) return;
  el.innerHTML = buildCategoryBarHTML(containerId);

  el.querySelectorAll('.cat-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      activeCategory = btn.dataset.cat;
      // Refresh all rendered bars so both stay in sync
      refreshAllCategoryBars();
      renderFilteredProducts();
      updateProductsCount();
    });
  });
}

/* ── Keep all bars in sync when filter changes ───────────── */
function refreshAllCategoryBars() {
  ['homeCategoryBar', 'pagesCategoryBar'].forEach(id => {
    const bar = document.getElementById(id);
    if (!bar) return;
    bar.querySelectorAll('.cat-btn').forEach(btn => {
      const isActive = btn.dataset.cat === activeCategory;
      btn.classList.toggle('active', isActive);
      btn.setAttribute('aria-pressed', String(isActive));
    });
  });
}

/* ── Filter products array ────────────────────────────────── */
function getFilteredProducts() {
  if (activeCategory === 'all') return products;
  return products.filter(p => {
    const cat = (p.category || '').toLowerCase();
    const filter = activeCategory.toLowerCase();
    return cat === filter ||
           cat.includes(filter) ||
           filter.includes(cat);
  });
}

/* ── Render filtered cards into the correct grid ─────────── */
function renderFilteredProducts() {
  // Determine which grid is currently visible
  const homeGrid  = document.getElementById('productsGrid');
  const pagesGrid = document.getElementById('pagesProductsGrid');

  const homeView   = document.querySelector('[data-view="home"]');
  const pagesView  = document.querySelector('[data-view="products"]');

  const filtered = getFilteredProducts();

  // Helper: render into a grid element
  const renderInto = (grid) => {
    if (!grid) return;
    if (!filtered.length) {
      grid.innerHTML = `
        <div class="products-empty">
          <div class="products-empty-icon">🔍</div>
          <h3>No products found</h3>
          <p>Try a different category or browse all products.</p>
        </div>`;
      return;
    }
    grid.innerHTML = filtered.map((p, i) => {
      // Use the real index in the full products array so quick-view works
      const realIdx = products.indexOf(p);
      return buildCardHTML(p, realIdx);
    }).join('');
    attachCardEvents();
    initAllCarousels();
    initReveal();
  };

  // Home view grid
  if (homeView && homeView.classList.contains('view-active')) {
    renderInto(homeGrid);
  }
  // Products page grid
  if (pagesView && pagesView.classList.contains('view-active')) {
    renderInto(pagesGrid);
  }
}

/* ── Update the product count label ─────────────────────────*/
function updateProductsCount() {
  const countEl = document.getElementById('productsCountLabel');
  if (!countEl) return;
  const n = getFilteredProducts().length;
  countEl.textContent = `${n} product${n !== 1 ? 's' : ''}`;
}

/* ── Init both bars once products are loaded ────────────────*/
function initCategoryBars() {
  renderCategoryBar('homeCategoryBar');
  renderCategoryBar('pagesCategoryBar');
  updateProductsCount();
}