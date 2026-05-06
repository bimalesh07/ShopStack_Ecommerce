import axiosInstance from './axiosInstance';

const cartService = {
  getCart: async () => {
    const response = await axiosInstance.get('/cart/');
    return response.data;
  },

  addToCart: async (productId, quantity = 1) => {
    const response = await axiosInstance.post('/cart/add/', { 
      product_id: productId, 
      quantity: quantity 
    });
    return response.data;
  },

  updateCartItem: async (itemId, quantity) => {
    const response = await axiosInstance.patch(`/cart/${itemId}`, { 
      quantity: quantity 
    });
    return response.data;
  },

  removeFromCart: async (itemId) => {
    const response = await axiosInstance.delete(`/cart/${itemId}`);
    return response.data;
  },

  clearCart: async () => {
    // Backend might not have a dedicated clear cart, 
    // but we can implement it if needed or just remove items one by one.
    // For now, let's assume the backend handles it or we'll add it.
    const response = await axiosInstance.delete('/cart/');
    return response.data;
  }
};

export default cartService;
