import { useState } from "react";
import { NavLink, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useWishlist } from "../../../context/WishlistContext";
import { useCart } from "../../../context/CartContext";
import CartDropdown from "./CartDropdown";
import { siteConfig } from "../../../data/siteConfig";

export default function HeaderBottom() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { state: wishlistItems } = useWishlist();
  const { state: cartItems } = useCart();
  const totalCartItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="header-bottom">
      <div className="container">

        {/* ════════════════════════════════════════
            MOBILE HEADER BAR (hidden on lg+)
            [≡ hamburger] [Logo centered] [♡ cart]
        ════════════════════════════════════════ */}
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

        {/* ════════════════════════════════════════
            MOBILE NAV MENU — animated slide-down
        ════════════════════════════════════════ */}
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
                {[
                  { to: '/', label: 'Home', end: true },
                  { to: '/products', label: 'Shop' },
                  { to: '/orders', label: 'My Orders' },
                ].map(({ to, label, end }) => (
                  <li key={to}>
                    <NavLink
                      to={to}
                      end={end}
                      onClick={() => setMobileOpen(false)}
                      style={({ isActive }) => ({
                        display: 'block',
                        padding: '10px 16px',
                        color: isActive ? '#0066c0' : '#081828',
                        fontWeight: isActive ? 600 : 400,
                        textDecoration: 'none',
                        borderBottom: '1px solid #f2f2f2',
                      })}
                    >
                      {label}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ════════════════════════════════════════
            DESKTOP NAV (hidden on mobile)
        ════════════════════════════════════════ */}
        <div className="row align-items-center d-none d-lg-flex">
          <div className="col-lg-8 col-md-6">
            <div className="nav-inner">
              <nav className="navbar navbar-expand-lg">
                <div className="collapse navbar-collapse sub-menu-bar show">
                  <ul className="navbar-nav ms-auto">
                    <li className="nav-item">
                      <NavLink to="/" end className={({ isActive }) => isActive ? 'active' : ''}>Home</NavLink>
                    </li>
                    <li className="nav-item">
                      <NavLink to="/products" className={({ isActive }) => isActive ? 'active' : ''}>Shop</NavLink>
                    </li>
                    <li className="nav-item">
                      <NavLink to="/orders" className={({ isActive }) => isActive ? 'active' : ''}>My Orders</NavLink>
                    </li>
                  </ul>
                </div>
              </nav>
            </div>
          </div>
          <div className="col-lg-4 col-md-6">
            <div className="nav-social">
              <h5 className="title">Follow Us:</h5>
              <ul>
                <li><a href="#"><i className="lni lni-facebook-filled"></i></a></li>
                <li><a href="#"><i className="lni lni-twitter-original"></i></a></li>
                <li><a href="#"><i className="lni lni-instagram"></i></a></li>
              </ul>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
