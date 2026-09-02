/**
 * images.js — Product image resolution + formatting helpers.
 * Mirrors Shop_Base.php: resolve_images(), format_product(), format_product_full().
 */

const IMAGE_BASE_URL = process.env.IMAGE_BASE_URL || 'http://localhost/JPos/userfiles/product';

export function resolveImages(p) {
  const base        = IMAGE_BASE_URL.replace(/\/$/, '') + '/';
  const v           = p.updated_at ? Math.floor(new Date(p.updated_at).getTime() / 1000) : Math.floor(Date.now() / 1000);
  const placeholder = `${base}default.png`;
  const urls        = [];

  // 1. JSON images column
  if (p.images && p.images !== '[]') {
    let arr;
    try { arr = typeof p.images === 'string' ? JSON.parse(p.images) : p.images; }
    catch { arr = []; }

    if (Array.isArray(arr)) {
      for (const img of arr) {
        const s = (img || '').trim();
        if (!s || s === 'default.png') continue;
        if (s.startsWith('http'))   urls.push(s.includes('?') ? s : `${s}?v=${v}`);
        else if (s.startsWith('/')) urls.push(`http://localhost${s}?v=${v}`);
        else                        urls.push(`${base}${s}?v=${v}`);
      }
    }
  }

  // 2. Legacy single image column
  if (urls.length === 0) {
    const img = (p.image || '').trim();
    if (img && img !== 'default.png') {
      urls.push(img.startsWith('http')
        ? (img.includes('?') ? img : `${img}?v=${v}`)
        : `${base}${img}?v=${v}`);
    }
  }

  // 3. Placeholder — use the full URL so it always resolves
  if (urls.length === 0) urls.push(placeholder);

  return urls;
}

export function slugify(str) {
  return (str || '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export function formatProduct(p) {
  const images        = resolveImages(p);
  // Use ecomm_price as the storefront price; fall back to retail_price
  const ecommPrice    = parseFloat(p.ecomm_price) || 0;
  const retailPrice   = parseFloat(p.retail_price) || 0;
  const displayPrice  = ecommPrice > 0 ? ecommPrice : retailPrice;
  const salePercent   = p.sale_percent ? parseInt(p.sale_percent, 10) : null;
  // If sale_percent is set, show a crossed-out original retail price
  const discountPrice = salePercent > 0 ? Math.round(displayPrice * (1 - salePercent / 100)) : null;

  return {
    id:             `prod-${p.pid}`,
    jpos_id:        parseInt(p.pid, 10),
    name:           p.product_name,
    category:       p.cat_title     || '',
    category_id:    parseInt(p.pcat, 10),
    category_slug:  p.cat_slug      || slugify(p.cat_title || ''),
    brand:          p.brand         || '',
    price:          Math.round(displayPrice),
    discount_price: discountPrice,
    images,
    rating:         parseFloat(p.rating      || 0),
    rating_count:   parseInt(p.rating_count  || 0, 10),
    tag:            p.shop_tag      || null,
    sale_percent:   salePercent     || null,
    variants:       safeJson(p.variants, []),
    colors:         safeJson(p.colors,   []),
    in_stock:       parseFloat(p.qty || 0) > 0,
    stock_qty:      parseInt(p.qty  || 0, 10),
  };
}

export function formatProductFull(p) {
  return {
    ...formatProduct(p),
    description:      p.product_des        || '',
    features:         safeJson(p.features,         []),
    specifications:   safeJson(p.specifications,   {}),
    shipping_options: safeJson(p.shipping_options, []),
  };
}

export function resolvePid(id) {
  if (!id) return null;
  if (/^\d+$/.test(String(id))) return parseInt(id, 10);
  const m = String(id).match(/^prod-(\d+)$/);
  return m ? parseInt(m[1], 10) : null;
}

function safeJson(str, fallback) {
  if (!str) return fallback;
  try { return typeof str === 'string' ? JSON.parse(str) : str; }
  catch { return fallback; }
}
