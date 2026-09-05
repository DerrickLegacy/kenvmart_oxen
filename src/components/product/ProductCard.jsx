// ProductCard.jsx
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Link, useNavigate } from 'react-router-dom';
import { useWishlist } from '../../context/WishlistContext';
import StarRating from './StarRating';

// ─── Lightbox — renders into document.body via portal ─────────────────────
function Lightbox({ src, alt, onClose }) {
  // Close on Escape key
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return createPortal(
    <div
      onClick={onClose}
      style={{
        position:        'fixed',
        inset:           0,
        zIndex:          99999,
        background:      'rgba(0,0,0,0.88)',
        display:         'flex',
        alignItems:      'center',
        justifyContent:  'center',
        padding:         16,
        cursor:          'zoom-out',
      }}
      role="dialog"
      aria-modal="true"
      aria-label={`Full view: ${alt}`}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        aria-label="Close preview"
        style={{
          position:   'absolute',
          top:        16,
          right:      16,
          background: 'rgba(255,255,255,0.12)',
          border:     '1px solid rgba(255,255,255,0.3)',
          borderRadius: '50%',
          width:      40,
          height:     40,
          color:      '#fff',
          fontSize:   20,
          cursor:     'pointer',
          display:    'flex',
          alignItems: 'center',
          justifyContent: 'center',
          lineHeight: 1,
          zIndex:     2,
        }}
      >
        ×
      </button>

      {/* Full image — click doesn't close, only the backdrop does */}
      <img
        src={src}
        alt={alt}
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth:     '92vw',
          maxHeight:    '92vh',
          objectFit:    'contain',
          borderRadius: 6,
          boxShadow:    '0 8px 48px rgba(0,0,0,0.6)',
          cursor:       'default',
          userSelect:   'none',
        }}
        onError={e => { e.currentTarget.src = '/assets/images/placeholder.jpg'; }}
      />

      {/* Helper text */}
      <p style={{
        position:   'absolute',
        bottom:     16,
        left:       '50%',
        transform:  'translateX(-50%)',
        color:      'rgba(255,255,255,0.45)',
        fontSize:   12,
        margin:     0,
        pointerEvents: 'none',
      }}>
        Click outside or press Esc to close
      </p>
    </div>,
    document.body
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────
const S = {
  card: {
    display:        'flex',
    flexDirection:  'column',
    height:         '370px',
    background:     '#fff',
    borderRadius:   '8px',
    overflow:       'hidden',
    border:         '1px solid #e8e8e8',
    transition:     'box-shadow 0.25s ease, transform 0.25s ease',
    cursor:         'pointer',
    position:       'relative',
  },
  imageWrap: {
    position:   'relative',
    flexShrink: 0,
    height:     '200px',
    background: '#f7f7f7',
    overflow:   'hidden',
  },
  image: {
    // width/height set dynamically below
    display:        'block',
    objectFit:      'cover',
    transition:     'transform 0.15s ease',   // pan transition
    transformOrigin: '0 0',                    // pan from top-left
    willChange:     'transform',
    userSelect:     'none',
    pointerEvents:  'none',
  },
  info: {
    flex:          1,
    display:       'flex',
    flexDirection: 'column',
    padding:       '9px 12px 10px',
    minHeight:     0,
    overflow:      'hidden',
  },
  badge: {
    position:   'absolute',
    top:        '10px',
    left:       '10px',
    padding:    '3px 10px',
    fontSize:   '11px',
    fontWeight: 600,
    borderRadius: '4px',
    color:      '#fff',
    zIndex:     4,
  },
  previewBtn: {
    position:       'absolute',
    top:            '10px',
    right:          '48px',        // sits left of the wishlist button
    width:          '32px',
    height:         '32px',
    border:         'none',
    borderRadius:   '50%',
    background:     'rgba(255,255,255,0.92)',
    color:          '#444',
    fontSize:       '15px',
    cursor:         'pointer',
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'center',
    zIndex:         5,
    boxShadow:      '0 1px 4px rgba(0,0,0,0.12)',
    transition:     'background-color 0.15s ease, color 0.15s ease',
    padding:        0,
  },
  wishlistBtn: (wishlisted) => ({
    position:       'absolute',
    top:            '10px',
    right:          '10px',
    width:          '32px',
    height:         '32px',
    border:         'none',
    borderRadius:   '50%',
    background:     'white',
    color:          wishlisted ? '#e74c3c' : '#999',
    fontSize:       '16px',
    cursor:         'pointer',
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'center',
    zIndex:         4,
    transition:     'color 0.15s ease',
    padding:        0,
  }),
  btnWrap: (visible) => ({
    position:      'absolute',
    bottom:        0,
    left:          0,
    right:         0,
    padding:       '10px',
    background:    'linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0) 100%)',
    zIndex:        3,
    opacity:       visible ? 1 : 0,
    transform:     visible ? 'translateY(0)' : 'translateY(10px)',
    transition:    'opacity 0.22s ease, transform 0.22s ease',
    pointerEvents: visible ? 'auto' : 'none',
  }),
};

