import { qs, throttle } from './utils.js';
import { SCROLL_THROTTLE_MS } from '../config/constants.js';

function updateScrollProgress() {
  const bar = qs('.progress-bar');
  if (!bar) return;

  const scrollTop = window.scrollY || document.documentElement.scrollTop;
  const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
  const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;

  bar.style.width = pct + '%';
  bar.setAttribute('aria-valuenow', Math.round(pct));
}

const throttledUpdate = throttle(updateScrollProgress, SCROLL_THROTTLE_MS);

function initScrollProgress() {
  const bar = qs('.progress-bar');
  if (!bar) return;

  bar.setAttribute('role', 'progressbar');
  bar.setAttribute('aria-valuemin', '0');
  bar.setAttribute('aria-valuemax', '100');
  bar.setAttribute('aria-valuenow', '0');
  bar.setAttribute('aria-label', 'Прокрутка страницы');

  window.addEventListener('scroll', throttledUpdate, { passive: true });
  window.addEventListener('resize', throttledUpdate, { passive: true });
  updateScrollProgress();
}

export { initScrollProgress };
