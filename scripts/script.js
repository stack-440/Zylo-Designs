/* ============================================================
   ZYLO-FURN — script.js
   - Fetches products from Google Sheets (CSV published URL)
   - Falls back to demo data if fetch fails
   - Builds all modals purely in JavaScript
   - Per-card image carousel with dots & arrows
   - Grid / List view toggle
   - Cart with quantity management
   - WhatsApp order integration
   - Checkout form → WhatsApp confirmation
   - Scroll reveal + sticky header
   ============================================================ */

'use strict';

/* ─────────────────────────────────────────────────────────────
   CONFIG — edit these two values for your own setup
   ─────────────────────────────────────────────────────────────
   SHEETS_CSV_URL:
     1. Open your Google Sheet
     2. File → Share → Publish to web
     3. Choose the sheet tab → CSV format → Publish
     4. Paste the generated URL below

   WHATSAPP_NUMBER:
     International format, no spaces or dashes.
     e.g. South Africa +27 83 123 4567 → "27831234567"
───────────────────────────────────────────────────────────── */
const CONFIG = {
  SHEETS_CSV_URL: 'YOUR_GOOGLE_SHEETS_CSV_PUBLISHED_URL_HERE',
  WHATSAPP_NUMBER: '27111234567',   // ← replace with your number
};

/*
  Expected Google Sheet column order (row 1 = headers, ignored):
  A: name        — e.g. "Modern Sectional Sofa"
  B: category    — e.g. "Living Room"
  C: price       — e.g. "15999"  (number only, no R)
  D: description — short product description
  E: specs       — pipe-separated specs, e.g. "W 280cm|D 160cm|Fabric: Linen"
  F: image1      — full URL
  G: image2      — full URL (optional)
  H: image3      — full URL (optional)
*/

/* ─────────────────────────────────────────────────────────────
   FALLBACK / DEMO PRODUCTS (used when Sheets fetch fails)
───────────────────────────────────────────────────────────── */
const DEMO_PRODUCTS = [
  {
    name: 'Modern Sectional Sofa',
    category: 'Living Room',
    price: 15999,
    description: 'Generous L-shaped sectional upholstered in premium Belgian linen. Feather-down cushions with hardwood frame. Available in three colourways.',
    specs: ['W 280cm | D 160cm', 'Material: Belgian Linen', 'Frame: Kiaat Hardwood', 'Cushions: Feather-down blend', 'Lead time: 3–4 weeks'],
    images: [
      'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=700&h=520&fit=crop',
      'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=700&h=520&fit=crop',
      'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=700&h=520&fit=crop',
    ],
  },
  {
    name: 'Oak Dining Table',
    category: 'Dining',
    price: 8500,
    description: 'Solid white oak dining table with a hand-rubbed oil finish. Seats six comfortably. Understated elegance for any dining space.',
    specs: ['W 200cm | D 90cm | H 76cm', 'Material: Solid White Oak', 'Finish: Hand-rubbed Oil', 'Seats: 6', 'Assembly required'],
    images: [
      'https://images.unsplash.com/photo-1549497538-303791108f95?w=700&h=520&fit=crop',
      'https://images.unsplash.com/photo-1581539250439-c96689b516dd?w=700&h=520&fit=crop',
      'https://images.unsplash.com/photo-1615066390971-03e4e1c36ddf?w=700&h=520&fit=crop',
    ],
  },
  {
    name: 'King Size Bedroom Set',
    category: 'Bedroom',
    price: 22900,
    description: 'Complete king bedroom set including bed frame, two bedside tables, and a six-drawer dresser. Ash veneer with brushed brass hardware.',
    specs: ['Bed: 193 × 203cm', 'Material: Ash Veneer', 'Hardware: Brushed Brass', 'Includes: Bed + 2× Bedside + Dresser', 'Delivery: 4–6 weeks'],
    images: [
      'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=700&h=520&fit=crop',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=700&h=520&fit=crop',
      'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=700&h=520&fit=crop',
    ],
  },
  {
    name: 'Executive Office Chair',
    category: 'Office',
    price: 3200,
    description: 'Ergonomic executive chair with adjustable lumbar support, armrests, and seat height. Full-grain leather upholstery in black or cognac.',
    specs: ['Seat height: 47–57cm', 'Material: Full-grain Leather', 'Base: Polished Aluminium', 'Max load: 130kg', 'Armrests: 4D adjustable'],
    images: [
      'https://images.unsplash.com/photo-1541558869434-2840d308329a?w=700&h=520&fit=crop',
      'https://images.unsplash.com/photo-1592078615290-033ee584e267?w=700&h=520&fit=crop',
      'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?w=700&h=520&fit=crop',
    ],
  },
  {
    name: 'Glass Coffee Table',
    category: 'Living Room',
    price: 1850,
    description: 'Minimalist coffee table with 12mm tempered smoked glass top and powder-coated steel legs. Pairs beautifully with any sofa.',
    specs: ['W 120cm | D 60cm | H 40cm', 'Top: 12mm Tempered Smoked Glass', 'Legs: Powder-coated Steel (Matte Black)', 'Weight capacity: 40kg'],
    images: [
      'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=700&h=520&fit=crop',
      'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=700&h=520&fit=crop',
      'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=700&h=520&fit=crop',
    ],
  },
  {
    name: '5-Tier Bookshelf',
    category: 'Storage',
    price: 2400,
    description: 'Open five-tier bookshelf in natural pine with a beeswax finish. Ideal for books, plants, and decorative objects. Easy flat-pack assembly.',
    specs: ['W 80cm | D 28cm | H 180cm', 'Material: Solid Pine', 'Finish: Beeswax', 'Load per shelf: 15kg', 'Assembly: flat-pack'],
    images: [
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=700&h=520&fit=crop',
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=700&h=520&fit=crop',
      'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=700&h=520&fit=crop',
    ],
  },
];

