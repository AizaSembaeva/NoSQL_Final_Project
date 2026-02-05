import { STORAGE_KEYS } from './config.js';

export function setToken(token){
  localStorage.setItem(STORAGE_KEYS.token, token);
}

export function clearToken(){
  localStorage.removeItem(STORAGE_KEYS.token);
}

export function getToken(){
  return localStorage.getItem(STORAGE_KEYS.token) || "";
}

export function isLoggedIn(){
  return !!getToken();
}

export function parseJwt(token){
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(c =>
      '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
    ).join(''));
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

export function getUser(){
  const t = getToken();
  if (!t) return null;
  const p = parseJwt(t);
  if (!p) return null;
  return { id: p.id, role: p.role, exp: p.exp };
}

export function requireAuth(){
  if (!isLoggedIn()) {
    window.location.href = '/login.html';
    return false;
  }
  return true;
}

export function requireAdmin(){
  const u = getUser();
  if (!u) {
    window.location.href = '/login.html';
    return false;
  }
  if (u.role !== 'admin') {
    window.location.href = '/index.html';
    return false;
  }
  return true;
}
