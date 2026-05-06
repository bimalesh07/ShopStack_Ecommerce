import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { User as UserIcon, Mail, Phone, Store, MapPin, Loader2, Save, Lock, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import axiosInstance from '../../api/axiosInstance';

const Profile = () => {
  const { user, fetchProfile, logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    shop_name: '',
    shop_descriptions: '',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        full_name: user.full_name || '',
        phone: user.phone || '',
        shop_name: user.vendor_details?.shop_name || '',
        shop_descriptions: user.vendor_details?.shop_descriptions || '',
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Update basic info
      await axiosInstance.patch('/profile/', {
        full_name: formData.full_name,
        phone: formData.phone,
      });

      // If vendor, update shop info
      if (user.role === 'vendor') {
        await axiosInstance.patch('/vendors/profile/', {
          shop_name: formData.shop_name,
          shop_descriptions: formData.shop_descriptions,
        });
      }

      await fetchProfile();
      toast.success('Profile updated successfully!');
    } catch (err) {
      toast.error('Failed to update profile');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const [passwords, setPasswords] = useState({
    old_password: '',
    new_password: '',
    new_password2: '',
  });
  const [changingPassword, setChangingPassword] = useState(false);

  const handlePasswordChange = (e) => {
    setPasswords({ ...passwords, [e.target.name]: e.target.value });
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwords.new_password !== passwords.new_password2) {
      toast.error('New passwords do not match');
      return;
    }
    setChangingPassword(true);
    try {
      await axiosInstance.post('/change-password/', passwords);
      toast.success('Password updated successfully! Please login again with your new password.');
      // Auto logout for security
      setTimeout(() => {
        logout();
        navigate('/login');
      }, 2000);
    } catch (err) {
      const msg = err.response?.data?.old_password || 'Failed to update password';
      toast.error(msg);
    } finally {
      setChangingPassword(false);
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 space-y-12">
      <div className="flex items-center space-x-4 mb-8">
        <div className="bg-primary-100 p-4 rounded-2xl">
          <UserIcon className="h-8 w-8 text-primary-600" />
        </div>
        <div>
          <h1 className="text-3xl font-black text-slate-900">Account Settings</h1>
          <p className="text-slate-600">Manage your profile and {user.role === 'vendor' ? 'shop' : 'personal'} information</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1 space-y-6">
          <div className="glass-card p-6">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Account Status</p>
            <div className="flex items-center space-x-2">
              <div className="h-2 w-2 rounded-full bg-green-500"></div>
              <span className="font-bold text-slate-900 capitalize">{user.role}</span>
            </div>
            <p className="text-xs text-slate-500 mt-2">Member since {new Date(user.created_at).toLocaleDateString()}</p>
          </div>

          <div className="glass-card p-6 bg-slate-900 text-white border-none shadow-2xl shadow-slate-900/20">
            <h4 className="font-black mb-2 flex items-center space-x-2">
              <ShieldCheck className="h-5 w-5 text-green-400" />
              <span>Security Tip</span>
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Use at least 8 characters with a mix of letters, numbers and symbols for a strong password.
            </p>
          </div>
        </div>

        <div className="md:col-span-2 space-y-8">
          {/* Profile Form */}
          <form onSubmit={handleSubmit} className="glass-card p-8 space-y-6">
            <div className="flex items-center space-x-2 text-primary-600 mb-2">
              <UserIcon className="h-5 w-5" />
              <h3 className="font-black uppercase tracking-wider text-sm">Personal Information</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Full Name</label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <input
                    name="full_name"
                    type="text"
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 transition-all font-medium"
                    value={formData.full_name}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <input
                    type="email"
                    disabled
                    className="w-full pl-10 pr-4 py-3 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 cursor-not-allowed font-medium"
                    value={user.email}
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <input
                    name="phone"
                    type="tel"
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 transition-all font-medium"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            {user.role === 'vendor' && (
              <div className="pt-6 border-t border-slate-100 space-y-6">
                <div className="flex items-center space-x-2 text-primary-600">
                  <Store className="h-5 w-5" />
                  <h3 className="font-black uppercase tracking-wider text-sm">Shop Information</h3>
                </div>
                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Store Name</label>
                    <input
                      name="shop_name"
                      type="text"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 transition-all font-medium"
                      value={formData.shop_name}
                      onChange={handleChange}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Store Description</label>
                    <textarea
                      name="shop_descriptions"
                      rows="3"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 transition-all font-medium"
                      value={formData.shop_descriptions}
                      onChange={handleChange}
                    ></textarea>
                  </div>
                </div>
              </div>
            )}

            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black hover:bg-primary-600 transition-all flex items-center justify-center space-x-2 shadow-lg shadow-slate-900/10"
              >
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : (
                  <>
                    <Save className="h-5 w-5" />
                    <span>Save Profile Changes</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Security Form */}
          <form onSubmit={handlePasswordSubmit} className="glass-card p-8 space-y-6">
            <div className="flex items-center space-x-2 text-red-600 mb-2">
              <Lock className="h-5 w-5" />
              <h3 className="font-black uppercase tracking-wider text-sm">Security & Password</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Current Password</label>
                <input
                  name="old_password"
                  type="password"
                  required
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500 transition-all font-medium"
                  value={passwords.old_password}
                  onChange={handlePasswordChange}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">New Password</label>
                <input
                  name="new_password"
                  type="password"
                  required
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500 transition-all font-medium"
                  value={passwords.new_password}
                  onChange={handlePasswordChange}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Confirm New Password</label>
                <input
                  name="new_password2"
                  type="password"
                  required
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500 transition-all font-medium"
                  value={passwords.new_password2}
                  onChange={handlePasswordChange}
                />
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={changingPassword}
                className="w-full bg-white border-2 border-slate-100 text-slate-900 py-4 rounded-2xl font-black hover:border-red-500 hover:text-red-600 transition-all flex items-center justify-center space-x-2"
              >
                {changingPassword ? <Loader2 className="h-5 w-5 animate-spin" /> : (
                  <>
                    <Lock className="h-5 w-5" />
                    <span>Update Password</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