/* ─────────────────────────────────────────────────────────────
   STATE
───────────────────────────────────────────────────────────── */
let products = [];   // loaded from Sheets or fallback
let cart = [];       // { product, qty }

/* ─────────────────────────────────────────────────────────────
   GOOGLE SHEETS — CSV FETCH & PARSE
───────────────────────────────────────────────────────────── */
function parseCSV(text) {
  const lines = text.trim().split('\n');
  // skip header row (index 0)
  return lines.slice(1).map(line => {
    // Handle commas inside quoted fields
    const cols = [];
    let inQuotes = false, cur = '';
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') { inQuotes = !inQuotes; continue; }
      if (ch === ',' && !inQuotes) { cols.push(cur.trim()); cur = ''; continue; }
      cur += ch;
    }
    cols.push(cur.trim());

    const price = parseFloat((cols[2] || '0').replace(/[^\d.]/g, '')) || 0;
    const specsRaw = cols[4] || '';
    const specs = specsRaw.split('|').map(s => s.trim()).filter(Boolean);
    const images = [cols[5], cols[6], cols[7]].filter(Boolean);

    return {
      name:        cols[0] || 'Unnamed Product',
      category:    cols[1] || 'General',
      price,
      description: cols[3] || '',
      specs,
      images: images.length ? images : ['https://placehold.co/700x520/f2ece3/9a8f82?text=ZYLO-Furn'],
    };
  }).filter(p => p.name && p.price > 0);
}

async function loadProducts() {
  const grid    = document.getElementById('productsGrid');
  const loading = document.getElementById('productsLoading');
  const errEl   = document.getElementById('productsError');

  // Skip fetch if URL hasn't been configured
  const useSheets = CONFIG.SHEETS_CSV_URL && !CONFIG.SHEETS_CSV_URL.startsWith('YOUR_');

  if (useSheets) {
    try {
      const res = await fetch(CONFIG.SHEETS_CSV_URL);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const text = await res.text();
      const parsed = parseCSV(text);
      if (!parsed.length) throw new Error('No products parsed');
      products = parsed;
    } catch (err) {
      console.warn('Google Sheets fetch failed, using demo data:', err.message);
      products = DEMO_PRODUCTS;
      errEl.style.display = 'block';
    }
  } else {
    // Demo mode — no fetch needed
    products = DEMO_PRODUCTS;
  }

  loading.style.display = 'none';
  grid.style.display = 'grid';
  renderProducts();
  initReveal();
}

/* ─────────────────────────────────────────────────────────────
   FORMAT PRICE
───────────────────────────────────────────────────────────── */
function fmtPrice(n) {
  return 'R ' + Number(n).toLocaleString('en-ZA');
}

