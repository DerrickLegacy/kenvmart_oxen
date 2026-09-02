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
import { formatProduct, formatProductFull, resolvePid } from '../utils/images.js';

const router = Router();

const PRODUCT_SELECT = `
  gp.pid, gp.product_name, gp.product_des, gp.retail_price, gp.ecomm_price, gp.product_price,
  gp.qty, gp.image, gp.images, gp.pcat, gp.created_at, gp.updated_at,
  gp.brand, gp.shop_tag, gp.sale_percent, gp.rating, gp.rating_count,
  gp.colors, gp.features, gp.specifications, gp.shipping_options, gp.variants,
  gp.shop_published, gpc.title AS cat_title, scm.slug AS cat_slug
`;

const PRODUCT_FROM = `
  FROM geopos_products gp
  LEFT JOIN geopos_product_cat gpc ON gpc.id = gp.pcat
  LEFT JOIN shop_category_meta scm ON scm.jpos_cat_id = gp.pcat
  WHERE gp.is_deleted = 0 AND gp.merge = 0 AND gp.shop_published = 1
`;

// ── GET /api/products ──────────────────────────────────────────────────────

router.get('/', async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page || '1', 10));
    const perPage = Math.min(100, Math.max(1, parseInt(req.query.per_page || '20', 10)));
    const { q, category, brand, tag, min_price, max_price, sort = 'newest' } = req.query;

    const { where, params } = buildFilters({ q, category, brand, tag, min_price, max_price });

    const [countRows] = await db.query(`SELECT COUNT(*) AS total ${PRODUCT_FROM} ${where}`, params);
    const total = countRows[0].total;
    const offset = (page - 1) * perPage;

    const [rows] = await db.query(
      `SELECT ${PRODUCT_SELECT} ${PRODUCT_FROM} ${where} ${sortClause(sort)} LIMIT ? OFFSET ?`,
      [...params, perPage, offset]
    );

    return res.json({ status: true, data: { products: rows.map(formatProduct), pagination: { total, per_page: perPage, current_page: page, last_page: Math.max(1, Math.ceil(total / perPage)) } } });
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
    return res.json({ status: true, data: { products: rows.map(formatProduct) } });
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
    return res.json({ status: true, data: { products: rows.map(formatProduct) } });
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
    return res.json({ status: true, data: { products: rows.map(formatProduct) } });
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
    return res.json({ status: true, data: { products: rows.map(formatProduct) } });
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
    return res.json({ status: true, data: { products: rows.map(formatProduct) } });
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
    return res.json({ status: true, data: { products: rows.map(formatProduct) } });
  } catch (err) {
    console.error('[products/related]', err);
    res.status(500).json({ status: false, message: 'Server error.' });
  }
});

// ── Helpers ────────────────────────────────────────────────────────────────

const STOP_WORDS = new Set([
  'the', 'and', 'for', 'with', 'from', 'that', 'this', 'into', 'your',
  'more', 'shop', 'store', 'item', 'items', 'product', 'products',
  'all', 'pro', 'plus', 'premium', 'lite', 'ultra',
]);

/**
 * Split a free-form phrase into normalized keyword tokens.
 * - Lowercases, splits on common separators.
 * - Drops tokens < 3 chars and stop words.
 * - Strips trailing plural 's' so singular ↔ plural match crosswise.
 * - Deduplicates.
 */
function tokenize(phrase = '') {
  if (!phrase) return [];
  return String(phrase)
    .toLowerCase()
    .split(/[\s&+_,./\\()]+/)
    .map((s) => s.trim())
    .filter((s) => s.length >= 3 && !STOP_WORDS.has(s))
    .map((s) => (s.endsWith('s') ? s.slice(0, -1) : s))
    .filter((s, i, arr) => arr.indexOf(s) === i && s.length >= 2);
}

/**
 * Build a SQL fragment that matches a single keyword token across the
 * columns a user would expect to search (name, description, brand, category).
 * Returns { sql: string, params: string[] }.
 */
function tokenMatchClause(tok) {
  const like = `%${tok}%`;
  return {
    sql:
      '(LOWER(gp.product_name) LIKE ?' +
      ' OR LOWER(gp.product_des) LIKE ?' +
      ' OR LOWER(COALESCE(gp.brand, "")) LIKE ?' +
      ' OR LOWER(gpc.title) LIKE ?)',
    params: [like, like, like, like],
  };
}

