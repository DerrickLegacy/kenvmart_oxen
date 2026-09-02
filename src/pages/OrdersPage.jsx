import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ordersApi } from "../services/api";
import Breadcrumb from "../components/layout/Breadcrumb";

const STATUS_OPTS = [
  "All",
  "Pending",
  "Processing",
  "Shipped",
  "Delivered",
  "Cancelled",
];
const STATUS_CLASS = {
  Pending: "order-status--pending",
  Processing: "order-status--processing",
  Shipped: "order-status--shipped",
  Delivered: "order-status--delivered",
  Cancelled: "order-status--cancelled",
};

const formatDate = (iso) =>
  new Date(iso).toLocaleString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
const formatPrice = (p) => `UGX ${Number(p).toLocaleString()}`;

function QtyStepper({ value, onDecrement, onIncrement }) {
  return (
    <div className="order-qty-stepper" aria-label="Quantity stepper">
      <button
        className="order-qty-btn"
        onClick={onDecrement}
        disabled={value <= 1}
        aria-label="Decrease"
      >
        −
      </button>
      <span className="order-qty-value">{value}</span>
      <button
        className="order-qty-btn"
        onClick={onIncrement}
        aria-label="Increase"
      >
        +
      </button>
    </div>
  );
}

export default function OrdersPage() {
  const { user } = useAuth();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [openId, setOpenId] = useState(null);
  const [actionError, setActionError] = useState("");

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = {};
      if (statusFilter !== "All") params.status = statusFilter;
      if (search.trim()) params.q = search.trim();
      const data = await ordersApi.list(params);
      setOrders(data.orders ?? []);
    } catch (err) {
      setError(err.message ?? "Failed to load orders.");
    } finally {
      setLoading(false);
    }
  }, [statusFilter, search]);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      setOrders([]);
      return;
    }
    const t = setTimeout(fetchOrders, 300);
    return () => clearTimeout(t);
  }, [user, fetchOrders]);

  const toggle = (id) => setOpenId((prev) => (prev === id ? null : id));

  const handleCancel = async (orderId) => {
    if (!window.confirm("Cancel this order? This cannot be undone.")) return;
    setActionError("");
    try {
      await ordersApi.cancel(orderId);
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: "Cancelled" } : o)),
      );
      setOpenId((prev) => (prev === orderId ? null : prev));
    } catch (err) {
      setActionError(err.message ?? "Could not cancel order.");
    }
  };

  const handleQtyChange = async (
    orderId,
    productId,
    variant,
    currentQty,
    delta,
  ) => {
    const newQty = currentQty + delta;
    if (newQty < 1) return;
    setActionError("");
    try {
      const updated = await ordersApi.updateItem(
        orderId,
        productId,
        newQty,
        variant,
      );
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, ...updated } : o)),
      );
    } catch (err) {
      setActionError(err.message ?? "Could not update quantity.");
    }
  };

  const handleRemoveItem = async (orderId, productId, variant) => {
    setActionError("");
    try {
      await ordersApi.removeItem(orderId, productId, variant);
      const updated = await ordersApi.get(orderId);
      if (updated.status === "Cancelled") {
        setOrders((prev) => prev.filter((o) => o.id !== orderId));
        setOpenId(null);
      } else {
        setOrders((prev) => prev.map((o) => (o.id === orderId ? updated : o)));
      }
    } catch (err) {
      setActionError(err.message ?? "Could not remove item.");
    }
  };

  if (!user && !loading) {
    return (
      <section className="">
        <div className="container">
          <div data-testid="orders-page" className="orsders-page">
            <div className="my-4">
              <div className="orders-empty">
                <i className="lni lni-package orders-empty-icon"></i>
                <h3>Sign in to view your orders</h3>
                <p>Your order history is saved to your account.</p>
                <Link
                  to="/login"
                  state={{ from: { pathname: "/orders" } }}
                  style={{ backgroundColor: "#3fb1f3" }}
                  className="btn"
                >
                  Sign In
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <div data-testid="orders-page" className="orders-page">
      <div className="container my-4">
        <Breadcrumb
          crumbs={[{ label: "Home", to: "/" }, { label: "My Orders" }]}
        />

        <div className="orders-filter-bar">
          <div className="orders-search-wrap">
            <i className="lni lni-search-alt"></i>
            <input
              type="text"
              className="orders-search-input"
              placeholder="Search by order ID or product…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search orders"
            />
            {search && (
              <button
                className="orders-search-clear"
                onClick={() => setSearch("")}
                aria-label="Clear search"
              >
                <i className="lni lni-close"></i>
              </button>
            )}
          </div>
          <div
            className="orders-status-pills"
            role="group"
            aria-label="Filter by status"
          >
            {STATUS_OPTS.map((s) => (
              <button
                key={s}
                className={`orders-pill${statusFilter === s ? " active" : ""}`}
                onClick={() => setStatusFilter(s)}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {actionError && (
          <div className="alert alert-danger my-2" role="alert">
            {actionError}
          </div>
        )}

        {loading ? (
          <div className="orders-loading" aria-live="polite">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="order-skeleton-row" aria-hidden="true" />
            ))}
          </div>
        ) : error ? (
          <div className="alert alert-danger">
            {error}
            <button className="btn btn-sm ms-3" onClick={fetchOrders}>
              Retry
            </button>
          </div>
        ) : orders.length === 0 ? (
          <div className="orders-empty">
            <i className="lni lni-package orders-empty-icon"></i>
            <h3>No orders yet</h3>
            <p>Add items to your cart and send your first order.</p>
            <Link to="/products" className="btn">
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="orders-accordion">
            {orders.map((order, idx) => {
              const isOpen = openId === order.id;
              const isPending = order.status === "Pending";
              const isLatest = idx === 0 && statusFilter === "All" && !search;

              return (
                <div
                  key={order.id}
                  className={`order-accordion-item${isOpen ? " open" : ""}`}
                >
                  <button
                    className="order-accordion-header"
                    onClick={() => toggle(order.id)}
                    aria-expanded={isOpen}
                  >
                    <div className="oah-left">
                      <span className="oah-id">{order.id}</span>
                      <span className="oah-sep">·</span>
                      <span className="oah-date">
                        {formatDate(order.placed_at ?? order.placedAt)}
                      </span>
                      <span className="oah-sep">·</span>
                      <span className="oah-total">
                        {formatPrice(order.total)}
                      </span>
                      {isLatest && (
                        <span className="oah-latest-badge">Latest</span>
                      )}
                    </div>
                    <div className="oah-right">
                      <span
                        className={`order-status ${STATUS_CLASS[order.status] ?? ""}`}
                      >
                        {order.status}
                      </span>
                      <i
                        className={`lni ${isOpen ? "lni-chevron-up" : "lni-chevron-down"} oah-caret`}
                      ></i>
                    </div>
                  </button>

                  {isOpen && (
                    <div className="order-accordion-body">
                      <div className="order-items">
                        {(order.items ?? []).map((item, i) => (
                          <div
                            key={`${item.product_id ?? item.productId}::${item.variant ?? ""}::${i}`}
                            className="order-item"
                          >
                            <img
                              src={item.image}
                              alt={item.name}
                              className="order-item-img"
                              onError={(e) => {
                                e.currentTarget.style.visibility = "hidden";
                              }}
                            />
                            <div className="order-item-info">
                              <span className="order-item-name">
                                {item.name}
                              </span>
                              {item.variant && (
                                <span className="order-item-variant">
                                  {item.variant}
                                </span>
                              )}
                              {isPending ? (
                                <div className="order-item-edit-row">
                                  <QtyStepper
                                    value={item.quantity}
                                    onDecrement={() =>
                                      handleQtyChange(
                                        order.id,
                                        item.product_id ?? item.productId,
                                        item.variant,
                                        item.quantity,
                                        -1,
                                      )
                                    }
                                    onIncrement={() =>
                                      handleQtyChange(
                                        order.id,
                                        item.product_id ?? item.productId,
                                        item.variant,
                                        item.quantity,
                                        1,
                                      )
                                    }
                                  />
                                  <span className="order-item-unit-price">
                                    × {formatPrice(item.price)}
                                  </span>
                                </div>
                              ) : (
                                <span className="order-item-qty">
                                  {item.quantity} × {formatPrice(item.price)}
                                </span>
                              )}
                            </div>

                            <span className="order-item-subtotal">
                              {formatPrice(item.price * item.quantity)}
                            </span>

                            {isPending && (
                              <button
                                className="order-item-remove"
                                onClick={() =>
                                  handleRemoveItem(
                                    order.id,
                                    item.product_id ?? item.productId,
                                    item.variant,
                                  )
                                }
                                aria-label={`Remove ${item.name}`}
                                title="Remove item"
                              >
                                ×
                              </button>
                            )}
                          </div>
                        ))}
                      </div>

                      <div className="order-totals-summary">
                        <div className="order-totals-row">
                          <span>
                            Subtotal (
                            {(order.items ?? []).reduce(
                              (s, it) => s + it.quantity,
                              0,
                            )}{" "}
                            items)
                          </span>
                          <span>{formatPrice(order.total)}</span>
                        </div>
                        <div className="order-totals-row">
                          <span>Shipping</span>
                          <span className="text-success">To be confirmed</span>
                        </div>
                        <div className="order-totals-row order-totals-total">
                          <span>Order Total</span>
                          <span>{formatPrice(order.total)}</span>
                        </div>
                      </div>

                      {isPending && (
                        <div className="order-cancel-row">
                          <button
                            className="btn order-cancel-btn"
                            onClick={() => handleCancel(order.id)}
                          >
                            <i className="lni lni-trash-can"></i> Cancel Order
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
