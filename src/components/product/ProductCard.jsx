// ProductCard.jsx — balanced card, 2-col mobile friendly
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useWishlist } from '../../context/WishlistContext';
import StarRating from './StarRating';

export default function ProductCard({ product }) {
  const navigate = useNavigate();
  const { state: wishlistItems, dispatch } = useWishlist();
  const [isHovered,     setIsHovered]     = useState(false);
  const [isCartHovered, setIsCartHovered] = useState(false);

  const isWishlisted  = wishlistItems.some(i => i.productId === product.id);
  const discountPrice = product.discount_price ?? product.discountPrice;
  const salePercent   = product.sale_percent   ?? product.salePercent;
  const imageSrc      = product.images?.[0]    || '/assets/images/placeholder.png';

  const toggleWishlist = (e) => {
    e.stopPropagation();
    dispatch({
      type:    isWishlisted ? 'REMOVE_FROM_WISHLIST' : 'ADD_TO_WISHLIST',
      payload: isWishlisted ? { productId: product.id } : { product },
    });
  };

  const fmt = (p) => p != null ? Math.round(Number(p)).toLocaleString('en-US') : '0';

  return (
    <>
      {/* Responsive styles scoped to .product-card */}
      <style>{`
        .product-card {
          display: flex;
          flex-direction: column;
          background: #fff;
          border-radius: 10px;
          overflow: hidden;
          border: 1px solid #e8ecf4;
          cursor: pointer;
          position: relative;
          transition: box-shadow 0.22s ease, transform 0.22s ease;
        }

        /* Image wrapper — aspect-ratio keeps it square & proportional */
        .product-card__img-wrap {
          position: relative;
          width: 100%;
          aspect-ratio: 1 / 1;          /* square on every screen size      */
          background: #f7f8fa;
          overflow: hidden;
          flex-shrink: 0;
        }

        .product-card__img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          transition: transform 0.28s ease;
        }

        .product-card__info {
          padding: 10px 10px 12px;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        /* badge */
        .product-card__badge {
          position: absolute;
          top: 8px;
          left: 8px;
          padding: 2px 8px;
          font-size: 10px;
          font-weight: 700;
          border-radius: 4px;
          color: #fff;
          z-index: 3;
          letter-spacing: 0.02em;
        }

        /* wishlist button */
        .product-card__wish {
          position: absolute;
          top: 8px;
          right: 8px;
          width: 30px;
          height: 30px;
          border: none;
          border-radius: 50%;
          background: #fff;
          font-size: 15px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 4;
          transition: color 0.15s ease;
          padding: 0;
          box-shadow: 0 1px 4px rgba(0,0,0,0.10);
        }

        /* add-to-cart overlay */
        .product-card__cart-overlay {
          position: absolute;
          bottom: 0; left: 0; right: 0;
          padding: 8px;
          background: linear-gradient(to top, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0) 100%);
          z-index: 3;
          transition: opacity 0.2s ease, transform 0.2s ease;
        }

        .product-card__cart-btn {
          width: 100%;
          padding: 7px;
          background: #183B9B;
          color: #fff;
          border: none;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 5px;
          transition: background 0.15s ease;
        }
        .product-card__cart-btn:hover { background: #122e7a; }

        .product-card__category {
          font-size: 10px;
          color: #183B9B;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .product-card__name {
          font-size: 13px;
          font-weight: 600;
          color: #0f172a;
          margin: 0;
          line-height: 1.35;
          /* clamp to 2 lines */
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .product-card__price {
          font-size: 15px;
          font-weight: 800;
          color: #0f172a;
          display: flex;
          align-items: center;
          gap: 6px;
          margin-top: 4px;
          padding-top: 6px;
          border-top: 1px solid #f0f2f5;
        }

        .product-card__price-old {
          font-size: 11px;
          font-weight: 400;
          color: #9ca3af;
          text-decoration: line-through;
        }

        /* ── Mobile tweaks (≤480px) ── */
        @media (max-width: 480px) {
          .product-card__info     { padding: 8px 8px 10px; gap: 3px; }
          .product-card__name     { font-size: 12px; }
          .product-card__price    { font-size: 13px; margin-top: 3px; padding-top: 5px; }
          .product-card__cart-btn { font-size: 11px; padding: 6px; }
          .product-card__badge    { font-size: 9px; padding: 2px 6px; }
        }
      `}</style>

      <div
        className="product-card mb-3"
        style={{
          boxShadow: isHovered ? '0 6px 20px rgba(0,0,0,0.11)' : '0 1px 3px rgba(0,0,0,0.05)',
          transform: isHovered ? 'translateY(-3px)' : 'translateY(0)',
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => { setIsHovered(false); setIsCartHovered(false); }}
        onClick={() => navigate(`/product/${product.id}`)}
      >
        {/* ── Image ── */}
        <div className="product-card__img-wrap">
          <img
            src={imageSrc}
            alt={product.name || 'Product'}
            className="product-card__img"
            style={{ transform: isHovered ? 'scale(1.05)' : 'scale(1)' }}
            onError={e => {
              if (!e.currentTarget.src.includes('placeholder'))
                e.currentTarget.src = '/assets/images/placeholder.png';
            }}
          />

          {/* Badge */}
          {(product.tag === 'sale' || product.tag === 'deals') && salePercent > 0 && (
            <span className="product-card__badge" style={{ background: '#ef2c4a' }}>
              -{salePercent}%
            </span>
          )}
          {product.tag === 'new' && (
            <span className="product-card__badge" style={{ background: '#0f5132' }}>
              New
            </span>
          )}
          {product.tag === 'hot' && (
            <span className="product-card__badge" style={{ background: '#b45309' }}>
              Hot
            </span>
          )}

          {/* Wishlist */}
          <button
            type="button"
            className="product-card__wish"
            style={{ color: isWishlisted ? '#ef2c4a' : '#9ca3af' }}
            onClick={toggleWishlist}
            aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <i className={isWishlisted ? 'lni lni-heart-filled' : 'lni lni-heart'} />
          </button>

          {/* Cart overlay — shows on hover */}
          <div
            className="product-card__cart-overlay"
            style={{
              opacity:   isHovered ? 1 : 0,
              transform: isHovered ? 'translateY(0)' : 'translateY(8px)',
              pointerEvents: isHovered ? 'auto' : 'none',
            }}
            onClick={e => e.stopPropagation()}
          >
            <button
              type="button"
              className="product-card__cart-btn"
              onClick={e => { e.stopPropagation(); navigate(`/product/${product.id}`); }}
            >
              <i className="lni lni-cart" /> Add to Cart
            </button>
          </div>
        </div>

        {/* ── Info ── */}
        <div className="product-card__info">
          <span className="product-card__category">
            {product.category || 'Accessories'}
          </span>

          <h4 className="product-card__name">
            <Link
              to={`/product/${product.id}`}
              style={{ color: 'inherit', textDecoration: 'none' }}
              onClick={e => e.stopPropagation()}
            >
              {product.name}
            </Link>
          </h4>

          <StarRating rating={product.rating || 0} />

          <div className="product-card__price">
            {discountPrice ? (
              <>
                <span>Shs {fmt(discountPrice)}</span>
                <span className="product-card__price-old">Shs {fmt(product.price)}</span>
              </>
            ) : (
              <span>Shs {fmt(product.price)}</span>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
