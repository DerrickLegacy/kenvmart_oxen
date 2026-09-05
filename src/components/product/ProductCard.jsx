// ProductCard.jsx — simple card, no pan/zoom/lightbox (those live in ProductGallery)
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useWishlist } from '../../context/WishlistContext';
import StarRating from './StarRating';

const S = {
  card: {
    display: 'flex', flexDirection: 'column', height: '370px',
    background: '#fff', borderRadius: '8px', overflow: 'hidden',
    border: '1px solid #e8e8e8',
    transition: 'box-shadow 0.25s ease, transform 0.25s ease',
    cursor: 'pointer', position: 'relative',
  },
  imageWrap: {
    position: 'relative', flexShrink: 0, height: '200px',
    background: '#f7f7f7', overflow: 'hidden',
  },
  image: {
    width: '100%', height: '100%', objectFit: 'cover',
    transition: 'transform 0.3s ease', display: 'block',
  },
  info: {
    flex: 1, display: 'flex', flexDirection: 'column',
    padding: '9px 12px 10px', minHeight: 0, overflow: 'hidden',
  },
  badge: {
    position: 'absolute', top: '10px', left: '10px',
    padding: '3px 10px', fontSize: '11px', fontWeight: 600,
    borderRadius: '4px', color: '#fff', zIndex: 3,
  },
  wishlistBtn: (wishlisted) => ({
    position: 'absolute', top: '10px', right: '10px',
    width: '32px', height: '32px', border: 'none', borderRadius: '50%',
    background: 'white', color: wishlisted ? '#e74c3c' : '#999',
    fontSize: '16px', cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 4, transition: 'color 0.15s ease', padding: 0,
  }),
  btnWrap: (visible) => ({
    position: 'absolute', bottom: 0, left: 0, right: 0, padding: '10px',
    background: 'linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0) 100%)',
    zIndex: 3, opacity: visible ? 1 : 0,
    transform: visible ? 'translateY(0)' : 'translateY(10px)',
    transition: 'opacity 0.22s ease, transform 0.22s ease',
    pointerEvents: visible ? 'auto' : 'none',
  }),
};

export default function ProductCard({ product }) {
  const navigate = useNavigate();
  const { state: wishlistItems, dispatch } = useWishlist();
  const [isHovered,     setIsHovered]     = useState(false);
  const [isCartHovered, setIsCartHovered] = useState(false);

  const isWishlisted  = wishlistItems.some(i => i.productId === product.id);
  const discountPrice = product.discount_price ?? product.discountPrice;
  const salePercent   = product.sale_percent   ?? product.salePercent;
  const imageSrc      = product.images?.[0]    || '/assets/images/placeholder.jpg';

  const toggleWishlist = (e) => {
    e.stopPropagation();
    dispatch({
      type:    isWishlisted ? 'REMOVE_FROM_WISHLIST' : 'ADD_TO_WISHLIST',
      payload: isWishlisted ? { productId: product.id } : { product },
    });
  };

  const fmt = (p) => p != null ? Math.round(Number(p)).toLocaleString('en-US') : '0';

  return (
    <div
      className="product-card mb-3"
      style={{
        ...S.card,
        boxShadow: isHovered ? '0 4px 18px rgba(0,0,0,0.12)' : '0 1px 2px rgba(0,0,0,0.02)',
        transform: isHovered ? 'translateY(-2px)' : 'translateY(0)',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => { setIsHovered(false); setIsCartHovered(false); }}
      onClick={() => navigate(`/product/${product.id}`)}
    >
      {/* IMAGE */}
      <div style={S.imageWrap}>
        <img
          src={imageSrc}
          alt={product.name || 'Product'}
          style={{ ...S.image, transform: isHovered ? 'scale(1.04)' : 'scale(1)' }}
          onError={e => {
            if (!e.currentTarget.src.includes('placeholder'))
              e.currentTarget.src = '/assets/images/placeholder.jpg';
          }}
        />

        {(product.tag === 'sale' || product.tag === 'deals') && (
          <span style={{ ...S.badge, background: '#e74c3c' }}>-{salePercent || 15}%</span>
        )}
        {product.tag === 'new' && (
          <span style={{ ...S.badge, background: '#2ecc71' }}>New</span>
        )}

        <button
          type="button" style={S.wishlistBtn(isWishlisted)}
          onClick={toggleWishlist}
          aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <i className={isWishlisted ? 'lni lni-heart-filled' : 'lni lni-heart'} />
        </button>

        <div style={S.btnWrap(isHovered)} onClick={e => e.stopPropagation()}>
          <button
            type="button"
            style={{
              width: '100%', padding: '8px',
              background: isCartHovered ? '#3fb1f3' : '#56bffc',
              color: '#fff', border: 'none', borderRadius: '4px',
              fontSize: '13px', fontWeight: 500, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              gap: '6px', transition: 'background-color 0.15s ease',
            }}
            onMouseEnter={() => setIsCartHovered(true)}
            onMouseLeave={() => setIsCartHovered(false)}
            onClick={e => { e.stopPropagation(); navigate(`/product/${product.id}`); }}
          >
            <i className="lni lni-cart" /> Add to Cart
          </button>
        </div>
      </div>

      {/* INFO */}
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
  );
}
