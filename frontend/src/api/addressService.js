import axiosInstance from './axiosInstance';

const addressService = {
  getAddresses: async () => {
    const response = await axiosInstance.get('/address/');
    return response.data;
  },

  createAddress: async (addressData) => {
    const response = await axiosInstance.post('/address/', addressData);
    return response.data;
  },

  updateAddress: async (id, addressData) => {
    const response = await axiosInstance.patch(`/address/${id}/`, addressData);
    return response.data;
  },

  deleteAddress: async (id) => {
    const response = await axiosInstance.delete(`/address/${id}/`);
    return response.data;
  },

  setDefault: async (id) => {
    const response = await axiosInstance.post(`/address/${id}/set_default/`);
    return response.data;
  }
};

export default addressService;
