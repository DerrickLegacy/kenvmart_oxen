/**
 * Cart routes  (all require auth)
 */

import { Router } from 'express';
import db from '../db.js';
import { requireAuth } from '../middleware/auth.js';
import { resolveImages, resolvePid } from '../utils/images.js';

const router = Router();

async function buildCartResponse(userId) {
  const [rows] = await db.query(`
    SELECT sci.*, gp.product_name, gp.image, gp.images, gp.updated_at, gp.retail_price, gp.sale_percent
    FROM shop_cart_items sci
    LEFT JOIN geopos_products gp ON gp.pid = sci.product_id
    WHERE sci.user_id = ?
  `, [userId]);

  let total = 0, count = 0;
  const items = [];

  for (const row of rows) {
    const liveRetail = parseFloat(row.retail_price) || 0;
    const sale       = row.sale_percent ? parseInt(row.sale_percent, 10) : 0;
    const livePrice  = sale > 0 && liveRetail > 0 ? Math.round(liveRetail * (1 - sale / 100)) : liveRetail;
    const priceAtAdd = parseFloat(row.price_at_add) || 0;
    const price      = priceAtAdd > 0 ? priceAtAdd : livePrice;
    const qty        = parseInt(row.quantity, 10);
    const images     = resolveImages(row);

    items.push({ product_id: `prod-${row.product_id}`, jpos_id: parseInt(row.product_id, 10), name: row.product_name, price, original_price: liveRetail > 0 ? liveRetail : price, quantity: qty, variant: row.variant || null, image: images[0] || null });
    total += price * qty;
    count += qty;
  }

  return { items, total, item_count: count };
}

async function getCartItem(userId, productId, variant) {
  const variantClause  = (variant !== null && variant !== '') ? 'AND variant = ?' : 'AND (variant IS NULL OR variant = "")';
  const variantParams  = (variant !== null && variant !== '') ? [variant] : [];
  const [rows] = await db.query(`SELECT * FROM shop_cart_items WHERE user_id = ? AND product_id = ? ${variantClause} LIMIT 1`, [userId, productId, ...variantParams]);
  return rows[0] || null;
}

async function upsertCartItem(userId, productId, variant, quantity, price) {
  const existing = await getCartItem(userId, productId, variant);
  if (existing) {
    const newQty = Math.min(existing.quantity + quantity, 99);
    await db.query('UPDATE shop_cart_items SET quantity = ?, updated_at = NOW() WHERE id = ?', [newQty, existing.id]);
  } else {
    await db.query('INSERT INTO shop_cart_items (user_id, product_id, variant, quantity, price_at_add) VALUES (?, ?, ?, ?, ?)', [userId, productId, variant || null, Math.min(Math.max(quantity, 1), 99), price]);
  }
}

router.get('/', requireAuth, async (req, res) => {
  try { return res.json({ status: true, data: await buildCartResponse(req.user.sub) }); }
  catch (err) { console.error('[cart/get]', err); res.status(500).json({ status: false, message: 'Server error.' }); }
});

router.post('/', requireAuth, async (req, res) => {
  try {
    const pid      = resolvePid(req.body.product_id);
    const quantity = Math.max(1, parseInt(req.body.quantity || '1', 10));
    const variant  = req.body.variant || null;
    if (!pid) return res.status(400).json({ status: false, message: 'product_id is required.' });

    const [pRows] = await db.query('SELECT * FROM geopos_products WHERE pid = ? LIMIT 1', [pid]);
    if (!pRows.length) return res.status(404).json({ status: false, message: 'Product not found.' });

    const p    = pRows[0];
    const sale = p.sale_percent ? parseInt(p.sale_percent, 10) : 0;
    await upsertCartItem(req.user.sub, pid, variant, quantity, sale > 0 ? Math.round(p.retail_price * (1 - sale / 100)) : parseFloat(p.retail_price));

    return res.json({ status: true, data: await buildCartResponse(req.user.sub) });
  } catch (err) { console.error('[cart/add]', err); res.status(500).json({ status: false, message: 'Server error.' }); }
});

