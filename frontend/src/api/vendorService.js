import axiosInstance from './axiosInstance';

const vendorService = {
  getProfile: async () => {
    const response = await axiosInstance.get('/vendors/profile/');
    return response.data;
  },

  createProfile: async (vendorData) => {
    // vendorData = { shop_name, shop_description, business_address, business_phone }
    const response = await axiosInstance.post('/vendors/profile/create', vendorData);
    return response.data;
  },

  updateProfile: async (vendorData) => {
    // Usually uses patch for partial update if available, or post to profile/
    const response = await axiosInstance.patch('/vendors/profile/', vendorData);
    return response.data;
  }
};

export default vendorService;
