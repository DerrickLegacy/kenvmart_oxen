/**
 * Products routes
 *
 * GET /api/products               — list (paginated, filterable)
 * GET /api/products/trending      — trending / featured
 * GET /api/products/deals         — today's deals
 * GET /api/products/:id           — single product detail
 * GET /api/products/:id/related   — related products
 */

import { Router } from 'express';
import db from '../db.js';
import { formatProduct, formatProductFull, resolvePid, slugify } from '../utils/images.js';

const router = Router();

const PRODUCT_SELECT = `
  gp.pid, gp.product_name, gp.product_des, gp.retail_price, gp.ecomm_price, gp.product_price,
  gp.qty, gp.image, gp.images, gp.pcat, gp.created_at, gp.updated_at,
  gp.brand, gp.shop_tag, gp.sale_percent, gp.rating, gp.rating_count,
  gp.colors, gp.features, gp.specifications, gp.shipping_options, gp.variants,
  gp.search_tags, gp.shop_published, gpc.title AS cat_title, scm.slug AS cat_slug
`;

const PRODUCT_FROM = `
  FROM geopos_products gp
  LEFT JOIN geopos_product_cat gpc ON gpc.id = gp.pcat
  LEFT JOIN shop_category_meta scm ON scm.jpos_cat_id = gp.pcat
  WHERE gp.is_deleted = 0 AND gp.merge = 0 AND gp.shop_published = 1
    AND gp.ecomm_price > 0
`;

// ── GET /api/products ──────────────────────────────────────────────────────

router.get('/', async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page || '1', 10));
    const perPage = Math.min(100, Math.max(1, parseInt(req.query.per_page || '20', 10)));
    const { q, category, brand, tag, min_price, max_price, rating_min, sort = 'newest' } = req.query;

    const { where, params } = buildFilters({ q, category, brand, tag, min_price, max_price, rating_min });

    console.log('[products/list] SQL:', `SELECT COUNT(*) AS total ${PRODUCT_FROM} ${where}`);
    console.log('[products/list] Params:', params);

    const [countRows] = await db.query(`SELECT COUNT(*) AS total ${PRODUCT_FROM} ${where}`, params);
    const total = countRows[0].total;
    const offset = (page - 1) * perPage;

    const [rows] = await db.query(
      `SELECT ${PRODUCT_SELECT} ${PRODUCT_FROM} ${where} ${sortClause(sort)} LIMIT ? OFFSET ?`,
      [...params, perPage, offset]
    );

    return res.json({ status: true, data: { products: rows.map(formatProduct).filter(Boolean), pagination: { total, per_page: perPage, current_page: page, last_page: Math.max(1, Math.ceil(total / perPage)) } } });
  } catch (err) {
    console.error('[products/list]', err);
    res.status(500).json({ status: false, message: 'Server error.' });
  }
});

// ── GET /api/products/trending ─────────────────────────────────────────────

router.get('/trending', async (req, res) => {
  try {
    const limit = Math.max(1, parseInt(req.query.limit || '8', 10));
    const [rows] = await db.query(
      `SELECT ${PRODUCT_SELECT} ${PRODUCT_FROM} AND (LOWER(TRIM(gp.shop_tag)) = 'trending' OR gp.rating >= 4.0) ORDER BY gp.rating DESC LIMIT ?`,
      [limit]
    );
    return res.json({ status: true, data: { products: rows.map(formatProduct).filter(Boolean) } });
  } catch (err) {
    console.error('[products/trending]', err);
    res.status(500).json({ status: false, message: 'Server error.' });
  }
});

// ── GET /api/products/deals ────────────────────────────────────────────────

router.get('/new', async (req, res) => {
  try {
    const limit = Math.max(1, parseInt(req.query.limit || '8', 10));
    const [rows] = await db.query(
      `SELECT ${PRODUCT_SELECT} ${PRODUCT_FROM} AND LOWER(TRIM(gp.shop_tag)) = 'new' ORDER BY gp.created_at DESC LIMIT ?`,
      [limit]
    );
    return res.json({ status: true, data: { products: rows.map(formatProduct).filter(Boolean) } });
  } catch (err) {
    console.error('[products/new]', err);
    res.status(500).json({ status: false, message: 'Server error.' });
  }
});

