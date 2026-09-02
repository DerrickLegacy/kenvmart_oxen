/**
 * KenvMart Node.js API + Static File Server
 *
 * In production:  serves the React/Vite dist/ build AND the /api/* routes.
 * In development: only serves /api/* — Vite dev server handles the frontend.
 *
 * Hostinger Node.js app setup:
 *   Entry point:    server/index.js
 *   Build command:  npm install && npm run build
 *   Start command:  npm start
 */

import 'dotenv/config';
import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { config as dotenvConfig } from 'dotenv';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = dirname(__filename);

// Load server/.env
dotenvConfig({ path: join(__dirname, '.env') });

import authRouter       from './routes/auth.js';
import productsRouter   from './routes/products.js';
import categoriesRouter from './routes/categories.js';
import cartRouter       from './routes/cart.js';
import wishlistRouter   from './routes/wishlist.js';
import ordersRouter     from './routes/orders.js';
import profileRouter    from './routes/profile.js';
import contactRouter    from './routes/contact.js';
import newsletterRouter from './routes/newsletter.js';

const app        = express();
const PORT       = process.env.PORT || 3000;
const IS_PROD    = process.env.NODE_ENV === 'production';

// dist/ is one level up from server/ (at the project root)
const DIST_DIR   = join(__dirname, '..', 'dist');
const INDEX_HTML = join(DIST_DIR, 'index.html');

// ── Middleware ─────────────────────────────────────────────────────────────

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS
app.use((req, res, next) => {
  const corsOrigin = process.env.CORS_ORIGIN || '*';
  res.setHeader('Access-Control-Allow-Origin', corsOrigin);
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

// ── API Routes ─────────────────────────────────────────────────────────────

app.use('/api/auth',       authRouter);
app.use('/api/products',   productsRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/cart',       cartRouter);
app.use('/api/wishlist',   wishlistRouter);
app.use('/api/orders',     ordersRouter);
app.use('/api/profile',    profileRouter);
app.use('/api/contact',    contactRouter);
app.use('/api/newsletter', newsletterRouter);

app.get('/api/health', (_req, res) =>
  res.json({ status: true, message: 'Kenvies API is running.', time: new Date().toISOString() })
);

// ── Serve React frontend in production ────────────────────────────────────
// This replaces the need for .htaccess — Express handles the SPA fallback.

if (IS_PROD && fs.existsSync(DIST_DIR)) {
  // Serve static assets (JS, CSS, images) from dist/
  app.use(express.static(DIST_DIR));

  // SPA fallback — any non-API route serves index.html so React Router works
  app.get('*', (req, res) => {
    if (fs.existsSync(INDEX_HTML)) {
      res.sendFile(INDEX_HTML);
    } else {
      res.status(404).send('App not built. Run: npm run build');
    }
  });
} else if (!IS_PROD) {
  // Dev mode — just a reminder, Vite handles the frontend
  app.use((req, res) =>
    res.status(404).json({ status: false, message: `Route ${req.method} ${req.path} not found.` })
  );
} else {
  // Production but dist/ missing
  app.use((_req, res) =>
    res.status(503).send('Frontend not built. SSH in and run: npm install && npm run build')
  );
}

// ── Start ──────────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`✅  Kenvies  →  http://localhost:${PORT}`);
  console.log(`    Mode: ${IS_PROD ? 'production' : 'development'}`);
  console.log(`    DB:   ${process.env.DB_NAME || 'jpos_db'} @ ${process.env.DB_HOST || 'localhost'}`);
  console.log(`    Dist: ${IS_PROD ? (fs.existsSync(DIST_DIR) ? '✅ found' : '❌ MISSING — run npm run build') : 'n/a (dev mode)'}`);
});
