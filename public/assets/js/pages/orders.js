import { OrdersAPI, PaymentsAPI } from '../api.js';
import { requireAuth } from '../auth.js';
import { money, renderNav, toast } from '../ui.js';

renderNav();
if (!requireAuth()) {
  // redirected
}

const $ = (id) => document.getElementById(id);

function getHighlight(){
  const p = new URLSearchParams(location.search);
  return p.get('highlight');
}

function orderCard(o, highlightId){
  const isHi = highlightId && o._id === highlightId;
  const items = (o.items||[]).map(it => `
    <tr>
      <td>${it.name}</td>
      <td>${it.quantity}</td>
      <td>${money(it.price)}</td>
      <td>${money(it.price*it.quantity)}</td>
    </tr>`).join('');

  const payBtn = o.status === 'pending'
    ? `<button class="btn primary" data-pay="${o._id}">Pay</button>`
    : '';

  return `
  <div class="card" style="margin-top:10px;border-color:${isHi ? 'rgba(90,166,255,.7)' : 'var(--border)'}">
    <div class="row" style="align-items:center;justify-content:space-between">
      <div>
        <div class="small muted">Order ID</div>
        <div style="font-weight:700">${o._id}</div>
      </div>
      <div class="kpi">
        <div class="badge">Status: ${o.status}</div>
        <div class="badge">Total: ${money(o.totalPrice)}</div>
      </div>
    </div>
    <div class="hr"></div>
    <table class="table small">
      <thead><tr><th>Product</th><th>Qty</th><th>Price</th><th>Sum</th></tr></thead>
      <tbody>${items}</tbody>
    </table>
    <div class="hr"></div>
    <div class="row" style="justify-content:flex-end">${payBtn}</div>
  </div>`;
}

async function load(){
  try {
    const [summary, orders] = await Promise.all([
      OrdersAPI.getSummary(),
      OrdersAPI.getMyOrders(),
    ]);

    // orders.html uses #summary and #orders
    $('summary').innerHTML = `
      <div class="row" style="gap:10px;flex-wrap:wrap">
        <div class="card" style="padding:10px 12px;min-width:180px">
          <div class="muted small">Orders</div>
          <div style="font-size:24px;font-weight:800">${summary.ordersCount}</div>
        </div>
        <div class="card" style="padding:10px 12px;min-width:180px">
          <div class="muted small">Total spent</div>
          <div style="font-size:24px;font-weight:800">${money(summary.totalSpent)}</div>
        </div>
      </div>
    `;

    // The old UI used to render raw JSON into #summaryJson.
    // If that block is removed from orders.html, we must not assume it exists.
    const debugEl = document.getElementById('summaryJson');
    if (debugEl) debugEl.textContent = JSON.stringify(summary, null, 2);

    const hi = getHighlight();
    $('orders').innerHTML = orders.length
      ? orders.map(o => orderCard(o, hi)).join('')
      : `<div class="card">No orders yet. <a href="/index.html">Shop</a></div>`;

    document.querySelectorAll('[data-pay]').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.getAttribute('data-pay');
        const method = prompt('Payment method (card/cash/...)', 'card') || 'card';
        try {
          await PaymentsAPI.createPayment(id, method);
          toast('Paid ✅', 'ok');
          load();
        } catch (err) {
          toast(err.message, 'danger');
        }
      });
    });

  } catch (err) {
    $('orders').innerHTML = `<div class="card">Error: ${err.message}</div>`;
  }
}

load();
