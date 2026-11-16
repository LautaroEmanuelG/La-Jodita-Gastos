// @astrojs/vercel v7 (Astro 4) solo conoce Node 18/20: con otra versión fuerza
// "nodejs18.x" en las funciones, runtime que Vercel ya no acepta.
// Este script reescribe el runtime de cada función al Node mayor actual del build.
// Eliminar al migrar a Astro 5+ con @astrojs/vercel >= 9 (soporta 22/24 nativamente).
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const FUNCTIONS_DIR = '.vercel/output/functions';
const runtime = `nodejs${process.versions.node.split('.')[0]}.x`;

async function walk(dir) {
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      await walk(full);
    } else if (entry.name === '.vc-config.json') {
      const config = JSON.parse(await readFile(full, 'utf8'));
      if (config.runtime && config.runtime.startsWith('nodejs') && config.runtime !== runtime) {
        console.log(`[fix-vercel-runtime] ${full}: ${config.runtime} → ${runtime}`);
        config.runtime = runtime;
        await writeFile(full, JSON.stringify(config, null, 2));
      }
    }
  }
}

await walk(FUNCTIONS_DIR);
