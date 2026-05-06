import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import authService from '../../api/authService';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, User, Phone, Loader2, Store } from 'lucide-react';
import GoogleLoginButton from '../../components/GoogleLoginButton';

const Signup = () => {
  const [isVendor, setIsVendor] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    full_name: '',
    phone: '',
    password: '',
    password2: '',
    invite_code: '',
    shop_name: '',
    shop_descriptions: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    
    // Trim all string values before sending
    const trimmedData = Object.keys(formData).reduce((acc, key) => {
      acc[key] = typeof formData[key] === 'string' ? formData[key].trim() : formData[key];
      return acc;
    }, {});

    try {
      const role = isVendor ? 'vendor' : 'customer';
      console.log('Submitting Signup Form (Trimmed):', { ...trimmedData, role });
      
      const data = await authService.signup(trimmedData, role);
      
      if (isVendor) {
        setSuccess('Vendor registration successful! Please wait for admin approval before logging in.');
        setFormData({ 
          email: '', 
          full_name: '', 
          phone: '', 
          password: '', 
          password2: '', 
          invite_code: '',
          shop_name: '',
          shop_descriptions: '' 
        });
      } else {
        login(data.user, data.tokens);
        navigate('/dashboard');
      }
    } catch (err) {
      console.error('Signup error response:', err.response?.data);
      const errorData = err.response?.data;
      
      if (errorData) {
        if (typeof errorData === 'string') {
          setError(errorData);
        } else if (typeof errorData === 'object') {
          // Extract the first error message from the object (e.g., { "email": ["This email is already registered"] })
          const firstKey = Object.keys(errorData)[0];
          const firstError = errorData[firstKey];
          
          if (Array.isArray(firstError)) {
            setError(`${firstKey}: ${firstError[0]}`);
          } else if (typeof firstError === 'string') {
            setError(`${firstKey}: ${firstError}`);
          } else if (errorData.message) {
            setError(errorData.message);
          } else if (errorData.detail) {
            setError(errorData.detail);
          } else {
            setError('Registration failed. Please check your inputs.');
          }
        }
      } else {
        setError('Connection failed. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[80vh] py-12">
      <div className="glass-card p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-slate-900">Create Account</h2>
          <p className="text-slate-600 mt-2">Join the ShopStack community</p>
        </div>

        {/* Role Toggle */}
        <div className="flex bg-slate-100 p-1 rounded-xl mb-8">
          <button
            onClick={() => setIsVendor(false)}
            className={`flex-1 flex items-center justify-center space-x-2 py-2 rounded-lg text-sm font-bold transition-all ${!isVendor ? 'bg-white shadow-sm text-primary-600' : 'text-slate-500'}`}
          >
            <User className="h-4 w-4" />
            <span>Customer</span>
          </button>
          <button
            onClick={() => setIsVendor(true)}
            className={`flex-1 flex items-center justify-center space-x-2 py-2 rounded-lg text-sm font-bold transition-all ${isVendor ? 'bg-white shadow-sm text-primary-600' : 'text-slate-500'}`}
          >
            <Store className="h-4 w-4" />
            <span>Vendor</span>
          </button>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-6 border border-red-100">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 text-green-600 p-3 rounded-lg text-sm mb-6 border border-green-100">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                name="full_name"
                type="text"
                required
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                placeholder="John Doe"
                value={formData.full_name}
                onChange={handleChange}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                name="email"
                type="email"
                required
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                name="phone"
                type="tel"
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                placeholder="+1 234 567 890"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  name="password"
                  type="password"
                  required
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Confirm</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  name="password2"
                  type="password"
                  required
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  placeholder="••••••••"
                  value={formData.password2}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          {isVendor && (
            <div className="space-y-4 pt-2 border-t border-slate-100 mt-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Shop Name</label>
                <input
                  name="shop_name"
                  type="text"
                  required={isVendor}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  placeholder="Your Shop Name"
                  value={formData.shop_name}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Shop Description</label>
                <textarea
                  name="shop_descriptions"
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  placeholder="Describe your shop..."
                  rows="2"
                  value={formData.shop_descriptions}
                  onChange={handleChange}
                ></textarea>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Admin Invite Code</label>
                <input
                  name="invite_code"
                  type="text"
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  placeholder="Enter your vendor invite code (optional)"
                  value={formData.invite_code || ''}
                  onChange={handleChange}
                />
                <p className="text-[10px] text-slate-500 mt-1 italic">Vendors can use an invite code for faster approval.</p>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary flex items-center justify-center space-x-2 mt-6"
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <span>Create {isVendor ? 'Vendor' : 'Customer'} Account</span>}
          </button>
        </form>

        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-slate-200"></span>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-slate-500">Or continue with</span>
          </div>
        </div>

        <GoogleLoginButton role={isVendor ? 'vendor' : 'customer'} />

        <div className="mt-8 text-center text-sm text-slate-600">
          Already have an account?{' '}
          <Link to="/login" className="text-primary-600 font-bold hover:underline">
            Log In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Signup;
