import { createContext, useContext, useReducer, useEffect, useRef, useState } from 'react';
import { AuthContext } from './AuthContext';
import { cartApi } from '../services/api';

const dedupKey = (productId, variant) => {
  if (!productId) return '';
  // Normalize ID: "prod-310" or 310 or "310" -> "310"
  const cleanId = String(productId).replace(/^prod-/, '');
  return `${cleanId}::${variant ?? ''}`;
};

function cartReducer(state, action) {
  if (!action || !action.payload) return state;

  switch (action.type) {
    case 'ADD_TO_CART': {
      const { product, variant = null, quantity = 1 } = action.payload;

      if (!product) return state;

      const rawId = product.id || product.pid || product.jpos_id;
      if (!rawId) return state;

      const productId = String(rawId).replace(/^prod-/, '');
      const key = dedupKey(productId, variant);

      const existingIndex = state.findIndex(
        (item) => dedupKey(item.productId, item.variant) === key
      );

      if (existingIndex !== -1) {
        return state.map((item, index) =>
          index === existingIndex
            ? { ...item, quantity: Math.min(item.quantity + quantity, 99) }
            : item
        );
      }

      const price = product.discount_price ?? product.discountPrice ?? product.price;

      const newItem = {
        productId,
        name: product.name || product.product_name,
        price: parseFloat(price) || 0,
        originalPrice: parseFloat(product.price || product.retail_price) || 0,
        quantity: Math.min(Math.max(quantity, 1), 99),
        image: product.images?.[0] ?? product.image ?? null,
        variant,
      };

      return [...state, newItem];
    }

    case 'REMOVE_FROM_CART': {
      const { productId, variant = null } = action.payload;
      if (!productId) return state;

      const key = dedupKey(productId, variant);
      return state.filter(
        (item) => dedupKey(item.productId, item.variant) !== key
      );
    }

    case 'UPDATE_QUANTITY': {
      const { productId, variant = null, quantity } = action.payload;

      if (!productId) return state;

      const key = dedupKey(productId, variant);
      const clamped = Math.min(Math.max(quantity, 1), 99);
      return state.map((item) =>
        dedupKey(item.productId, item.variant) === key
          ? { ...item, quantity: clamped }
          : item
      );
    }

    case 'CLEAR_CART':
      return [];

    case 'SET_CART': {
      return action.payload;
    }

    default:
      return state;
  }
}

function initCartState() {
  try {
    const stored = localStorage.getItem('kenvies_cart');
    if (stored) {
      const parsed = JSON.parse(stored);
      return parsed.filter(item => item.productId && item.name);
    }
  } catch {
  }
  return [];
}

export const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, undefined, initCartState);
  const [quickViewProduct, setQuickViewProduct] = useState(null);

  let authCtx = null;
  try { authCtx = useContext(AuthContext); } catch { }
  const user = authCtx?.user ?? null;

  const prevUserIdRef = useRef(null);

  useEffect(() => {
    try {
      localStorage.setItem('kenvies_cart', JSON.stringify(state));
    } catch {
    }
  }, [state]);

  useEffect(() => {
    if (!user) {
      prevUserIdRef.current = null;
      return;
    }

    if (prevUserIdRef.current === user.id) return;
    prevUserIdRef.current = user.id;

    let cancelled = false;

    (async () => {
      try {
        const data = await cartApi.get();
        if (cancelled || !data?.items) return;

        const mapped = data.items.map((item) => {
          const productId = String(item.product_id || item.jpos_id || '').replace(/^prod-/, '');
          return {
            productId,
            name: item.name,
            price: item.price,
            originalPrice: item.original_price ?? item.price,
            quantity: item.quantity,
            image: item.image,
            variant: item.variant ?? null,
          };
        });

        dispatch({ type: 'SET_CART', payload: mapped });
      } catch {
      }
    })();

    return () => { cancelled = true; };
  }, [user]);

  const addToCart = async (product, variant = null, quantity = 1) => {
    if (!product) return;
    const productId = product.id || product.pid || product.jpos_id;
    dispatch({ type: 'ADD_TO_CART', payload: { product, variant, quantity } });
    if (user && productId) {
      try { await cartApi.add(productId, quantity, variant); } catch { }
    }
  };

  const removeFromCart = async (productId, variant = null) => {
    if (!productId) return;
    dispatch({ type: 'REMOVE_FROM_CART', payload: { productId, variant } });
    if (user) {
      try { await cartApi.remove(productId, variant); } catch { }
    }
  };

  const updateQuantity = async (productId, variant = null, quantity) => {
    if (!productId) return;
    dispatch({ type: 'UPDATE_QUANTITY', payload: { productId, variant, quantity } });
    if (user) {
      try { await cartApi.update(productId, quantity, variant); } catch { }
    }
  };

  const clearCart = async () => {
    dispatch({ type: 'CLEAR_CART' });
    if (user) {
      try { await cartApi.clear(); } catch { }
    }
  };

  return (
    <CartContext.Provider value={{
      state,
      dispatch,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      quickViewProduct,
      setQuickViewProduct
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === null) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

export { cartReducer, dedupKey };
