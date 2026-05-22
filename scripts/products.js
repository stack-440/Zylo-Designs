/* ============================================================
   ZYLO-FURN — scripts/products.js
   - CSV fetch & parse from Google Sheets
   - Product card HTML builder & renderer
   - Per-card image carousel (arrows + dots)
   - View toggle (grid ↔ list)
   ============================================================ */

'use strict';

/* ─────────────────────────────────────────────────────────────
   GOOGLE SHEETS — CSV FETCH & PARSE
───────────────────────────────────────────────────────────── */
function parseCSV(text) {
  const lines = text.trim().split('\n');
  // skip header row (index 0)
  return lines.slice(1).map(line => {
    // handle commas inside quoted fields
    const cols = [];
    let inQuotes = false, cur = '';
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') { inQuotes = !inQuotes; continue; }
      if (ch === ',' && !inQuotes) { cols.push(cur.trim()); cur = ''; continue; }
      cur += ch;
    }
    cols.push(cur.trim());

    const price  = parseFloat((cols[2] || '0').replace(/[^\d.]/g, '')) || 0;
    const specs  = (cols[4] || '').split('|').map(s => s.trim()).filter(Boolean);
    const images = [cols[5], cols[6], cols[7]].filter(Boolean);

    return {
      name:        cols[0] || 'Unnamed Product',
      category:    cols[1] || 'General',
      price,
      description: cols[3] || '',
      specs,
      images: images.length
        ? images
        : ['https://placehold.co/700x520/f2ece3/9a8f82?text=ZYLO-Furn'],
    };
  }).filter(p => p.name && p.price > 0);
}

async function loadProducts() {
  const grid  = document.getElementById('productsGrid');
  const errEl = document.getElementById('productsError');

  const useSheets =
    CONFIG.SHEETS_CSV_URL && !CONFIG.SHEETS_CSV_URL.startsWith('YOUR_');

  if (useSheets) {
    try {
      const res = await fetch(CONFIG.SHEETS_CSV_URL);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const text   = await res.text();
      const parsed = parseCSV(text);
      if (!parsed.length) throw new Error('No products parsed');
      products = parsed;
    } catch (err) {
      console.warn('Google Sheets fetch failed, using demo data:', err.message);
      products = DEMO_PRODUCTS;
      if (errEl) errEl.style.display = 'block';
    }
  } else {
    products = DEMO_PRODUCTS;
  }

  if (grid) grid.style.display = 'grid';
  renderProducts();
  initReveal();   // re-run after dynamic cards are injected
}

/* ─────────────────────────────────────────────────────────────
   RENDER PRODUCT CARDS
───────────────────────────────────────────────────────────── */
function renderProducts() {
  const grid = document.getElementById('productsGrid');
  if (!grid) return;
  grid.innerHTML = products.map((p, idx) => buildCardHTML(p, idx)).join('');
  attachCardEvents();
  initAllCarousels();
}

function buildCardHTML(p, idx) {
  const imgs = p.images.map((src, i) => `
    <img src="${src}" alt="${p.name} view ${i + 1}" loading="lazy"
         onerror="this.src='https://placehold.co/700x520/f2ece3/9a8f82?text=ZYLO-Furn'">`
  ).join('');

  const dots = p.images.map((_, i) => `
    <button class="dot${i === 0 ? ' active' : ''}" data-dot="${i}" aria-label="Image ${i + 1}"></button>`
  ).join('');

  const carouselControls = p.images.length > 1 ? `
    <button class="carousel-btn prev" data-target="${idx}" aria-label="Previous image">&#8249;</button>
    <button class="carousel-btn next" data-target="${idx}" aria-label="Next image">&#8250;</button>
    <div class="carousel-dots" data-dots="${idx}">${dots}</div>` : '';

  return `
    <div class="product-card reveal" data-idx="${idx}">
      <div class="product-media">
        <div class="carousel-track-wrapper">
          <div class="carousel-track" data-carousel="${idx}">${imgs}</div>
        </div>
        ${carouselControls}
        <button class="quick-view-btn" data-idx="${idx}">Quick View</button>
      </div>
      <div class="product-info">
        <span class="product-category">${p.category}</span>
        <h3 class="product-name">${p.name}</h3>
        <p class="product-desc">${p.description}</p>
        <div class="product-footer">
          <p class="product-price">${fmtPrice(p.price)}</p>
          <button class="add-to-cart" data-idx="${idx}">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Add
          </button>
        </div>
      </div>
    </div>`;
}

/* ─────────────────────────────────────────────────────────────
   CARD EVENTS
───────────────────────────────────────────────────────────── */
function attachCardEvents() {
  document.querySelectorAll('.quick-view-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      openQuickView(+btn.dataset.idx);
    });
  });

  document.querySelectorAll('.add-to-cart').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      addToCart(+btn.dataset.idx);
    });
  });

  // Click anywhere on card body → quick view
  document.querySelectorAll('.product-card').forEach(card => {
    card.addEventListener('click', () => openQuickView(+card.dataset.idx));
  });
}

/* ─────────────────────────────────────────────────────────────
   CAROUSEL — per-card image slider
───────────────────────────────────────────────────────────── */
const carouselState = {};   // idx → currentSlide

function initAllCarousels() {
  document.querySelectorAll('.carousel-track').forEach(track => {
    const idx = +track.dataset.carousel;
    carouselState[idx] = 0;

    const prevBtn = document.querySelector(`.carousel-btn.prev[data-target="${idx}"]`);
    const nextBtn = document.querySelector(`.carousel-btn.next[data-target="${idx}"]`);

    if (prevBtn) prevBtn.addEventListener('click', e => { e.stopPropagation(); slideCarousel(idx, -1); });
    if (nextBtn) nextBtn.addEventListener('click', e => { e.stopPropagation(); slideCarousel(idx, +1); });

    const dotsWrap = document.querySelector(`.carousel-dots[data-dots="${idx}"]`);
    if (dotsWrap) {
      dotsWrap.querySelectorAll('.dot').forEach(dot => {
        dot.addEventListener('click', e => {
          e.stopPropagation();
          goToSlide(idx, +dot.dataset.dot);
        });
      });
    }
  });
}

function slideCarousel(idx, dir) {
  const track = document.querySelector(`.carousel-track[data-carousel="${idx}"]`);
  if (!track) return;
  const total = track.children.length;
  goToSlide(idx, (carouselState[idx] + dir + total) % total);
}

function goToSlide(idx, slide) {
  const track = document.querySelector(`.carousel-track[data-carousel="${idx}"]`);
  if (!track) return;
  carouselState[idx] = slide;
  track.style.transform = `translateX(-${slide * 100}%)`;

  const dotsWrap = document.querySelector(`.carousel-dots[data-dots="${idx}"]`);
  if (dotsWrap) {
    dotsWrap.querySelectorAll('.dot').forEach((d, i) =>
      d.classList.toggle('active', i === slide)
    );
  }
}

/* ─────────────────────────────────────────────────────────────
   VIEW TOGGLE — grid ↔ list
───────────────────────────────────────────────────────────── */
function initViewToggle() {
  const grid    = document.getElementById('productsGrid');
  const gridBtn = document.getElementById('gridViewBtn');
  const listBtn = document.getElementById('listViewBtn');
  if (!gridBtn || !listBtn) return;

  gridBtn.addEventListener('click', () => {
    grid.classList.remove('list-view');
    gridBtn.classList.add('active');
    listBtn.classList.remove('active');
  });

  listBtn.addEventListener('click', () => {
    grid.classList.add('list-view');
    listBtn.classList.add('active');
    gridBtn.classList.remove('active');
  });
}

