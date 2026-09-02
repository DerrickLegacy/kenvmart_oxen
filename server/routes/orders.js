/**
 * Orders routes  (all require auth)
 */

import { Router } from 'express';
import db from '../db.js';
import { requireAuth } from '../middleware/auth.js';
import { resolvePid } from '../utils/images.js';

const router = Router();

function formatOrder(order, items) {
  const formattedItems = (items || []).map((item) => ({
    product_id:     `prod-${item.product_id}`,
    jpos_id:        parseInt(item.product_id, 10),
    name:           item.name,
    price:          parseFloat(item.price),
    original_price: parseFloat(item.original_price),
    quantity:       parseInt(item.quantity, 10),
    variant:        item.variant || null,
    image:          item.image   || null,
  }));

  return { id: order.id, placed_at: order.placed_at, status: order.status, total: parseFloat(order.total), note: order.note || null, item_count: formattedItems.length, items: formattedItems };
}

async function getOrderWithItems(orderId, userId = null) {
  const userClause = userId !== null ? 'AND user_id = ?' : '';
  const userParams = userId !== null ? [userId] : [];
  const [orderRows] = await db.query(`SELECT * FROM shop_orders WHERE id = ? ${userClause} LIMIT 1`, [orderId, ...userParams]);
  if (!orderRows.length) return null;
  const [itemRows] = await db.query('SELECT * FROM shop_order_items WHERE order_id = ?', [orderId]);
  return { order: orderRows[0], items: itemRows };
}

// POST /api/orders
router.post('/', requireAuth, async (req, res) => {
  try {
    const { items = [], note = '' } = req.body;
    if (!Array.isArray(items) || items.length === 0)
      return res.status(400).json({ status: false, message: 'Order must contain at least one item.' });

    let total    = 0;
    for (const item of items) total += (parseFloat(item.price) || 0) * (parseInt(item.quantity, 10) || 1);

    const orderId = `ORD-${Date.now()}`;
    const now     = new Date().toISOString().slice(0, 19).replace('T', ' ');
    const conn    = await db.getConnection();

    try {
      await conn.beginTransaction();
      await conn.query('INSERT INTO shop_orders (id, user_id, status, total, note, placed_at) VALUES (?, ?, ?, ?, ?, ?)', [orderId, req.user.sub, 'Pending', total, note || null, now]);
      for (const item of items) {
        await conn.query('INSERT INTO shop_order_items (order_id, product_id, name, price, original_price, quantity, variant, image) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', [orderId, resolvePid(item.product_id) || 0, item.name || '', item.price || 0, item.original_price || item.price || 0, item.quantity || 1, item.variant || null, item.image || null]);
      }
      await conn.query('DELETE FROM shop_cart_items WHERE user_id = ?', [req.user.sub]);
      await conn.commit();
    } catch (e) { await conn.rollback(); throw e; }
    finally { conn.release(); }

    return res.status(201).json({ status: true, message: 'Order placed successfully.', data: { order_id: orderId, status: 'Pending', placed_at: now, total } });
  } catch (err) { console.error('[orders/place]', err); res.status(500).json({ status: false, message: 'Server error.' }); }
});

// GET /api/orders
router.get('/', requireAuth, async (req, res) => {
  try {
    const page    = Math.max(1, parseInt(req.query.page     || '1',  10));
    const perPage = Math.max(1, parseInt(req.query.per_page || '10', 10));
    const status  = req.query.status || null;
    const q       = req.query.q      || null;

    const conditions  = ['user_id = ?'];
    const cParams     = [req.user.sub];
    if (status) { conditions.push('status = ?');   cParams.push(status); }
    if (q)      { conditions.push('id LIKE ?');    cParams.push(`%${q}%`); }
    const where = 'WHERE ' + conditions.join(' AND ');

    const [countRows] = await db.query(`SELECT COUNT(*) AS total FROM shop_orders ${where}`, cParams);
    const total  = countRows[0].total;
    const [orders] = await db.query(`SELECT * FROM shop_orders ${where} ORDER BY placed_at DESC LIMIT ? OFFSET ?`, [...cParams, perPage, (page - 1) * perPage]);

    const result = [];
    for (const order of orders) {
      const [itemRows] = await db.query('SELECT * FROM shop_order_items WHERE order_id = ?', [order.id]);
      result.push(formatOrder(order, itemRows));
    }

    return res.json({ status: true, data: { orders: result, pagination: { total, per_page: perPage, current_page: page, last_page: Math.max(1, Math.ceil(total / perPage)) } } });
  } catch (err) { console.error('[orders/list]', err); res.status(500).json({ status: false, message: 'Server error.' }); }
});

