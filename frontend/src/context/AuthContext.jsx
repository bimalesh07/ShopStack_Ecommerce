import React, { createContext, useContext, useState, useEffect } from 'react';
import authService from '../api/authService';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [token, setToken] = useState(localStorage.getItem('access_token'));
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const data = await authService.getProfile();
      setUser(data);
      localStorage.setItem('user', JSON.stringify(data));
    } catch (err) {
      console.error('Failed to fetch profile:', err);
      if (err.response?.status === 401) {
        logout();
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [token]);

  const login = (userData, tokens) => {
    setToken(tokens.access);
    setUser(userData);
    localStorage.setItem('access_token', tokens.access);
    localStorage.setItem('refresh_token', tokens.refresh);
    localStorage.setItem('user', JSON.stringify(userData));
    toast.success('Welcome back!');
  };

  const logout = async () => {
    const refreshToken = localStorage.getItem('refresh_token');
    if (refreshToken) {
      try {
        await authService.logout(refreshToken);
      } catch (e) {
        console.error('Logout API failed:', e);
      }
    }
    setToken(null);
    setUser(null);
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    toast.success('Logged out successfully');
  };

  const googleLogin = async (credential, role = 'customer') => {
    try {
      setLoading(true);
      const data = await authService.googleLogin(credential, role);
      login(data.user, data.tokens);
      return true;
    } catch (err) {
      console.error('Google Login failed:', err);
      const message = err.response?.data?.error || 'Google Login failed';
      toast.error(message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const changePassword = async (passwordData) => {
    try {
      await authService.changePassword(passwordData);
      toast.success('Password changed successfully');
      return true;
    } catch (err) {
      const message = err.response?.data?.error || 'Failed to change password';
      toast.error(message);
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, googleLogin, fetchProfile, changePassword }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
