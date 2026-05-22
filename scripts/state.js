export let products = [];
export let cart = [];

export function setProducts(data) {
  products.length = 0;
  products.push(...data);
}

export function clearCart() {
  cart.length = 0;
}