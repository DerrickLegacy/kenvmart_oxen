import { useState } from "react";
import { NavLink } from "react-router-dom";

export default function HeaderBottom() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="header-bottom">
      <div className="container">
        <div className="row align-items-center">
          <div className="col-lg-8 col-md-6 col-12">
            <div className="nav-inner">
              <nav className="navbar navbar-expand-lg">
                <button
                  className="navbar-toggler mobile-menu-btn"
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
