import { useState } from "react";
import { NavLink, Link } from "react-router-dom";
import { useWishlist } from "../../../context/WishlistContext";
import CartDropdown from "./CartDropdown";
import { siteConfig } from "../../../data/siteConfig";

export default function HeaderBottom() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { state: wishlistItems } = useWishlist();

  return (
    <div className="header-bottom">
      <div className="container">
        <div className="row align-items-center">
          <div className="col-lg-8 col-md-6 col-12">
            <div className="nav-inner">
              <nav className="navbar navbar-expand-lg">
                {/* Mobile top bar: [hamburger] [logo centered] [wishlist+cart] */}
                <div className="mobile-nav-bar d-flex d-lg-none align-items-center w-100">
                  <button
                    className="navbar-toggler mobile-menu-btn"
                    type="button"
                    aria-label="Toggle navigation"
                    onClick={() => setMobileOpen(!mobileOpen)}
                    style={{ flex: '0 0 auto' }}
                  >
                    <span className="toggler-icon"></span>
                    <span className="toggler-icon"></span>
                    <span className="toggler-icon"></span>
                  </button>

                  {/* App name/logo — centered */}
                  <Link
                    to="/"
                    className="navbar-brand mx-auto"
                    style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}
                  >
                    <img src="/assets/images/logo/logo.svg" alt={siteConfig.name} style={{ height: 32 }} />
                  </Link>

                  {/* Wishlist + Cart — right */}
                  <div className="mobile-nav-icons d-flex align-items-center gap-2 ms-auto">
                    <Link to="/wishlist" style={{ position: 'relative', color: '#333' }}>
                      <i className="lni lni-heart" style={{ fontSize: 22 }}></i>
                      {wishlistItems.length > 0 && (
                        <span className="total-items" style={{
                          position: 'absolute', top: -6, right: -8,
                          background: '#ef2c4a', color: '#fff',
                          borderRadius: '50%', fontSize: 10,
                          width: 16, height: 16,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>{wishlistItems.length}</span>
                      )}
                    </Link>
                    <CartDropdown />
                  </div>
                </div>

                {/* Desktop: normal toggle button (hidden on mobile) */}
                <button
                  className="navbar-toggler mobile-menu-btn d-none d-lg-block"
                  type="button"
                  aria-label="Toggle navigation"
                  onClick={() => setMobileOpen(!mobileOpen)}
                >
                  <span className="toggler-icon"></span>
                  <span className="toggler-icon"></span>
                  <span className="toggler-icon"></span>
                </button>
                <div
                  className={`collapse navbar-collapse sub-menu-bar${mobileOpen ? " show" : ""}`}
                >
                  <ul className="navbar-nav ms-auto">
                    <li className="nav-item">
                      <NavLink
                        to="/"
                        end
                        className={({ isActive }) => (isActive ? "active" : "")}
                      >
                        Home
                      </NavLink>
                    </li>
                    <li className="nav-item">
                      <NavLink
                        to="/products"
                        className={({ isActive }) => (isActive ? "active" : "")}
                      >
                        Shop
                      </NavLink>
                    </li>
                    <li className="nav-item">
                      <NavLink
                        to="/orders"
                        className={({ isActive }) => (isActive ? "active" : "")}
                      >
                        My Orders
                      </NavLink>
                    </li>
                  </ul>
                </div>
              </nav>
            </div>
          </div>
          <div className="col-lg-4 col-md-6 col-12">
            <div className="nav-social">
              <h5 className="title">Follow Us:</h5>
              <ul>
                <li>
                  <a href="#">
                    <i className="lni lni-facebook-filled"></i>
                  </a>
                </li>
                <li>
                  <a href="#">
                    <i className="lni lni-twitter-original"></i>
                  </a>
                </li>
                <li>
                  <a href="#">
                    <i className="lni lni-instagram"></i>
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