// ── GET /api/products/deals ────────────────────────────────────────────────

router.get('/deals', async (req, res) => {
  try {
    const limit = Math.max(1, parseInt(req.query.limit || '8', 10));
    const [rows] = await db.query(
      `SELECT ${PRODUCT_SELECT} ${PRODUCT_FROM} AND LOWER(TRIM(gp.shop_tag)) = 'deals' ORDER BY gp.created_at DESC LIMIT ?`,
      [limit]
    );
    return res.json({ status: true, data: { products: rows.map(formatProduct).filter(Boolean) } });
  } catch (err) {
    console.error('[products/deals]', err);
    res.status(500).json({ status: false, message: 'Server error.' });
  }
});

// ── GET /api/products/hot ──────────────────────────────────────────────────

router.get('/hot', async (req, res) => {
  try {
    const limit = Math.max(1, parseInt(req.query.limit || '8', 10));
    const [rows] = await db.query(
      `SELECT ${PRODUCT_SELECT} ${PRODUCT_FROM} AND LOWER(TRIM(gp.shop_tag)) = 'hot' ORDER BY gp.created_at DESC LIMIT ?`,
      [limit]
    );
    return res.json({ status: true, data: { products: rows.map(formatProduct).filter(Boolean) } });
  } catch (err) {
    console.error('[products/hot]', err);
    res.status(500).json({ status: false, message: 'Server error.' });
  }
});

// ── GET /api/products/sale ─────────────────────────────────────────────────

router.get('/sale', async (req, res) => {
  try {
    const limit = Math.max(1, parseInt(req.query.limit || '8', 10));
    const [rows] = await db.query(
      `SELECT ${PRODUCT_SELECT} ${PRODUCT_FROM} AND LOWER(TRIM(gp.shop_tag)) = 'sale' ORDER BY gp.sale_percent DESC LIMIT ?`,
      [limit]
    );
    return res.json({ status: true, data: { products: rows.map(formatProduct).filter(Boolean) } });
  } catch (err) {
    console.error('[products/sale]', err);
    res.status(500).json({ status: false, message: 'Server error.' });
  }
});

// ── GET /api/products/:id ──────────────────────────────────────────────────

router.get('/:id', async (req, res) => {
  try {
    const pid = resolvePid(req.params.id);
    if (!pid) return res.status(404).json({ status: false, message: 'Product not found.' });

    // Main product row
    const [rows] = await db.query(
      `SELECT ${PRODUCT_SELECT} ${PRODUCT_FROM} AND gp.pid = ? LIMIT 1`,
      [pid]
    );
    if (!rows.length) return res.status(404).json({ status: false, message: 'Product not found.' });

    const base = formatProductFull(rows[0]);

    // Rich detail from geopos_product_details (if the table exists and has a row)
    let detail = null;
    try {
      const [detailRows] = await db.query(
        `SELECT long_description, warranty_info, specifications, features
         FROM geopos_product_details WHERE product_id = ? LIMIT 1`,
        [pid]
      );
      if (detailRows.length) detail = detailRows[0];
    } catch { /* table may not exist yet — fail silently */ }

    // Aggregate review stats from geopos_product_reviews
    let reviewStats = { average: 0, count: 0 };
    let reviews = [];
    try {
      const [statsRows] = await db.query(
        `SELECT ROUND(AVG(rating), 1) AS average, COUNT(*) AS count
         FROM geopos_product_reviews WHERE product_id = ?`,
        [pid]
      );
      if (statsRows.length) {
        reviewStats = {
          average: parseFloat(statsRows[0].average) || 0,
          count: parseInt(statsRows[0].count, 10) || 0,
        };
      }

      const [revRows] = await db.query(
        `SELECT r.id, r.rating, r.comment, r.created_at,
                COALESCE(u.full_name, 'Anonymous') AS reviewer_name
         FROM geopos_product_reviews r
         LEFT JOIN shop_users u ON u.id = r.user_id
         WHERE r.product_id = ?
         ORDER BY r.created_at DESC
         LIMIT 20`,
        [pid]
      );
      reviews = revRows.map(r => ({
        id: r.id,
        rating: r.rating,
        comment: r.comment || '',
        created_at: r.created_at,
        reviewer_name: r.reviewer_name,
      }));
    } catch { /* reviews table may not exist yet */ }

    // Merge: detail table wins over geopos_products columns when present
    const merged = {
      ...base,
      // Override description with long_description if available
      description: (detail?.long_description) || base.description,
      warranty_info: detail?.warranty_info || null,
      // Override features/specifications from detail table if available
      features: safeJsonParse(detail?.features, base.features),
      specifications: safeJsonParse(detail?.specifications, base.specifications),
      // Live review data
      rating: reviewStats.count > 0 ? reviewStats.average : base.rating,
      rating_count: reviewStats.count > 0 ? reviewStats.count : base.rating_count,
      reviews,
    };

    return res.json({ status: true, data: merged });
  } catch (err) {
    console.error('[products/show]', err);
    res.status(500).json({ status: false, message: 'Server error.' });
  }
});

