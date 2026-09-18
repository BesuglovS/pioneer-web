import { rmSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const siteDir = resolve(__dirname, '_site');

if (existsSync(siteDir)) {
  rmSync(siteDir, { recursive: true, force: true });
  console.log('✅ _site/ cleaned');
} else {
  console.log('ℹ️  _site/ not found, nothing to clean');
}
