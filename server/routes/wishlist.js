/**
 * Wishlist routes  (all require auth)
 */

import { Router } from 'express';
import db from '../db.js';
import { requireAuth } from '../middleware/auth.js';
import { resolveImages, resolvePid } from '../utils/images.js';

const router = Router();

async function buildWishlistResponse(userId) {
  const [rows] = await db.query(`
    SELECT sw.*, gp.product_name, gp.retail_price, gp.image, gp.images, gp.updated_at, gp.sale_percent
    FROM shop_wishlist sw
    LEFT JOIN geopos_products gp ON gp.pid = sw.product_id
    WHERE sw.user_id = ?
    ORDER BY sw.added_at DESC
  `, [userId]);

  const items = rows.map((row) => {
    const sale   = row.sale_percent ? parseInt(row.sale_percent, 10) : 0;
    const retail = parseFloat(row.retail_price) || 0;
    return {
      product_id: `prod-${row.product_id}`,
      jpos_id:    parseInt(row.product_id, 10),
      name:       row.product_name,
      price:      sale > 0 ? Math.round(retail * (1 - sale / 100)) : retail,
      image:      resolveImages(row)[0] || null,
      added_at:   row.added_at,
    };
  });

  return { items, count: items.length };
}

router.get('/', requireAuth, async (req, res) => {
  try { return res.json({ status: true, data: await buildWishlistResponse(req.user.sub) }); }
  catch (err) { console.error('[wishlist/get]', err); res.status(500).json({ status: false, message: 'Server error.' }); }
});

router.post('/', requireAuth, async (req, res) => {
  try {
    const pid = resolvePid(req.body.product_id);
    if (!pid) return res.status(400).json({ status: false, message: 'product_id is required.' });
    const [pRows] = await db.query('SELECT pid FROM geopos_products WHERE pid = ? LIMIT 1', [pid]);
    if (!pRows.length) return res.status(404).json({ status: false, message: 'Product not found.' });
    await db.query('INSERT IGNORE INTO shop_wishlist (user_id, product_id) VALUES (?, ?)', [req.user.sub, pid]);
    return res.json({ status: true, data: await buildWishlistResponse(req.user.sub) });
  } catch (err) { console.error('[wishlist/add]', err); res.status(500).json({ status: false, message: 'Server error.' }); }
});

router.post('/sync', requireAuth, async (req, res) => {
  try {
    const productIds = req.body.product_ids;
    if (!Array.isArray(productIds)) return res.status(400).json({ status: false, message: 'product_ids must be an array.' });
    for (const rawId of productIds) {
      const pid = resolvePid(rawId);
      if (!pid) continue;
      const [pRows] = await db.query('SELECT pid FROM geopos_products WHERE pid = ? LIMIT 1', [pid]);
      if (!pRows.length) continue;
      await db.query('INSERT IGNORE INTO shop_wishlist (user_id, product_id) VALUES (?, ?)', [req.user.sub, pid]);
    }
    return res.json({ status: true, data: await buildWishlistResponse(req.user.sub) });
  } catch (err) { console.error('[wishlist/sync]', err); res.status(500).json({ status: false, message: 'Server error.' }); }
});

router.delete('/:product_id', requireAuth, async (req, res) => {
  try {
    const pid = resolvePid(req.params.product_id);
    await db.query('DELETE FROM shop_wishlist WHERE user_id = ? AND product_id = ?', [req.user.sub, pid]);
    return res.json({ status: true, data: await buildWishlistResponse(req.user.sub) });
  } catch (err) { console.error('[wishlist/remove]', err); res.status(500).json({ status: false, message: 'Server error.' }); }
});

router.delete('/', requireAuth, async (req, res) => {
  try {
    await db.query('DELETE FROM shop_wishlist WHERE user_id = ?', [req.user.sub]);
    return res.json({ status: true, message: 'Wishlist cleared.', data: [] });
  } catch (err) { console.error('[wishlist/clear]', err); res.status(500).json({ status: false, message: 'Server error.' }); }
});

export default router;
