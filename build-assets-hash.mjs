import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { createHash } from 'crypto';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const siteDir = resolve(__dirname, '_site');
const outDir = resolve(__dirname, 'src/_data');
const outPath = resolve(outDir, 'assetsHash.json');

function fileHash(filePath) {
  const data = readFileSync(filePath);
  return createHash('md5').update(data).digest('hex').slice(0, 8);
}

function buildHashes() {
  if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });

  const assets = {};
  const candidates = {
    mainCss: resolve(siteDir, 'css', 'main.css'),
    mainJs: resolve(siteDir, 'js', 'main.js'),
    themeInitJs: resolve(siteDir, 'js', 'theme-init.js'),
  };

  for (const [key, filePath] of Object.entries(candidates)) {
    if (existsSync(filePath)) {
      assets[key] = fileHash(filePath);
    } else {
      console.warn(`⚠️  ${key} not found at ${filePath}`);
      assets[key] = 'dev';
    }
  }

  writeFileSync(outPath, JSON.stringify(assets, null, 2));
  console.log(`✅ assetsHash.json generated: css=${assets.mainCss} js=${assets.mainJs}`);
}

buildHashes();
