import { createContext, useContext, useReducer, useEffect, useRef } from 'react';
import { AuthContext } from './AuthContext';
import { cartApi } from '../services/api';

const dedupKey = (productId, variant) => `${productId}::${variant ?? ''}`;

function cartReducer(state, action) {
  switch (action.type) {
    case 'ADD_TO_CART': {
      const { product, variant = null, quantity = 1 } = action.payload;
      const key = dedupKey(product.id, variant);

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
        productId: product.id,
        name: product.name,
        price,
        originalPrice: product.price,
        quantity: Math.min(Math.max(quantity, 1), 99),
        image: product.images?.[0] ?? product.image ?? null,
        variant,
      };

      return [...state, newItem];
    }

    case 'REMOVE_FROM_CART': {
      const { productId, variant = null } = action.payload;
      const key = dedupKey(productId, variant);
      return state.filter(
        (item) => dedupKey(item.productId, item.variant) !== key
      );
    }

    case 'UPDATE_QUANTITY': {
      const { productId, variant = null, quantity } = action.payload;
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

        const mapped = data.items.map((item) => ({
          productId: item.product_id ?? `prod-${item.jpos_id}`,
          name: item.name,
          price: item.price,
          originalPrice: item.original_price ?? item.price,
          quantity: item.quantity,
          image: item.image,
          variant: item.variant ?? null,
        }));

        dispatch({ type: 'SET_CART', payload: mapped });
      } catch {
      }
    })();

    return () => { cancelled = true; };
  }, [user]);

  const addToCart = async (product, variant = null, quantity = 1) => {
    dispatch({ type: 'ADD_TO_CART', payload: { product, variant, quantity } });
    if (user) {
      try { await cartApi.add(product.id, quantity, variant); } catch { }
    }
  };

  const removeFromCart = async (productId, variant = null) => {
    dispatch({ type: 'REMOVE_FROM_CART', payload: { productId, variant } });
    if (user) {
      try { await cartApi.remove(productId, variant); } catch { }
    }
  };

  const updateQuantity = async (productId, variant = null, quantity) => {
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
    <CartContext.Provider value={{ state, dispatch, addToCart, removeFromCart, updateQuantity, clearCart }}>
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
