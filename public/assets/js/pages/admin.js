import { CatalogAPI, OrdersAPI } from '../api.js';
import { requireAdmin } from '../auth.js';
import { money, renderNav, toast } from '../ui.js';

renderNav();
if (!requireAdmin()) {
  // redirected
}

const $ = (id) => document.getElementById(id);

let categories = [];
let products = [];

function catBadges() {
  const wrap = $('catList');
  wrap.innerHTML = categories.length
    ? categories.map(c => `<div class="badge" title="${c._id}">${c.name}</div>`).join('')
    : `<div class="muted small">No categories yet</div>`;

  const sel = $('pCategory');
  sel.innerHTML = `<option value="">—</option>` +
    categories.map(c => `<option value="${c._id}">${c.name}</option>`).join('');
}

async function loadCategories() {
  categories = await CatalogAPI.getCategories();
  catBadges();
}

function productRow(p) {
  const catOptions = `<option value="">—</option>` + categories.map(c =>
    `<option value="${c._id}" ${String(p.category_id) === String(c._id) ? 'selected' : ''}>${c.name}</option>`
  ).join('');

  const sizes = Array.isArray(p.sizes) ? p.sizes.join(',') : '';

  return `
    <tr data-row="${p._id}">
      <td><input class="tinput" data-f="name" value="${p.name ?? ''}" /></td>
      <td><input class="tinput" data-f="price" type="number" step="0.01" min="0" value="${p.price ?? 0}" /></td>
      <td><select class="tinput" data-f="category_id">${catOptions}</select></td>
      <td><input class="tinput" data-f="color" value="${p.color ?? ''}" /></td>
      <td><input class="tinput" data-f="sizes" value="${sizes}" placeholder="S,M,L" /></td>
      <td>
        <div class="row" style="gap:8px;align-items:center">
          <input class="tinput" style="width:88px" data-f="stock" type="number" step="1" min="0" value="${p.stock ?? 0}" />
          <button class="btn" type="button" data-stock="${p._id}" title="Decrease stock by 1">-1</button>
        </div>
      </td>
      <td>
        <select class="tinput" data-f="isAvailable">
          <option value="true" ${p.isAvailable ? 'selected' : ''}>true</option>
          <option value="false" ${!p.isAvailable ? 'selected' : ''}>false</option>
        </select>
      </td>
      <td>
        <div class="row" style="gap:8px;flex-wrap:nowrap">
          <button class="btn ok" type="button" data-save="${p._id}">Save</button>
          <button class="btn danger" type="button" data-del="${p._id}">Delete</button>
        </div>
        <div class="muted small" style="margin-top:6px">${money(p.price)} • id: ${p._id}</div>
      </td>
    </tr>
  `;
}

async function loadProducts() {
  const tbody = $('productsBody');
  tbody.innerHTML = `<tr><td colspan="8" class="muted">Loading...</td></tr>`;

  const data = await CatalogAPI.getProducts('?limit=200&sort=createdAt&order=desc');
  products = data.items || [];

  tbody.innerHTML = products.length
    ? products.map(productRow).join('')
    : `<tr><td colspan="8" class="muted">No products yet</td></tr>`;

  // Save
  document.querySelectorAll('[data-save]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.getAttribute('data-save');
      const tr = document.querySelector(`tr[data-row="${id}"]`);
      if (!tr) return;

      const payload = {};
      tr.querySelectorAll('[data-f]').forEach(el => {
        const f = el.getAttribute('data-f');
        let v = el.value;
        if (f === 'price' || f === 'stock') v = Number(v);
        if (f === 'isAvailable') v = v === 'true';
        if (f === 'sizes') v = v.split(',').map(s => s.trim()).filter(Boolean);
        if (f === 'category_id' && !v) v = null;
        payload[f] = v;
      });

      try {
        await CatalogAPI.updateProduct(id, payload);
        toast('Saved', 'ok');
        await loadProducts();
      } catch (err) {
        toast(err.message, 'danger');
      }
    });
  });

  // Delete
  document.querySelectorAll('[data-del]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.getAttribute('data-del');
      if (!confirm('Delete this product?')) return;
      try {
        await CatalogAPI.deleteProduct(id);
        toast('Deleted', 'ok');
        await loadProducts();
      } catch (err) {
        toast(err.message, 'danger');
      }
    });
  });

  // Stock patch
  document.querySelectorAll('[data-stock]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.getAttribute('data-stock');
      try {
        await CatalogAPI.patchStock(id, -1);
        toast('Stock -1', 'ok');
        await loadProducts();
      } catch (err) {
        toast(err.message, 'danger');
      }
    });
  });
}

// Create category
$('createCategoryForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = $('newCatName').value.trim();
  const description = $('newCatDesc').value.trim();
  if (!name) return toast('Category name required', 'danger');
  try {
    await CatalogAPI.createCategory({ name, description });
    $('newCatName').value = '';
    $('newCatDesc').value = '';
    toast('Category created ✅', 'ok');
    await loadCategories();
  } catch (err) {
    toast(err.message, 'danger');
  }
});

// Create product
$('createProductForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const payload = {
    name: $('pName').value.trim(),
    price: Number($('pPrice').value || 0),
    category_id: $('pCategory').value || null,
    color: $('pColor').value.trim(),
    sizes: ($('pSizes').value || '').split(',').map(s => s.trim()).filter(Boolean),
    stock: Number($('pStock').value || 0),
    isAvailable: $('pAvail').checked,
  };

  if (!payload.name) return toast('Product name required', 'danger');

  try {
    await CatalogAPI.createProduct(payload);
    toast('Product created', 'ok');
    e.target.reset();
    $('pAvail').checked = true;
    await loadProducts();
  } catch (err) {
    toast(err.message, 'danger');
  }
});

// Update order status
$('orderStatusForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const id = $('orderId').value.trim();
  const status = $('orderStatus').value;
  if (!id) return toast('Order ID required', 'danger');
  try {
    await OrdersAPI.updateStatus(id, status);
    toast('Order updated', 'ok');
  } catch (err) {
    toast(err.message, 'danger');
  }
});

(async function init() {
  try {
    await loadCategories();
    await loadProducts();
  } catch (err) {
    toast(err.message, 'danger');
  }
})();