function buildFilters({ q, category, brand, tag, min_price, max_price }) {
  const conditions = [];
  const params = [];

  if (q) {
    const phrase = q.trim();
    const tokens = tokenize(phrase);

    const localParams = [];

    // Full-phrase match (exact / loose substring across name, brand, code, barcode, category, description)
    const full = `%${phrase.toLowerCase()}%`;
    const fullPhraseSql = [
      'LOWER(gp.product_name) LIKE ?',
      'LOWER(COALESCE(gp.brand, "")) LIKE ?',
      'LOWER(COALESCE(gp.product_code, "")) LIKE ?',
      'LOWER(COALESCE(gp.barcode, "")) LIKE ?',
      'LOWER(gpc.title) LIKE ?',
      'LOWER(gp.product_des) LIKE ?',
    ].join(' OR ');
    localParams.push(full, full, full, full, full, full);

    if (tokens.length === 0) {
      // No usable tokens -> rely entirely on the full phrase match
      conditions.push(`(${fullPhraseSql})`);
    } else if (tokens.length === 1) {
      // Single token: phrase OR single-token match across all search columns
      const single = tokenMatchClause(tokens[0]);
      conditions.push(`((${fullPhraseSql}) OR ${single.sql})`);
      localParams.push(...single.params);
    } else {
      // Multi-token: phrase OR (every token matched individually)
      const andParts = [];
      for (const t of tokens) {
        const c = tokenMatchClause(t);
        andParts.push(c.sql);
        localParams.push(...c.params);
      }
      conditions.push(`((${fullPhraseSql}) OR (${andParts.join(' AND ')}))`);
    }

    params.push(...localParams);
  }

  if (category) {
    // The sidebar passes slugs like 'iaccess-products' or titles like 'Earphones & Audio'.
    // shop_category_meta may be empty so slug match often fails.
    // Strategy: (1) try slug match, (2) convert slug → title-style LIKE on gpc.title,
    // (3) ALSO keyword-match against the product's own name/description/brand
    // so a product named "XYZ Earphone" shows up under "Earphones & Audio" even if pcat is wrong.
    const slugAsWords = category.replace(/-/g, ' '); // 'iaccess-products' → 'iaccess products'
    const tokens = tokenize(slugAsWords);

    const ors = ['scm.slug = ?', 'gpc.title LIKE ?', 'LOWER(gpc.title) LIKE ?'];
    const paramsLocal = [category, `%${slugAsWords}%`, `%${slugAsWords.toLowerCase()}%`];

    for (const tok of tokens) {
      const clause = tokenMatchClause(tok);
      // Take only the first two OR conditions (product_name + product_des) from the clause.
      // The clause sql is already wrapped in outer parens — strip only the outer wrapper,
      // then split on ' OR ' and take the first two, keeping inner function calls intact.
      const inner = clause.sql.replace(/^\(|\)$/g, ''); // strip outer parens only
      const parts = inner.split(' OR ').slice(0, 2);
      ors.push(parts.join(' OR '));
      paramsLocal.push(...clause.params.slice(0, 2)); // name + description params only
    }

    if (slugAsWords.length >= 4) {
      ors.push('LOWER(gp.product_name) LIKE ?');
      paramsLocal.push(`%${slugAsWords.toLowerCase()}%`);
    }

    conditions.push(`(${ors.join(' OR ')})`);
    params.push(...paramsLocal);
  }

  if (brand) {
    conditions.push('gp.brand = ?');
    params.push(brand);
  }

  // 'trending' tag on the shop page should also catch high-rated products (mirrors /trending endpoint)
  if (tag === 'trending') {
    conditions.push("(gp.shop_tag = 'trending' OR gp.rating >= 4.0)");
  } else if (tag) {
    conditions.push('gp.shop_tag = ?');
    params.push(tag);
  }

  if (min_price !== undefined && min_price !== '') {
    conditions.push('GREATEST(gp.ecomm_price, gp.retail_price) >= ?');
    params.push(parseFloat(min_price));
  }
  if (max_price !== undefined && max_price !== '') {
    conditions.push('GREATEST(gp.ecomm_price, gp.retail_price) <= ?');
    params.push(parseFloat(max_price));
  }

  return { where: conditions.length ? 'AND ' + conditions.join(' AND ') : '', params };
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
