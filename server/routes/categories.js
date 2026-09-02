import { Router } from 'express';
import db from '../db.js';
import { slugify } from '../utils/images.js';

const router = Router();

router.get('/', async (_req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT
        gpc.id,
        gpc.title        AS name,
        scm.slug,
        COUNT(gp.pid)    AS product_count
      FROM geopos_product_cat gpc
      LEFT JOIN geopos_products gp
        ON  gp.pcat          = gpc.id
        AND gp.is_deleted    = 0
        AND gp.merge         = 0
        AND gp.shop_published = 1
      LEFT JOIN shop_category_meta scm ON scm.jpos_cat_id = gpc.id
      WHERE gpc.title NOT LIKE 'Uncategorized%'
        AND gpc.title NOT LIKE 'Flame%'
        AND gpc.title NOT LIKE 'General%'
        AND gpc.title NOT LIKE 'Other accessories%'
      GROUP BY gpc.id, gpc.title, scm.slug
      ORDER BY product_count DESC
    `);

    return res.json({
      status: true,
      data: rows.map((cat) => ({
        id:            cat.id,
        name:          cat.name,
        slug:          cat.slug || slugify(cat.name),
        product_count: parseInt(cat.product_count, 10),
      })),
    });
  } catch (err) {
    console.error('[categories]', err);
    res.status(500).json({ status: false, message: 'Server error.' });
  }
});

export default router;
