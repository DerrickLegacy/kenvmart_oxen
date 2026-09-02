/**
 * KenvMart Node.js API Server
 *
 * Replaces the CodeIgniter /api/* backend.
 * Connects directly to the same MySQL database as JPOS.
 * JPOS continues running independently — this server only reads/writes
 * the shop_* tables and reads geopos_products / geopos_product_cat.
 *
 * Development:
 *   node server/index.js
 *   npm run server
 *
 * The Vite dev server proxies /api/* → this server (see vite.config.js).
 * In production, run this as a standalone process on a separate port,
 * or behind Nginx / Apache with a reverse-proxy rule.
 */

import 'dotenv/config';
import express from 'express';

// Ensure dotenv loads from the right place when run from any cwd
import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { config as dotenvConfig } from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = dirname(__filename);
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

const app  = express();
const PORT = process.env.PORT || 4000;

// ── Middleware ─────────────────────────────────────────────────────────────

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  const allowedOrigins = [
    'http://localhost',
    'http://localhost:5173',
    'http://127.0.0.1',
    'http://127.0.0.1:5173',
    process.env.CORS_ORIGIN,
  ].filter(Boolean);

  const origin = req.headers.origin || '';

  if (allowedOrigins.includes(origin))      res.setHeader('Access-Control-Allow-Origin', origin);
  else if (!origin)                          res.setHeader('Access-Control-Allow-Origin', '*');
  else                                       res.setHeader('Access-Control-Allow-Origin', process.env.CORS_ORIGIN || '*');

  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

// ── Routes ─────────────────────────────────────────────────────────────────

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

app.use((req, res) =>
  res.status(404).json({ status: false, message: `Route ${req.method} ${req.path} not found.` })
);

// ── Start ──────────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`✅  Kenvies API  →  http://localhost:${PORT}/api`);
  console.log(`    DB:   ${process.env.DB_NAME || 'jpos_db'} @ ${process.env.DB_HOST || 'localhost'}`);
  console.log(`    ENV:  ${process.env.NODE_ENV || 'development'}`);
});