/* ─────────────────────────────────────────────────────────────
   RENDER PRODUCT CARDS
───────────────────────────────────────────────────────────── */
function renderProducts() {
  const grid = document.getElementById('productsGrid');
  grid.innerHTML = products.map((p, idx) => buildCardHTML(p, idx)).join('');
  attachCardEvents();
  initAllCarousels();
}

function buildCardHTML(p, idx) {
  const imgs = p.images.map((src, i) =>
    `<img src="${src}" alt="${p.name} view ${i + 1}" loading="lazy"
          onerror="this.src='https://placehold.co/700x520/f2ece3/9a8f82?text=ZYLO-Furn'">`
  ).join('');

  const dots = p.images.map((_, i) =>
    `<button class="dot${i === 0 ? ' active' : ''}" data-dot="${i}" aria-label="Image ${i + 1}"></button>`
  ).join('');

  return `
    <div class="product-card reveal" data-idx="${idx}">
      <div class="product-media">
        <div class="carousel-track-wrapper">
          <div class="carousel-track" data-carousel="${idx}">${imgs}</div>
        </div>
        ${p.images.length > 1 ? `
        <button class="carousel-btn prev" data-target="${idx}" aria-label="Previous image">&#8249;</button>
        <button class="carousel-btn next" data-target="${idx}" aria-label="Next image">&#8250;</button>
        <div class="carousel-dots" data-dots="${idx}">${dots}</div>
        ` : ''}
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
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
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
  // Quick view buttons
  document.querySelectorAll('.quick-view-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      openQuickView(+btn.dataset.idx);
    });
  });

  // Add to cart buttons
  document.querySelectorAll('.add-to-cart').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      addToCart(+btn.dataset.idx);
    });
  });

  // Click card body → quick view
  document.querySelectorAll('.product-card').forEach(card => {
    card.addEventListener('click', () => openQuickView(+card.dataset.idx));
  });
}

/* ─────────────────────────────────────────────────────────────
   CAROUSEL — per-card image slider
───────────────────────────────────────────────────────────── */
const carouselState = {}; // idx → currentSlide

function initAllCarousels() {
  document.querySelectorAll('.carousel-track').forEach(track => {
    const idx = +track.dataset.carousel;
    carouselState[idx] = 0;

    const prevBtn = document.querySelector(`.carousel-btn.prev[data-target="${idx}"]`);
    const nextBtn = document.querySelector(`.carousel-btn.next[data-target="${idx}"]`);

    if (prevBtn) prevBtn.addEventListener('click', e => { e.stopPropagation(); slideCarousel(idx, -1); });
    if (nextBtn) nextBtn.addEventListener('click', e => { e.stopPropagation(); slideCarousel(idx, +1); });

    // Dot buttons
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
  let next = (carouselState[idx] + dir + total) % total;
  goToSlide(idx, next);
}

function goToSlide(idx, slide) {
  const track = document.querySelector(`.carousel-track[data-carousel="${idx}"]`);
  if (!track) return;
  carouselState[idx] = slide;
  track.style.transform = `translateX(-${slide * 100}%)`;

  const dotsWrap = document.querySelector(`.carousel-dots[data-dots="${idx}"]`);
  if (dotsWrap) {
    dotsWrap.querySelectorAll('.dot').forEach((d, i) => d.classList.toggle('active', i === slide));
  }
}

/* ─────────────────────────────────────────────────────────────
   MODAL FACTORY — creates and mounts overlay + modal in DOM
───────────────────────────────────────────────────────────── */
function createModal(id, maxWidth, contentHTML) {
  // Remove old instance if exists
  const old = document.getElementById(id);
  if (old) old.remove();

  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.id = id;
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');

  overlay.innerHTML = `
    <div class="modal" style="max-width:${maxWidth}">
      <button class="modal-close" aria-label="Close">&times;</button>
      ${contentHTML}
    </div>`;

  document.body.appendChild(overlay);

  // Close handlers
  overlay.querySelector('.modal-close').addEventListener('click', () => closeModal(id));
  overlay.addEventListener('click', e => { if (e.target === overlay) closeModal(id); });

  // Trap Escape key
  const escHandler = e => { if (e.key === 'Escape') { closeModal(id); document.removeEventListener('keydown', escHandler); } };
  document.addEventListener('keydown', escHandler);

  // Open with slight delay so transition plays
  requestAnimationFrame(() => requestAnimationFrame(() => overlay.classList.add('open')));

  return overlay;
}

function closeModal(id) {
  const overlay = document.getElementById(id);
  if (!overlay) return;
  overlay.classList.remove('open');
  overlay.addEventListener('transitionend', () => overlay.remove(), { once: true });
}

/* ─────────────────────────────────────────────────────────────
   QUICK VIEW MODAL
───────────────────────────────────────────────────────────── */
function openQuickView(idx) {
  const p = products[idx];
  if (!p) return;

  const specsHTML = p.specs.length
    ? `<ul class="modal-specs">${p.specs.map(s => `<li>${s}</li>`).join('')}</ul>`
    : '';

  const content = `
    <div class="modal-product-body">
      <div class="modal-gallery">
        <img id="qvMainImg" src="${p.images[0]}"
             alt="${p.name}"
             onerror="this.src='https://placehold.co/700x520/f2ece3/9a8f82?text=ZYLO-Furn'">
      </div>
      <div class="modal-product-details">
        <span class="product-category">${p.category}</span>
        <h2>${p.name}</h2>
        <p class="modal-price">${fmtPrice(p.price)}</p>
        <p class="modal-desc">${p.description}</p>
        ${specsHTML}
        ${p.images.length > 1 ? `
        <div class="modal-thumbs" style="display:flex;gap:.5rem;margin-bottom:1.4rem;flex-wrap:wrap;">
          ${p.images.map((src, i) => `
            <img src="${src}" alt="View ${i+1}" data-qvthumb="${i}"
                 style="width:62px;height:46px;object-fit:cover;border-radius:6px;cursor:pointer;
                        border:2px solid ${i===0?'var(--accent)':'var(--stone)'};transition:.2s;"
                 onerror="this.style.display='none'">
          `).join('')}
        </div>` : ''}
        <div class="modal-actions">
          <button class="btn btn-primary modal-add-cart" data-idx="${idx}">Add to Cart</button>
          <button class="btn btn-wa modal-wa-order" data-idx="${idx}">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" style="flex-shrink:0">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
              <path d="M12 0C5.373 0 0 5.373 0 12c0 2.115.549 4.099 1.51 5.824L0 24l6.336-1.488A11.94 11.94 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.796 9.796 0 01-4.988-1.364l-.358-.213-3.76.883.938-3.658-.233-.376A9.795 9.795 0 012.182 12C2.182 6.57 6.57 2.182 12 2.182S21.818 6.57 21.818 12 17.43 21.818 12 21.818z"/>
            </svg>
            Order via WhatsApp
          </button>
        </div>
      </div>
    </div>`;

  const overlay = createModal('quickViewModal', '900px', content);

  // Thumbnail switcher
  overlay.querySelectorAll('[data-qvthumb]').forEach(thumb => {
    thumb.addEventListener('click', () => {
      const i = +thumb.dataset.qvthumb;
      overlay.querySelector('#qvMainImg').src = p.images[i];
      overlay.querySelectorAll('[data-qvthumb]').forEach((t, ti) => {
        t.style.borderColor = ti === i ? 'var(--accent)' : 'var(--stone)';
      });
    });
  });

  // Add to cart from modal
  overlay.querySelector('.modal-add-cart').addEventListener('click', () => {
    addToCart(idx);
    closeModal('quickViewModal');
  });

  // WhatsApp direct order from modal
  overlay.querySelector('.modal-wa-order').addEventListener('click', () => {
    sendWhatsAppOrder([{ product: p, qty: 1 }], null);
  });
}

/* ─────────────────────────────────────────────────────────────
   CART
───────────────────────────────────────────────────────────── */
function addToCart(idx) {
  const p = products[idx];
  if (!p) return;
  const existing = cart.find(item => item.product.name === p.name);
  if (existing) {
    existing.qty++;
  } else {
    cart.push({ product: p, qty: 1 });
  }
  updateCartCount();
  showToast(`✓ "${p.name}" added to cart`, 'success');
}

function removeFromCart(name) {
  cart = cart.filter(item => item.product.name !== name);
  updateCartCount();
  renderCartItems();
}

function updateCartCount() {
  const total = cart.reduce((sum, i) => sum + i.qty, 0);
  const badge = document.getElementById('cartCount');
  badge.textContent = total;
  badge.classList.toggle('visible', total > 0);
}

function cartTotal() {
  return cart.reduce((sum, i) => sum + i.product.price * i.qty, 0);
}

/* ─────────────────────────────────────────────────────────────
   CART MODAL
───────────────────────────────────────────────────────────── */
function openCartModal() {
  const content = `
    <h2>Your Cart</h2>
    <div class="cart-items" id="cartItemsContainer"></div>
    <div class="cart-footer">
      <div class="cart-total">
        <span>Total</span>
        <strong id="cartTotalDisplay">${fmtPrice(cartTotal())}</strong>
      </div>
      <button class="btn btn-primary" id="proceedCheckout" ${cart.length ? '' : 'disabled'}>
        Proceed to Checkout
      </button>
    </div>`;

  const overlay = createModal('cartModal', '500px', content);
  renderCartItems();

  overlay.querySelector('#proceedCheckout').addEventListener('click', () => {
    closeModal('cartModal');
    openCheckoutModal();
  });
}

function renderCartItems() {
  const container = document.getElementById('cartItemsContainer');
  if (!container) return;

  if (!cart.length) {
    container.innerHTML = '<p class="cart-empty">Your cart is empty.</p>';
    const btn = document.getElementById('proceedCheckout');
    const total = document.getElementById('cartTotalDisplay');
    if (btn) btn.disabled = true;
    if (total) total.textContent = fmtPrice(0);
    return;
  }

  container.innerHTML = cart.map(({ product: p, qty }) => `
    <div class="cart-item" data-name="${p.name}">
      <img src="${p.images[0]}" alt="${p.name}"
           onerror="this.src='https://placehold.co/64x64/f2ece3/9a8f82?text=ZF'">
      <div class="cart-item-info">
        <span class="cart-item-name">${p.name}</span>
        <span class="cart-item-price">${fmtPrice(p.price)} × ${qty}</span>
      </div>
      <button class="cart-item-remove" data-remove="${p.name}" aria-label="Remove">&times;</button>
    </div>`).join('');

  const total = document.getElementById('cartTotalDisplay');
  if (total) total.textContent = fmtPrice(cartTotal());
  const btn = document.getElementById('proceedCheckout');
  if (btn) btn.disabled = false;

  container.querySelectorAll('.cart-item-remove').forEach(btn => {
    btn.addEventListener('click', () => removeFromCart(btn.dataset.remove));
  });
}

/* ─────────────────────────────────────────────────────────────
   CHECKOUT MODAL
───────────────────────────────────────────────────────────── */
function openCheckoutModal() {
  if (!cart.length) { showToast('Your cart is empty.'); return; }

  const summaryRows = cart.map(({ product: p, qty }) => `
    <div class="summary-line">
      <span>${p.name} × ${qty}</span>
      <span>${fmtPrice(p.price * qty)}</span>
    </div>`).join('');

  const content = `
    <h2>Complete Your Order</h2>
    <div class="checkout-field">
      <label for="co-name">Full Name</label>
      <input type="text" id="co-name" placeholder="Jane Smith" autocomplete="name" />
    </div>
    <div class="checkout-field">
      <label for="co-email">Email</label>
      <input type="email" id="co-email" placeholder="jane@example.com" autocomplete="email" />
    </div>
    <div class="checkout-field">
      <label for="co-phone">Phone / WhatsApp</label>
      <input type="tel" id="co-phone" placeholder="+27 71 000 0000" autocomplete="tel" />
    </div>
    <div class="checkout-field">
      <label for="co-address">Delivery Address</label>
      <textarea id="co-address" rows="3" placeholder="123 Main Street, Johannesburg" autocomplete="street-address"></textarea>
    </div>
    <div class="checkout-summary">
      ${summaryRows}
      <div class="summary-line">
        <span>Total</span>
        <span>${fmtPrice(cartTotal())}</span>
      </div>
    </div>
    <div class="checkout-actions">
      <button class="btn btn-wa" id="submitWaBtn">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
          <path d="M12 0C5.373 0 0 5.373 0 12c0 2.115.549 4.099 1.51 5.824L0 24l6.336-1.488A11.94 11.94 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.796 9.796 0 01-4.988-1.364l-.358-.213-3.76.883.938-3.658-.233-.376A9.795 9.795 0 012.182 12C2.182 6.57 6.57 2.182 12 2.182S21.818 6.57 21.818 12 17.43 21.818 12 21.818z"/>
        </svg>
        Send Order via WhatsApp
      </button>
      <button class="btn btn-outline" id="backToCartBtn">← Back to Cart</button>
    </div>
    <p class="checkout-note">Clicking "Send Order via WhatsApp" will open WhatsApp with your full order pre-filled. Our team will confirm availability and delivery within 24 hours.</p>`;

  const overlay = createModal('checkoutModal', '540px', content);

  overlay.querySelector('#backToCartBtn').addEventListener('click', () => {
    closeModal('checkoutModal');
    openCartModal();
  });

  overlay.querySelector('#submitWaBtn').addEventListener('click', () => {
    const name    = document.getElementById('co-name').value.trim();
    const email   = document.getElementById('co-email').value.trim();
    const phone   = document.getElementById('co-phone').value.trim();
    const address = document.getElementById('co-address').value.trim();

    if (!name || !phone) {
      showToast('Please fill in your name and phone number.');
      return;
    }

    const customerInfo = { name, email, phone, address };
    sendWhatsAppOrder(cart, customerInfo);
    closeModal('checkoutModal');
    openConfirmModal();
    cart = [];
    updateCartCount();
  });
}

/* ─────────────────────────────────────────────────────────────
   WHATSAPP ORDER SENDER
   Works for both "quick order single item" and "full cart"
───────────────────────────────────────────────────────────── */
function sendWhatsAppOrder(items, customer) {
  const lines = [];
  lines.push('🛋️ *ZYLO-Furn Order Request*');
  lines.push('─────────────────────');

  items.forEach(({ product: p, qty }) => {
    lines.push(`• *${p.name}*`);
    lines.push(`  Category: ${p.category}`);
    lines.push(`  Price: ${fmtPrice(p.price)}${qty > 1 ? ` × ${qty} = ${fmtPrice(p.price * qty)}` : ''}`);
  });

  const total = items.reduce((s, i) => s + i.product.price * i.qty, 0);
  lines.push('─────────────────────');
  lines.push(`*Total: ${fmtPrice(total)}*`);

  if (customer) {
    lines.push('─────────────────────');
    lines.push('*Customer Details*');
    lines.push(`Name: ${customer.name}`);
    if (customer.email)   lines.push(`Email: ${customer.email}`);
    if (customer.phone)   lines.push(`Phone: ${customer.phone}`);
    if (customer.address) lines.push(`Address: ${customer.address}`);
  }

  lines.push('─────────────────────');
  lines.push('Please confirm availability and delivery date. Thank you!');

  const msg = encodeURIComponent(lines.join('\n'));
  const url = `https://wa.me/${CONFIG.WHATSAPP_NUMBER}?text=${msg}`;
  window.open(url, '_blank', 'noopener,noreferrer');
}

/* ─────────────────────────────────────────────────────────────
   CONFIRMATION MODAL
───────────────────────────────────────────────────────────── */
function openConfirmModal() {
  const content = `
    <div class="confirm-icon">✓</div>
    <h2>Order Sent!</h2>
    <p>Your order has been sent via WhatsApp. Our team will confirm availability and delivery details within 24 hours. Thank you for choosing ZYLO-Furn.</p>
    <button class="btn btn-primary" id="confirmDoneBtn">Continue Shopping</button>`;

  const overlay = createModal('confirmModal', '440px', content);
  overlay.querySelector('#confirmDoneBtn').addEventListener('click', () => closeModal('confirmModal'));
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

/* ─────────────────────────────────────────────────────────────
   STICKY HEADER
───────────────────────────────────────────────────────────── */
function initHeader() {
  const header = document.getElementById('header');
  const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 60);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
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

/* ─────────────────────────────────────────────────────────────
   BOOTSTRAP
───────────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  initHeader();
  initMobileMenu();
  initCartButton();
  initViewToggle();
  initReveal();        // for non-product reveal elements
  loadProducts();      // async — fetches Sheets or uses demo data
});