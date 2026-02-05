import { CatalogAPI } from '../api.js';
import { addToCart, cartTotals } from '../cart.js';
import { isLoggedIn } from '../auth.js';
import { money, renderNav, toast } from '../ui.js';

renderNav();

const $ = (id) => document.getElementById(id);

let categories = [];
let last = { items: [], pagination: { total: 0, page: 1, pages: 1, limit: 50 } };

function debounce(fn, ms = 300) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), ms);
  };
}

async function loadCategories() {
  categories = await CatalogAPI.getCategories();
  const sel = $('categorySel');
  sel.innerHTML = `<option value="">All categories</option>` +
    categories.map(c => `<option value="${c._id}">${c.name}</option>`).join('');
}

function buildQuery() {
  const q = new URLSearchParams();

  const search = ($('search')?.value || '').trim();
  const category_id = $('categorySel')?.value || '';
  const minPrice = $('minPrice')?.value || '';
  const maxPrice = $('maxPrice')?.value || '';
  const sort = $('sortSel')?.value || 'createdAt';
  const order = $('orderSel')?.value || 'desc';
  const isAvailable = $('onlyAvailable')?.checked ? 'true' : '';

  if (search) q.set('search', search);
  if (category_id) q.set('category_id', category_id);
  if (minPrice !== '') q.set('minPrice', minPrice);
  if (maxPrice !== '') q.set('maxPrice', maxPrice);
  if (isAvailable) q.set('isAvailable', isAvailable);

  q.set('sort', sort);
  q.set('order', order);
  q.set('page', '1');
  q.set('limit', '50');

  return '?' + q.toString();
}

function productCard(p) {
  const sizes = Array.isArray(p.sizes) ? p.sizes.join(', ') : '';
  const available = p.isAvailable ? 'Available' : 'Not available';
  const stockText = (p.stock ?? 0) > 0 ? `Stock: ${p.stock}` : 'Out of stock';
  const disabled = (p.stock ?? 0) <= 0 ? 'disabled' : '';

  return `
    <div class="card">
      <h3>${p.name}</h3>
      <div class="muted small">${available} • ${stockText}</div>
      <div class="hr"></div>
      <div class="row">
        <div class="badge">Price: ${money(p.price)}</div>
        <div class="badge">Color: ${p.color || '-'}</div>
      </div>
      <div class="muted small" style="margin-top:8px">Sizes: ${sizes || '-'}</div>
      <div class="hr"></div>
      <button class="btn primary" data-add="${p._id}" ${disabled}>Add to cart</button>
    </div>
  `;
}

function renderProducts() {
  const wrap = $('products');
  const items = last.items || [];

  wrap.innerHTML = items.length
    ? items.map(productCard).join('')
    : `<div class="card">No products found.</div>`;

  $('resultsMeta').textContent = `${last.pagination.total} products found`;

  document.querySelectorAll('[data-add]').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-add');
      const p = items.find(x => x._id === id);
      if (!p) return;
      if (!isLoggedIn()) {
        toast('Please login to add items to cart', 'danger');
        setTimeout(()=>window.location.href='/login.html', 600);
        return;
      }
      addToCart(p, 1);
      const { itemsCount } = cartTotals();
      toast(`Added to cart • items: ${itemsCount}`, 'ok');
      renderNav();
    });
  });
}

async function loadProducts() {
  $('products').innerHTML = `<div class="card">Loading...</div>`;
  try {
    last = await CatalogAPI.getProducts(buildQuery());
    renderProducts();
  } catch (e) {
    $('products').innerHTML = `<div class="card">Error: ${e.message}</div>`;
  }
}

const triggerLoad = debounce(() => loadProducts(), 300);

['search', 'categorySel', 'minPrice', 'maxPrice', 'sortSel', 'orderSel', 'onlyAvailable'].forEach(id => {
  const el = $(id);
  if (!el) return;
  el.addEventListener('input', triggerLoad);
  el.addEventListener('change', triggerLoad);
});

$('resetBtn')?.addEventListener('click', () => {
  $('search').value = '';
  $('categorySel').value = '';
  $('minPrice').value = '';
  $('maxPrice').value = '';
  $('sortSel').value = 'createdAt';
  $('orderSel').value = 'desc';
  $('onlyAvailable').checked = false;
  loadProducts();
});

(async function init() {
  try {
    await loadCategories();
  } catch (e) {
    toast(e.message, 'danger');
  }
  await loadProducts();
})();