// ── POST /api/products/:id/reviews  (auth required) ───────────────────────

router.post('/:id/reviews', async (req, res) => {
  try {
    // Auth check
    const authHeader = req.headers['authorization'] || '';
    const match = authHeader.match(/^Bearer\s+(.+)$/i);
    if (!match) return res.status(401).json({ status: false, message: 'Authentication required.' });

    const { decode } = await import('../utils/jwt.js');
    const payload = await decode(match[1].trim());
    if (!payload) return res.status(401).json({ status: false, message: 'Invalid or expired token.' });

    const pid = resolvePid(req.params.id);
    const rating = parseInt(req.body.rating, 10);
    const comment = (req.body.comment || '').trim();

    if (!pid) return res.status(404).json({ status: false, message: 'Product not found.' });
    if (!rating || rating < 1 || rating > 5)
      return res.status(422).json({ status: false, message: 'Rating must be between 1 and 5.' });

    // Check product exists
    const [pRows] = await db.query('SELECT pid FROM geopos_products WHERE pid = ? LIMIT 1', [pid]);
    if (!pRows.length) return res.status(404).json({ status: false, message: 'Product not found.' });

    // One review per user per product
    const [existing] = await db.query(
      'SELECT id FROM geopos_product_reviews WHERE product_id = ? AND user_id = ? LIMIT 1',
      [pid, payload.sub]
    );
    if (existing.length) {
      // Update existing review
      await db.query(
        'UPDATE geopos_product_reviews SET rating = ?, comment = ? WHERE product_id = ? AND user_id = ?',
        [rating, comment || null, pid, payload.sub]
      );
    } else {
      await db.query(
        'INSERT INTO geopos_product_reviews (product_id, user_id, rating, comment) VALUES (?, ?, ?, ?)',
        [pid, payload.sub, rating, comment || null]
      );
    }

    return res.status(201).json({ status: true, message: 'Review submitted.' });
  } catch (err) {
    console.error('[products/reviews/post]', err);
    res.status(500).json({ status: false, message: 'Server error.' });
  }
});

// ── GET /api/products/:id/related ─────────────────────────────────────────

