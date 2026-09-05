import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useApi } from "../hooks/useApi";
import { productsApi, cartApi, wishlistApi } from "../services/api";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import { useAuth } from "../context/AuthContext";
import ProductGallery from "../components/product/ProductGallery";
import Breadcrumb from "../components/layout/Breadcrumb";
import StarRating from "../components/product/StarRating";
import ProductCard from "../components/product/ProductCard";

const RECENTLY_VIEWED_KEY = 'kenvies_recently_viewed';
const MAX_RECENTLY_VIEWED = 8;

function saveRecentlyViewed(product) {
  try {
    const raw = localStorage.getItem(RECENTLY_VIEWED_KEY);
    let items = raw ? JSON.parse(raw) : [];
    // Remove if already present, then prepend
    items = items.filter((p) => p.id !== product.id);
    items.unshift(product);
    if (items.length > MAX_RECENTLY_VIEWED) items = items.slice(0, MAX_RECENTLY_VIEWED);
    localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(items));
  } catch {
    // ignore storage errors
  }
}

const COLOR_STYLES = [
  "checkbox-style-1",
  "checkbox-style-2",
  "checkbox-style-3",
  "checkbox-style-4",
];

const formatUgxPrice = (price) => {
  if (price === null || price === undefined || price === '') return '0';
  return Math.round(Number(price)).toLocaleString('en-US');
};

const effectivePrice = (product) => {
  return product?.discount_price ?? product?.discountPrice ?? product?.price ?? 0;
};

const originalPrice = (product) => {
  return product?.price ?? 0;
};

