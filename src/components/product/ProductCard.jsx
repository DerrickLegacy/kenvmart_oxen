// ProductCard.jsx
// Compact product card with hover Add to Cart button

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useWishlist } from '../../context/WishlistContext';
import StarRating from './StarRating';

const styles = {
  card: {
    display: 'flex',
    flexDirection: 'column',
    height: '370px',
    background: '#fff',
    borderRadius: '8px',
    overflow: 'hidden',
    border: '1px solid #e8e8e8',
    transition: 'box-shadow 0.25s ease, transform 0.25s ease',
    cursor: 'pointer',
    position: 'relative',
  },

  imageWrap: {
    position: 'relative',
    flexShrink: 0,
    height: '200px',
    background: '#f7f7f7',
    overflow: 'hidden',
  },

  image: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    transition: 'transform 0.3s ease',
    display: 'block',
  },

  info: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    padding: '9px 12px 10px',
    minHeight: 0,
    overflow: 'hidden',
  },

  category: {
    fontSize: '11px',
    color: '#3fb1f3',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    marginBottom: '3px',
    lineHeight: '16px',
  },

  title: {
    fontSize: '14px',
    fontWeight: 500,
    margin: 0,
    lineHeight: '18px',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    wordBreak: 'break-word',
    height: '36px',
  },

  titleLink: {
    color: '#111',
    textDecoration: 'none',
  },

  rating: {
    margin: '5px 0 2px',
    flexShrink: 0,
    lineHeight: '18px',
  },

  price: {
    marginTop: '6px',
    paddingTop: '7px',
    fontSize: '18px',
    fontWeight: 900,
    color: '#111',
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    borderTop: '1px solid #f0f0f0',
  },

  discountPrice: {
    fontSize: '12px',
    fontWeight: 400,
    color: '#999',
    textDecoration: 'line-through',
  },

  badge: {
    position: 'absolute',
    top: '10px',
    left: '10px',
    padding: '3px 10px',
    fontSize: '11px',
    fontWeight: 600,
    borderRadius: '4px',
    color: '#fff',
    zIndex: 3,
  },

  wishlistBtn: (isWishlisted) => ({
    position: 'absolute',
    top: '10px',
    right: '10px',
    width: '32px',
    height: '32px',
    border: 'none',
    borderRadius: '50%',
    borderColor: '#3fb1f3',
    background: 'white',
    color: isWishlisted ? '#e74c3c' : '#999',
    fontSize: '16px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 4,
    transition: 'all 0.2s ease',
    padding: 0,
  }),

  btnWrap: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: '10px',
    background:
      'linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0) 100%)',
    zIndex: 3,
    opacity: 0,
    transform: 'translateY(10px)',
    transition: 'opacity 0.25s ease, transform 0.25s ease',
    pointerEvents: 'none',
  },

  btnWrapHover: {
    opacity: 1,
    transform: 'translateY(0)',
    pointerEvents: 'auto',
  },

  btn: {
    width: '100%',
    padding: '8px',
    background: '#0066c0',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    fontSize: '13px',
    fontWeight: 500,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    transition: 'background 0.2s ease',
  },
};

