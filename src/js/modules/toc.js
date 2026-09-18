import { qs, qsa, throttle } from './utils.js';
import { SCROLL_THROTTLE_MS } from '../config/constants.js';

let tocLinks = [];
let headings = [];
let activeId = null;

function extractHeadings() {
  const content = qs('.page-content');
  if (!content) return [];

  return qsa('h2, h3, h4', content)
    .filter((h) => !h.closest('table'))
    .map((heading, index) => {
      if (!heading.id) {
        heading.id = 'heading-' + index;
      }
      return {
        id: heading.id,
        text: heading.textContent.trim(),
        level: parseInt(heading.tagName.charAt(1), 10),
        el: heading
      };
    });
}

function renderToc(headingsList) {
  const sidebar = qs('.toc-sidebar');
  if (!sidebar) return;

  if (headingsList.length === 0) {
    sidebar.style.display = 'none';
    return;
  }

  const nav = qs('.toc-nav', sidebar);
  if (!nav) return;

  const list = document.createElement('ol');
  list.className = 'toc-list';

  headingsList.forEach((h) => {
    const li = document.createElement('li');
    li.className = 'toc-item';
    const a = document.createElement('a');
    let levelClass = '';
    if (h.level === 3) levelClass = ' toc-list__link--level-2';
    else if (h.level === 4) levelClass = ' toc-list__link--level-3';
    a.className = 'toc-list__link' + levelClass;
    a.href = '#' + h.id;
    a.textContent = h.text;
    a.dataset.targetId = h.id;
    a.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.getElementById(h.id);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        history.pushState(null, '', '#' + h.id);
      }
    });
    li.appendChild(a);
    list.appendChild(li);
  });

  nav.innerHTML = '';
  nav.appendChild(list);

  tocLinks = qsa('.toc-list__link', nav);
}

function updateActiveHeading() {
  const scrollPos = window.scrollY + 120;
  let currentId = null;

  for (let i = headings.length - 1; i >= 0; i--) {
    if (headings[i].el.offsetTop <= scrollPos) {
      currentId = headings[i].id;
      break;
    }
  }

  if (currentId !== activeId) {
    activeId = currentId;
    tocLinks.forEach((link) => {
      link.classList.toggle('toc-list__link--active', link.dataset.targetId === currentId);
    });
  }
}

const throttledUpdate = throttle(updateActiveHeading, SCROLL_THROTTLE_MS);

function initToc() {
  if (!qs('.toc-sidebar')) return;
  headings = extractHeadings();
  renderToc(headings);

  if (headings.length > 0) {
    window.addEventListener('scroll', throttledUpdate, { passive: true });
    updateActiveHeading();
  }
}

export { initToc };
