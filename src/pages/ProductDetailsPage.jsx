import { useState, useEffect, useRef } from "react";
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
import ReviewModal from "../components/product/ReviewModal";
import ProductCard from "../components/product/ProductCard";
import RecentlyViewed from "../components/home/RecentlyViewed";
import HorizontalCategoryNav from "../components/home/HorizontalCategoryNav";

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
  const { state: cartItems, dispatch: cartDispatch, updateQuantity, addToCart } = useCart();
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

  const [selectedColor, setSelectedColor] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const [apiBusy, setApiBusy] = useState(false);
  const [localError, setLocalError] = useState("");
  const [deliveryType, setDeliveryType] = useState("pickup");
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [votingReviewId, setVotingReviewId] = useState(null);

  // Calculate return date (current + 60 days)
  const returnDate = new Date();
  returnDate.setDate(returnDate.getDate() + 60);
  const formattedReturnDate = returnDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  useEffect(() => {
    const raw = localStorage.getItem(RECENTLY_VIEWED_KEY);
    if (raw) {
      try {
        const items = JSON.parse(raw);
        // Don't show the current product in the recently viewed list
        setRecentlyViewed(items.filter(p => p.id !== product?.id).slice(0, 4));
      } catch (e) {
        setRecentlyViewed([]);
      }
    }
  }, [product?.id]);

  // Sync quantity from cart when product or cart changes
  useEffect(() => {
    if (!product) return;
    const cleanId = String(product.id).replace(/^prod-/, '');

    // Construct variant string to match cart items
    const color = product.colors?.[selectedColor];
    const variantParts = [];
    if (color) variantParts.push(`Color: ${color}`);
    if (selectedVariant) variantParts.push(selectedVariant);
    const variant = variantParts.join(', ') || null;

    const itemInCart = cartItems.find(i => String(i.productId).replace(/^prod-/, '') === cleanId && i.variant === variant);
    if (itemInCart) {
      setQuantity(itemInCart.quantity);
    } else {
      setQuantity(1);
    }
  }, [product, cartItems, selectedVariant, selectedColor]);

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

  useEffect(() => {
    if (product?.variants?.length) {
      setSelectedVariant(product.variants[0]);
    } else {
      setSelectedVariant("");
    }
    setSelectedColor(0);
  }, [id, product?.variants]);

  const hasDiscount = (product?.discount_price ?? product?.discountPrice) != null;

  const [activeAccordion, setActiveAccordion] = useState("details");

  const toggleAccordion = (id) => {
    setActiveAccordion(activeAccordion === id ? null : id);
  };

  const accordionItems = product
    ? [
      { id: "details", title: "Details", content: product.description },
      {
        id: "features",
        title: "Features",
        content:
          product.features && product.features.length > 0 ? (
            <ul className="features-list">
              {product.features.map((f, i) => (
                <li key={i}>{f}</li>
              ))}
            </ul>
          ) : null,
      },
      {
        id: "specs",
        title: "Specifications",
        content:
          product.specifications &&
            Object.keys(product.specifications).length > 0 ? (
            <ul className="specs-list">
              {Object.entries(product.specifications).map(([key, val]) => (
                <li key={key}>
                  <strong>{key}:</strong> {String(val)}
                </li>
              ))}
            </ul>
          ) : null,
      },
      { id: "warranty", title: "Warranty", content: product.warranty_info },
      {
        id: "reviews_summary",
        title: "Reviews summary",
        content: (
          <div className="reviews-summary-content">
            <div
              style={{
                background: "#e7f3ff",
                color: "#183B9B",
                display: "inline-block",
                padding: "4px 12px",
                borderRadius: "15px",
                fontSize: "14px",
                fontWeight: 700,
                marginBottom: 16,
              }}
            >
              Pros
            </div>
            <ul className="features-list">
              <li>Fast phone charging: It powers multiple devices quickly.</li>
              <li>Multiple usb ports: Has several ports for simultaneous device charging.</li>
              <li>Fast laptop charging: Charges laptops quickly alongside other devices.</li>
            </ul>
            <div style={{ fontSize: "12px", color: "#74767c", marginTop: 12 }}>
              Generated by AI <i className="lni lni-question-circle"></i>
            </div>
          </div>
        ),
      },
    ].filter((item) => item.content)
    : [];

  const isWishlisted = product
    ? wishlistState.some((item) => item.productId === product.id)
    : false;

  const handleQtyChange = async (newQty) => {
    if (!product || newQty < 1 || newQty > 99) return;
    setQuantity(newQty);

    const cleanId = String(product.id).replace(/^prod-/, "");
    const itemInCart = cartItems.find(
      (i) =>
        String(i.productId).replace(/^prod-/, "") === cleanId &&
        i.variant === (selectedVariant || null)
    );

    if (itemInCart) {
      await updateQuantity(cleanId, selectedVariant || null, newQty);
    }
  };

  const handleAddToCart = async () => {
    if (!product) return;

    // Construct variant string: combine color and selected variant
    const color = product.colors?.[selectedColor];
    const variantParts = [];
    if (color) variantParts.push(`Color: ${color}`);
    if (selectedVariant) variantParts.push(selectedVariant);
    const variant = variantParts.join(', ') || null;

    const cleanId = String(product.id).replace(/^prod-/, "");

    const itemInCart = cartItems.find(
      (i) =>
        String(i.productId).replace(/^prod-/, "") === cleanId &&
        i.variant === variant
    );

    if (itemInCart) {
      if (itemInCart.quantity !== quantity) {
        await updateQuantity(cleanId, variant, quantity);
      }
    } else {
      await addToCart(product, variant, quantity);
    }

    if (isWishlisted) {
      wishlistDispatch({
        type: "REMOVE_FROM_WISHLIST",
        payload: { productId: product.id },
      });
      if (user) {
        try {
          await wishlistApi.remove(product.id);
        } catch { }
      }
    }

    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 3000);
  };

  const handleToggleWishlist = async () => {
    if (!product) return;
    if (isWishlisted) {
      wishlistDispatch({
        type: "REMOVE_FROM_WISHLIST",
        payload: { productId: product.id },
      });
      if (user) {
        try {
          await wishlistApi.remove(product.id);
        } catch { }
      }
    } else {
      wishlistDispatch({ type: "ADD_TO_WISHLIST", payload: { product } });
      if (user) {
        try {
          await wishlistApi.add(product.id);
        } catch { }
      }
    }
  };

  const handleVote = async (reviewId, voteValue) => {
    if (!user) {
      toast.error("Please sign in to vote on reviews.");
      return;
    }

    setVotingReviewId(reviewId);
    try {
      const response = await productsApi.submitReviewVote(reviewId, voteValue);
      if (response.status) {
        toast.success(voteValue === 1 ? "Marked as helpful!" : "Vote submitted.");
        refetch(); // Reload reviews to show updated counts
      }
    } catch (err) {
      toast.error(err.message || "Failed to submit vote.");
    } finally {
      setVotingReviewId(null);
    }
  };

  if (loading) {
    return (
      <div data-testid="product-details-page" className="container section">
        <div className="row">
          <div className="col-lg-6 col-md-12">
            {/* Gallery Skeleton */}
            <div style={{ display: "flex", gap: "16px", height: "500px" }}>
              <div style={{ flex: "0 0 100px", display: "flex", flexDirection: "column", gap: "8px", overflow: "hidden" }}>
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="skeleton-block" style={{ height: "85px", minHeight: "85px", width: "100%", borderRadius: "8px" }} />
                ))}
              </div>
              <div className="skeleton-block" style={{ flex: 1, height: "100%", borderRadius: "12px" }} />
            </div>
          </div>
          <div className="col-lg-6 col-md-12">
            <div className="skeleton-block" style={{ height: "36px", width: "85%", marginBottom: "16px" }} />
            <div className="skeleton-block" style={{ height: "20px", width: "40%", marginBottom: "24px" }} />

            <div style={{ display: "flex", gap: "12px", marginBottom: "24px", alignItems: "center" }}>
              <div className="skeleton-block" style={{ height: "20px", width: "100px" }} />
              <div style={{ height: "16px", width: "1px", background: "#e2e8f0" }} />
              <div className="skeleton-block" style={{ height: "20px", width: "120px" }} />
            </div>

            <div className="skeleton-block" style={{ height: "48px", width: "35%", marginBottom: "24px" }} />
            <div className="skeleton-block" style={{ height: "80px", width: "100%", marginBottom: "32px" }} />

            <div className="row mb-4">
              <div className="col-4">
                <div className="skeleton-block" style={{ height: "60px", width: "100%" }} />
              </div>
              <div className="col-4">
                <div className="skeleton-block" style={{ height: "60px", width: "100%" }} />
              </div>
              <div className="col-4">
                <div className="skeleton-block" style={{ height: "60px", width: "100%" }} />
              </div>
            </div>

            <div className="row g-3">
              <div className="col-lg-4 col-md-4 col-12">
                <div className="skeleton-block" style={{ height: "50px", width: "100%", borderRadius: "25px" }} />
              </div>
              <div className="col-lg-4 col-md-4 col-12">
                <div className="skeleton-block" style={{ height: "50px", width: "100%", borderRadius: "8px" }} />
              </div>
              <div className="col-lg-4 col-md-4 col-12">
                <div className="skeleton-block" style={{ height: "50px", width: "100%", borderRadius: "8px" }} />
              </div>
            </div>
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

  return (
    <div data-testid="product-details-page mt-3">
      <style>{`
        .walmart-sticky-card {
          position: sticky;
          top: 100px;
          background: #fff;
          border: 1px solid #e8ecf0;
          border-radius: 12px;
          padding: 24px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.05);
          z-index: 10;
        }
        .price-label { font-size: 14px; color: #464b56; margin-bottom: 4px; }
        .main-price { font-size: 32px; font-weight: 700; color: #000; margin-bottom: 8px; }
        .shipping-info { display: flex; align-items: center; justify-content: space-between; gap: 8px; font-size: 14px; color: #2e2f32; margin-top: 12px; }
        .shipping-info .shipping-item { display: inline-flex; align-items: center; gap: 6px; white-space: nowrap; }
        .shipping-info i { color: #0071dc; }
        .color-swatches { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 8px; }
        .color-swatch {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          border: 1px solid #d5d5d5;
          padding: 0;
          cursor: pointer;
          transition: transform 0.15s ease, box-shadow 0.15s ease;
        }
        .color-swatch:hover { transform: scale(1.1); }
        .color-swatch.selected { box-shadow: 0 0 0 2px #fff, 0 0 0 4px #183B9B; }
        .add-to-cart-walmart {
          background: #f59e0b;
          color: #fff;
          border: none;
          border-radius: 25px;
          padding: 12px;
          width: 100%;
          font-weight: 700;
          margin-top: 20px;
          cursor: pointer;
          transition: background 0.2s;
        }
        .add-to-cart-walmart:hover { background: #edb24dff; }
        
        .delivery-options {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 8px;
          margin-top: 24px;
        }
        .delivery-box {
          border: 1px solid #e8ecf0;
          border-radius: 8px;
          padding: 12px 8px;
          text-align: center;
          font-size: 12px;
          cursor: pointer;
          transition: all 0.2s ease;
          background: #fff;
        }
        .delivery-box.active { 
          border: 2px solid #183B9B; 
          padding: 11px 7px;
          background: #f0f7ff;
        }
        .delivery-box img { width: 24px; height: 24px; margin-bottom: 8px; }
        .delivery-box .type { font-weight: 700; display: block; }
        .delivery-box .status { color: #183B9B; font-weight: 600; display: block; margin-top: 4px; }
        
        .delivery-details-content {
          margin-top: 16px;
          padding: 16px;
          background: #fdfaf5;
          border-radius: 8px;
          border-left: 4px solid #f59e0b;
          font-size: 13px;
          line-height: 1.5;
        }
        .delivery-details-content strong {
          color: #183B9B;
          display: block;
          margin-bottom: 4px;
        }
        .delivery-details-content p {
          margin: 0;
          color: #464b56;
        }
        .delivery-details-content .contact-link {
          color: #f59e0b;
          font-weight: 700;
          text-decoration: none;
          display: inline-block;
          margin-top: 8px;
        }
        .delivery-details-content ul {
          padding-left: 18px;
          margin-top: 8px;
        }
        .delivery-details-content li {
          margin-bottom: 4px;
        }
        
        .accordion-row {
          border: 1px solid #e8ecf0;
          border-radius: 8px;
          margin-bottom: 12px;
          overflow: hidden;
        }
        .accordion-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 20px;
          cursor: pointer;
          font-weight: 700;
          font-size: 16px;
          background: #fff;
        }
        .accordion-content {
          padding: 0 20px 20px;
          font-size: 15px;
          line-height: 1.6;
          color: #464b56;
          border-top: 1px solid #f8f9fa;
        }
        .features-list, .specs-list {
          list-style: disc;
          padding-left: 20px;
        }
        .features-list li, .specs-list li { margin-bottom: 6px; }

        .reviews-section { margin-top: 40px; }
        .reviews-summary-card {
          background: #f8f9fa;
          border-radius: 12px;
          padding: 24px;
          margin-bottom: 24px;
        }
        .rating-bars { margin-top: 20px; }
        .rating-bar-row { display: flex; align-items: center; gap: 12px; margin-bottom: 8px; font-size: 14px; }
        .rating-bar-bg { flex: 1; height: 8px; background: #e8ecf0; border-radius: 4px; overflow: hidden; }
        .rating-bar-fill { height: 100%; background: #0071dc; }
      `}</style>
      <section className="item-details mb-2">
        <HorizontalCategoryNav />
        <div className="container my-4">
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

          <div className="top-area my-4">
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

                  <div style={{ margin: '8px 0 12px', display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                    <StarRating rating={product.rating || 0} showLabel={false} />
                    <span style={{ color: '#464b56', fontSize: '14px' }}>
                      {product.rating ? product.rating.toFixed(1) : '0.0'} Review(s)
                    </span>
                    <span style={{ color: '#e8ecf0' }}>|</span>
                    <span style={{ color: '#74767c', fontSize: '14px' }}>
                      {product.rating_count || 0} ratings
                    </span>
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
                          <div className="color-swatches">
                            {product.colors.map((color, i) => (
                              <button
                                type="button"
                                key={`${color}-${i}`}
                                className={`color-swatch${selectedColor === i ? " selected" : ""}`}
                                style={{ backgroundColor: color }}
                                onClick={() => setSelectedColor(i)}
                                aria-label={`Select color ${color}`}
                                title={color}
                              />
                            ))}
                          </div>
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
                              handleQtyChange(quantity - 1)
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
                              handleQtyChange(quantity + 1)
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
                          View Cart
                        </Link>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col-lg-8 col-12">
              {/* Accordions */}
              <div className="product-accordions-wrapper">
                {accordionItems.map((item) => (
                  <div key={item.id} className="accordion-row">
                    <div
                      className="accordion-header"
                      onClick={() => toggleAccordion(item.id)}
                    >
                      <span>{item.title}</span>
                      <i
                        className={`lni ${activeAccordion === item.id
                          ? "lni-chevron-up"
                          : "lni-chevron-down"
                          }`}
                      ></i>
                    </div>
                    <AnimatePresence>
                      {activeAccordion === item.id && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="accordion-content"
                        >
                          {typeof item.content === "string" ? (
                            <p>{item.content}</p>
                          ) : (
                            item.content
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>

              {/* Related Products */}
              {relatedProducts.length > 0 && (
                <div
                  className="related-products-section"
                  style={{ marginTop: 40 }}
                >
                  <h3 style={{ marginBottom: 20 }}>Related Products</h3>
                  <div className="row">
                    {relatedProducts.slice(0, 4).map((rp) => (
                      <div
                        key={rp.id}
                        className="col-xl-3 col-lg-3 col-md-3 col-6"
                      >
                        <ProductCard product={rp} />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Customer Ratings & Reviews */}
              <div className="reviews-section">
                <div className="d-flex justify-content-between align-items-center">
                  <h3>Customer ratings & reviews</h3>
                  <button
                    className="btn btn-sm px-3 py-2"
                    onClick={() => setIsReviewModalOpen(true)}
                    style={{ background: '#183B9B', color: '#fff', borderRadius: '8px', fontWeight: 600 }}
                  >
                    Write a Review
                  </button>
                </div>
                <div className="row align-items-center mt-4">
                  <div className="col-md-4 text-center">
                    <div style={{ fontSize: "48px", fontWeight: 700 }}>
                      {product.rating || "0.0"}
                    </div>

                    <div style={{ color: "#464b56", marginTop: 8 }}>
                      <StarRating rating={product.rating || 0} />
                      {product.rating_count || 0} ratings
                    </div>
                  </div>
                  <div className="col-md-8">
                    <div className="rating-bars">
                      {[5, 4, 3, 2, 1].map((star) => {
                        const count =
                          product.reviews?.filter((r) => Math.round(r.rating) === star)
                            .length || 0;
                        const total = product.reviews?.length || 1;
                        const percent = (count / total) * 100;
                        return (
                          <div key={star} className="rating-bar-row">
                            <span style={{ width: "50px" }}>{star} stars</span>
                            <div className="rating-bar-bg">
                              <div
                                className="rating-bar-fill"
                                style={{ width: `${percent}%` }}
                              ></div>
                            </div>
                            <span style={{ width: "40px" }}>{count}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Actual Reviews List */}
                <div className="mt-4">
                  {product.reviews && product.reviews.length > 0 ? (
                    product.reviews.map((r) => (
                      <div
                        key={r.id}
                        className="review-item"
                        style={{ borderBottom: "1px solid #eee", padding: "20px 0" }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center"
                          }}
                        >
                          <strong>{r.reviewer_name}</strong>
                          <span style={{ color: "#888", fontSize: "0.85rem" }}>
                            {r.created_at
                              ? new Date(r.created_at).toLocaleDateString()
                              : ""}
                          </span>
                        </div>
                        <div className="d-flex align-items-center gap-2">
                          <StarRating rating={r.rating} />
                          {r.verified_purchase && (
                            <span className="badge bg-success-subtle text-success border border-success-subtle" style={{ fontSize: '10px' }}>
                              <i className="lni lni-checkmark-circle me-1"></i>
                              Verified Purchase
                            </span>
                          )}
                        </div>
                        {r.comment && (
                          <p style={{ marginTop: 8, color: "#2e2f32" }}>
                            {r.comment}
                          </p>
                        )}
                        <div className="mt-2 d-flex align-items-center gap-3">
                          <button
                            className="btn btn-sm border-0 p-0 text-muted"
                            style={{ fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}
                            onClick={() => handleVote(r.id, 1)}
                            disabled={votingReviewId === r.id}
                          >
                            <i className="lni lni-thumbs-up"></i>
                            Helpful ({r.helpful_count || 0})
                          </button>
                          <button
                            className="btn btn-sm border-0 p-0 text-muted"
                            style={{ fontSize: '12px' }}
                            onClick={() => handleVote(r.id, -1)}
                            disabled={votingReviewId === r.id}
                          >
                            Report
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p>No reviews yet.</p>
                  )}
                </div>
              </div>
            </div>

            <div className="col-lg-4 col-12 d-none d-lg-block mb-2">
              <div className="walmart-sticky-card">
                <div className="price-label">Price when purchased online <i className="lni lni-question-circle"></i></div>
                <div className="main-price">Shs. {formatUgxPrice(effectivePrice(product))}</div>

                <div className="shipping-info">
                  <span className="shipping-item">
                    <i className="lni lni-delivery"></i> Free delivery
                  </span>
                  <span className="shipping-item">
                    <i className="lni lni-reload"></i> Free returns until {formattedReturnDate}
                  </span>
                </div>

                <button
                  className="add-to-cart-walmart"
                  onClick={handleAddToCart}
                  disabled={apiBusy}
                >
                  {apiBusy ? "Adding..." : "Add to cart"}
                </button>

                <div className="mt-4" style={{ fontSize: '14px', display: 'flex', alignItems: 'center' }}>
                  <strong>Actual Color:</strong>
                  <span style={{ marginLeft: 8, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                    <span
                      style={{
                        width: 14,
                        height: 14,
                        borderRadius: '50%',
                        border: '1px solid #d5d5d5',
                        display: 'inline-block',
                        backgroundColor: product.colors?.[selectedColor] || 'transparent',
                      }}
                    />
                  </span>
                  <a href="#" style={{ marginLeft: 'auto', color: '#000', textDecoration: 'underline' }}>Edit selections</a>
                </div>

                <div className="mt-4">
                  <strong>How you'll get this item:</strong>
                  <div className="delivery-options">
                    <div
                      className={`delivery-box ${deliveryType === "pickup" ? "active" : ""
                        }`}
                      onClick={() => setDeliveryType("pickup")}
                    >
                      <i
                        className="lni lni-restaurant"
                        style={{
                          fontSize: "24px",
                          display: "block",
                          marginBottom: 8,
                          color:
                            deliveryType === "pickup" ? "#183B9B" : "#74767c",
                        }}
                      ></i>
                      <span className="type">Pickup</span>
                      <span className="status">Ready</span>
                    </div>
                    <div
                      className={`delivery-box ${deliveryType === "shipping" ? "active" : ""
                        }`}
                      onClick={() => setDeliveryType("shipping")}
                    >
                      <i
                        className="lni lni-delivery"
                        style={{
                          fontSize: "24px",
                          display: "block",
                          marginBottom: 8,
                          color:
                            deliveryType === "shipping" ? "#183B9B" : "#74767c",
                        }}
                      ></i>
                      <span className="type">Shipping</span>
                      <span className="status">Available</span>
                    </div>

                    <div
                      className={`delivery-box ${deliveryType === "delivery" ? "active" : ""
                        }`}
                      onClick={() => setDeliveryType("delivery")}
                    >
                      <i
                        className="lni lni-package"
                        style={{
                          fontSize: "24px",
                          display: "block",
                          marginBottom: 8,
                          color:
                            deliveryType === "delivery" ? "#183B9B" : "#74767c",
                        }}
                      ></i>
                      <span className="type">Delivery</span>
                      <span className="status">Local</span>
                    </div>
                  </div>

                  {/* Delivery Details Content */}
                  <motion.div
                    key={deliveryType}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="delivery-details-content"
                  >
                    {deliveryType === "pickup" && (
                      <>
                        <strong>Kenvies Stores</strong>
                        <p>Kisa Kya Maria Building Complex</p>
                        <p>Shop no. B115 and 116</p>
                        <p>Kampala</p>
                        <a href="tel:+256704487386" className="contact-link">
                          <i className="lni lni-phone"></i> +256 704 487386
                        </a>
                      </>
                    )}
                    {deliveryType === "shipping" && (
                      <>
                        <strong>Uganda Wide Shipping</strong>
                        <p>
                          Arrives within 24 hours if you order within 5 hours
                          from now.
                        </p>
                        <ul className="normal-list" style={{ padding: 0, listStyle: 'none', marginTop: 8 }}>
                          <li>
                            <i
                              className="lni lni-checkmark-circle"
                              style={{ color: "#f59e0b", marginRight: 6 }}
                            ></i>
                            Only within Uganda Business Districts
                          </li>
                          <li>
                            <i
                              className="lni lni-warning"
                              style={{ color: "#f59e0b", marginRight: 6 }}
                            ></i>
                            Price does not include shipping fees
                          </li>
                        </ul>
                      </>
                    )}
                    {deliveryType === "delivery" && (
                      <>
                        <strong>Local Home Delivery</strong>
                        <p>Available within Kampala & neighboring districts.</p>
                        <ul className="normal-list" style={{ padding: 0, listStyle: 'none', marginTop: 8 }}>
                          <li>
                            <i
                              className="lni lni-star-filled"
                              style={{ color: "#f59e0b", marginRight: 6 }}
                            ></i>
                            Free for goods worth 600,000+ UGX
                          </li>
                          <li>
                            <i
                              className="lni lni-tag"
                              style={{ color: "#f59e0b", marginRight: 6 }}
                            ></i>
                            Low fee applied for smaller orders
                          </li>
                        </ul>
                      </>
                    )}
                  </motion.div>
                </div>


                <div className="mt-4 pt-3" style={{ borderTop: '1px solid #e8ecf0', fontSize: '14px' }}>
                  <i className="lni lni-home" style={{ marginRight: 8 }}></i>
                  Sold by <strong>Kenvies Official Store</strong>
                  <div style={{ marginTop: 4, color: '#74767c' }}>Fulfilled by Kenvies General Merchandise Ltd.</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Recently Viewed — full-width at the bottom of the page */}
      <RecentlyViewed items={recentlyViewed} />

      {product && (
        <ReviewModal
          productId={product.id}
          isOpen={isReviewModalOpen}
          onClose={() => setIsReviewModalOpen(false)}
          onReviewSubmitted={refetch}
        />
      )}
    </div>
  );
}
