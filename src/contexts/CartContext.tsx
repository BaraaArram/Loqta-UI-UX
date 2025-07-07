'use client';
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from '@/lib/axios';

interface CartItem {
  product: any;
  quantity: number;
}

interface CartContextType {
  cart: CartItem[];
  loading: boolean;
  error: string;
  fetchCart: () => Promise<void>;
  addToCart: (productId: string, quantity?: number) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  clearCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchCart = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get('/api/v1/cart/', { withCredentials: true });
      const items = res.data?.data?.items;
      if (Array.isArray(items)) {
        setCart(items);
      } else {
        setCart([]);
        setError('Cart data is missing or in an unexpected format.');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load cart.');
      setCart([]);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (productId: string, quantity: number = 1) => {
    setLoading(true);
    setError('');
    try {
      await axios.post(`/api/v1/cart/${productId}/add/`, { quantity, override: false }, { withCredentials: true });
      await fetchCart();
    } catch (err: any) {
      setError(err.message || 'Failed to add to cart.');
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (productId: string) => {
    setLoading(true);
    setError('');
    try {
      await axios.delete(`/api/v1/cart/${productId}/remove/`, { withCredentials: true });
      await fetchCart();
    } catch (err: any) {
      setError(err.message || 'Failed to remove item.');
    } finally {
      setLoading(false);
    }
  };

  const clearCart = async () => {
    setLoading(true);
    setError('');
    try {
      await axios.post('/api/v1/cart/clear/', {}, { withCredentials: true });
      setCart([]);
    } catch (err: any) {
      setError(err.message || 'Failed to clear cart.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  return (
    <CartContext.Provider value={{ cart, loading, error, fetchCart, addToCart, removeFromCart, clearCart }}>
      {children}
    </CartContext.Provider>
  );
}; 