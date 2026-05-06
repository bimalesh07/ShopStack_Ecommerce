import axiosInstance from './axiosInstance';

const wishlistService = {
  getWishlist: async () => {
    const response = await axiosInstance.get('/wishlist/');
    return response.data;
  },

  addToWishlist: async (productId) => {
    const response = await axiosInstance.post('/wishlist/add/', { product_id: productId });
    return response.data;
  },

  removeFromWishlist: async (itemId) => {
    const response = await axiosInstance.delete(`/wishlist/${itemId}`);
    return response.data;
  },

  clearWishlist: async () => {
    const response = await axiosInstance.delete('/wishlist/clear/');
    return response.data;
  },
};

export default wishlistService;
