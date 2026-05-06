import axiosInstance from './axiosInstance';

const reviewService = {
  getProductReviews: async (productId) => {
    const response = await axiosInstance.get(`/reviews/product/${productId}/`);
    return response.data;
  },

  getProductRating: async (productId) => {
    const response = await axiosInstance.get(`/reviews/product/${productId}/rating/`);
    return response.data;
  },

  createReview: async (productId, reviewData) => {
    const response = await axiosInstance.post(`/reviews/product/${productId}/`, reviewData);
    return response.data;
  }
};

export default reviewService;
