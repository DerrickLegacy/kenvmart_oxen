/**
 * readLogs.js — CLI utility to read and filter application log files
 *
 * Usage (run from project root):
 *   node server/utils/readLogs.js              # today's access + error logs
 *   node server/utils/readLogs.js --type error # error log only
 *   node server/utils/readLogs.js --type access
 *   node server/utils/readLogs.js --date 2026-09-03
 *   node server/utils/readLogs.js --level error
 *   node server/utils/readLogs.js --tail 50    # last 50 lines
 *   node server/utils/readLogs.js --list       # list all log files
 */

import fs   from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);
const LOG_DIR    = path.resolve(__dirname, '..', '..', 'logs');

const args  = process.argv.slice(2);
const get   = (flag) => { const i = args.indexOf(flag); return i !== -1 ? args[i + 1] : null; };
const has   = (flag) => args.includes(flag);

const type  = get('--type')  || 'all';   // access | error | all
const date  = get('--date')  || today();
const level = get('--level') || null;    // info | warn | error | http
const tail  = parseInt(get('--tail') || '100', 10);
const list  = has('--list');

function today() {
  const now = new Date();
  const dd  = String(now.getDate()).padStart(2, '0');
  const mm  = String(now.getMonth() + 1).padStart(2, '0');
  const yy  = String(now.getFullYear()).slice(-2);
  return `${dd}-${mm}-${yy}`; // e.g. 03-09-26
}

function readLogFile(filePath) {
  if (!fs.existsSync(filePath)) {
    console.log(`  (no file: ${path.basename(filePath)})`);
    return;
  }
  const raw   = fs.readFileSync(filePath, 'utf8').trim();
  if (!raw) { console.log('  (empty)'); return; }

  let lines = raw.split('\n');

  // Filter by level if requested
  if (level) {
    lines = lines.filter(l => {
      try { return JSON.parse(l).level === level; } catch { return false; }
    });
  }

  // Apply tail
  lines = lines.slice(-tail);

  // Pretty print
  for (const line of lines) {
    try {
      const obj = JSON.parse(line);
      const color = {
        info:  '\x1b[36m',   // cyan
        http:  '\x1b[32m',   // green
        warn:  '\x1b[33m',   // yellow
        error: '\x1b[31m',   // red
      }[obj.level] || '\x1b[0m';
      const reset = '\x1b[0m';

      if (obj.level === 'http') {
        const statusColor = obj.status >= 500 ? '\x1b[31m' : obj.status >= 400 ? '\x1b[33m' : '\x1b[32m';
        console.log(
          `${color}[${obj.time}]${reset} ${obj.method.padEnd(6)} ${statusColor}${obj.status}${reset} ${obj.url} ${obj.duration} — ${obj.ip}`
        );
      } else {
        const meta = { ...obj };
        delete meta.level; delete meta.time; delete meta.msg;
        const metaStr = Object.keys(meta).length ? ' ' + JSON.stringify(meta) : '';
        console.log(`${color}[${obj.time}] [${obj.level.toUpperCase()}]${reset} ${obj.msg}${metaStr}`);
      }
    } catch {
      console.log(line); // print raw if not JSON
    }
  }
}

if (!fs.existsSync(LOG_DIR)) {
  console.error(`Logs directory not found: ${LOG_DIR}`);
  console.error('Start the server first to generate logs.');
  process.exit(1);
}

if (list) {
  const files = fs.readdirSync(LOG_DIR).filter(f => f.endsWith('.log')).sort();
  if (!files.length) { console.log('No log files found.'); process.exit(0); }
  console.log(`\nLog files in ${LOG_DIR}:\n`);
  for (const f of files) {
    const stat = fs.statSync(path.join(LOG_DIR, f));
    const kb   = (stat.size / 1024).toFixed(1);
    console.log(`  ${f.padEnd(35)} ${kb} KB   ${stat.mtime.toISOString()}`);
  }
  process.exit(0);
}

console.log(`\n── kenvmart_${date}.log (last ${tail} lines${level ? `, level=${level}` : ''}) ──\n`);

if (type === 'all' || type === 'access') {
  console.log(`\x1b[1m📄 kenvmart_${date}.log\x1b[0m`);
  readLogFile(path.join(LOG_DIR, `kenvmart_${date}.log`));
}

if (type === 'error') {
  console.log(`\x1b[1m📄 kenvmart_${date}.log (errors only)\x1b[0m`);
  readLogFile(path.join(LOG_DIR, `kenvmart_${date}.log`));
}