router.post('/sync', requireAuth, async (req, res) => {
  try {
    const items = req.body.items;
    if (!Array.isArray(items)) return res.status(400).json({ status: false, message: 'items must be an array.' });

    for (const item of items) {
      const pid      = resolvePid(item.product_id);
      const quantity = Math.max(1, parseInt(item.quantity || '1', 10));
      if (!pid) continue;
      const [pRows] = await db.query('SELECT * FROM geopos_products WHERE pid = ? LIMIT 1', [pid]);
      if (!pRows.length) continue;
      const p    = pRows[0];
      const sale = p.sale_percent ? parseInt(p.sale_percent, 10) : 0;
      await upsertCartItem(req.user.sub, pid, item.variant || null, quantity, sale > 0 ? Math.round(p.retail_price * (1 - sale / 100)) : parseFloat(p.retail_price));
    }

    return res.json({ status: true, data: await buildCartResponse(req.user.sub) });
  } catch (err) { console.error('[cart/sync]', err); res.status(500).json({ status: false, message: 'Server error.' }); }
});

router.put('/:product_id', requireAuth, async (req, res) => {
  try {
    const quantity = parseInt(req.body.quantity || '0', 10);
    const variant  = req.body.variant !== undefined ? req.body.variant : null;
    const pid      = resolvePid(req.params.product_id);

    if (quantity < 1 || quantity > 99) return res.status(400).json({ status: false, message: 'Quantity must be between 1 and 99.' });
    if (!pid) return res.status(400).json({ status: false, message: 'Invalid product id.' });

    const existing = await getCartItem(req.user.sub, pid, variant);
    if (!existing) {
      const [pRows] = await db.query('SELECT * FROM geopos_products WHERE pid = ? LIMIT 1', [pid]);
      if (!pRows.length) return res.status(404).json({ status: false, message: 'Product not found.' });
      const p    = pRows[0];
      const sale = p.sale_percent ? parseInt(p.sale_percent, 10) : 0;
      await upsertCartItem(req.user.sub, pid, variant, quantity, sale > 0 && parseFloat(p.retail_price) > 0 ? Math.round(p.retail_price * (1 - sale / 100)) : parseFloat(p.retail_price));
    } else {
      await db.query('UPDATE shop_cart_items SET quantity = ?, updated_at = NOW() WHERE id = ?', [quantity, existing.id]);
    }

    return res.json({ status: true, data: await buildCartResponse(req.user.sub) });
  } catch (err) { console.error('[cart/update]', err); res.status(500).json({ status: false, message: 'Server error.' }); }
});

router.delete('/:product_id', requireAuth, async (req, res) => {
  try {
    const pid     = resolvePid(req.params.product_id);
    const variant = req.query.variant || null;
    const variantClause = (variant !== null && variant !== '') ? 'AND variant = ?' : 'AND (variant IS NULL OR variant = "")';
    const variantParams = (variant !== null && variant !== '') ? [variant] : [];
    await db.query(`DELETE FROM shop_cart_items WHERE user_id = ? AND product_id = ? ${variantClause}`, [req.user.sub, pid, ...variantParams]);
    return res.json({ status: true, data: await buildCartResponse(req.user.sub) });
  } catch (err) { console.error('[cart/remove]', err); res.status(500).json({ status: false, message: 'Server error.' }); }
});

router.delete('/', requireAuth, async (req, res) => {
  try {
    await db.query('DELETE FROM shop_cart_items WHERE user_id = ?', [req.user.sub]);
    return res.json({ status: true, message: 'Cart cleared.', data: [] });
  } catch (err) { console.error('[cart/clear]', err); res.status(500).json({ status: false, message: 'Server error.' }); }
});

export default router;
