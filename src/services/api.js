/**
 * api.js — Centralised HTTP client for the Kenvies JPOS API.
 *
 * All calls go through `request()` which:
 *   - Reads the base URL from VITE_API_BASE_URL (set per environment in .env)
 *   - Attaches the JWT from localStorage automatically on every request
 *   - Throws an ApiError with { status, message, errors } on non-2xx responses
 *   - Returns the parsed `data` payload on success (never the full envelope)
 *
 * Moving the React app to a different folder or domain only requires updating
 * VITE_API_BASE_URL in .env / .env.production — no code changes needed.
 */

// ── Config ────────────────────────────────────────────────────────────────────

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

if (!BASE_URL) {
  throw new Error(
    '[api.js] VITE_API_BASE_URL is not set. ' +
    'Add it to .env (dev) or .env.production (prod).'
  );
}

// ── Token storage ─────────────────────────────────────────────────────────────

const TOKEN_KEY = 'kenvies_token';

export const tokenStore = {
  get:    ()        => localStorage.getItem(TOKEN_KEY),
  set:    (token)   => localStorage.setItem(TOKEN_KEY, token),
  clear:  ()        => localStorage.removeItem(TOKEN_KEY),
};

// ── Custom error class ────────────────────────────────────────────────────────

export class ApiError extends Error {
  /**
   * @param {string} message   Human-readable summary
   * @param {number} status    HTTP status code
   * @param {object} errors    Field-level validation errors (may be empty)
   */
  constructor(message, status, errors = {}) {
    super(message);
    this.name   = 'ApiError';
    this.status = status;
    this.errors = errors;
  }
}

// ── Core request function ─────────────────────────────────────────────────────

/**
 * @param {string} endpoint  Path relative to BASE_URL, e.g. '/auth/login'
 * @param {object} options   fetch options — method, body, headers, etc.
 * @returns {Promise<any>}   Resolved with response.data on success
 * @throws  {ApiError}       On HTTP errors or network failures
 */
async function request(endpoint, options = {}) {
  const url     = `${BASE_URL}${endpoint}`;
  const token   = tokenStore.get();

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers ?? {}),
  };

  let response;
  try {
    response = await fetch(url, {
      ...options,
      headers,
      // credentials: 'include' is not needed for JWT — keep it omit
      // to avoid CORS preflight failures on simple requests
      credentials: 'omit',
    });
  } catch (networkError) {
    throw new ApiError(
      'Network error — check your connection and try again.',
      0
    );
  }

  // Parse JSON regardless of status so we can read the error message
  let json;
  try {
    json = await response.json();
  } catch {
    throw new ApiError(`Server returned non-JSON response (${response.status})`, response.status);
  }

  if (!response.ok || json.status === false) {
    throw new ApiError(
      json.message ?? `Request failed (${response.status})`,
      response.status,
      json.errors ?? {}
    );
  }

  // Return the data payload directly (callers never need the outer envelope)
  return json.data ?? json;
}

// ── Convenience wrappers ──────────────────────────────────────────────────────

const get    = (endpoint)         => request(endpoint, { method: 'GET' });
const post   = (endpoint, body)   => request(endpoint, { method: 'POST',   body: JSON.stringify(body) });
const put    = (endpoint, body)   => request(endpoint, { method: 'PUT',    body: JSON.stringify(body) });
const del    = (endpoint, body)   => request(endpoint, { method: 'DELETE', ...(body ? { body: JSON.stringify(body) } : {}) });

// ── Auth ──────────────────────────────────────────────────────────────────────

export const authApi = {
  register: (data)       => post('/auth/register', data),
  login:    (data)       => post('/auth/login', data),
  google:   (data)       => post('/auth/google', data),
  logout:   ()           => post('/auth/logout', {}),
  me:       ()           => get('/auth/me'),
};

// ── Products ──────────────────────────────────────────────────────────────────

