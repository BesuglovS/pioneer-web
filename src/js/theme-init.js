(function () {
  'use strict';
  var pref = null;
  try {
    var raw = localStorage.getItem('pioneer-web-theme');
    if (raw) pref = JSON.parse(raw);
  } catch (e) { /* ignore */ }
  if (pref !== 'light' && pref !== 'dark') {
    try {
      pref = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    } catch (e) {
      pref = 'light';
    }
  }
  document.documentElement.setAttribute('data-theme', pref);
})();
