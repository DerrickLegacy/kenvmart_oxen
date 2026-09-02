import { Link } from 'react-router-dom';
import { useCart } from '../../../context/CartContext';

export default function CartDropdown() {
  const { state: cartItems, dispatch } = useCart();

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const removeItem = (productId, variant) => {
    dispatch({ type: 'REMOVE_FROM_CART', payload: { productId, variant } });
  };

  return (
    <div className="cart-items">
      <a href="#" className="main-btn">
        <i className="lni lni-cart"></i>
        <span className="total-items" data-testid="cart-badge">{totalItems}</span>
      </a>
      <div className="shopping-item">
        <div className="dropdown-cart-header">
          <span>{totalItems} Items</span>
          <Link to="/cart">View Cart</Link>
        </div>
        <ul className="shopping-list">
          {cartItems.map((item) => (
            <li key={`${item.productId}::${item.variant ?? ''}`}>
              <button
                className="remove"
                title="Remove this item"
                onClick={() => removeItem(item.productId, item.variant)}
              >
                <i className="lni lni-close"></i>
              </button>
              <div className="cart-img-head">
                <Link className="cart-img" to={`/product/${item.productId}`}>
                  <img
                    src={item.image}
                    alt={item.name}
                    onError={e => { e.currentTarget.src = '/assets/images/placeholder.jpg'; }}
                  />
                </Link>
              </div>
              <div className="content">
                <h4><Link to={`/product/${item.productId}`}>{item.name}</Link></h4>
                <p className="quantity">
                  {item.quantity}x -{' '}
                  <span className="amount">${(item.price * item.quantity).toFixed(2)}</span>
                </p>
              </div>
            </li>
          ))}
        </ul>
        <div className="bottom">
          <div className="total">
            <span>Total</span>
            <span className="total-amount" data-testid="cart-total">${totalAmount.toFixed(2)}</span>
          </div>
          <div className="button">
            <Link to="/cart" className="btn animate">Checkout</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
