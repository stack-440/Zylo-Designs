/* ============================================================
   ZYLO-FURN — scripts/whatsapp.js
   Builds and opens a WhatsApp pre-filled message for orders.
   Works for single quick-order items and full cart checkouts.
   ============================================================ */

'use strict';

/* ─────────────────────────────────────────────────────────────
   WHATSAPP ORDER SENDER
   items    — array of { product, qty }
   customer — { name, email, phone, address } or null
───────────────────────────────────────────────────────────── */
function sendWhatsAppOrder(items, customer) {
  const lines = [];
  lines.push('🛋️ *ZYLO-Furn Order Request*');
  lines.push('─────────────────────');

  items.forEach(({ product: p, qty }) => {
    lines.push(`• *${p.name}*`);
    lines.push(`  Category: ${p.category}`);
    lines.push(
      `  Price: ${fmtPrice(p.price)}${qty > 1 ? ` × ${qty} = ${fmtPrice(p.price * qty)}` : ''}`
    );
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