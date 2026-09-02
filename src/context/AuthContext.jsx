import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi, cartApi, wishlistApi, tokenStore } from '../services/api';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = tokenStore.get();
        if (!token) {
            setLoading(false);
            return;
        }
        authApi.me()
            .then(data => setUser(data))
            .catch(() => tokenStore.clear())
            .finally(() => setLoading(false));
    }, []);

    const login = useCallback(async (identifier, password) => {
        const data = await authApi.login({ identifier, password });
        tokenStore.set(data.token);
        setUser(data.user);
        await _syncLocalDataToServer();
        return data;
    }, []);

    const register = useCallback(async (fields) => {
        const data = await authApi.register(fields);
        tokenStore.set(data.token);
        setUser(data.user);
        await _syncLocalDataToServer();
        return data;
    }, []);

    const logout = useCallback(async () => {
        try {
            await authApi.logout();
        } catch {
        }
        tokenStore.clear();
        setUser(null);
        localStorage.removeItem('kenvies_cart');
        localStorage.removeItem('kenvies_wishlist');
    }, []);

    const refreshUser = useCallback(async () => {
        const data = await authApi.me();
        setUser(data);
        return data;
    }, []);

    async function _syncLocalDataToServer() {
        try {
            const rawCart = localStorage.getItem('kenvies_cart');
            if (rawCart) {
                const localCart = JSON.parse(rawCart);
                if (localCart.length > 0) {
                    const items = localCart.map(item => ({
                        product_id: item.productId,
                        quantity: item.quantity,
                        variant: item.variant ?? null,
                    }));
                    await cartApi.sync(items);
                    localStorage.removeItem('kenvies_cart');
                }
            }
        } catch {
        }

        try {
            const rawWish = localStorage.getItem('kenvies_wishlist');
            if (rawWish) {
                const localWish = JSON.parse(rawWish);
                if (localWish.length > 0) {
                    const ids = localWish.map(item => item.productId);
                    await wishlistApi.sync(ids);
                    localStorage.removeItem('kenvies_wishlist');
                }
            }
        } catch {
        }
    }

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
    return ctx;
}
