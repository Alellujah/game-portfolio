#!/usr/bin/env node
// Simple image optimizer for the local dev workflow.
// - Scans `public/` recursively
// - Writes optimized files to `public/compressed/` preserving folders
// - PNG/JPEG: uses `sharp` if installed, otherwise falls back to copying
// - SVG/GIF/others: copied as-is
//
// Usage:
//   node tools/optimize-images.mjs
// Options:
//   --src <dir>   (default: public)
//   --out <dir>   (default: <src>/compressed)
//   --quality <n> (JPEG quality, default: 75)

import fs from 'node:fs/promises';
import fssync from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function parseArgs() {
  const args = process.argv.slice(2);
  const out = { src: 'public', out: null, quality: 75 };
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === '--src' && args[i + 1]) { out.src = args[++i]; continue; }
    if (a === '--out' && args[i + 1]) { out.out = args[++i]; continue; }
    if (a === '--quality' && args[i + 1]) { out.quality = Number(args[++i]) || 75; continue; }
  }
  if (!out.out) out.out = path.join(out.src, 'compressed');
  return out;
}

async function pathExists(p) {
  try { await fs.access(p); return true; } catch { return false; }
}

async function ensureDir(p) {
  await fs.mkdir(p, { recursive: true });
}

async function* walk(dir, { exclude = [] } = {}) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (exclude.some((ex) => full.startsWith(ex))) continue;
    if (e.isDirectory()) {
      yield* walk(full, { exclude });
    } else if (e.isFile()) {
      yield full;
    }
  }
}

async function tryImportSharp() {
  try {
    const mod = await import('sharp');
    return mod?.default ?? mod;
  } catch {
    return null;
  }
}

async function copyFile(src, dest) {
  await ensureDir(path.dirname(dest));
  await fs.copyFile(src, dest);
}

async function main() {
  const { src, out, quality } = parseArgs();
  const srcAbs = path.resolve(src);
  const outAbs = path.resolve(out);

  if (!(await pathExists(srcAbs))) {
    console.error(`Source folder not found: ${srcAbs}`);
    process.exit(1);
  }
  if (srcAbs === outAbs) {
    console.error('Output folder must be different from source.');
    process.exit(1);
  }

  // Avoid recursing into the output directory if it is within src
  const exclude = outAbs.startsWith(srcAbs) ? [outAbs] : [];

  console.log(`Optimizing images from ${srcAbs} -> ${outAbs}`);

  const sharp = await tryImportSharp();
  if (!sharp) {
    console.warn('Note: sharp not found. Falling back to copying files without compression.');
    console.warn('Install it for better results: pnpm add -D sharp');
  }

  let count = 0;
  for await (const file of walk(srcAbs, { exclude })) {
    const rel = path.relative(srcAbs, file);
    const dest = path.join(outAbs, rel);
    const ext = path.extname(file).toLowerCase();

    if (ext === '.png' && sharp) {
      await ensureDir(path.dirname(dest));
      await sharp(file)
        .png({ compressionLevel: 9, palette: true, effort: 7 })
        .toFile(dest);
      count++;
      continue;
    }

    if ((ext === '.jpg' || ext === '.jpeg') && sharp) {
      await ensureDir(path.dirname(dest));
      await sharp(file)
        .jpeg({ quality, mozjpeg: true, progressive: true, chromaSubsampling: '4:4:4' })
        .toFile(dest);
      count++;
      continue;
    }

    // For other images or if no sharp: just copy
    await copyFile(file, dest);
    count++;
  }

  console.log(`Done. Processed ${count} files into ${outAbs}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