export default function ProductCard({ product }) {
  const navigate = useNavigate();

  const { state: wishlistItems, dispatch } = useWishlist();

  const [isHovered, setIsHovered] = React.useState(false);
  const [isCartHovered, setIsCartHovered] = React.useState(false);

  const isWishlisted = wishlistItems.some(
    (item) => item.productId === product.id
  );

  const discountPrice = product.discount_price ?? product.discountPrice;
  const salePercent = product.sale_percent ?? product.salePercent;

  // --------------------------------------------------
  // Wishlist
  // --------------------------------------------------
  const toggleWishlist = (e) => {
    e.stopPropagation();

    if (isWishlisted) {
      dispatch({
        type: 'REMOVE_FROM_WISHLIST',
        payload: {
          productId: product.id,
        },
      });
    } else {
      dispatch({
        type: 'ADD_TO_WISHLIST',
        payload: {
          product,
        },
      });
    }
  };

  // --------------------------------------------------
  // Format UGX price
  // --------------------------------------------------
  const formatUgxPrice = (price) => {
    if (price === null || price === undefined || price === '') {
      return '0';
    }

    return Math.round(Number(price)).toLocaleString('en-US');
  };

  // --------------------------------------------------
  // Open product
  // --------------------------------------------------
  const handleCardClick = () => {
    navigate(`/product/${product.id}`);
  };

  // --------------------------------------------------
  // Add to cart
  // --------------------------------------------------
  const handleAddToCart = (e) => {
    e.stopPropagation();

    // Navigate to product page where the actual
    // quantity/options and cart action can be handled.
    navigate(`/product/${product.id}`);
  };

  // --------------------------------------------------
  // Image fallback
  // --------------------------------------------------
  const imageSrc =
    product.images?.[0] || '/assets/images/placeholder.jpg';

  return (
    <div
      className="product-card mb-3"
      style={{
        ...styles.card,
        boxShadow: isHovered
          ? '0 4px 18px rgba(0,0,0,0.12)'
          : '0 1px 2px rgba(0,0,0,0.02)',
        transform: isHovered
          ? 'translateY(-2px)'
          : 'translateY(0)',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setIsCartHovered(false);
      }}
      onClick={handleCardClick}
    >
      {/* ================= IMAGE ================= */}
      <div style={styles.imageWrap}>
        <img
          src={imageSrc}
          alt={product.name || 'Product'}
          style={{
            ...styles.image,
            transform: isHovered
              ? 'scale(1.04)'
              : 'scale(1)',
          }}
          onError={(e) => {
            if (
              e.currentTarget.src.indexOf(
                '/assets/images/placeholder.jpg'
              ) === -1
            ) {
              e.currentTarget.src =
                '/assets/images/placeholder.jpg';
            }
          }}
        />

        {/* SALE / DEALS BADGE */}
        {(product.tag === 'sale' || product.tag === 'deals') && (
          <span
            style={{
              ...styles.badge,
              background: '#e74c3c',
            }}
          >
            -{salePercent || 15}%
          </span>
        )}

        {/* NEW BADGE */}
        {product.tag === 'new' && (
          <span
            style={{
              ...styles.badge,
              background: '#2ecc71',
            }}
          >
            New
          </span>
        )}

        {/* WISHLIST */}
        <button
          type="button"
          style={styles.wishlistBtn(isWishlisted)}
          onClick={toggleWishlist}
          aria-label={
            isWishlisted
              ? 'Remove from wishlist'
              : 'Add to wishlist'
          }
          onMouseEnter={(e) => {
            e.stopPropagation();
          }}
        >
          <i
            className={
              isWishlisted
                ? 'lni lni-heart-filled'
                : 'lni lni-heart'
            }
          />
        </button>

        {/* ================= HOVER ADD TO CART ================= */}
        <div
          style={{
            ...styles.btnWrap,
            ...(isHovered ? styles.btnWrapHover : {}),
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            style={{
              ...styles.btn,
              background: isCartHovered
                ? '#3FB1F3'
                : '#56bffcff',
            }}
            onMouseEnter={() => setIsCartHovered(true)}
            onMouseLeave={() => setIsCartHovered(false)}
            onClick={handleAddToCart}
          >
            <i className="lni lni-cart" />
            Add to Cart
          </button>
        </div>
      </div>

      {/* ================= PRODUCT INFO ================= */}
      <div style={styles.info}>
        {/* CATEGORY */}
        <span style={styles.category}>
          {product.category || 'Accessories'}
        </span>

        {/* PRODUCT NAME */}
        <h4 style={styles.title}>
          <Link
            to={`/product/${product.id}`}
            style={styles.titleLink}
            onClick={(e) => e.stopPropagation()}
          >
            {product.name}
          </Link>
        </h4>

        {/* RATING */}
        <div style={styles.rating}>
          <StarRating rating={product.rating || 0} />
        </div>

        {/* PRICE */}
        <div style={styles.price}>
          {discountPrice ? (
            <>
              <span>
                Shs. {formatUgxPrice(discountPrice)}
              </span>

              <span style={styles.discountPrice}>
                {formatUgxPrice(product.price)}
              </span>
            </>
          ) : (
            <span>
              Shs. {formatUgxPrice(product.price)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}