router.get('/:id/related', async (req, res) => {
  try {
    const pid = resolvePid(req.params.id);
    if (!pid) return res.status(404).json({ status: false, message: 'Product not found.' });

    const [productRows] = await db.query(`SELECT gp.pcat ${PRODUCT_FROM} AND gp.pid = ? LIMIT 1`, [pid]);
    if (!productRows.length) return res.status(404).json({ status: false, message: 'Product not found.' });

    const [rows] = await db.query(
      `SELECT ${PRODUCT_SELECT} ${PRODUCT_FROM} AND gp.pcat = ? AND gp.pid != ? LIMIT 4`,
      [productRows[0].pcat, pid]
    );
    return res.json({ status: true, data: { products: rows.map(formatProduct).filter(Boolean) } });
  } catch (err) {
    console.error('[products/related]', err);
    res.status(500).json({ status: false, message: 'Server error.' });
  }
});

// ── Helpers ────────────────────────────────────────────────────────────────

const STOP_WORDS = new Set([
  'the', 'and', 'for', 'with', 'from', 'that', 'this', 'into', 'your',
  'more', 'shop', 'store', 'item', 'items', 'product', 'products',
  'all', 'any', 'buy', 'get', 'best', 'sale', 'off', 'only',
]);

function tokenize(phrase = '') {
  if (!phrase) return [];
  return String(phrase)
    .toLowerCase()
    .split(/[\s&+_,./\\()]+/)
    .map((s) => s.trim())
    .filter((s) => s.length >= 1 && !STOP_WORDS.has(s))
    .flatMap((s) => {
      const tokens = [s];

      // Handle common singular/plural for search (e.g., Battery <-> Batteries)
      if (s === 'battery') tokens.push('batterie');
      if (s === 'batterie' || s === 'batteries') tokens.push('battery');

      // Basic singularization for other common cases
      if (
        s.endsWith('s') &&
        s.length > 3 &&
        !['glass', 'press', 'dress', 'plus', 'bus', 'lens'].includes(s)
      ) {
        tokens.push(s.slice(0, -1));
      }

      // Handle common dash/space variations (e.g., C-To-C <-> C To C)
      if (s.includes('-')) {
        tokens.push(s.replace(/-/g, ''));
        tokens.push(...s.split('-').filter((t) => t.length >= 1));
      }

      return tokens;
    })
    .filter((s, i, arr) => arr.indexOf(s) === i && s.length >= 1);
}

/**
 * Build a SQL fragment that matches a single keyword token across the
 * columns a user would expect to search (name, description, brand, category, and search_tags).
 * Returns { sql: string, params: string[] }.
 */
function tokenMatchClause(tok) {
  const like = `%${tok}%`;
  return {
    sql:
      '(LOWER(gp.product_name) LIKE ?' +
      ' OR LOWER(COALESCE(gp.brand, "")) LIKE ?' +
      ' OR LOWER(COALESCE(gpc.title, "")) LIKE ?' +
      ' OR LOWER(COALESCE(gp.search_tags, "")) LIKE ?)',
    params: [like, like, like, like],
  };
}

