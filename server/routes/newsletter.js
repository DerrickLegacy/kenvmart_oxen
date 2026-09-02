import { Router } from 'express';
import db from '../db.js';

const router = Router();

router.post('/subscribe', async (req, res) => {
  try {
    const email = ((req.body.email || '')).toLowerCase().trim();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return res.status(422).json({ status: false, message: 'Validation failed.', errors: { email: 'A valid email address is required.' } });

    const [existing] = await db.query('SELECT id FROM shop_newsletter WHERE email = ? LIMIT 1', [email]);
    if (!existing.length) await db.query('INSERT INTO shop_newsletter (email, subscribed_at) VALUES (?, NOW())', [email]);

    return res.json({ status: true, message: 'You have successfully subscribed to our newsletter.', data: [] });
  } catch (err) { console.error('[newsletter]', err); res.status(500).json({ status: false, message: 'Server error.' }); }
});

export default router;
