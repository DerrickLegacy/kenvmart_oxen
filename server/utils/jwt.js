/**
 * jwt.js — Pure-Node HS256 JWT implementation.
 *
 * Matches the logic in Shop_Base.php so tokens are interchangeable
 * during any transition period.
 */

import crypto from 'crypto';
import db from '../db.js';

const JWT_EXPIRE = 7 * 24 * 60 * 60; // 7 days in seconds

function b64urlEncode(data) {
  return Buffer.from(data)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

function b64urlDecode(str) {
  const padded = str + '='.repeat((4 - (str.length % 4)) % 4);
  return Buffer.from(padded.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8');
}

function jwtSecret() {
  const s = process.env.JWT_SECRET;
  if (!s) console.warn('[jwt] JWT_SECRET not set — using insecure default!');
  return s || 'shopgrids-jpos-secret-change-me';
}

/**
 * Sign a JWT payload.
 * @param {object} payload
 * @returns {string}
 */
export function encode(payload) {
  const header = b64urlEncode(JSON.stringify({ typ: 'JWT', alg: 'HS256' }));
  const now    = Math.floor(Date.now() / 1000);
  const claims = {
    ...payload,
    iat: now,
    exp: now + JWT_EXPIRE,
    jti: crypto.randomBytes(16).toString('hex'),
  };
  const body = b64urlEncode(JSON.stringify(claims));
  const sig  = b64urlEncode(
    crypto.createHmac('sha256', jwtSecret()).update(`${header}.${body}`).digest()
  );
  return `${header}.${body}.${sig}`;
}

/**
 * Verify and decode a JWT.
 * @param {string} token
 * @returns {Promise<object|null>}
 */
export async function decode(token) {
  const parts = (token || '').split('.');
  if (parts.length !== 3) return null;

  const [headerB64, bodyB64, sigB64] = parts;

  const expectedSig = b64urlEncode(
    crypto.createHmac('sha256', jwtSecret()).update(`${headerB64}.${bodyB64}`).digest()
  );

  const a = Buffer.from(expectedSig);
  const b = Buffer.from(sigB64);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;

  let payload;
  try {
    payload = JSON.parse(b64urlDecode(bodyB64));
  } catch {
    return null;
  }

  if (!payload || typeof payload !== 'object') return null;
  if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) return null;

  if (payload.jti) {
    const [rows] = await db.query(
      'SELECT id FROM shop_token_blacklist WHERE token_jti = ? AND expires_at > NOW() LIMIT 1',
      [payload.jti]
    );
    if (rows.length > 0) return null;
  }

  return payload;
}
