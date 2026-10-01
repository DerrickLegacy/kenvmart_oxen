/**
 * Auth routes
 *
 * POST /api/auth/register
 * POST /api/auth/login
 * POST /api/auth/google
 * POST /api/auth/logout     (auth required)
 * GET  /api/auth/me         (auth required)
 */

import { Router } from 'express';
import { createRequire } from 'module';
import https from 'https';
import db from '../db.js';
import * as jwt from '../utils/jwt.js';
import { requireAuth } from '../middleware/auth.js';

const require = createRequire(import.meta.url);
const router = Router();

// ── Helpers ────────────────────────────────────────────────────────────────

function userView(user) {
  return {
    id: user.id,
    full_name: user.full_name,
    email: user.email,
    phone: user.phone || null,
    created_at: user.created_at,
  };
}

async function findByEmail(email) {
  const [rows] = await db.query('SELECT * FROM shop_users WHERE email = ? LIMIT 1', [email]);
  return rows[0] || null;
}

async function findByPhone(phone) {
  const [rows] = await db.query('SELECT * FROM shop_users WHERE phone = ? LIMIT 1', [phone]);
  return rows[0] || null;
}

async function findById(id) {
  const [rows] = await db.query('SELECT * FROM shop_users WHERE id = ? LIMIT 1', [id]);
  return rows[0] || null;
}

async function findByGoogleId(googleId) {
  const [rows] = await db.query('SELECT * FROM shop_users WHERE google_id = ? LIMIT 1', [googleId]);
  return rows[0] || null;
}

async function createUser(data) {
  const [result] = await db.query('INSERT INTO shop_users SET ?', [data]);
  return result.insertId;
}

async function updateUser(id, data) {
  await db.query('UPDATE shop_users SET ? WHERE id = ?', [data, id]);
}

// ── POST /api/auth/register ────────────────────────────────────────────────

router.post('/register', async (req, res) => {
  try {
    const bcrypt = require('bcryptjs');
    const { full_name = '', email = '', phone = '', password = '', password_confirmation = '' } = req.body;

    const errors = {};
    if (!full_name.trim() || full_name.trim().length > 100)
      errors.full_name = 'Full name is required (max 100 characters).';
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      errors.email = 'A valid email address is required.';
    if ((password || '').length < 6)
      errors.password = 'Password must be at least 6 characters.';
    if (password !== password_confirmation)
      errors.password_confirmation = 'Passwords do not match.';

    if (Object.keys(errors).length)
      return res.status(422).json({ status: false, message: 'Validation failed.', errors });

    if (await findByEmail(email.toLowerCase()))
      return res.status(422).json({ status: false, message: 'Validation failed.', errors: { email: 'The email address is already registered.' } });

    const uid = await createUser({
      full_name: full_name.trim(),
      email: email.toLowerCase().trim(),
      phone: phone.trim() || null,
      password_hash: await bcrypt.hash(password, 10),
    });

    const user = await findById(uid);
    const token = jwt.encode({ sub: uid, email: user.email });

    return res.status(201).json({ status: true, message: 'Account created successfully.', data: { user: userView(user), token } });
  } catch (err) {
    console.error('[auth/register]', err);
    res.status(500).json({ status: false, message: 'Server error.' });
  }
});

// ── POST /api/auth/login ───────────────────────────────────────────────────

router.post('/login', async (req, res) => {
  try {
    const bcrypt = require('bcryptjs');
    const { identifier = '', password = '' } = req.body;

    if (!identifier || !password)
      return res.status(400).json({ status: false, message: 'Identifier and password are required.' });

    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier);
    const user = isEmail ? await findByEmail(identifier.toLowerCase()) : await findByPhone(identifier);

    if (!user || !user.password_hash || !(await bcrypt.compare(password, user.password_hash)))
      return res.status(401).json({ status: false, message: 'Invalid credentials.' });

    const token = jwt.encode({ sub: user.id, email: user.email });
    return res.json({ status: true, message: 'Login successful.', data: { user: userView(user), token } });
  } catch (err) {
    console.error('[auth/login]', err);
    res.status(500).json({ status: false, message: 'Server error.' });
  }
});

