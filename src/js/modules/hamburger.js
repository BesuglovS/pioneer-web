export function initHamburger() {
  const panel = document.querySelector('.hamburger-panel');
  const overlay = document.querySelector('.hamburger-overlay');
  const button = document.querySelector('.hamburger-button');
  const closeBtn = document.querySelector('.hamburger-close');
  if (!panel || !overlay || !closeBtn) return;

  // активная страница
  const path = window.location.pathname.replace(/\/$/, '') + '/';
  panel.querySelectorAll('.hamburger-link').forEach((a) => {
    const href = a.getAttribute('href').replace(/\/$/, '') + '/';
    if (href === path) a.classList.add('hamburger-active');
  });

  function openPanel() {
    panel.classList.add('open');
    overlay.classList.add('open');
    overlay.setAttribute('aria-hidden', 'false');
    if (button) button.setAttribute('aria-expanded', 'true');
    closeBtn.focus();
  }

  function closePanel() {
    panel.classList.remove('open');
    overlay.classList.remove('open');
    overlay.setAttribute('aria-hidden', 'true');
    if (button) button.setAttribute('aria-expanded', 'false');
    if (button) button.focus();
  }

  if (button) button.addEventListener('click', () => {
    if (panel.classList.contains('open')) closePanel();
    else openPanel();
  });
  overlay.addEventListener('click', closePanel);
  closeBtn.addEventListener('click', closePanel);

  // focus-trap: Tab не выпускает фокус из модальной панели
  panel.addEventListener('keydown', (e) => {
    if (e.key !== 'Tab') return;
    const focusables = panel.querySelectorAll('a[href], button');
    if (!focusables.length) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && panel.classList.contains('open')) closePanel();
  });
}
