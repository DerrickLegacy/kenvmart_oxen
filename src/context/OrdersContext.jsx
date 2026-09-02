import { createContext, useContext, useState, useCallback } from 'react';

/**
 * Each saved order shape:
 * {
 *   id: string,          // timestamp-based unique id
 *   placedAt: string,    // ISO date string
 *   items: CartItem[],   // snapshot of cart at send time
 *   total: number,
 *   status: 'Pending' | 'Processing' | 'Shipped'
 * }
 *
 * Mutations (deleteOrder, removeItemFromOrder, updateItemQuantity) only
 * operate when order.status === 'Pending'.
 */

const STORAGE_KEY = 'kenvies_orders';

function loadOrders() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveOrders(orders) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
  } catch {
    // storage may be unavailable — silently ignore
  }
}

function calcTotal(items) {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

export const OrdersContext = createContext(null);

export function OrdersProvider({ children }) {
  const [orders, setOrders] = useState(loadOrders);

  /** Place a new order from the current cart snapshot */
  const placeOrder = useCallback((cartItems) => {
    const newOrder = {
      id: `ORD-${Date.now()}`,
      placedAt: new Date().toISOString(),
      items: cartItems,
      total: calcTotal(cartItems),
      status: 'Pending',
    };
    setOrders(prev => {
      const updated = [newOrder, ...prev];
      saveOrders(updated);
      return updated;
    });
    return newOrder.id;
  }, []);

  /**
   * Delete an entire order.
   * Only allowed when order.status === 'Pending'.
   */
  const deleteOrder = useCallback((orderId) => {
    setOrders(prev => {
      const target = prev.find(o => o.id === orderId);
      if (!target || target.status !== 'Pending') return prev;
      const updated = prev.filter(o => o.id !== orderId);
      saveOrders(updated);
      return updated;
    });
  }, []);

  /**
   * Remove a single item from a pending order by productId + variant.
   * If no items remain after removal the order is deleted entirely.
   * Recalculates the order total.
   */
  const removeItemFromOrder = useCallback((orderId, productId, variant) => {
    setOrders(prev => {
      const target = prev.find(o => o.id === orderId);
      if (!target || target.status !== 'Pending') return prev;

      const newItems = target.items.filter(
        item => !(item.productId === productId && item.variant === variant)
      );

      // If all items removed, delete the order
      if (newItems.length === 0) {
        const updated = prev.filter(o => o.id !== orderId);
        saveOrders(updated);
        return updated;
      }

      const updated = prev.map(o =>
        o.id === orderId
          ? { ...o, items: newItems, total: calcTotal(newItems) }
          : o
      );
      saveOrders(updated);
      return updated;
    });
  }, []);

  /**
   * Update the quantity of one item in a pending order.
   * newQty must be >= 1; values below 1 are ignored.
   * Recalculates the order total.
   */
  const updateItemQuantity = useCallback((orderId, productId, variant, newQty) => {
    if (newQty < 1) return;
    setOrders(prev => {
      const target = prev.find(o => o.id === orderId);
      if (!target || target.status !== 'Pending') return prev;

      const newItems = target.items.map(item =>
        item.productId === productId && item.variant === variant
          ? { ...item, quantity: newQty }
          : item
      );

      const updated = prev.map(o =>
        o.id === orderId
          ? { ...o, items: newItems, total: calcTotal(newItems) }
          : o
      );
      saveOrders(updated);
      return updated;
    });
  }, []);

  return (
    <OrdersContext.Provider
      value={{ orders, placeOrder, deleteOrder, removeItemFromOrder, updateItemQuantity }}
    >
      {children}
    </OrdersContext.Provider>
  );
}

export function useOrders() {
  const ctx = useContext(OrdersContext);
  if (!ctx) throw new Error('useOrders must be used within an OrdersProvider');
  return ctx;
}
