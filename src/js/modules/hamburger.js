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

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && panel.classList.contains('open')) closePanel();
  });
}
