import React, { createContext, useContext, useState, useEffect } from 'react';
import cartService from '../api/cartService';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(false);
  const { token, user } = useAuth();

  const fetchCart = async () => {
    if (!token || user?.role !== 'customer') return;
    setLoading(true);
    try {
      const data = await cartService.getCart();
      setCart(data);
    } catch (err) {
      console.error('Failed to fetch cart:', err);
      // Only set cart to null if it's a 401 or 403, otherwise keep old state or empty
      if (err.response?.status === 401) setCart(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [token, user?.id]);

  const addToCart = async (productId, quantity = 1) => {
    if (!token) {
      toast.error('Please login to add items to cart');
      return false;
    }
    if (user?.role === 'vendor') {
      toast.error('Vendors cannot add items to cart');
      return false;
    }
    
    try {
      const data = await cartService.addToCart(productId, quantity);
      setCart(data);
      toast.success('Added to cart!');
      return true;
    } catch (err) {
      const message = err.response?.data?.error || 'Failed to add to cart';
      toast.error(message);
      return false;
    }
  };

  const updateQuantity = async (itemId, quantity) => {
    try {
      const data = await cartService.updateCartItem(itemId, quantity);
      setCart(data);
    } catch (err) {
      const message = err.response?.data?.error || 'Failed to update quantity';
      toast.error(message);
    }
  };

  const removeFromCart = async (itemId) => {
    try {
      const data = await cartService.removeFromCart(itemId);
      setCart(data);
      toast.success('Removed from cart');
    } catch (err) {
      const message = err.response?.data?.error || 'Failed to remove item';
      toast.error(message);
    }
  };

  const clearCart = async () => {
    try {
      await cartService.clearCart();
      setCart({ items: [], total_amount: 0, total_items: 0 });
      toast.success('Cart cleared');
    } catch (err) {
      const message = err.response?.data?.error || 'Failed to clear cart';
      toast.error(message);
    }
  };

  return (
    <CartContext.Provider value={{ cart, loading, addToCart, updateQuantity, removeFromCart, clearCart, fetchCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
