import { AuthAPI } from '../api.js';
import { setToken, isLoggedIn } from '../auth.js';
import { $, renderNav, toast } from '../ui.js';

renderNav();

if (isLoggedIn()) {
  window.location.href = '/index.html';
}

$('#loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = $('#email').value.trim();
  const password = $('#password').value;

  try {
    const res = await AuthAPI.login({ email, password });
    setToken(res.token);
    toast('Logged in', 'ok');
    setTimeout(()=>window.location.href='/index.html', 400);
  } catch (err) {
    toast(err.message, 'danger');
  }
});
