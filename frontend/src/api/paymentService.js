import axiosInstance from './axiosInstance';

const paymentService = {
  createRazorpayOrder: async (orderId) => {
    const response = await axiosInstance.post(`/payment/create/${orderId}/`);
    return response.data;
  },

  verifyPayment: async (paymentData) => {
    const response = await axiosInstance.post('/payment/verify/', paymentData);
    return response.data;
  },

  getPaymentDetail: async (orderId) => {
    const response = await axiosInstance.get(`/payment/detail/${orderId}/`);
    return response.data;
  }
};

export default paymentService;
