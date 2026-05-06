import React, { createContext, useContext, useState, useEffect } from 'react';
import wishlistService from '../api/wishlistService';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const [wishlist, setWishlist] = useState(null);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const fetchWishlist = async () => {
    if (!user || user.role === 'vendor') return;
    setLoading(true);
    try {
      const data = await wishlistService.getWishlist();
      setWishlist(data);
    } catch (error) {
      console.error('Failed to fetch wishlist:', error);
      // Only toast error if it's not a 401 (AuthContext handles that)
      if (error.response?.status !== 401) {
        toast.error('Failed to load wishlist');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, [user?.id]);

  const addToWishlist = async (productId) => {
    try {
      const data = await wishlistService.addToWishlist(productId);
      setWishlist(data);
      toast.success('Added to wishlist!');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to add to wishlist');
    }
  };

  const removeFromWishlist = async (itemId) => {
    try {
      await wishlistService.removeFromWishlist(itemId);
      // Optimistic update or refetch
      fetchWishlist();
      toast.success('Removed from wishlist');
    } catch (error) {
      toast.error('Failed to remove from wishlist');
    }
  };

  const isInWishlist = (productId) => {
    return wishlist?.items?.some(item => item.product.id === productId);
  };

  return (
    <WishlistContext.Provider value={{ 
      wishlist, 
      loading, 
      addToWishlist, 
      removeFromWishlist, 
      isInWishlist,
      wishlistCount: wishlist?.items?.length || 0
    }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => useContext(WishlistContext);
