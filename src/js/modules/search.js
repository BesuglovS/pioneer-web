import { PAGES } from '../config/courseData.js';
import { qs, qsa, debounce } from './utils.js';
import { SEARCH_DEBOUNCE_MS } from '../config/constants.js';

function normalizeText(str) {
  return String(str).toLowerCase().trim();
}

function matchesQuery(page, query) {
  if (!query) return true;
  const q = normalizeText(query);
  const haystack = [page.title, page.description, page.url, page.section]
    .map(normalizeText)
    .join(' ');
  return q.split(/\s+/).every((word) => haystack.includes(word));
}

function filterAndRender(query) {
  const normalizedQuery = normalizeText(query);
  const cards = qsa('.topic-card');

  cards.forEach((card) => {
    const num = parseInt(card.dataset.page, 10);
    const page = PAGES.find((p) => p.number === num);
    if (!page) return;
    card.style.display = matchesQuery(page, normalizedQuery) ? '' : 'none';
  });

  qsa('.section-group').forEach((group) => {
    const visible = qsa('.topic-card', group).filter((c) => c.style.display !== 'none');
    group.style.display = visible.length > 0 ? '' : 'none';
  });

  const visibleCount = cards.filter((c) => c.style.display !== 'none').length;
  const noResults = qs('.search-no-results');
  if (noResults) {
    noResults.style.display = visibleCount === 0 && normalizedQuery ? '' : 'none';
  }
}

const debouncedFilter = debounce((query) => filterAndRender(query), SEARCH_DEBOUNCE_MS);

function initSearch() {
  const input = qs('.search-input');
  if (!input) return;

  input.addEventListener('input', (e) => {
    debouncedFilter(e.target.value);
  });

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      input.value = '';
      filterAndRender('');
      input.blur();
    }
  });
}

export { initSearch, filterAndRender, matchesQuery };
