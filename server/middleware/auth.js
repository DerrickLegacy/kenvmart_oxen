/**
 * auth.js — JWT authentication middleware.
 */

import { decode } from '../utils/jwt.js';

export async function requireAuth(req, res, next) {
  const header = req.headers['authorization'] || '';
  if (!header) return res.status(401).json({ status: false, message: 'Authentication required.' });

  const match = header.match(/^Bearer\s+(.+)$/i);
  if (!match)  return res.status(401).json({ status: false, message: 'Authentication required.' });

  const payload = await decode(match[1].trim());
  if (!payload) return res.status(401).json({ status: false, message: 'Invalid or expired token.' });

  req.user = payload;
  next();
}