// ── POST /api/auth/google ──────────────────────────────────────────────────

router.post('/google', async (req, res) => {
  try {
    const { code = '', redirect_uri = '' } = req.body;
    if (!code) return res.status(400).json({ status: false, message: 'Google authorization code is required.' });

    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    if (!clientId || !clientSecret)
      return res.status(503).json({ status: false, message: 'Google OAuth is not configured on this server.' });

    const tokenData = await googleTokenExchange(code, redirect_uri, clientId, clientSecret);
    if (!tokenData?.id_token) return res.status(502).json({ status: false, message: 'Failed to obtain Google token.' });

    const googleUser = await googleGetUserInfo(tokenData.access_token);
    if (!googleUser?.email) return res.status(502).json({ status: false, message: 'Failed to retrieve Google user info.' });

    const email = googleUser.email.toLowerCase();
    const googleId = googleUser.sub;
    let isNew = false;

    let user = await findByGoogleId(googleId) || await findByEmail(email);

    if (!user) {
      const uid = await createUser({ full_name: googleUser.name || email, email, google_id: googleId, avatar: googleUser.picture || null });
      user = await findById(uid);
      isNew = true;
    } else {
      const updates = {};
      if (!user.google_id) updates.google_id = googleId;
      if (!user.avatar && googleUser.picture) updates.avatar = googleUser.picture;
      if (Object.keys(updates).length) { await updateUser(user.id, updates); user = await findById(user.id); }
    }

    const token = jwt.encode({ sub: user.id, email: user.email });
    return res.json({ status: true, data: { user: { ...userView(user), avatar: user.avatar || null }, token, is_new_user: isNew } });
  } catch (err) {
    console.error('[auth/google]', err);
    res.status(500).json({ status: false, message: 'Server error.' });
  }
});

// ── GET /api/auth/google/callback — server-side OAuth callback ──────────────
// Google redirects the user's browser here after consent with ?code=...&state=...
// Exchanges the code for a Google id_token / access_token, looks up or
// creates the local user, issues a JWT, then redirects back to the SPA with
// the token in the URL fragment (fragment is NOT sent to web servers / logs).

function buildAppOrigin(req) {
  const configured = process.env.GOOGLE_AUTH_REDIRECT_APP || process.env.CORS_ORIGIN;
  if (configured) return configured.endsWith('/') ? configured.slice(0, -1) : configured;
  return req.protocol + '://' + req.get('host');
}

async function googleOAuthCallbackHandler(req, res) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  const fail = (reason) => {
    console.error('[auth/google/callback]', reason);
    const error = encodeURIComponent(reason || 'Authentication failed.');
    return res.redirect(302, buildAppOrigin(req) + '/login?auth_error=' + error);
  };

  if (!clientId || !clientSecret)
    return fail('Google OAuth is not configured on this server.');

  const code = req.query.code || '';
  const googleError = req.query.error || '';

  if (googleError) return fail('Google returned error: ' + googleError);
  if (!code) return fail('Missing authorization code from Google.');

  const serverRedirectUri = process.env.GOOGLE_AUTH_REDIRECT_URI ||
    (req.protocol + '://' + req.get('host') + '/google-auth-callback');

  let tokenData;
  try {
    tokenData = await googleTokenExchange(code, serverRedirectUri, clientId, clientSecret);
  } catch (err) {
    console.error('[auth/google/callback] token exchange exception', err);
    return fail('Failed to obtain Google token.');
  }

  if (!tokenData?.id_token && !tokenData?.access_token)
    return fail('Google did not return valid credentials.');

  let googleUser;
  try {
    googleUser = await googleGetUserInfo(tokenData.access_token);
  } catch (err) {
    console.error('[auth/google/callback] userinfo exception', err);
    return fail('Failed to retrieve Google profile.');
  }

  if (!googleUser?.email)
    return fail('Google profile does not include an email address.');

  const email = googleUser.email.toLowerCase();
  const googleId = googleUser.sub;

  let user = await findByGoogleId(googleId) || await findByEmail(email);
  let isNew = false;

  if (!user) {
    try {
      const uid = await createUser({
        full_name: googleUser.name || email,
        email,
        google_id: googleId,
        avatar: googleUser.picture || null,
      });
      user = await findById(uid);
      isNew = true;
    } catch (err) {
      console.error('[auth/google/callback] create user error', err);
      return fail('Could not create your account. Please try again.');
    }
  } else {
    const updates = {};
    if (!user.google_id) updates.google_id = googleId;
    if (!user.avatar && googleUser.picture) updates.avatar = googleUser.picture;
    if (Object.keys(updates).length) {
      try { await updateUser(user.id, updates); } catch { }
      user = await findById(user.id);
    }
  }

  const token = jwt.encode({ sub: user.id, email: user.email });
  const userPayload = JSON.stringify({
    token,
    user: { ...userView(user), avatar: user.avatar || null },
    is_new_user: isNew,
  });

  const hash = 'auth=' + encodeURIComponent(userPayload);
  return res.redirect(302, buildAppOrigin(req) + '/auth/google/callback#' + hash);
}