function buildFilters({ q, category, brand, tag, min_price, max_price, rating_min }) {
  const conditions = [];
  const params = [];

  // Free-text search — matches name, brand, product_code, barcode, category title, search_tags. 
  // product_des is intentionally excluded. 
  if (q) {
    const phrase = q.trim();
    const tokens = tokenize(phrase);
    const localParams = [];

    const phraseCols = [
      'gp.product_name',
      'gp.brand',
      'gp.product_code',
      'gp.barcode',
      'gpc.title',
      'gp.search_tags',
    ];
    const fullPhraseSql = phraseCols
      .map((c) => `LOWER(COALESCE(${c}, "")) LIKE ?`)
      .join(' OR ');
    const full = `%${phrase.toLowerCase()}%`;
    localParams.push(...phraseCols.map(() => full));

    if (tokens.length > 0) {
      const andParts = [];
      for (const t of tokens) {
        const c = tokenMatchClause(t);
        andParts.push(c.sql);
        localParams.push(...c.params);
      }
      // Match EITHER the full phrase exactly OR ALL tokens somewhere
      conditions.push(`((${fullPhraseSql}) OR (${andParts.join(' AND ')}))`);
    } else {
      conditions.push(`(${fullPhraseSql})`);
    }

    params.push(...localParams);
  }

  // Category — token-based, forgiving. Handles plural/singular and searches 
  // title, name, and search_tags. product_des is intentionally excluded. 
  if (category) {
    const phrase = category.trim();
    const tokens = tokenize(phrase);
    const slug = slugify(phrase);
    const localParams = [];
    const ors = [];

    // Exact matches or slug matches in category metadata
    ors.push('gpc.title = ?', 'gpc.title LIKE ?', 'scm.slug = ?', 'scm.slug LIKE ?');
    localParams.push(phrase, `%${phrase}%`, slug, `%${slug}%`);

    // Fallback: search the phrase in product names and tags if it's long enough
    if (phrase.length >= 3) {
      const like = `%${phrase.toLowerCase()}%`;
      ors.push('LOWER(gp.product_name) LIKE ?');
      ors.push('LOWER(COALESCE(gp.search_tags, "")) LIKE ?');
      localParams.push(like, like);
    }

    // Token-based fallback: products that match ALL category tokens
    if (tokens.length > 0) {
      const tokenAnds = [];
      for (const tok of tokens) {
        const like = `%${tok}%`;
        tokenAnds.push(
          '(LOWER(COALESCE(gpc.title, "")) LIKE ? OR LOWER(gp.product_name) LIKE ? OR LOWER(COALESCE(gp.search_tags, "")) LIKE ?)'
        );
        localParams.push(like, like, like);
      }
      ors.push(`(${tokenAnds.join(' AND ')})`);
    }

    conditions.push(`(${ors.join(' OR ')})`);
    params.push(...localParams);
  }

  // Brand — accepts comma-separated list, e.g. ?brand=Iaccess,Oraimo,Floating Ark 
  if (brand) {
    const brands = String(brand)
      .split(',')
      .map((b) => b.trim())
      .filter(Boolean);

    if (brands.length === 1) {
      conditions.push('LOWER(gp.brand) = LOWER(?)');
      params.push(brands[0]);
    } else if (brands.length > 1) {
      const placeholders = brands.map(() => 'LOWER(?)').join(',');
      conditions.push(`LOWER(gp.brand) IN (${placeholders})`);
      params.push(...brands);
    }
  }

  if (rating_min !== undefined && rating_min !== '') {
    const r = parseFloat(rating_min);
    if (!isNaN(r)) {
      conditions.push('gp.rating >= ?');
      params.push(r);
    }
  }

  if (tag === 'trending') {
    conditions.push("(gp.shop_tag = 'trending' OR gp.rating >= 4.0)");
  } else if (tag) {
    conditions.push('gp.shop_tag = ?');
    params.push(tag);
  }

  if (min_price !== undefined && min_price !== '') {
    const p = parseFloat(min_price);
    if (!isNaN(p)) {
      conditions.push('GREATEST(gp.ecomm_price, gp.retail_price) >= ?');
      params.push(p);
    }
  }
  if (max_price !== undefined && max_price !== '') {
    const p = parseFloat(max_price);
    if (!isNaN(p)) {
      conditions.push('GREATEST(gp.ecomm_price, gp.retail_price) <= ?');
      params.push(p);
    }
  }

  return {
    where: conditions.length ? 'AND ' + conditions.join(' AND ') : '',
    params,
  };
}


function sortClause(sort) {
  switch (sort) {
    case 'price_asc': return 'ORDER BY gp.retail_price ASC';
    case 'price_desc': return 'ORDER BY gp.retail_price DESC';
    case 'rating_desc': return 'ORDER BY gp.rating DESC';
    default: return 'ORDER BY gp.created_at DESC';
  }
}

/** Safely parse a JSON value that may already be an object (mysql2 parses JSON cols automatically). */
function safeJsonParse(val, fallback) {
  if (!val) return fallback;
  if (typeof val === 'object') return val; // mysql2 already parsed it
  try { return JSON.parse(val); } catch { return fallback; }
}

export default router;
