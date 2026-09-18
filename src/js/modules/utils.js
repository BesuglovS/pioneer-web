import { STORAGE_PREFIX } from '../config/constants.js';

export function debounce(fn, ms) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), ms);
  };
}

export function throttle(fn, ms) {
  let lastCall = 0;
  return function (...args) {
    const now = Date.now();
    if (now - lastCall >= ms) {
      lastCall = now;
      return fn.apply(this, args);
    }
  };
}

export function qs(selector, parent = document) {
  return parent.querySelector(selector);
}

export function qsa(selector, parent = document) {
  return Array.from(parent.querySelectorAll(selector));
}

export function on(el, event, handler, options) {
  if (typeof el === 'string') el = qs(el);
  if (!el) return;
  el.addEventListener(event, handler, options);
  return () => el.removeEventListener(event, handler, options);
}

export function storageGet(key) {
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function storageSet(key, value) {
  try {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}
