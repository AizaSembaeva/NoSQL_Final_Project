import { clearToken, getUser, isLoggedIn } from './auth.js';
import { cartTotals } from './cart.js';

export function $(sel, root=document){
  return root.querySelector(sel);
}
export function $all(sel, root=document){
  return Array.from(root.querySelectorAll(sel));
}

export function toast(msg, type=''){ 
  const el = document.getElementById('toast');
  if (!el) { alert(msg); return; }
  el.textContent = msg;
  el.style.borderColor = type==='danger' ? 'rgba(255,90,122,.5)' : type==='ok' ? 'rgba(61,220,151,.5)' : 'rgba(90,166,255,.5)';
  el.classList.add('show');
  clearTimeout(el._t);
  el._t = setTimeout(()=>el.classList.remove('show'), 2600);
}

export function renderNav(){
  const nav = document.getElementById('navLinks');
  if (!nav) return;

  const u = getUser();
  const { itemsCount } = cartTotals();

  const links = [];
  links.push(`<a class="pill" href="/index.html">Shop</a>`);
  links.push(`<a class="pill" href="/cart.html">Cart (${itemsCount})</a>`);
  if (isLoggedIn()) {
    links.push(`<a class="pill" href="/orders.html">My orders</a>`);
    if (u?.role === 'admin') links.push(`<a class="pill" href="/admin.html">Admin</a>`);
    links.push(`<button id="logoutBtn" class="btn">Logout</button>`);
  } else {
    links.push(`<a class="pill" href="/login.html">Login</a>`);
    links.push(`<a class="pill" href="/register.html">Register</a>`);
  }

  nav.innerHTML = links.join('');

  const lb = document.getElementById('logoutBtn');
  if (lb) {
    lb.addEventListener('click', () => {
      clearToken();
      toast('Logged out', 'ok');
      setTimeout(()=>window.location.href='/index.html', 400);
    });
  }
}

export function money(n){
  const x = Number(n||0);
  return x.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}

export function qs(obj){
  const p = new URLSearchParams();
  Object.entries(obj).forEach(([k,v]) => {
    if (v === undefined || v === null || v === '') return;
    p.set(k, String(v));
  });
  const s = p.toString();
  return s ? `?${s}` : '';
}
