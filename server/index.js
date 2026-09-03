/**
 * KenvMart — Production Node.js Server
 *
 * - Serves the React/Vite dist/ build (static files + SPA fallback)
 * - Handles all /api/* routes
 * - Listens on process.env.PORT (required by Hostinger)
 * - Structured logging to stdout/stderr + log files
 *
 * Hostinger hPanel setup:
 *   Application root : domains/kenvmart.kenvies.com/public_html
 *   Entry file       : server/index.js
 *   Build command    : npm install && npm run build
 *   Start command    : npm start
 *   Node.js version  : 20
 */

// ── Load env FIRST before any other imports ────────────────────────────────
import { fileURLToPath } from 'url';
import { dirname, join, resolve } from 'path';
import { config as dotenvConfig } from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = dirname(__filename);

// Load server/.env (production secrets — never committed to git)
dotenvConfig({ path: join(__dirname, '.env') });

// ── Imports ────────────────────────────────────────────────────────────────
import express        from 'express';
import fs             from 'fs';
import { createWriteStream } from 'fs';
import { mkdirSync }  from 'fs';

// ── Logger setup ───────────────────────────────────────────────────────────
const IS_PROD  = process.env.NODE_ENV === 'production';
const LOG_DIR  = join(__dirname, '..', 'logs');

// Create logs/ directory if it doesn't exist
try { mkdirSync(LOG_DIR, { recursive: true }); } catch {}

// ── Log rotation — one combined file per day: kenvmart_DD-MM-YY.log ────────
function todayStamp() {
  const now = new Date();
  const dd  = String(now.getDate()).padStart(2, '0');
  const mm  = String(now.getMonth() + 1).padStart(2, '0');
  const yy  = String(now.getFullYear()).slice(-2);
  return `${dd}-${mm}-${yy}`; // e.g. 03-09-26
}

let _day       = todayStamp();
let _logStream = createWriteStream(join(LOG_DIR, `kenvmart_${_day}.log`), { flags: 'a' });

function getStream() {
  const today = todayStamp();
  if (today !== _day) {
    // Day rolled over — open a new log file
    _day       = today;
    _logStream = createWriteStream(join(LOG_DIR, `kenvmart_${_day}.log`), { flags: 'a' });
  }
  return _logStream;
}

function timestamp() {
  return new Date().toISOString();
}

function writeLog(line) {
  getStream().write(line + '\n');
}

const logger = {
  info(msg, meta = {}) {
    const line = JSON.stringify({ level: 'info', time: timestamp(), msg, ...meta });
    writeLog(line);
    if (!IS_PROD) console.log(line);
  },
  warn(msg, meta = {}) {
    const line = JSON.stringify({ level: 'warn', time: timestamp(), msg, ...meta });
    writeLog(line);
    if (!IS_PROD) console.warn(line);
  },
  error(msg, meta = {}) {
    const line = JSON.stringify({ level: 'error', time: timestamp(), msg, ...meta });
    writeLog(line);
    if (!IS_PROD) console.error(line);
  },
  http(req, res, duration) {
    const line = JSON.stringify({
      level:    'http',
      time:     timestamp(),
      method:   req.method,
      url:      req.originalUrl,
      status:   res.statusCode,
      duration: `${duration}ms`,
      ip:       req.headers['x-forwarded-for'] || req.socket.remoteAddress,
    });
    writeLog(line);
    if (!IS_PROD) console.log(line);
  },
};

// ── Auto-cleanup: delete log files older than 14 days ─────────────────────
function cleanOldLogs() {
  try {
    const files     = fs.readdirSync(LOG_DIR);
    const cutoff    = Date.now() - 14 * 24 * 60 * 60 * 1000; // 14 days in ms
    let   deleted   = 0;
    for (const file of files) {
      if (!file.endsWith('.log')) continue;
      const filePath = join(LOG_DIR, file);
      const stat     = fs.statSync(filePath);
      if (stat.mtimeMs < cutoff) {
        fs.unlinkSync(filePath);
        deleted++;
      }
    }
    if (deleted > 0) logger.info(`Log cleanup: removed ${deleted} old log file(s)`);
  } catch (e) {
    logger.warn('Log cleanup failed', { error: e.message });
  }
}