export default function ProductDetailsPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const { dispatch: cartDispatch } = useCart();
  const { state: wishlistState, dispatch: wishlistDispatch } = useWishlist();

  const { data: product, loading, error, refetch } = useApi(
    () => productsApi.get(id),
    [id]
  );

  const { data: relatedData } = useApi(
    () => (id ? productsApi.related(id).catch(() => ({ products: [] })) : Promise.resolve({ products: [] })),
    [id]
  );

  const relatedProducts = relatedData?.products ?? [];

  // Save this product to recently-viewed in localStorage as soon as it loads
  useEffect(() => {
    if (!product) return;
    // Build a minimal product shape compatible with ProductCard
    saveRecentlyViewed({
      id: product.id,
      name: product.name,
      category: product.category,
      price: product.price,
      discount_price: product.discount_price ?? product.discountPrice ?? null,
      images: product.images ?? [],
      rating: product.rating ?? 0,
      rating_count: product.rating_count ?? 0,
      tag: product.tag ?? null,
      sale_percent: product.sale_percent ?? null,
    });
  }, [product?.id]);

  const [selectedColor, setSelectedColor] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const [apiBusy, setApiBusy] = useState(false);
  const [localError, setLocalError] = useState("");

  useEffect(() => {
    if (product?.variants?.length) {
      setSelectedVariant(product.variants[0]);
    } else {
      setSelectedVariant("");
    }
    setSelectedColor(0);
    setQuantity(1);
  }, [id, product?.variants]);

  const isWishlisted = product
    ? wishlistState.some((item) => item.productId === product.id)
    : false;

  if (loading) {
    return (
      <div data-testid="product-details-page" className="container section">
        <div className="row">
          <div className="col-lg-6">
            <div className="product-skeleton" style={{ height: 400 }} />
          </div>
          <div className="col-lg-6">
            <div className="product-skeleton" style={{ height: 30, marginBottom: 12 }} />
            <div className="product-skeleton" style={{ height: 20, width: "40%", marginBottom: 20 }} />
            <div className="product-skeleton" style={{ height: 40, width: "30%", marginBottom: 16 }} />
            <div className="product-skeleton" style={{ height: 80, marginBottom: 20 }} />
            <div className="product-skeleton" style={{ height: 50 }} />
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div data-testid="product-details-page" className="container section">
        <div className="alert alert-danger" role="alert">
          {error || "Product not found."}
        </div>
        <Link to="/products" className="btn mt-3">Back to Shop</Link>
      </div>
    );
  }

  const handleAddToCart = async () => {
    const variant = selectedVariant || null;
    cartDispatch({
      type: "ADD_TO_CART",
      payload: { product, variant, quantity },
    });

    if (user) {
      setApiBusy(true);
      try {
        await cartApi.add(product.id, quantity, variant);
      } catch (err) {
        setLocalError(err.message || "Could not sync cart with server.");
      } finally {
        setApiBusy(false);
      }
    }

    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const handleToggleWishlist = async () => {
    if (isWishlisted) {
      wishlistDispatch({ type: "REMOVE_FROM_WISHLIST", payload: { productId: product.id } });
      if (user) {
        try { await wishlistApi.remove(product.id); } catch {}
      }
    } else {
      wishlistDispatch({ type: "ADD_TO_WISHLIST", payload: { product } });
      if (user) {
        try { await wishlistApi.add(product.id); } catch {}
      }
    }
  };

  const hasDiscount = (product.discount_price ?? product.discountPrice) != null;

  return (
    <div data-testid="product-details-page">
      <section className="item-details mb-3">
        <div className="container">
          <Breadcrumb
            crumbs={[
              { label: "Home", to: "/" },
              { label: "Shop", to: "/products" },
              { label: product.name },
            ]}
          />

          {localError && (
            <div className="alert alert-warning mb-3" role="alert">{localError}</div>
          )}

          <div className="top-area">
            <div className="row align-items-start">
              <div className="col-lg-6 col-md-12 col-12">
                <ProductGallery
                  images={product.images}
                  productName={product.name}
                />
              </div>

              <div className="col-lg-6 col-md-12 col-12">
                <div className="product-info">
                  <h2 className="title" data-testid="product-title">
                    {product.name}
                  </h2>

                  <p className="category" data-testid="product-category">
                    <i className="lni lni-tag"></i> {product.category}:&nbsp;
                    <Link to={`/products?category=${encodeURIComponent(product.category_slug || product.category)}`}>
                      {product.category}
                    </Link>
                  </p>

                  <div style={{ margin: '8px 0 12px' }}>
                    <StarRating rating={product.rating || 0} />
                    {product.rating_count > 0 && (
                      <span style={{ marginLeft: 8, color: '#888', fontSize: '0.85rem' }}>
                        ({product.rating_count} {product.rating_count === 1 ? 'review' : 'reviews'})
                      </span>
                    )}
                  </div>

                  <h3 className="price" data-testid="product-price" style={{ fontSize: '28px', fontWeight: 700 }}>
                    Shs. {formatUgxPrice(effectivePrice(product))}
                    {hasDiscount && (
                      <span style={{ marginLeft: 12, fontSize: '16px', color: '#999', textDecoration: 'line-through', fontWeight: 400 }}>
                        Shs. {formatUgxPrice(originalPrice(product))}
                      </span>
                    )}
                  </h3>

                  <p className="info-text" data-testid="product-description" style={{ margin: '12px 0' }}>
                    {product.description}
                  </p>

                  <div className="row">
                    {product.colors && product.colors.length > 0 && (
                      <div className="col-lg-4 col-md-4 col-12">
                        <div className="form-group color-option">
                          <label className="title-label" htmlFor="size">
                            Choose color
                          </label>
                          {product.colors.map((color, i) => (
                            <div
                              key={color}
                              className={`single-checkbox ${COLOR_STYLES[i % COLOR_STYLES.length]}`}
                              style={{ "--swatch-color": color }}
                            >
                              <input
                                type="checkbox"
                                id={`checkbox-${i + 1}`}
                                checked={selectedColor === i}
                                onChange={() => setSelectedColor(i)}
                              />
                              <label htmlFor={`checkbox-${i + 1}`}>
                                <span></span>
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {product.variants && product.variants.length > 0 && (
                      <div className="col-lg-4 col-md-4 col-12">
                        <div className="form-group">
                          <label htmlFor="variant-select">
                            {product.category === "Watches"
                              ? "Size"
                              : "Variant"}
                          </label>
                          <select
                            className="form-control"
                            id="variant-select"
                            data-testid="variant-select"
                            value={selectedVariant}
                            onChange={(e) => setSelectedVariant(e.target.value)}
                          >
                            {product.variants.map((v) => (
                              <option key={v} value={v}>
                                {v}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    )}

                    <div className="col-lg-4 col-md-4 col-12">
                      <div className="form-group quantity">
                        <label>Quantity</label>
                        <div className="inner-content">
                          <input
                            type="button"
                            className="button first"
                            value="−"
                            aria-label="Decrease quantity"
                            onClick={() =>
                              setQuantity((q) => Math.max(1, q - 1))
                            }
                          />
                          <input
                            type="text"
                            className="text"
                            readOnly
                            value={quantity}
                            data-testid="quantity-input"
                            aria-label="Quantity"
                          />
                          <input
                            type="button"
                            className="button last"
                            value="+"
                            aria-label="Increase quantity"
                            onClick={() =>
                              setQuantity((q) => Math.min(99, q + 1))
                            }
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bottom-content">
                    <div className="row align-items-end">
                      <div className="col-lg-4 col-md-4 col-12">
                        <div className="button cart-button">
                          <motion.button
                            className="btn"
                            style={{ width: "100%" }}
                            data-testid="add-to-cart-btn"
                            onClick={handleAddToCart}
                            disabled={apiBusy}
                            whileTap={{ scale: 0.96 }}
                            transition={{ duration: 0.12, ease: [0.23, 1, 0.32, 1] }}
                          >
                            {apiBusy ? "Adding…" : "Add to Cart"}
                          </motion.button>
                        </div>
                      </div>
                      <div className="col-lg-4 col-md-4 col-12">
                        <div className="wish-button">
                          <button className="btn" onClick={refetch}>
                            <i className="lni lni-reload"></i> Refresh
                          </button>
                        </div>
                      </div>
                      <div className="col-lg-4 col-md-4 col-12">
                        <div className="wish-button">
                          <button
                            className="btn"
                            data-testid="add-to-wishlist-btn"
                            onClick={handleToggleWishlist}
                            style={isWishlisted ? { color: '#e74c3c', borderColor: '#e74c3c' } : {}}
                          >
                            <i className={isWishlisted ? "lni lni-heart-filled" : "lni lni-heart"}></i>{" "}
                            {isWishlisted ? "In Wishlist" : "To Wishlist"}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <AnimatePresence>
                    {addedToCart && (
                      <motion.div
                        className="add-to-cart-toast"
                        role="status"
                        aria-live="polite"
                        initial={{ opacity: 0, transform: 'translateY(8px) scale(0.97)' }}
                        animate={{ opacity: 1, transform: 'translateY(0px) scale(1)' }}
                        exit={{ opacity: 0, transform: 'translateY(4px) scale(0.98)' }}
                        transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
                      >
                        <i className="lni lni-checkmark-circle"></i> Added to cart!{" "}
                        <Link to="/cart" className="cart-toast-link">
                          View Cart →
                        </Link>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </div>

          <div className="product-details-info">
            <div className="single-block">
              <div className="row">
                <div className="col-lg-6 col-12">
                  <div className="info-body custom-responsive-margin">
                    <h4>Details</h4>
                    <p>{product.description}</p>

                    {product.features && product.features.length > 0 && (
                      <>
                        <h4>Features</h4>
                        <ul className="features" data-testid="product-features">
                          {product.features.map((f, i) => (
                            <li key={i}>{f}</li>
                          ))}
                        </ul>
                      </>
                    )}

                    {product.warranty_info && (
                      <>
                        <h4>Warranty</h4>
                        <p>{product.warranty_info}</p>
                      </>
                    )}
                  </div>
                </div>
                <div className="col-lg-6 col-12">
                  <div className="info-body">
                    {product.specifications &&
                      Object.keys(product.specifications).length > 0 && (
                      <>
                        <h4>Specifications</h4>
                        <ul
                          className="normal-list"
                          data-testid="product-specifications"
                        >
                          {Object.entries(product.specifications).map(
                            ([key, val]) => (
                              <li key={key}>
                                <span>{key}:</span> {String(val)}
                              </li>
                            ),
                          )}
                        </ul>
                      </>
                    )}

                    {product.shipping_options &&
                      product.shipping_options.length > 0 && (
                        <>
                          <h4>Shipping Options:</h4>
                          <ul
                            className="normal-list"
                            data-testid="product-shipping"
                          >
                            {product.shipping_options.map((opt, i) => (
                              <li key={i}>
                                <span>{opt.method}:</span> {opt.duration},{" "}
                                {opt.cost}
                              </li>
                            ))}
                          </ul>
                        </>
                      )}

                    {product.reviews && product.reviews.length > 0 && (
                      <>
                        <h4>Customer Reviews ({product.reviews.length})</h4>
                        <div className="product-reviews-list">
                          {product.reviews.map((r) => (
                            <div key={r.id} className="review-item" style={{ borderBottom: '1px solid #eee', padding: '10px 0' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <strong>{r.reviewer_name}</strong>
                                <span style={{ color: '#888', fontSize: '0.85rem' }}>
                                  {r.created_at ? new Date(r.created_at).toLocaleDateString() : ''}
                                </span>
                              </div>
                              <StarRating rating={r.rating} />
                              {r.comment && <p style={{ marginTop: 4, marginBottom: 0 }}>{r.comment}</p>}
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>                

          </div>

          {relatedProducts.length > 0 && (
            <div className="related-products-section" style={{ marginTop: 40 }}>
              <h3 style={{ marginBottom: 20 }}>Related Products</h3>
              <div className="row">
                {relatedProducts.slice(0, 4).map((rp) => (
                  <div key={rp.id} className="col-xl-3 col-lg-3 col-md-3 col-6">
                    <ProductCard product={rp} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