// ─── ProductCard ───────────────────────────────────────────────────────────
export default function ProductCard({ product }) {
  const navigate = useNavigate();
  const { state: wishlistItems, dispatch } = useWishlist();

  const [isHovered,      setIsHovered]      = useState(false);
  const [isCartHovered,  setIsCartHovered]  = useState(false);
  const [lightboxOpen,   setLightboxOpen]   = useState(false);
  const [imgTransform,   setImgTransform]   = useState('scale(1) translate(0px, 0px)');

  const imageWrapRef = useRef(null);
  const imgNativeRef = useRef(null);    // for reading natural dimensions

  const isWishlisted  = wishlistItems.some(i => i.productId === product.id);
  const discountPrice = product.discount_price ?? product.discountPrice;
  const salePercent   = product.sale_percent   ?? product.salePercent;
  const imageSrc      = product.images?.[0]    || '/assets/images/placeholder.jpg';

  // ── Pan on mouse-move ──────────────────────────────────────────────────
  const handleMouseMove = useCallback((e) => {
    const wrap = imageWrapRef.current;
    const img  = imgNativeRef.current;
    if (!wrap || !img) return;

    const wRect      = wrap.getBoundingClientRect();
    const natW       = img.naturalWidth  || img.offsetWidth;
    const natH       = img.naturalHeight || img.offsetHeight;
    const SCALE      = 1.04;     // slight zoom so there's room to pan
    const scaledW    = wRect.width  * SCALE;
    const scaledH    = wRect.height * SCALE;

    // How far the image overflows horizontally / vertically
    const overflowX  = Math.max(0, scaledW  - wRect.width);
    const overflowY  = Math.max(0, scaledH  - wRect.height);

    // Cursor ratio inside the wrap (0–1)
    const rx = (e.clientX - wRect.left) / wRect.width;
    const ry = (e.clientY - wRect.top)  / wRect.height;

    // Pan offset — negative because we shift the image left/up
    const tx = -(rx * overflowX);
    const ty = -(ry * overflowY);

    setImgTransform(`scale(${SCALE}) translate(${tx / SCALE}px, ${ty / SCALE}px)`);
  }, []);

  const handleMouseEnter = () => {
    setIsHovered(true);
    setImgTransform('scale(1.04) translate(0px, 0px)');
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setIsCartHovered(false);
    setImgTransform('scale(1) translate(0px, 0px)');
  };

  // ── Lightbox ───────────────────────────────────────────────────────────
  const openLightbox = (e) => {
    e.stopPropagation();
    setLightboxOpen(true);
  };

  // ── Wishlist ───────────────────────────────────────────────────────────
  const toggleWishlist = (e) => {
    e.stopPropagation();
    dispatch({
      type: isWishlisted ? 'REMOVE_FROM_WISHLIST' : 'ADD_TO_WISHLIST',
      payload: isWishlisted ? { productId: product.id } : { product },
    });
  };

  // ── Price formatter ────────────────────────────────────────────────────
  const fmt = (p) => p != null ? Math.round(Number(p)).toLocaleString('en-US') : '0';

  return (
    <>
      <div
        className="product-card mb-3"
        style={{
          ...S.card,
          boxShadow: isHovered ? '0 4px 18px rgba(0,0,0,0.12)' : '0 1px 2px rgba(0,0,0,0.02)',
          transform: isHovered ? 'translateY(-2px)' : 'translateY(0)',
        }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onMouseMove={handleMouseMove}
        onClick={() => navigate(`/product/${product.id}`)}
      >
        {/* ═══════════ IMAGE AREA ═══════════ */}
        <div ref={imageWrapRef} style={S.imageWrap}>
          <img
            ref={imgNativeRef}
            src={imageSrc}
            alt={product.name || 'Product'}
            style={{
              ...S.image,
              width:     '100%',
              height:    '100%',
              transform: imgTransform,
            }}
            onError={e => {
              if (!e.currentTarget.src.includes('placeholder'))
                e.currentTarget.src = '/assets/images/placeholder.jpg';
            }}
          />

          {/* SALE badge */}
          {(product.tag === 'sale' || product.tag === 'deals') && (
            <span style={{ ...S.badge, background: '#e74c3c' }}>
              -{salePercent || 15}%
            </span>
          )}

          {/* NEW badge */}
          {product.tag === 'new' && (
            <span style={{ ...S.badge, background: '#2ecc71' }}>New</span>
          )}

          {/* 🔍 Preview / fullscreen icon — always visible on the card */}
          <button
            type="button"
            style={S.previewBtn}
            onClick={openLightbox}
            aria-label="Preview full image"
            title="Preview full image"
          >
            <i className="lni lni-full-screen" />
          </button>

          {/* ♡ Wishlist */}
          <button
            type="button"
            style={S.wishlistBtn(isWishlisted)}
            onClick={toggleWishlist}
            aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <i className={isWishlisted ? 'lni lni-heart-filled' : 'lni lni-heart'} />
          </button>

          {/* Add to Cart overlay */}
          <div
            style={S.btnWrap(isHovered)}
            onClick={e => e.stopPropagation()}
          >
            <button
              type="button"
              style={{
                width:          '100%',
                padding:        '8px',
                background:     isCartHovered ? '#3fb1f3' : '#56bffc',
                color:          '#fff',
                border:         'none',
                borderRadius:   '4px',
                fontSize:       '13px',
                fontWeight:     500,
                cursor:         'pointer',
                display:        'flex',
                alignItems:     'center',
                justifyContent: 'center',
                gap:            '6px',
                transition:     'background-color 0.15s ease',
              }}
              onMouseEnter={() => setIsCartHovered(true)}
              onMouseLeave={() => setIsCartHovered(false)}
              onClick={e => { e.stopPropagation(); navigate(`/product/${product.id}`); }}
            >
              <i className="lni lni-cart" /> Add to Cart
            </button>
          </div>
        </div>

        {/* ═══════════ PRODUCT INFO ═══════════ */}
        <div style={S.info}>
          <span style={{
            fontSize: '11px', color: '#3fb1f3', textTransform: 'uppercase',
            letterSpacing: '0.5px', whiteSpace: 'nowrap', overflow: 'hidden',
            textOverflow: 'ellipsis', marginBottom: '3px', lineHeight: '16px',
          }}>
            {product.category || 'Accessories'}
          </span>

          <h4 style={{
            fontSize: '14px', fontWeight: 500, margin: 0, lineHeight: '18px',
            display: '-webkit-box', WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical', overflow: 'hidden',
            textOverflow: 'ellipsis', wordBreak: 'break-word', height: '36px',
          }}>
            <Link
              to={`/product/${product.id}`}
              style={{ color: '#111', textDecoration: 'none' }}
              onClick={e => e.stopPropagation()}
            >
              {product.name}
            </Link>
          </h4>

          <div style={{ margin: '5px 0 2px', flexShrink: 0, lineHeight: '18px' }}>
            <StarRating rating={product.rating || 0} />
          </div>

          <div style={{
            marginTop: '6px', paddingTop: '7px', fontSize: '18px',
            fontWeight: 900, color: '#111', flexShrink: 0,
            display: 'flex', alignItems: 'center', gap: '8px',
            borderTop: '1px solid #f0f0f0',
          }}>
            {discountPrice ? (
              <>
                <span>Shs. {fmt(discountPrice)}</span>
                <span style={{ fontSize: '12px', fontWeight: 400, color: '#999', textDecoration: 'line-through' }}>
                  {fmt(product.price)}
                </span>
              </>
            ) : (
              <span>Shs. {fmt(product.price)}</span>
            )}
          </div>
        </div>
      </div>

      {/* ═══════════ LIGHTBOX PORTAL ═══════════ */}
      {lightboxOpen && (
        <Lightbox
          src={imageSrc}
          alt={product.name || 'Product image'}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </>
  );
}
