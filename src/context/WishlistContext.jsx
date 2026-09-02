import { createContext, useContext, useReducer, useEffect, useRef } from 'react';
import { AuthContext } from './AuthContext';
import { wishlistApi } from '../services/api';

export function wishlistReducer(state, action) {
  switch (action.type) {
    case 'ADD_TO_WISHLIST': {
      const { product } = action.payload;
      const alreadyAdded = state.some((item) => item.productId === product.id);
      if (alreadyAdded) return state;

      const price = product.discount_price ?? product.discountPrice ?? product.price;

      return [
        ...state,
        {
          productId: product.id,
          name: product.name,
          price,
          image: product.images?.[0] ?? product.image ?? '',
        },
      ];
    }

    case 'REMOVE_FROM_WISHLIST': {
      const { productId } = action.payload;
      return state.filter((item) => item.productId !== productId);
    }

    case 'CLEAR_WISHLIST':
      return [];

    case 'SET_WISHLIST': {
      return action.payload;
    }

    default:
      return state;
  }
}

function initWishlistState() {
  try {
    const stored = localStorage.getItem('kenvies_wishlist');
    if (stored) return JSON.parse(stored);
  } catch {
  }
  return [];
}

export const WishlistContext = createContext(null);

export function WishlistProvider({ children }) {
  const [state, dispatch] = useReducer(wishlistReducer, undefined, initWishlistState);

  let authCtx = null;
  try { authCtx = useContext(AuthContext); } catch { }
  const user = authCtx?.user ?? null;

  const prevUserIdRef = useRef(null);

  useEffect(() => {
    try {
      localStorage.setItem('kenvies_wishlist', JSON.stringify(state));
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
        const data = await wishlistApi.get();
        if (cancelled || !Array.isArray(data.items)) return;

        const mapped = data.items.map((item) => ({
          productId: item.product_id ?? `prod-${item.jpos_id}`,
          name: item.name,
          price: item.price ?? item.discount_price ?? item.discountPrice,
          image: item.image ?? '',
        }));

        dispatch({ type: 'SET_WISHLIST', payload: mapped });
      } catch {
      }
    })();

    return () => { cancelled = true; };
  }, [user]);

  const addToWishlist = async (product) => {
    dispatch({ type: 'ADD_TO_WISHLIST', payload: { product } });
    if (user) {
      try { await wishlistApi.add(product.id); } catch { }
    }
  };

  const removeFromWishlist = async (productId) => {
    dispatch({ type: 'REMOVE_FROM_WISHLIST', payload: { productId } });
    if (user) {
      try { await wishlistApi.remove(productId); } catch { }
    }
  };

  const clearWishlist = async () => {
    dispatch({ type: 'CLEAR_WISHLIST' });
    if (user) {
      try { await wishlistApi.clear(); } catch { }
    }
  };

  return (
    <WishlistContext.Provider value={{ state, dispatch, addToWishlist, removeFromWishlist, clearWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (context === null) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
}