export const productsApi = {
  /**
   * List products with optional filters.
   * @param {object} params  { q, category, brand, tag, min_price, max_price, sort, page, per_page }
   */
  list: (params = {}) => {
    const qs = new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([, v]) => v !== '' && v != null))
    ).toString();
    return get(`/products${qs ? `?${qs}` : ''}`);
  },

  get:      (id)           => get(`/products/${id}`),
  trending: (limit = 8)    => get(`/products/trending?limit=${limit}`),
  newArrivals: (limit = 8) => get(`/products/new?limit=${limit}`),
  deals:    (limit = 8)    => get(`/products/deals?limit=${limit}`),
  hot:      (limit = 8)    => get(`/products/hot?limit=${limit}`),
  sale:     (limit = 8)    => get(`/products/sale?limit=${limit}`),
  related:  (id)           => get(`/products/${id}/related`),
  submitReview: (id, data) => post(`/products/${id}/reviews`, data),
};

// ── Categories ────────────────────────────────────────────────────────────────

export const categoriesApi = {
  list: () => get('/categories'),
};

// ── Cart  (all require auth) ──────────────────────────────────────────────────

export const cartApi = {
  get:    ()                          => get('/cart'),
  add:    (productId, quantity, variant) =>
            post('/cart', { product_id: productId, quantity, variant }),
  update: (productId, quantity, variant) =>
            put(`/cart/${productId}`, { quantity, variant }),
  remove: (productId, variant)        =>
            del(`/cart/${productId}${variant ? `?variant=${encodeURIComponent(variant)}` : ''}`),
  clear:  ()                          => del('/cart'),
  sync:   (items)                     => post('/cart/sync', { items }),
};

// ── Wishlist  (all require auth) ──────────────────────────────────────────────

export const wishlistApi = {
  get:    ()             => get('/wishlist'),
  add:    (productId)    => post('/wishlist', { product_id: productId }),
  remove: (productId)    => del(`/wishlist/${productId}`),
  clear:  ()             => del('/wishlist'),
  sync:   (productIds)   => post('/wishlist/sync', { product_ids: productIds }),
};

// ── Orders  (all require auth) ────────────────────────────────────────────────

export const ordersApi = {
  place:      (items, note = '')        => post('/orders', { items, note }),
  list:       (params = {})             => {
    const qs = new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([, v]) => v !== '' && v != null))
    ).toString();
    return get(`/orders${qs ? `?${qs}` : ''}`);
  },
  get:        (orderId)                 => get(`/orders/${orderId}`),
  cancel:     (orderId)                 => del(`/orders/${orderId}`),
  updateItem: (orderId, productId, qty, variant) =>
                put(`/orders/${orderId}/items/${productId}`, { quantity: qty, variant }),
  removeItem: (orderId, productId, variant) =>
                del(`/orders/${orderId}/items/${productId}${variant ? `?variant=${encodeURIComponent(variant)}` : ''}`),
};

// ── Profile  (all require auth) ───────────────────────────────────────────────

export const profileApi = {
  get:            ()      => get('/profile'),
  update:         (data)  => put('/profile', data),
  changePassword: (data)  => put('/profile/password', data),
};

// ── Contact & Newsletter  (public) ───────────────────────────────────────────

export const contactApi = {
  send: (data) => post('/contact', data),
};

export const newsletterApi = {
  subscribe: (email) => post('/newsletter/subscribe', { email }),
};

// ── Image URL helper ──────────────────────────────────────────────────────────

const DEFAULT_IMAGE = import.meta.env.VITE_DEFAULT_IMAGE ?? '';

/**
 * Resolve a product image to a displayable URL.
 *
 * The API already returns fully-qualified URLs for every image
 * (e.g. http://localhost/JPos/userfiles/product/abc.webp?v=1234567890).
 * This helper is a simple passthrough with a null-guard.
 *
 * It deliberately does NOT prefix VITE_IMAGE_BASE_URL — the server does
 * that job. Moving the React app to a different domain requires no change
 * here because all image URLs come from the API response.
 *
 * @param {string|null} url  Value from product.images[0] or product.image
 * @returns {string}
 */
export function imageUrl(url) {
  if (!url || url === '') return DEFAULT_IMAGE;
  return url; // already a full http(s):// URL from the API
}
