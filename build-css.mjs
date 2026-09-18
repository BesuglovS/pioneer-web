import { build } from 'esbuild';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const src = resolve(__dirname, 'src/css/index.css');
const out = resolve(__dirname, '_site/css');

async function buildCSS() {
  if (!existsSync(out)) mkdirSync(out, { recursive: true });
  try {
    await build({
      entryPoints: [src],
      bundle: true,
      minify: true,
      target: ['chrome100', 'firefox100'],
      outfile: resolve(out, 'main.css'),
      loader: { '.css': 'css' },
    });
    console.log('✅ CSS built successfully');
  } catch (e) {
    console.error('❌ CSS build failed:', e);
    process.exit(1);
  }
}
buildCSS();
