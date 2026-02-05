import { STORAGE_KEYS } from './config.js';

function read(){
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.cart) || '[]');
  } catch {
    return [];
  }
}

function write(items){
  localStorage.setItem(STORAGE_KEYS.cart, JSON.stringify(items));
}

export function getCart(){
  return read();
}

export function clearCart(){
  write([]);
}

export function addToCart(product, quantity=1){
  const cart = read();
  const idx = cart.findIndex(i => i.productId === product._id);
  if (idx >= 0) cart[idx].quantity += quantity;
  else cart.push({
    productId: product._id,
    name: product.name,
    price: product.price,
    quantity
  });
  write(cart);
}

export function removeFromCart(productId){
  write(read().filter(i => i.productId !== productId));
}

export function setQty(productId, quantity){
  const q = Math.max(1, Number(quantity||1));
  const cart = read();
  const it = cart.find(i => i.productId === productId);
  if (it) it.quantity = q;
  write(cart);
}

export function cartTotals(){
  const cart = read();
  const itemsCount = cart.reduce((s,i)=>s+i.quantity,0);
  const total = cart.reduce((s,i)=>s+i.price*i.quantity,0);
  return { itemsCount, total };
}
