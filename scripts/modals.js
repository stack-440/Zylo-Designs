/* ============================================================
   ZYLO-FURN — scripts/modals.js
   - Modal factory (createModal / closeModal)
   - Quick View modal
   - Cart modal
   - Checkout modal
   - Confirmation modal
   ============================================================ */

'use strict';

/* ─────────────────────────────────────────────────────────────
   MODAL FACTORY
   Creates and mounts an overlay + modal in the DOM on demand.
───────────────────────────────────────────────────────────── */
function createModal(id, maxWidth, contentHTML) {
  // Remove any existing instance with the same id
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

  // Close on ✕ button
  overlay.querySelector('.modal-close').addEventListener('click', () => closeModal(id));
  // Close on backdrop click
  overlay.addEventListener('click', e => { if (e.target === overlay) closeModal(id); });
  // Close on Escape key
  const escHandler = e => {
    if (e.key === 'Escape') { closeModal(id); document.removeEventListener('keydown', escHandler); }
  };
  document.addEventListener('keydown', escHandler);

  // Trigger open transition on next paint
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
const WA_SVG = `
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" style="flex-shrink:0">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
    <path d="M12 0C5.373 0 0 5.373 0 12c0 2.115.549 4.099 1.51 5.824L0 24l6.336-1.488A11.94 11.94 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.796 9.796 0 01-4.988-1.364l-.358-.213-3.76.883.938-3.658-.233-.376A9.795 9.795 0 012.182 12C2.182 6.57 6.57 2.182 12 2.182S21.818 6.57 21.818 12 17.43 21.818 12 21.818z"/>
  </svg>`;

function openQuickView(idx) {
  const p = products[idx];
  if (!p) return;

  const specsHTML = p.specs.length
    ? `<ul class="modal-specs">${p.specs.map(s => `<li>${s}</li>`).join('')}</ul>`
    : '';

  const thumbsHTML = p.images.length > 1
    ? `<div class="modal-thumbs">
        ${p.images.map((src, i) => `
          <img src="${src}" alt="View ${i + 1}" data-qvthumb="${i}"
               class="modal-thumb${i === 0 ? ' active' : ''}"
               onerror="this.style.display='none'">`
        ).join('')}
      </div>`
    : '';

  const content = `
    <div class="modal-product-body">
      <div class="modal-gallery">
        <div class="modal-main-img-wrap">
          <img id="qvMainImg" src="${p.images[0]}" alt="${p.name}"
               onerror="this.src='https://placehold.co/700x520/f2ece3/9a8f82?text=ZYLO-Furn'">
        </div>
        ${thumbsHTML}
      </div>
      <div class="modal-product-details">
        <span class="product-category">${p.category}</span>
        <h2>${p.name}</h2>
        <p class="modal-price">${fmtPrice(p.price)}</p>
        <p class="modal-desc">${p.description}</p>
        ${specsHTML}
        <div class="modal-actions">
          <button class="btn btn-primary modal-add-cart" data-idx="${idx}">Add to Cart</button>
          <button class="btn btn-wa modal-wa-order" data-idx="${idx}">
            ${WA_SVG} Order via WhatsApp
          </button>
        </div>
      </div>
    </div>`;

  const overlay = createModal('quickViewModal', '900px', content);

  // Thumbnail switcher with fade transition
  overlay.querySelectorAll('[data-qvthumb]').forEach((thumb, ti) => {
    thumb.addEventListener('click', () => {
      const mainImg = overlay.querySelector('#qvMainImg');
      // Fade out, swap src, fade in
      mainImg.classList.add('switching');
      setTimeout(() => {
        mainImg.src = p.images[ti];
        mainImg.onload = () => mainImg.classList.remove('switching');
        // fallback if image is already cached
        if (mainImg.complete) mainImg.classList.remove('switching');
      }, 180);
      // Update active thumb
      overlay.querySelectorAll('[data-qvthumb]').forEach((t, i) =>
        t.classList.toggle('active', i === ti)
      );
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
   CART MODAL
───────────────────────────────────────────────────────────── */
function openCartModal() {
  const itemCount = cart.reduce((s, i) => s + i.qty, 0);

  const content = `
    <div class="cart-modal-header">
      <h2>Your Cart</h2>
      <span class="cart-item-count">${itemCount} ${itemCount === 1 ? 'item' : 'items'}</span>
    </div>
    <div class="cart-items" id="cartItemsContainer"></div>
    <div class="cart-footer">
      <div class="cart-subtotal-row">
        <span class="cart-subtotal-label">Subtotal</span>
        <span class="cart-subtotal-value" id="cartSubtotalDisplay">${fmtPrice(cartTotal())}</span>
      </div>
      <div class="cart-total-row">
        <span class="cart-total-label">Total</span>
        <span class="cart-total-value" id="cartTotalDisplay">${fmtPrice(cartTotal())}</span>
      </div>
      <div class="cart-footer-actions">
        <button class="btn btn-primary" id="proceedCheckout" ${cart.length ? '' : 'disabled'}>
          Proceed to Checkout
        </button>
        <button class="btn btn-outline" id="continueShoppingBtn">Continue Shopping</button>
      </div>
    </div>`;

  const overlay = createModal('cartModal', '520px', content);
  renderCartItems();

  overlay.querySelector('#proceedCheckout').addEventListener('click', () => {
    closeModal('cartModal');
    openCheckoutModal();
  });

  overlay.querySelector('#continueShoppingBtn').addEventListener('click', () => {
    closeModal('cartModal');
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
    <div class="checkout-modal-header">
      <h2>Complete Your Order</h2>
    </div>
    <div class="checkout-body">
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
        <textarea id="co-address" rows="3" placeholder="123 Main Street, Johannesburg"
                  autocomplete="street-address"></textarea>
      </div>
      <div class="checkout-summary">
        ${summaryRows}
        <div class="summary-line">
          <span>Total</span>
          <span>${fmtPrice(cartTotal())}</span>
        </div>
      </div>
    </div>
    <div class="checkout-footer">
      <button class="btn btn-wa" id="submitWaBtn">
        ${WA_SVG} Send Order via WhatsApp
      </button>
      <button class="btn btn-outline" id="backToCartBtn">← Back to Cart</button>
      <p class="checkout-note">
        Clicking "Send Order via WhatsApp" opens WhatsApp with your full order pre-filled.
        Our team will confirm availability and delivery within 24 hours.
      </p>
    </div>`;

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

    sendWhatsAppOrder(cart, { name, email, phone, address });
    closeModal('checkoutModal');
    openConfirmModal();
    cart = [];
    updateCartCount();
  });
}

/* ─────────────────────────────────────────────────────────────
   CONFIRMATION MODAL
───────────────────────────────────────────────────────────── */
function openConfirmModal() {
  const content = `
    <div class="confirm-icon">✓</div>
    <h2>Order Sent!</h2>
    <p>Your order has been sent via WhatsApp. Our team will confirm availability and delivery
       details within 24 hours. Thank you for choosing ZYLO-Furn.</p>
    <button class="btn btn-primary" id="confirmDoneBtn">Continue Shopping</button>`;

  const overlay = createModal('confirmModal', '440px', content);
  overlay.querySelector('#confirmDoneBtn').addEventListener('click', () =>
    closeModal('confirmModal')
  );
}