router.get('/google/callback', async (req, res) => {
  try {
    await googleOAuthCallbackHandler(req, res);
  } catch (err) {
    console.error('[auth/google/callback] unhandled', err);
    const error = encodeURIComponent('Unexpected error during Google sign-in.');
    return res.redirect(302, buildAppOrigin(req) + '/login?auth_error=' + error);
  }
});

// ── POST /api/auth/logout ──────────────────────────────────────────────────

router.post('/logout', requireAuth, async (req, res) => {
  try {
    if (req.user.jti && req.user.exp) {
      const expiresAt = new Date(req.user.exp * 1000).toISOString().slice(0, 19).replace('T', ' ');
      await db.query('INSERT IGNORE INTO shop_token_blacklist (token_jti, expires_at) VALUES (?, ?)', [req.user.jti, expiresAt]);
    }
    return res.json({ status: true, message: 'Logged out successfully.', data: [] });
  } catch (err) {
    console.error('[auth/logout]', err);
    res.status(500).json({ status: false, message: 'Server error.' });
  }
});

// ── GET /api/auth/me ───────────────────────────────────────────────────────

router.get('/me', requireAuth, async (req, res) => {
  try {
    const user = await findById(req.user.sub);
    if (!user) return res.status(404).json({ status: false, message: 'User not found.' });
    return res.json({ status: true, data: userView(user) });
  } catch (err) {
    console.error('[auth/me]', err);
    res.status(500).json({ status: false, message: 'Server error.' });
  }
});

// ── Google OAuth helpers ───────────────────────────────────────────────────

function googleTokenExchange(code, redirectUri, clientId, clientSecret) {
  return new Promise((resolve) => {
    const body = new URLSearchParams({ code, client_id: clientId, client_secret: clientSecret, redirect_uri: redirectUri, grant_type: 'authorization_code' }).toString();
    const req = https.request({ hostname: 'oauth2.googleapis.com', path: '/token', method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Content-Length': Buffer.byteLength(body) } }, (r) => {
      let data = '';
      r.on('data', (c) => (data += c));
      r.on('end', () => { try { resolve(JSON.parse(data)); } catch { resolve(null); } });
    });
    req.on('error', () => resolve(null));
    req.write(body);
    req.end();
  });
}

function googleGetUserInfo(accessToken) {
  return new Promise((resolve) => {
    const r = https.request({ hostname: 'www.googleapis.com', path: '/oauth2/v3/userinfo', method: 'GET', headers: { Authorization: `Bearer ${accessToken}` } }, (res) => {
      let data = '';
      res.on('data', (c) => (data += c));
      res.on('end', () => { try { resolve(JSON.parse(data)); } catch { resolve(null); } });
    });
    r.on('error', () => resolve(null));
    r.end();
  });
}

export default router;
export { googleOAuthCallbackHandler };
