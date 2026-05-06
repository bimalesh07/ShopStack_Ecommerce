import axiosInstance from './axiosInstance';

const productService = {
  getProducts: async (params = {}) => {
    // params can include { category, search, min_price, max_price, page }
    const response = await axiosInstance.get('/products/', { params });
    // Handle DRF pagination response structure { count, next, previous, results }
    return response.data.results || response.data;
  },

  getProductById: async (id) => {
    const response = await axiosInstance.get(`/products/${id}/`);
    return response.data;
  },

  getCategories: async () => {
    const response = await axiosInstance.get('/products/categories/');
    return response.data;
  },

  // Vendor specific methods
  getVendorProducts: async () => {
    const response = await axiosInstance.get('/products/vendor/');
    return response.data.results || response.data;
  },

  createProduct: async (productData) => {
    const response = await axiosInstance.post('/products/vendor/', productData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  updateProduct: async (id, productData) => {
    const response = await axiosInstance.patch(`/products/vendor/${id}/`, productData);
    return response.data;
  },

  deleteProduct: async (id) => {
    const response = await axiosInstance.delete(`/products/vendor/${id}/`);
    return response.data;
  },

  uploadImage: async (productId, imageData) => {
    const response = await axiosInstance.post(`/products/vendor/${productId}/images/`, imageData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  deleteImage: async (productId, imageId) => {
    const response = await axiosInstance.delete(`/products/vendor/${productId}/images/${imageId}/`);
    return response.data;
  },

  createCategory: async (categoryData) => {
    const response = await axiosInstance.post('/products/categories/create/', categoryData);
    return response.data;
  },
};

export default productService;
