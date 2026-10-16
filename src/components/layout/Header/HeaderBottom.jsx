import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useWishlist } from "../../../context/WishlistContext";
import { useCart } from "../../../context/CartContext";
import { siteConfig } from "../../../data/siteConfig";
import categories from "../../../data/categories";

export default function HeaderBottom({ sticky = false }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { state: wishlistItems } = useWishlist();
  const { state: cartItems } = useCart();
  const navigate = useNavigate();
  const totalCartItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const handleCategoryClick = (categoryName) => {
    navigate(`/products?category=${encodeURIComponent(categoryName)}`);
    setMobileOpen(false);
  };

  return (
    <div className={`header-bottom${sticky ? ' header-bottom--stuck' : ''}`} style={{ borderBottom: 'none', borderTop: 'none' }}>
      <div className="container">
        <div
          className="d-flex d-lg-none align-items-center"
          style={{ position: 'relative', height: 52, padding: '0 4px' }}
        >
          {/* Left — hamburger */}
          <button
            className="navbar-toggler mobile-menu-btn"
            type="button"
            aria-label="Toggle navigation"
            onClick={() => setMobileOpen(!mobileOpen)}
            style={{ padding: '6px 8px', background: 'none', border: '1px solid #ddd', borderRadius: 6, zIndex: 2 }}
          >
            <span className="toggler-icon"></span>
            <span className="toggler-icon"></span>
            <span className="toggler-icon"></span>
          </button>

          {/* Center — logo (absolutely centered so it's always truly in the middle) */}
          <Link
            to="/"
            style={{
              position: 'absolute',
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 1,
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <img
              src="/assets/images/logo/logo.svg"
              alt={siteConfig.name}
              style={{ height: 30, display: 'block' }}
            />
          </Link>

          {/* Right — wishlist icon + cart icon (simple links, NO dropdown) */}
          <div
            style={{
              marginLeft: 'auto',
              display: 'flex',
              alignItems: 'center',
              gap: 18,
              zIndex: 2,
            }}
          >
            {/* Wishlist */}
            <Link to="/wishlist" style={{ position: 'relative', color: '#081828', lineHeight: 1 }}>
              <i className="lni lni-heart" style={{ fontSize: 22 }} />
              {wishlistItems.length > 0 && (
                <span style={{
                  position: 'absolute', top: -6, right: -8,
                  background: '#ef2c4a', color: '#fff',
                  borderRadius: '50%', fontSize: 10, fontWeight: 700,
                  width: 16, height: 16,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  lineHeight: 1,
                }}>
                  {wishlistItems.length}
                </span>
              )}
            </Link>

            {/* Cart — plain link on mobile, no expanding dropdown */}
            <Link to="/cart" style={{ position: 'relative', color: '#081828', lineHeight: 1 }}>
              <i className="lni lni-cart" style={{ fontSize: 22 }} />
              {totalCartItems > 0 && (
                <span style={{
                  position: 'absolute', top: -6, right: -8,
                  background: '#ef2c4a', color: '#fff',
                  borderRadius: '50%', fontSize: 10, fontWeight: 700,
                  width: 16, height: 16,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  lineHeight: 1,
                }}>
                  {totalCartItems}
                </span>
              )}
            </Link>
          </div>
        </div>

         <AnimatePresence>
          {mobileOpen && (
            <motion.div
              className="d-lg-none"
              initial={{ opacity: 0, transform: 'translateY(-8px)' }}
              animate={{ opacity: 1, transform: 'translateY(0px)' }}
              exit={{ opacity: 0, transform: 'translateY(-8px)' }}
              transition={{ duration: 0.18, ease: [0.23, 1, 0.32, 1] }}
              style={{ borderTop: '1px solid #eee', paddingTop: 8, paddingBottom: 8 }}
            >
              <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                {categories.map((cat) => (
                  <li key={cat.title}>
                    <button
                      onClick={() => handleCategoryClick(cat.title)}
                      style={{
                        display: 'block',
                        width: '100%',
                        padding: '10px 16px',
                        color: '#081828',
                        fontWeight: 600,
                        textDecoration: 'none',
                        borderBottom: '1px solid #f2f2f2',
                        background: 'transparent',
                        border: 'none',
                        textAlign: 'left',
                        cursor: 'pointer',
                      }}
                    >
                      {cat.title}
                    </button>
                    
                    {cat.items.length > 0 && (
                      <ul style={{ listStyle: 'none', margin: 0, padding: 0, paddingLeft: 16 }}>
                        {cat.items.map((item) => (
                          <li key={item.name}>
                            <button
                              onClick={() => handleCategoryClick(item.name)}
                              style={{
                                display: 'block',
                                width: '100%',
                                padding: '8px 16px',
                                color: '#6b7280',
                                fontWeight: 400,
                                fontSize: '14px',
                                textDecoration: 'none',
                                borderBottom: '1px solid #f9fafb',
                                background: 'transparent',
                                border: 'none',
                                textAlign: 'left',
                                cursor: 'pointer',
                              }}
                            >
                              {item.name}
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                ))}
              </ul>
            </motion.div>
          )}
        </AnimatePresence> 
      </div>
    </div>
  );
}
