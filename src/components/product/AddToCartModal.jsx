import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';

export default function AddToCartModal({ product, isOpen, onClose }) {
  const { state: cartItems, dispatch, updateQuantity, addToCart } = useCart();

  // Find existing quantity in cart
  const cleanId = String(product?.id || '').replace(/^prod-/, '');
  const cartItem = cartItems.find(item => String(item.productId).replace(/^prod-/, '') === cleanId);
  const [quantity, setQuantity] = useState(cartItem ? cartItem.quantity : 1);

  useEffect(() => {
    if (isOpen && product) {
      const cleanId = String(product.id).replace(/^prod-/, '');
      const item = cartItems.find(i => String(i.productId).replace(/^prod-/, '') === cleanId);
      setQuantity(item ? item.quantity : 1);
    }
  }, [isOpen, cartItems, product?.id]);

  const updateCart = async (newQty) => {
    if (newQty < 1 || newQty > 99) return;
    setQuantity(newQty);

    const cleanId = String(product.id).replace(/^prod-/, '');
    const itemInCart = cartItems.find(item => String(item.productId).replace(/^prod-/, '') === cleanId);

    if (itemInCart) {
      await updateQuantity(cleanId, null, newQty);
    } else {
      await addToCart(product, null, newQty);
    }
  };

  const truncate = (str, n) => {
    return str?.length > n ? str.substr(0, n - 1) + '...' : str;
  };

  const discountPrice = product.discount_price ?? product.discountPrice;
  const imageSrc = product.images?.[0] || '/assets/images/placeholder.png';

  return (
    <div className={`modal fade ${isOpen ? 'show d-block' : ''}`} tabIndex="-1" role="dialog" style={{ background: isOpen ? 'rgba(0,0,0,0.5)' : 'none', zIndex: 100000 }}>
      <div className="modal-dialog modal-dialog-centered" role="document" style={{ zIndex: 100001 }}>
        <motion.div
          className="modal-content"
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={isOpen ? { opacity: 1, scale: 1, y: 0 } : {}}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          style={{ borderRadius: '16px', border: 'none', overflow: 'hidden', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)' }}
        >
          <div className="modal-body p-4">
            <div className="d-flex gap-3 mb-4">
              <img
                src={imageSrc}
                alt={product.name}
                style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px' }}
              />
              <div style={{ flex: 1 }}>
                <h5 style={{ fontSize: '16px', fontWeight: 700, margin: '0 0 4px', color: '#0b1a33' }}>{product.name}</h5>
                <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 8px' }}>
                  {truncate(product.description || 'No description available.', 30)}
                </p>
                <div style={{ fontWeight: 700, color: '#183B9B' }}>
                  Shs. {(discountPrice ?? product.price).toLocaleString()}
                </div>
                {product.variant && (
                  <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>
                    Variant: {product.variant}
                  </div>
                )}
              </div>
            </div>

            <div className="qty-selector d-flex align-items-center justify-content-between mb-4 p-2" style={{ background: '#f8fafc', borderRadius: '12px' }}>
              <span style={{ fontSize: '14px', fontWeight: 600, color: '#475569', paddingLeft: '8px' }}>Quantity</span>
              <div className="d-flex align-items-center gap-3">
                <button
                  onClick={() => updateCart(quantity - 1)}
                  className="btn-qty"
                  style={{ width: '32px', height: '32px', borderRadius: '8px', border: 'none', background: '#fff', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}
                >
                  <i className="lni lni-minus" />
                </button>
                <span style={{ fontWeight: 700, minWidth: '20px', textAlign: 'center', color: '#0b1a33' }}>{quantity}</span>
                <button
                  onClick={() => updateCart(quantity + 1)}
                  className="btn-qty"
                  style={{ width: '32px', height: '32px', borderRadius: '8px', border: 'none', background: '#fff', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}
                >
                  <i className="lni lni-plus" />
                </button>
              </div>
            </div>

            <div className="d-flex flex-row gap-2">
              <Link
                to="/cart"
                className="btn w-100"
                style={{ background: '#183B9B', color: '#fff', borderRadius: '10px', padding: '12px', fontWeight: 600, textDecoration: 'none', textAlign: 'center' }}
                onClick={onClose}
              >
                View Cart
              </Link>
              <button
                onClick={onClose}
                className="btn w-100"
                style={{ background: '#f1f5f9', color: '#475569', borderRadius: '10px', padding: '12px', fontWeight: 600, border: 'none' }}
              >
                Back to shop
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
