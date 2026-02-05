import { OrdersAPI } from '../api.js';
import { requireAuth } from '../auth.js';
import { getCart, removeFromCart, setQty, clearCart, cartTotals } from '../cart.js';
import { money, renderNav, toast } from '../ui.js';

renderNav();

const $ = (id) => document.getElementById(id);

function render(){
  const cart = getCart();
  const body = $('cartBody');
  const clearBtn = $('clearBtn');
  const checkoutBtn = $('checkoutBtn');

  if (!body) return;

  if (!cart.length) {
    body.innerHTML = `
      <tr>
        <td colspan="5" class="muted" style="padding:14px 6px">Your cart is empty.</td>
      </tr>
    `;
    if (clearBtn) clearBtn.disabled = true;
    if (checkoutBtn) checkoutBtn.disabled = true;
  } else {
    if (clearBtn) clearBtn.disabled = false;
    if (checkoutBtn) checkoutBtn.disabled = false;

    body.innerHTML = cart.map(i => `
      <tr>
        <td>
          <div style="font-weight:700">${i.name}</div>
          <div class="muted small">ID: ${i.productId}</div>
        </td>
        <td>${money(i.price)}</td>
        <td>
          <input data-qty="${i.productId}" type="number" min="1" value="${i.quantity}" style="width:90px" />
        </td>
        <td><span class="badge">${money(i.price * i.quantity)}</span></td>
        <td><button class="btn danger" data-rm="${i.productId}">Remove</button></td>
      </tr>
    `).join('');

    document.querySelectorAll('[data-rm]').forEach(btn => {
      btn.addEventListener('click', () => {
        removeFromCart(btn.getAttribute('data-rm'));
        toast('Removed', 'ok');
        renderNav();
        render();
      });
    });

    document.querySelectorAll('[data-qty]').forEach(inp => {
      inp.addEventListener('change', () => {
        setQty(inp.getAttribute('data-qty'), inp.value);
        renderNav();
        render();
      });
    });
  }

  const { itemsCount, total } = cartTotals();
  const totalsEl = $('totals');
  if (totalsEl) totalsEl.textContent = `Items: ${itemsCount} • Total: ${money(total)}`;
}

$('clearBtn')?.addEventListener('click', () => {
  clearCart();
  toast('Cart cleared', 'ok');
  renderNav();
  render();
});

$('checkoutBtn')?.addEventListener('click', async () => {
  // Checkout requires authentication
  if (!requireAuth()) return;

  const cart = getCart();
  if (!cart.length) return;

  try {
    const items = cart.map(i => ({ productId: i.productId, quantity: i.quantity }));
    const order = await OrdersAPI.createOrder(items);
    clearCart();
    toast('Order created (pending). Redirecting to My Orders...', 'ok');
    setTimeout(()=>window.location.href='/orders.html?highlight=' + order._id, 700);
  } catch (err) {
    toast(err.message, 'danger');
  }
});

render();
