import { build } from 'esbuild';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { mkdirSync, existsSync, writeFileSync, unlinkSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = resolve(__dirname, '_site/js');

async function buildHighlight() {
  if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });

  const tmpFile = resolve(__dirname, '_tmp_hljs_entry.mjs');
  const code = [
    "import hljs from 'highlight.js/lib/core';",
    "import python from 'highlight.js/lib/languages/python';",
    "hljs.registerLanguage('python', python);",
    "hljs.registerLanguage('javascript', function(hljs){return{contains:[hljs.QUOTE_STRING_MODE,{className:'comment',begin:'//',end:'$'},{className:'number',begin:'\\b[0-9]+\\b'}]}});",
    "hljs.registerLanguage('json', function(hljs){return{contains:[{className:'string',begin:'\"',end:'\"',contains:[{begin:'\\\\\\\\.'}]},{begin:'\\{',end:'\\}',contains:[{className:'attr',begin:'\"[^\"]*\"\\s*:'}]}]}});",
    "hljs.registerLanguage('bash', function(hljs){return{contains:[{className:'comment',begin:'#',end:'$'},{className:'string',begin:'\"',end:'\"'},{className:'keyword',begin:'\\b(echo|if|then|fi|for|do|done|exit)\\b'}]}});",
    "hljs.registerLanguage('sql', function(hljs){return{contains:[{className:'keyword',begin:'\\b(SELECT|INSERT|UPDATE|DELETE|FROM|WHERE|CREATE|DROP|ALTER|TABLE|INDEX|JOIN|ON|AND|OR|NOT|NULL|PRIMARY|KEY|VALUES|INTO|SET)\\b',caseInsensitive:true},{className:'string',begin:'\\'',end:'\\''},{className:'number',begin:'\\b[0-9]+\\b'}]}});",
    "window.hljs=hljs;"
  ].join('\n');

  writeFileSync(tmpFile, code);

  try {
    await build({
      entryPoints: [tmpFile],
      bundle: true,
      minify: true,
      target: ['chrome100', 'firefox100'],
      outfile: resolve(outDir, 'hljs.min.js'),
      format: 'iife',
    });
    console.log('✅ highlight.js built (python + basic fallbacks)');
  } catch (e) {
    console.error('❌ highlight.js build failed:', e);
    process.exit(1);
  } finally {
    if (existsSync(tmpFile)) unlinkSync(tmpFile);
  }
}

buildHighlight();
