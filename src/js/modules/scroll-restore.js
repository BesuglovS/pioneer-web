import { ssGet, ssSet } from './utils.js';

function scrollKey() {
  return 'scroll' + window.location.pathname;
}

export function initScrollRestore() {
  // Восстановление позиции при переходе назад/вперёд
  window.addEventListener('popstate', () => {
    const hash = window.location.hash.slice(1);
    if (!hash) {
      const saved = ssGet(scrollKey());
      if (saved) {
        window.scrollTo(0, parseInt(saved, 10) || 0);
      }
    }
  });

  let saveTimer = null;
  window.addEventListener('scroll', () => {
    if (saveTimer) return;
    saveTimer = setTimeout(() => {
      saveTimer = null;
      ssSet(scrollKey(), String(window.scrollY));
    }, 200);
  }, { passive: true });
}
