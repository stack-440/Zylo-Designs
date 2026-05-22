/* ============================================================
   ZYLO-FURN — scripts/cart.js
   Cart state management: add, remove, quantity, badge, render
   ============================================================ */

'use strict';

/* ─────────────────────────────────────────────────────────────
   CART HELPERS
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

function cartTotal() {
  return cart.reduce((sum, i) => sum + i.product.price * i.qty, 0);
}

function updateCartCount() {
  const total = cart.reduce((sum, i) => sum + i.qty, 0);
  const badge = document.getElementById('cartCount');
  if (!badge) return;
  badge.textContent = total;
  badge.classList.toggle('visible', total > 0);
}

/* ─────────────────────────────────────────────────────────────
   RENDER CART ITEMS (inside the cart modal)
───────────────────────────────────────────────────────────── */
function renderCartItems() {
  const container = document.getElementById('cartItemsContainer');
  if (!container) return;

  // Update header badge count
  const badge = document.querySelector('.cart-item-count');
  const itemCount = cart.reduce((s, i) => s + i.qty, 0);
  if (badge) badge.textContent = `${itemCount} ${itemCount === 1 ? 'item' : 'items'}`;

  if (!cart.length) {
    container.innerHTML = `
      <div class="cart-empty">
        <span class="cart-empty-icon">🛒</span>
        <p>Your cart is empty.</p>
        <p style="font-size:.8rem;color:var(--text-muted)">Add some furniture to get started.</p>
      </div>`;
    const btn      = document.getElementById('proceedCheckout');
    const total    = document.getElementById('cartTotalDisplay');
    const subtotal = document.getElementById('cartSubtotalDisplay');
    if (btn)      btn.disabled = true;
    if (total)    total.textContent = fmtPrice(0);
    if (subtotal) subtotal.textContent = fmtPrice(0);
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

  const total    = document.getElementById('cartTotalDisplay');
  const subtotal = document.getElementById('cartSubtotalDisplay');
  if (total)    total.textContent    = fmtPrice(cartTotal());
  if (subtotal) subtotal.textContent = fmtPrice(cartTotal());

  const btn = document.getElementById('proceedCheckout');
  if (btn) btn.disabled = false;

  container.querySelectorAll('.cart-item-remove').forEach(btn => {
    btn.addEventListener('click', () => removeFromCart(btn.dataset.remove));
  });
}