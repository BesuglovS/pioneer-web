import { initThemeToggle } from './modules/theme.js';
import { initHamburger } from './modules/hamburger.js';
import { initScrollProgress } from './modules/scroll-progress.js';
import { initToc } from './modules/toc.js';
import { initSearch } from './modules/search.js';
import { initKeyboardNav } from './modules/keyboard-nav.js';
import { initScrollRestore } from './modules/scroll-restore.js';
import { initServiceWorker } from './modules/sw-register.js';

function detectPageType() {
  const body = document.body;
  if (body.classList.contains('page-doc')) return 'doc';
  if (body.classList.contains('page-index')) return 'index';
  return 'other';
}

function initApp() {
  const pageType = detectPageType();

  initThemeToggle();
  initScrollProgress();
  initKeyboardNav();
  initScrollRestore();

  if (pageType === 'doc') {
    initToc();
  }

  if (pageType === 'index') {
    initSearch();
  }

  initHamburger();
  initServiceWorker();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
