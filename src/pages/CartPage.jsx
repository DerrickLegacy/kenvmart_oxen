import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart }    from '../context/CartContext';
import { useAuth }    from '../context/AuthContext';
import { ordersApi, cartApi } from '../services/api';
import Breadcrumb from '../components/layout/Breadcrumb';

const formatPrice = (p) => `${Number(p).toLocaleString()}`;

export default function CartPage() {
  const { state: cartItems, dispatch } = useCart();
  const { user } = useAuth();
  const navigate  = useNavigate();
  const [sending, setSending]   = useState(false);
  const [sent,    setSent]      = useState(false);
  const [error,   setError]     = useState('');

  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const updateQty = (productId, variant, qty) => {
    const clamped = Math.min(Math.max(qty, 1), 99);
    dispatch({ type: 'UPDATE_QUANTITY', payload: { productId, variant, quantity: clamped } });
    if (user) {
      cartApi.update(productId, clamped, variant).catch(() => {});
    }
  };

  const removeItem = (productId, variant) => {
    dispatch({ type: 'REMOVE_FROM_CART', payload: { productId, variant } });
    if (user) {
      cartApi.remove(productId, variant).catch(() => {});
    }
  };

  const handleSendOrder = async () => {
    if (cartItems.length === 0) return;
    setSending(true);
    setError('');
    try {
      if (user) {
        const items = cartItems.map(item => ({
          product_id:     item.productId,
          name:           item.name,
          price:          item.price,
          original_price: item.originalPrice ?? item.price,
          quantity:       item.quantity,
          variant:        item.variant ?? null,
          image:          item.image ?? null,
        }));
        await ordersApi.place(items);
        await cartApi.clear();
      }
      dispatch({ type: 'CLEAR_CART' });
      setSent(true);
      setTimeout(() => navigate('/orders'), 1800);
    } catch (err) {
      setError(err.message ?? 'Failed to place order. Please try again.');
    } finally {
      setSending(false);
    }
  };

  if (cartItems.length === 0 && !sent) {
    return (
      <div data-testid="cart-page" className="shopping-cart">
        <div className="container">
          <div className="cart-empty">
            <i className="lni lni-cart cart-empty-icon"></i>
            <h3>Your cart is empty</h3>
            <p>Browse our products and add items to your cart.</p>
            <Link to="/products" className="btn">Continue Shopping</Link>
          </div>
        </div>
      </div>
    );
  }

  if (sent) {
    return (
      <div data-testid="cart-page" className="shopping-cart ">
        <div className="container">
          <div className="cart-sent">
            <i className="lni lni-checkmark-circle cart-sent-icon"></i>
            <h3>Order Sent!</h3>
            <p>Your order has been received and is being reviewed. Redirecting to your orders…</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div data-testid="cart-page" className="shopping-cart ">
      <div className="container">
        <Breadcrumb crumbs={[{ label: 'Home', to: '/' }, { label: 'Cart' }]} />

        {error && (
          <div className="alert alert-danger mb-3" role="alert">{error}</div>
        )}

        <div className="row">
          <div className="col-lg-8 col-12">
            <div className="cart-list-wrap">
              <div className="cart-header d-none d-md-flex">
                <span className="cart-header-product">Product</span>
                <span className="cart-header-price">Price</span>
                <span className="cart-header-qty">Qty</span>
                <span className="cart-header-subtotal">Subtotal</span>
                <span className="cart-header-remove"></span>
              </div>

              {cartItems.map(item => {
                const key      = `${item.productId}::${item.variant ?? ''}`;
                const subtotal = item.price * item.quantity;
                return (
                  <div key={key} className="cart-row" data-testid="cart-item">
                    <div className="cart-product">
                      <Link to={`/product/${item.productId}`} className="cart-product-img-link">
                        <img
                          src={item.image || '/assets/images/placeholder.jpg'}
                          alt={item.name}
                          className="cart-product-img"
                          onError={e => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = '/assets/images/placeholder.jpg';
                          }}
                        />
                      </Link>
                      <div className="cart-product-info">
                        <h6 className="cart-product-name">
                          <Link to={`/product/${item.productId}`}>{item.name}</Link>
                        </h6>
                        {item.variant && (
                          <span className="cart-product-variant">{item.variant}</span>
                        )}
                      </div>
                    </div>

                    <div className="cart-price">
                      <span className="cart-label d-md-none">Price: </span>
                      {formatPrice(item.price)}
                    </div>

                    <div className="cart-qty">
                      <span className="cart-label d-md-none">Qty: </span>
                      <div className="cart-qty-stepper">
                        <button className="cart-qty-btn" aria-label="Decrease"
                          onClick={() => updateQty(item.productId, item.variant, item.quantity - 1)}>−</button>
                        <span className="cart-qty-value">{item.quantity}</span>
                        <button className="cart-qty-btn" aria-label="Increase"
                          onClick={() => updateQty(item.productId, item.variant, item.quantity + 1)}>+</button>
                      </div>
                    </div>

                    <div className="cart-subtotal">
                      <span className="cart-label d-md-none">Subtotal: </span>
                      <strong>{formatPrice(subtotal)}</strong>
                    </div>

                    <div className="cart-remove">
                      <button className="cart-remove-btn"
                        aria-label={`Remove ${item.name}`}
                        onClick={() => removeItem(item.productId, item.variant)}>
                        <i className="lni lni-close"></i>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="cart-actions mb-3">
              <Link to="/products" className="btn cart-continue-btn">
                <i className="lni lni-arrow-left"></i> Continue Shopping
              </Link>
            </div>
          </div>

          <div className="col-lg-4 col-12">
            <div className="cart-summary-panel">
              <h4 className="cart-summary-title">Order Summary</h4>
              <div className="cart-summary-lines">
                {cartItems.map(item => (
                  <div key={`${item.productId}::${item.variant ?? ''}`} className="cart-summary-line">
                    <span className="cart-summary-line-name">
                      {item.name}{item.variant ? ` (${item.variant})` : ''} × {item.quantity}
                    </span>
                    <span className="cart-summary-line-price">
                      {formatPrice(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>
              <div className="cart-summary-divider"></div>
              <div className="cart-summary-total">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>

              {!user && (
                <p className="cart-summary-note">
                  <i className="lni lni-information"></i>&nbsp;
                  <Link to="/login" state={{ from: { pathname: '/cart' } }}>Sign in</Link>
                  {' '}to save your order history.
                </p>
              )}

              <p className="cart-summary-note">
                <i className="lni lni-information"></i>&nbsp;
                No payment required — we&apos;ll review your order and contact you about shipping.
              </p>

              <button
                className="btn cart-send-btn"
                onClick={handleSendOrder}
                disabled={sending}
                data-testid="send-order-btn"
              >
                <i className="lni lni-send"></i>
                {sending ? ' Placing order…' : ' Send Order'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
