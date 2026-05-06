import axiosInstance from './axiosInstance';

const authService = {
  login: async (credentials) => {
    // credentials = { email, password }
    const response = await axiosInstance.post('/login/', credentials);
    return response.data;
  },

  signup: async (userData, role = 'customer') => {
    // userData for customer: { email, full_name, phone, password, password2 }
    // userData for vendor: { email, full_name, phone, password, password2, invite_code }
    const endpoint = role === 'vendor' ? '/vendor/register/' : '/register/';
    const response = await axiosInstance.post(endpoint, userData);
    return response.data;
  },

  logout: async (refreshToken) => {
    const response = await axiosInstance.post('/logout/', { refresh: refreshToken });
    return response.data;
  },

  getProfile: async () => {
    const response = await axiosInstance.get('/profile/');
    return response.data;
  },

  changePassword: async (passwordData) => {
    const response = await axiosInstance.post('/change-password/', passwordData);
    return response.data;
  },

  googleLogin: async (credential, role = 'customer') => {
    const response = await axiosInstance.post('/google-login/', { credential, role });
    return response.data;
  }
};

export default authService;
