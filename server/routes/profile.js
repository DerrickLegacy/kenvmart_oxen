import { Router } from 'express';
import { createRequire } from 'module';
import db from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const require = createRequire(import.meta.url);
const router  = Router();

function userView(u) {
  return { id: u.id, full_name: u.full_name, email: u.email, phone: u.phone || null, created_at: u.created_at };
}

async function findById(id) {
  const [rows] = await db.query('SELECT * FROM shop_users WHERE id = ? LIMIT 1', [id]);
  return rows[0] || null;
}

router.get('/', requireAuth, async (req, res) => {
  try {
    const user = await findById(req.user.sub);
    if (!user) return res.status(404).json({ status: false, message: 'User not found.' });
    return res.json({ status: true, data: userView(user) });
  } catch (err) { console.error('[profile/get]', err); res.status(500).json({ status: false, message: 'Server error.' }); }
});

router.put('/', requireAuth, async (req, res) => {
  try {
    const body    = req.body || {};
    const updates = {};
    const errors  = {};

    if ('full_name' in body) {
      const fn = (body.full_name || '').trim();
      if (!fn || fn.length > 100) errors.full_name = 'Full name is required (max 100 characters).';
      else updates.full_name = fn;
    }
    if ('phone' in body) updates.phone = (body.phone || '').trim() || null;
    if (Object.keys(errors).length) return res.status(422).json({ status: false, message: 'Validation failed.', errors });
    if (Object.keys(updates).length) await db.query('UPDATE shop_users SET ? WHERE id = ?', [updates, req.user.sub]);

    return res.json({ status: true, message: 'Profile updated.', data: userView(await findById(req.user.sub)) });
  } catch (err) { console.error('[profile/update]', err); res.status(500).json({ status: false, message: 'Server error.' }); }
});

router.put('/password', requireAuth, async (req, res) => {
  try {
    const bcrypt = require('bcryptjs');
    const { current_password = '', new_password = '', new_password_confirmation = '' } = req.body;

    const errors = {};
    if (!current_password)       errors.current_password = 'Current password is required.';
    if (new_password.length < 6) errors.new_password = 'New password must be at least 6 characters.';
    if (new_password !== new_password_confirmation) errors.new_password_confirmation = 'Passwords do not match.';
    if (Object.keys(errors).length) return res.status(422).json({ status: false, message: 'Validation failed.', errors });

    const user = await findById(req.user.sub);
    if (!user || !user.password_hash || !(await bcrypt.compare(current_password, user.password_hash)))
      return res.status(422).json({ status: false, message: 'Validation failed.', errors: { current_password: 'The current password is incorrect.' } });

    await db.query('UPDATE shop_users SET password_hash = ? WHERE id = ?', [await bcrypt.hash(new_password, 10), req.user.sub]);
    return res.json({ status: true, message: 'Password changed successfully.', data: [] });
  } catch (err) { console.error('[profile/password]', err); res.status(500).json({ status: false, message: 'Server error.' }); }
});

export default router;
