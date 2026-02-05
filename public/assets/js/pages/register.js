import { AuthAPI } from '../api.js';
import { renderNav, toast } from '../ui.js';

renderNav();

const $ = (id) => document.getElementById(id);

$('regForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const payload = {
    fullname: $('fullname').value.trim(),
    email: $('email').value.trim(),
    password: $('password').value,
    phone: $('phone').value.trim(),
    address: {
      city: $('city').value.trim(),
      street: $('street').value.trim(),
      house: $('house').value.trim(),
    }
  };

  try {
    await AuthAPI.register(payload);
    toast('Account created. Please login.', 'ok');
    setTimeout(() => window.location.href = '/login.html', 600);
  } catch (err) {
    toast(err.message, 'danger');
  }
});
