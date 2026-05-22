/* ============================================================
   ZYLO-FURN — scripts/config.js
   Global configuration and demo product data
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
  SHEETS_CSV_URL: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTgPoKqP5QuVzXk1eN071EI1TivfyF4s3GJQVjAaXQDAh2lP6j-2YdtJAUlMDr6MHyR7-urI256cnh6/pub?output=csv',
  WHATSAPP_NUMBER: '27717090240',   // ← replace with your number
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