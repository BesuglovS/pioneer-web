export function initServiceWorker() {
  if (!('serviceWorker' in navigator)) return;
  // Регистрируем SW только в проде (не на localhost)
  if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') return;

  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch((err) => {
      console.warn('[sw-register] регистрация не удалась:', err);
    });
  });
}