// Run cleanup once at startup and then every 24 hours
cleanOldLogs();
setInterval(cleanOldLogs, 24 * 60 * 60 * 1000);


import authRouter       from './routes/auth.js';
import productsRouter   from './routes/products.js';
import categoriesRouter from './routes/categories.js';
import cartRouter       from './routes/cart.js';
import wishlistRouter   from './routes/wishlist.js';
import ordersRouter     from './routes/orders.js';
import profileRouter    from './routes/profile.js';
import contactRouter    from './routes/contact.js';
import newsletterRouter from './routes/newsletter.js';

// ── App setup ──────────────────────────────────────────────────────────────
const app  = express();

// Use Hostinger's assigned PORT — never hardcode a port in production
const PORT = Number(process.env.PORT || 3000);

// dist/ is one level up from server/
const DIST_DIR   = resolve(__dirname, '..', 'dist');
const INDEX_HTML = join(DIST_DIR, 'index.html');

// ── Request logging middleware ─────────────────────────────────────────────
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => logger.http(req, res, Date.now() - start));
  next();
});

// ── Body parsers ───────────────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── CORS ───────────────────────────────────────────────────────────────────
app.use((req, res, next) => {
  const corsOrigin = process.env.CORS_ORIGIN || '*';
  res.setHeader('Access-Control-Allow-Origin', corsOrigin);
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

// ── API routes (MUST come before static/SPA fallback) ─────────────────────
app.use('/api/auth',       authRouter);
app.use('/api/products',   productsRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/cart',       cartRouter);
app.use('/api/wishlist',   wishlistRouter);
app.use('/api/orders',     ordersRouter);
app.use('/api/profile',    profileRouter);
app.use('/api/contact',    contactRouter);
app.use('/api/newsletter', newsletterRouter);

app.get('/api/health', (_req, res) => {
  res.json({
    status:  true,
    message: 'Kenvies API is running.',
    time:    new Date().toISOString(),
    env:     process.env.NODE_ENV || 'development',
    db:      process.env.DB_NAME  || 'unknown',
  });
});

// ── Serve React frontend (production) ─────────────────────────────────────
if (fs.existsSync(DIST_DIR)) {
  // Serve static files: JS, CSS, images from dist/
  app.use(express.static(DIST_DIR));

  // SPA fallback — non-API routes return index.html so React Router works
  // (handles /login, /cart, /product/123, etc.)
  app.get('*', (_req, res) => {
    res.sendFile(INDEX_HTML);
  });

  logger.info('Static files will be served from dist/');
} else {
  // dist/ missing — show a helpful error instead of a blank 404
  app.use((_req, res) => {
    res.status(503).send(
      '<h2>App not built.</h2><p>SSH in and run: <code>npm install &amp;&amp; npm run build</code></p>'
    );
  });
  logger.warn('dist/ directory not found — frontend will not be served', { DIST_DIR });
}

// ── Global error handler ───────────────────────────────────────────────────
app.use((err, req, res, _next) => {
  logger.error('Unhandled error', {
    message: err.message,
    stack:   IS_PROD ? undefined : err.stack,
    method:  req.method,
    url:     req.originalUrl,
  });
  res.status(err.status || 500).json({
    status:  false,
    message: IS_PROD ? 'Internal server error' : err.message,
  });
});

// ── Unhandled rejections & exceptions ─────────────────────────────────────
process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled promise rejection', { reason: String(reason) });
});

process.on('uncaughtException', (err) => {
  logger.error('Uncaught exception — shutting down', { message: err.message });
  process.exit(1);
});

// ── Start ──────────────────────────────────────────────────────────────────
app.listen(PORT, '0.0.0.0', () => {
  logger.info('Server started', {
    port:    PORT,
    mode:    process.env.NODE_ENV || 'development',
    db:      `${process.env.DB_NAME || '?'} @ ${process.env.DB_HOST || 'localhost'}`,
    dist:    fs.existsSync(DIST_DIR) ? 'found' : 'MISSING',
  });
});
