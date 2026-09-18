export function initKeyboardNav() {
  const prev = document.querySelector('.bottom-link--prev');
  const next = document.querySelector('.bottom-link--next');
  const path = window.location.pathname;

  document.addEventListener('keydown', (e) => {
    if (e.altKey || e.ctrlKey || e.metaKey) return;
    const tag = (document.activeElement && document.activeElement.tagName) || '';
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

    if ((e.key === 'ArrowRight' || e.key === 'l') && next) {
      window.location.href = next.getAttribute('href');
    } else if ((e.key === 'ArrowLeft' || e.key === 'h') && prev) {
      window.location.href = prev.getAttribute('href');
    } else if (e.key === '/' && path === '/') {
      const search = document.querySelector('.search-input');
      if (search) {
        e.preventDefault();
        search.focus();
      }
    }
  });
}
