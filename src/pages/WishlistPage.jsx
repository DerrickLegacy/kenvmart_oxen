import { useState } from "react";
import { Link } from "react-router-dom";
import { useWishlist } from "../context/WishlistContext";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { wishlistApi } from "../services/api";
import Breadcrumb from "../components/layout/Breadcrumb";

const fmt = (p) => p != null ? Math.round(Number(p)).toLocaleString('en-US') : '0';

export default function WishlistPage() {
  const { state: wishlistItems, dispatch: wishlistDispatch } = useWishlist();
  const { dispatch: cartDispatch } = useCart();
  const { user } = useAuth();
  const [view, setView] = useState("grid");

  const handleRemove = async (productId) => {
    wishlistDispatch({ type: "REMOVE_FROM_WISHLIST", payload: { productId } });
    if (user) {
      try { await wishlistApi.remove(productId); } catch { }
    }
  };

  const handleClearAll = () => {
    if (window.confirm("Remove all items from your wishlist?")) {
      wishlistDispatch({ type: "CLEAR_WISHLIST" });
    }
  };

  const handleAddToCart = async (item) => {
    const product = {
      id: item.productId,
      name: item.name,
      price: item.price,
      images: [item.image],
      image: item.image,
    };
    cartDispatch({ type: "ADD_TO_CART", payload: { product, quantity: 1 } });
    handleRemove(item.productId);
  };

  return (
    <div data-testid="wishlist-page" className="wishlist-page">
      <style>{`
        .wishlist-card-name {
          font-size: 14px;
          font-weight: 600;
          margin-bottom: 6px;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          line-height: 1.35;
          height: calc(14px * 1.35 * 2);
        }
        .wishlist-card-buttons {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .wishlist-card-buttons .btn {
          width: 100%;
          font-size: 13px;
          padding: 8px;
          text-align: center;
        }
        .wl-row-buttons {
          display: flex;
          gap: 6px;
          align-items: center;
        }
        .wl-row-buttons .btn {
          font-size: 12px;
          padding: 5px 10px;
        }
      `}</style>

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
                        e.currentTarget.src = "/assets/images/placeholder.png";
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
                    Shs. {fmt(item.price)}
                  </p>
                  <div className="wishlist-card-buttons">
                    <Link
                      to={`/product/${item.productId}`}
                      className="btn wishlist-view-btn"
                    >
                      View Product
                    </Link>
                    <button
                      type="button"
                      className="btn wishlist-add-btn"
                      onClick={() => handleAddToCart(item)}
                    >
                      Add to Cart
                    </button>
                  </div>
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
              <span className="wl-col-action">Actions</span>
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
                        e.currentTarget.src = "/assets/images/placeholder.png";
                      }}
                    />
                  </Link>
                </div>
                <div className="wl-col-name">
                  <Link
                    to={`/product/${item.productId}`}
                    className="wishlist-list-name"
                    style={{
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      lineHeight: 1.35,
                    }}
                  >
                    {item.name}
                  </Link>
                </div>
                <div className="wl-col-price">
                  <span className="wishlist-list-price">
                    Shs. {fmt(item.price)}
                  </span>
                </div>
                <div className="wl-col-action">
                  <div className="wl-row-buttons">
                    <Link
                      to={`/product/${item.productId}`}
                      className="btn wishlist-view-btn-sm"
                    >
                      View
                    </Link>
                    <button
                      type="button"
                      className="btn wl-add-btn"
                      onClick={() => handleAddToCart(item)}
                    >
                      Add to Cart
                    </button>
                    <button
                      className="wishlist-remove-btn"
                      onClick={() => handleRemove(item.productId)}
                      aria-label={`Remove ${item.name}`}
                    >
                      <i className="lni lni-close"></i>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
