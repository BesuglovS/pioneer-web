import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const lessonsPath = resolve(__dirname, 'lessons.json');
const outPath = resolve(__dirname, 'src/js/config/courseData.js');

function pad2(n) {
  return String(n).padStart(2, '0');
}

function buildConfigMeta() {
  const data = JSON.parse(readFileSync(lessonsPath, 'utf8'));
  const lessons = data.lessons || [];
  const sections = data.sections || [];

  const pages = lessons.map((l) => ({
    number: l.number,
    url: `/${pad2(l.number)}-${l.slug}/`,
    title: l.title,
    section: l.section,
    description: l.description || '',
    duration: l.duration,
    complexity: l.complexity,
  }));

  const secs = sections.map((s) => ({
    id: s.id,
    name: s.title,
    icon: s.icon,
  }));

  const js = `// АВТОГЕНЕРИРУЕТСЯ из lessons.json (npm run build:config-meta) — НЕ редактировать вручную
export const PAGES = ${JSON.stringify(pages, null, 2)};

export const SECTIONS = ${JSON.stringify(secs, null, 2)};
`;

  writeFileSync(outPath, js);
  console.log(`✅ courseData.js generated (${pages.length} pages, ${secs.length} sections)`);
}

buildConfigMeta();
