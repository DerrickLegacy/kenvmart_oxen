import { useState } from "react";
import { Link } from "react-router-dom";
import { useWishlist } from "../context/WishlistContext";
import Breadcrumb from "../components/layout/Breadcrumb";

export default function WishlistPage() {
  const { state: wishlistItems, dispatch } = useWishlist();
  const [view, setView] = useState("grid"); // 'grid' | 'list'

  const handleRemove = (productId) => {
    dispatch({ type: "REMOVE_FROM_WISHLIST", payload: { productId } });
  };

  const handleClearAll = () => {
    if (window.confirm("Remove all items from your wishlist?")) {
      dispatch({ type: "CLEAR_WISHLIST" });
    }
  };

  return (
    <div data-testid="wishlist-page" className="wishlist-page">
      <div className="container my-4">
        <Breadcrumb
          crumbs={[{ label: "Home", to: "/" }, { label: "Wishlist" }]}
        />

        {/* ── Toolbar ── */}
        <div className="wishlist-toolbar">
          <h4 className="wishlist-heading">
            My Wishlist
            {wishlistItems.length > 0 && (
              <span className="wishlist-count">
                {wishlistItems.length}{" "}
                {wishlistItems.length === 1 ? "item" : "items"}
              </span>
            )}
          </h4>

          {wishlistItems.length > 0 && (
            <div className="wishlist-toolbar-actions">
              {/* View toggle */}
              <div
                className="wishlist-view-toggle"
                role="group"
                aria-label="View style"
              >
                <button
                  className={`view-toggle-btn${view === "grid" ? " active" : ""}`}
                  onClick={() => setView("grid")}
                  aria-label="Grid view"
                  title="Grid view"
                >
                  <i className="lni lni-grid-alt"></i>
                </button>
                <button
                  className={`view-toggle-btn${view === "list" ? " active" : ""}`}
                  onClick={() => setView("list")}
                  aria-label="List view"
                  title="List view"
                >
                  <i className="lni lni-list"></i>
                </button>
              </div>

              {/* Clear all */}
              <button className="wishlist-clear-btn" onClick={handleClearAll}>
                <i className="lni lni-trash"></i> Clear All
              </button>
            </div>
          )}
        </div>

        {/* ── Empty state ── */}
        {wishlistItems.length === 0 ? (
          <div className="wishlist-empty">
            <i className="lni lni-heart"></i>
            <h3>Your wishlist is empty</h3>
            <p>
              Save products you love and find them here whenever you're ready.
            </p>
            <Link to="/products" className="btn">
              Browse Products
            </Link>
          </div>
        ) : view === "grid" ? (
          /* ── Grid view ── */
          <div className="wishlist-grid">
            {wishlistItems.map((item) => (
              <div key={item.productId} className="wishlist-card">
                <div className="wishlist-card-img">
                  <Link to={`/product/${item.productId}`}>
                    <img
                      src={item.image}
                      alt={item.name}
                      onError={(e) => {
                        e.currentTarget.src = "/assets/images/placeholder.jpg";
                      }}
                    />
                  </Link>
                  <button
                    className="wishlist-card-remove"
                    onClick={() => handleRemove(item.productId)}
                    aria-label={`Remove ${item.name}`}
                  >
                    <i className="lni lni-close"></i>
                  </button>
                </div>
                <div className="wishlist-card-body">
                  <h4 className="wishlist-card-name">
                    <Link to={`/product/${item.productId}`}>{item.name}</Link>
                  </h4>
                  <p className="wishlist-card-price">
                    ${item.price.toFixed(2)}
                  </p>
                  <Link
                    to={`/product/${item.productId}`}
                    className="btn wishlist-view-btn"
                    style={{ backgroundColor: '#3fb1f3' }}
                  >
                    View Product
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* ── List view ── */
          <div className="wishlist-list">
            {/* Header row */}
            <div className="wishlist-list-header d-none d-md-flex">
              <span className="wl-col-img"></span>
              <span className="wl-col-name">Product</span>
              <span className="wl-col-price">Price</span>
              <span className="wl-col-action"></span>
            </div>

            {wishlistItems.map((item) => (
              <div key={item.productId} className="wishlist-list-row">
                <div className="wl-col-img">
                  <Link to={`/product/${item.productId}`}>
                    <img
                      src={item.image}
                      alt={item.name}
                      className="wishlist-list-img"
                      onError={(e) => {
                        e.currentTarget.src = "/assets/images/placeholder.jpg";
                      }}
                    />
                  </Link>
                </div>
                <div className="wl-col-name">
                  <Link
                    to={`/product/${item.productId}`}
                    className="wishlist-list-name"
                  >
                    {item.name}
                  </Link>
                </div>
                <div className="wl-col-price">
                  <span className="wishlist-list-price">
                    ${item.price.toFixed(2)}
                  </span>
                </div>
                <div className="wl-col-action">
                  <Link
                    to={`/product/${item.productId}`}
                    className="btn wishlist-view-btn-sm"
                  >
                    View
                  </Link>
                  <button
                    className="wishlist-remove-btn"
                    onClick={() => handleRemove(item.productId)}
                    aria-label={`Remove ${item.name}`}
                  >
                    <i className="lni lni-close"></i>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
