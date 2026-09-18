import { build } from 'esbuild';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { mkdirSync, existsSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const src = resolve(__dirname, 'src/js/script.js');
const out = resolve(__dirname, '_site/js');

async function buildJS() {
  if (!existsSync(out)) mkdirSync(out, { recursive: true });
  try {
    await build({
      entryPoints: [src],
      bundle: true,
      minify: true,
      target: ['chrome100', 'firefox100'],
      outfile: resolve(out, 'main.js'),
      format: 'esm',
      sourcemap: false,
    });
    console.log('✅ JS built successfully');
  } catch (e) {
    console.error('❌ JS build failed:', e);
    process.exit(1);
  }
}
buildJS();
