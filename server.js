/**
 * server.js — Root entry point for Hostinger deployment
 *
 * Hostinger looks for server.js at the project root.
 * This file builds the frontend if dist/ is missing, then
 * hands off to the real server at server/index.js.
 */

import { execSync } from 'child_process';
import { existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIST      = resolve(__dirname, 'dist');
const INDEX     = resolve(__dirname, 'dist', 'index.html');

// Build the frontend if dist/ or dist/index.html is missing
if (!existsSync(DIST) || !existsSync(INDEX)) {
  console.log('dist/ not found — running npm run build...');
  try {
    execSync('RAYON_NUM_THREADS=1 npx vite build', {
      stdio: 'inherit',
      cwd:   __dirname,
      env:   { ...process.env, NODE_ENV: 'production' },
    });
    console.log('Build complete.');
  } catch (err) {
    console.error('Build failed:', err.message);
    process.exit(1);
  }
} else {
  console.log('dist/ found — skipping build.');
}

// Hand off to the real server
import('./server/index.js');
