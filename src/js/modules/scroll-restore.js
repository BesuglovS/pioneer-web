export function initScrollRestore() {
  // Восстановление позиции при переходе назад/вперёд
  window.addEventListener('popstate', (e) => {
    const hash = window.location.hash.slice(1);
    if (!hash) {
      const saved = sessionStorage.getItem('pioneer-web-scroll' + window.location.pathname);
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
      sessionStorage.setItem('pioneer-web-scroll' + window.location.pathname, String(window.scrollY));
    }, 200);
  }, { passive: true });
}