// GET /api/orders/:order_id
router.get('/:order_id', requireAuth, async (req, res) => {
  try {
    const result = await getOrderWithItems(req.params.order_id, req.user.sub);
    if (!result) return res.status(404).json({ status: false, message: 'Order not found.' });
    return res.json({ status: true, data: formatOrder(result.order, result.items) });
  } catch (err) { console.error('[orders/show]', err); res.status(500).json({ status: false, message: 'Server error.' }); }
});

// DELETE /api/orders/:order_id  (cancel)
router.delete('/:order_id', requireAuth, async (req, res) => {
  try {
    const result = await getOrderWithItems(req.params.order_id, req.user.sub);
    if (!result) return res.status(404).json({ status: false, message: 'Order not found.' });
    if (result.order.status !== 'Pending') return res.status(403).json({ status: false, message: 'Only pending orders can be cancelled.' });
    await db.query('UPDATE shop_orders SET status = "Cancelled", updated_at = NOW() WHERE id = ? AND user_id = ? AND status = "Pending"', [req.params.order_id, req.user.sub]);
    return res.json({ status: true, message: 'Order cancelled successfully.', data: [] });
  } catch (err) { console.error('[orders/cancel]', err); res.status(500).json({ status: false, message: 'Server error.' }); }
});

// DELETE /api/orders/:order_id/items/:product_id
router.delete('/:order_id/items/:product_id', requireAuth, async (req, res) => {
  try {
    const result = await getOrderWithItems(req.params.order_id, req.user.sub);
    if (!result) return res.status(404).json({ status: false, message: 'Order not found.' });
    if (result.order.status !== 'Pending') return res.status(403).json({ status: false, message: 'Can only modify pending orders.' });

    const pid           = resolvePid(req.params.product_id);
    const variant       = req.query.variant || null;
    const vClause       = variant ? 'AND variant = ?' : '';
    const vParams       = variant ? [variant] : [];

    await db.query(`DELETE FROM shop_order_items WHERE order_id = ? AND product_id = ? ${vClause}`, [req.params.order_id, pid, ...vParams]);

    const [cntRows] = await db.query('SELECT COUNT(*) AS cnt FROM shop_order_items WHERE order_id = ?', [req.params.order_id]);
    if (parseInt(cntRows[0].cnt, 10) === 0) {
      await db.query('UPDATE shop_orders SET status = "Cancelled", updated_at = NOW() WHERE id = ? AND user_id = ?', [req.params.order_id, req.user.sub]);
      return res.json({ status: true, message: 'Last item removed; order has been cancelled.', data: [] });
    }

    const [sumRows] = await db.query('SELECT SUM(price * quantity) AS total FROM shop_order_items WHERE order_id = ?', [req.params.order_id]);
    await db.query('UPDATE shop_orders SET total = ?, updated_at = NOW() WHERE id = ?', [parseFloat(sumRows[0].total) || 0, req.params.order_id]);

    const updated = await getOrderWithItems(req.params.order_id, req.user.sub);
    return res.json({ status: true, data: formatOrder(updated.order, updated.items) });
  } catch (err) { console.error('[orders/removeItem]', err); res.status(500).json({ status: false, message: 'Server error.' }); }
});

// PUT /api/orders/:order_id/items/:product_id
router.put('/:order_id/items/:product_id', requireAuth, async (req, res) => {
  try {
    const result = await getOrderWithItems(req.params.order_id, req.user.sub);
    if (!result) return res.status(404).json({ status: false, message: 'Order not found.' });
    if (result.order.status !== 'Pending') return res.status(403).json({ status: false, message: 'Can only modify pending orders.' });

    const quantity  = parseInt(req.body.quantity || '0', 10);
    const variant   = req.body.variant || null;
    const pid       = resolvePid(req.params.product_id);
    if (quantity < 1) return res.status(400).json({ status: false, message: 'Quantity must be at least 1.' });

    const vClause = variant ? 'AND variant = ?' : '';
    const vParams = variant ? [variant] : [];
    await db.query(`UPDATE shop_order_items SET quantity = ? WHERE order_id = ? AND product_id = ? ${vClause}`, [quantity, req.params.order_id, pid, ...vParams]);

    const [sumRows] = await db.query('SELECT SUM(price * quantity) AS total FROM shop_order_items WHERE order_id = ?', [req.params.order_id]);
    await db.query('UPDATE shop_orders SET total = ?, updated_at = NOW() WHERE id = ?', [parseFloat(sumRows[0].total) || 0, req.params.order_id]);

    const updated = await getOrderWithItems(req.params.order_id, req.user.sub);
    return res.json({ status: true, data: formatOrder(updated.order, updated.items) });
  } catch (err) { console.error('[orders/updateItem]', err); res.status(500).json({ status: false, message: 'Server error.' }); }
});

export default router;
