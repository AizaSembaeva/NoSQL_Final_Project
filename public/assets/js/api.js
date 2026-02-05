import { API_BASE, STORAGE_KEYS } from './config.js';

function getToken(){
  return localStorage.getItem(STORAGE_KEYS.token) || "";
}

export async function api(path, { method="GET", body, auth=false } = {}){
  const headers = { "Content-Type":"application/json" };
  if (auth) {
    const t = getToken();
    if (t) headers.Authorization = `Bearer ${t}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined
  });

  let data = null;
  const ct = res.headers.get("content-type") || "";
  if (ct.includes("application/json")) data = await res.json();
  else data = await res.text();

  if (!res.ok) {
    let msg = `HTTP ${res.status}`;
    if (data) {
      if (typeof data === 'string' && data.trim()) msg = data;
      else if (data.message) msg = data.message;
      else if (data.error) msg = data.error;
      else if (Array.isArray(data.errors) && data.errors[0]) msg = data.errors[0].message || data.errors[0].msg || msg;
    }
    const err = new Error(msg);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

export const AuthAPI = {
  register: (payload) => api('/api/auth/register', { method:'POST', body:payload }),
  login: (payload) => api('/api/auth/login', { method:'POST', body:payload }),
};

export const CatalogAPI = {
  getCategories: () => api('/api/categories'),
  createCategory: (payload) => api('/api/categories', { method:'POST', body:payload, auth:true }),

  getProducts: (queryString='') => api(`/api/products${queryString}`),
  createProduct: (payload) => api('/api/products', { method:'POST', body:payload, auth:true }),
  updateProduct: (id, payload) => api(`/api/products/${id}`, { method:'PUT', body:payload, auth:true }),
  deleteProduct: (id) => api(`/api/products/${id}`, { method:'DELETE', auth:true }),
  patchStock: (id, delta) => api(`/api/products/${id}/stock`, { method:'PATCH', body:{ delta }, auth:true }),
};

export const OrdersAPI = {
  createOrder: (items) => api('/api/orders', { method:'POST', body:{ items }, auth:true }),
  getMyOrders: () => api('/api/orders/my', { auth:true }),
  getSummary: () => api('/api/orders/summary', { auth:true }),
  updateStatus: (id, status) => api(`/api/orders/${id}/status`, { method:'PATCH', body:{ status }, auth:true }),
  adminGetByEmail: (email, date='') => {
    const q = new URLSearchParams();
    q.set('email', email);
    if (date) q.set('date', date);
    return api(`/api/orders/admin/by-email?${q.toString()}`, { auth:true });
  }
};

export const PaymentsAPI = {
  createPayment: (order_id, payment_method='card') => api('/api/payments', { method:'POST', body:{ order_id, payment_method }, auth:true })
};
