import axiosInstance from './axiosInstance';

const orderService = {
  getOrders: async () => {
    const response = await axiosInstance.get('/orders/');
    return response.data;
  },

  getOrderById: async (id) => {
    const response = await axiosInstance.get(`/orders/${id}/`);
    return response.data;
  },

  createOrder: async (orderData) => {
    const response = await axiosInstance.post('/orders/', orderData);
    return response.data;
  },

  cancelOrder: async (id) => {
    const response = await axiosInstance.post(`/orders/${id}/cancel/`);
    return response.data;
  },

  // Vendor specific
  getVendorOrders: async () => {
    const response = await axiosInstance.get('/orders/vendor/');
    return response.data;
  },

  updateOrderStatus: async (id, statusData) => {
    const response = await axiosInstance.patch(`/orders/vendor/order/${id}/update-status/`, statusData);
    return response.data;
  }
};

export default orderService;
