import { Router } from 'express';
import db from '../db.js';

const router = Router();

router.post('/', async (req, res) => {
  try {
    const name    = (req.body.name    || '').trim();
    const email   = (req.body.email   || '').trim();
    const subject = (req.body.subject || '').trim();
    const message = (req.body.message || '').trim();

    const errors = {};
    if (!name)   errors.name = 'Name is required.';
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = 'A valid email address is required.';
    if (!subject) errors.subject = 'Subject is required.';
    if (message.length < 20) errors.message = 'Message must be at least 20 characters.';

    if (Object.keys(errors).length) return res.status(422).json({ status: false, message: 'Validation failed.', errors });

    await db.query('INSERT INTO shop_contact_messages (name, email, subject, message, created_at) VALUES (?, ?, ?, ?, NOW())', [name, email, subject, message]);
    return res.json({ status: true, message: 'Message received. We will get back to you shortly.', data: [] });
  } catch (err) { console.error('[contact]', err); res.status(500).json({ status: false, message: 'Server error.' }); }
});

export default router;
