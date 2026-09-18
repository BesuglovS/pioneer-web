import { qs, on, storageGet, storageSet } from './utils.js';

const THEME_KEY = 'theme';

function getSystemTheme() {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function getSavedTheme() {
  return storageGet(THEME_KEY) || 'auto';
}

function resolveTheme(preference) {
  if (preference === 'auto') return getSystemTheme();
  return preference;
}

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  const btn = qs('.theme-toggle');
  if (btn) {
    const icon = theme === 'dark' ? '☀️' : '🌙';
    btn.textContent = icon;
    btn.setAttribute('aria-label', theme === 'dark' ? 'Переключить на светлую тему' : 'Переключить на тёмную тему');
  }
}

function cycleTheme() {
  const current = getSavedTheme();
  const order = ['auto', 'light', 'dark'];
  const idx = order.indexOf(current);
  const next = order[(idx + 1) % order.length];
  storageSet(THEME_KEY, next);
  applyTheme(resolveTheme(next));
  updateIndicator(next);
}

function updateIndicator(preference) {
  const indicator = qs('.theme-indicator');
  if (indicator) {
    const labels = { auto: 'Авто', light: 'Светлая', dark: 'Тёмная' };
    indicator.textContent = labels[preference] || preference;
  }
}

function initThemeToggle() {
  const btn = qs('.theme-toggle');
  if (btn) {
    on(btn, 'click', cycleTheme);
  }

  const saved = getSavedTheme();
  applyTheme(resolveTheme(saved));
  updateIndicator(saved);

  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    if (getSavedTheme() === 'auto') {
      applyTheme(getSystemTheme());
    }
  });
}

export { initThemeToggle };
