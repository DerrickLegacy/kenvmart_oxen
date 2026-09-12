import { Link } from 'react-router-dom';
import { useCart } from '../../../context/CartContext';

export default function CartDropdown() {
  const { state: cartItems } = useCart();
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="cart-items cart-items--simple">
      <Link
        to="/cart"
        className="main-btn"
        aria-label="Cart"
      >
        <i className="lni lni-cart"></i>
        <span className="total-items" data-testid="cart-badge">{totalItems}</span>
      </Link>
    </div>
  );
}
