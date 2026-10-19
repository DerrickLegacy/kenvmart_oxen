/**
 * rateLimiter.js — Sliding-window rate limiter using MySQL.
 * 
 * Implements the logic from tasks.md:
 * - Keyed by IP and action (e.g. "review", "login")
 * - Rejects after X requests in Y minutes
 */

import db from '../db.js';

/**
 * checkRateLimit
 * @param {string} action - e.g. "review", "login", "register"
 * @param {object} req - Express request object
 * @param {number} limit - Max requests allowed
 * @param {number} windowMinutes - Time window in minutes
 * @returns {Promise<boolean>} - true if allowed, false if limited
 */
export async function checkRateLimit(action, req, limit = 50, windowMinutes = 5) {
  try {
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
    const uid = req.user?.sub || null;
    const bucketKey = `${action}:${ip}`;

    // 1. Look for existing record within the window
    const [rows] = await db.query(
      `SELECT id, rate_limit_count 
       FROM shop_rate_limits 
       WHERE bucket_key = ? 
         AND action = ? 
         AND created_at > NOW() - INTERVAL ? MINUTE
       ORDER BY created_at DESC LIMIT 1`,
      [bucketKey, action, windowMinutes]
    );

    const existing = rows[0];

    if (existing) {
      if (existing.rate_limit_count >= limit) {
        return false; // Rate limited
      }
      // 2. Increment existing record
      await db.query(
        'UPDATE shop_rate_limits SET rate_limit_count = rate_limit_count + 1 WHERE id = ?',
        [existing.id]
      );
    } else {
      // 3. Create new record for this window
      await db.query(
        `INSERT INTO shop_rate_limits (bucket_key, action, ip_address, user_id, rate_limit_count) 
         VALUES (?, ?, ?, ?, 1)`,
        [bucketKey, action, ip, uid]
      );
    }

    return true;
  } catch (err) {
    console.error('[rateLimiter] Error:', err.message);
    return true; // Fail open
  }
}

/**
 * Middleware factory for rate limiting
 */
export function rateLimitMiddleware(action, limit = 50, windowMinutes = 1) {
  return async (req, res, next) => {
    const allowed = await checkRateLimit(action, req, limit, windowMinutes);
    if (!allowed) {
      return res.status(429).json({
        status: false,
        message: 'Too many requests. Please try again later.'
      });
    }
    next();
  };
}
