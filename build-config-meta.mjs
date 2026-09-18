import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const lessonsPath = resolve(__dirname, 'lessons.json');
const outDir = resolve(__dirname, 'src/_data');
const outPath = resolve(outDir, 'courseConfig.json');

function buildConfigMeta() {
  if (!existsSync(lessonsPath)) {
    console.error('❌ lessons.json not found');
    process.exit(1);
  }

  if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });

  const data = JSON.parse(readFileSync(lessonsPath, 'utf8'));
  const lessons = data.lessons || [];
  const sections = data.sections || [];

  const LESSON_META = {};

  for (const lesson of lessons) {
    LESSON_META[lesson.slug] = {
      number: lesson.number,
      url: `/${String(lesson.number).padStart(2, '0')}-${lesson.slug}/`,
      title: lesson.title,
      section: lesson.section,
      order: lesson.number,
      description: lesson.description || '',
      duration: lesson.duration,
      complexity: lesson.complexity,
    };
  }

  const config = {
    LESSON_META,
    sections: sections.map((s) => ({
      id: s.id,
      name: s.title,
      icon: s.icon,
      order: s.order,
      startLesson: s.startLesson,
      endLesson: s.endLesson,
    })),
    totalLessons: lessons.length,
  };

  writeFileSync(outPath, JSON.stringify(config, null, 2));
  console.log(`✅ courseConfig.json generated (${lessons.length} lessons, ${sections.length} sections)`);
}

buildConfigMeta();
