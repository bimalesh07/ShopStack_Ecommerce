import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import authService from '../../api/authService';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, User, Phone, Loader2, Store } from 'lucide-react';
import toast from 'react-hot-toast';
import GoogleLoginButton from '../../components/GoogleLoginButton';

const Signup = () => {
  const [isVendor, setIsVendor] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    name: '',
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

      toast.success('Registration successful! Please verify your email.');
      navigate(`/verify-otp?email=${encodeURIComponent(trimmedData.email)}&role=${role}`);
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
    <div className="flex items-center justify-center min-h-screen auth-gradient py-12 px-4">
      <div className="glass-card p-10 w-full max-w-lg animate-in fade-in slide-in-from-bottom-8 duration-700 shadow-2xl">
        <div className="text-center mb-10">
          <h2 className="text-4xl font-medium text-slate-900 dark:text-white font-serif mb-2 capitalize">Create Account</h2>
          <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Join the ShopStack community</p>
        </div>

        {/* Role Toggle - Premium Style */}
        <div className="flex bg-slate-50/50 dark:bg-slate-900/50 p-1.5 rounded-2xl mb-10 border border-slate-100 dark:border-slate-800">
          <button
            onClick={() => setIsVendor(false)}
            className={`flex-1 flex items-center justify-center space-x-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${!isVendor ? 'bg-slate-900 dark:bg-white shadow-xl shadow-slate-900/20 text-white dark:text-slate-900' : 'text-slate-400 dark:text-slate-600'}`}
          >
            <User className="h-3.5 w-3.5" />
            <span>Customer</span>
          </button>
          <button
            onClick={() => setIsVendor(true)}
            className={`flex-1 flex items-center justify-center space-x-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${isVendor ? 'bg-slate-900 dark:bg-white shadow-xl shadow-slate-900/20 text-white dark:text-slate-900' : 'text-slate-400 dark:text-slate-600'}`}
          >
            <Store className="h-3.5 w-3.5" />
            <span>Vendor</span>
          </button>
        </div>

        {error && (
          <div className="bg-rose-50 dark:bg-rose-900/10 text-rose-600 dark:text-rose-400 p-4 rounded-2xl text-[10px] font-black uppercase tracking-widest mb-8 border border-rose-100 dark:border-rose-900/20 animate-in shake duration-500">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Full Name</label>
            <div className="relative group">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 dark:text-slate-600 group-focus-within:text-slate-900 dark:group-focus-within:text-white transition-colors" />
              <input
                name="name"
                type="text"
                required
                className="w-full pl-12 pr-6 py-4 bg-slate-50/50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 rounded-2xl focus:ring-2 focus:ring-slate-900 dark:focus:ring-white focus:border-transparent transition-all text-sm font-bold text-slate-900 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-700"
                placeholder="John Doe"
                value={formData.name}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Email Address</label>
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 dark:text-slate-600 group-focus-within:text-slate-900 dark:group-focus-within:text-white transition-colors" />
              <input
                name="email"
                type="email"
                required
                className="w-full pl-12 pr-6 py-4 bg-slate-50/50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 rounded-2xl focus:ring-2 focus:ring-slate-900 dark:focus:ring-white focus:border-transparent transition-all text-sm font-bold text-slate-900 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-700"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Phone Number</label>
            <div className="relative group">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 dark:text-slate-600 group-focus-within:text-slate-900 dark:group-focus-within:text-white transition-colors" />
              <input
                name="phone"
                type="tel"
                className="w-full pl-12 pr-6 py-4 bg-slate-50/50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 rounded-2xl focus:ring-2 focus:ring-slate-900 dark:focus:ring-white focus:border-transparent transition-all text-sm font-bold text-slate-900 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-700"
                placeholder="+1 234 567 890"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Password</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 dark:text-slate-600 group-focus-within:text-slate-900 dark:group-focus-within:text-white transition-colors" />
                <input
                  name="password"
                  type="password"
                  required
                  className="w-full pl-12 pr-6 py-4 bg-slate-50/50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 rounded-2xl focus:ring-2 focus:ring-slate-900 dark:focus:ring-white focus:border-transparent transition-all text-sm font-bold text-slate-900 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-700"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Confirm</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 dark:text-slate-600 group-focus-within:text-slate-900 dark:group-focus-within:text-white transition-colors" />
                <input
                  name="password2"
                  type="password"
                  required
                  className="w-full pl-12 pr-6 py-4 bg-slate-50/50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 rounded-2xl focus:ring-2 focus:ring-slate-900 dark:focus:ring-white focus:border-transparent transition-all text-sm font-bold text-slate-900 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-700"
                  placeholder="••••••••"
                  value={formData.password2}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          {isVendor && (
            <div className="space-y-5 pt-6 border-t border-slate-100 dark:border-slate-800 mt-6 animate-in fade-in duration-500">
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Shop Details</label>
                <input
                  name="shop_name"
                  type="text"
                  required={isVendor}
                  className="w-full px-6 py-4 bg-slate-50/50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 rounded-2xl focus:ring-2 focus:ring-slate-900 dark:focus:ring-white focus:border-transparent transition-all text-sm font-bold text-slate-900 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-700"
                  placeholder="Your Shop Name"
                  value={formData.shop_name}
                  onChange={handleChange}
                />
              </div>
              <textarea
                name="shop_descriptions"
                className="w-full px-6 py-4 bg-slate-50/50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 rounded-2xl focus:ring-2 focus:ring-slate-900 dark:focus:ring-white focus:border-transparent transition-all text-sm font-bold text-slate-900 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-700"
                placeholder="Describe your shop..."
                rows="2"
                value={formData.shop_descriptions}
                onChange={handleChange}
              ></textarea>
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Admin Invite Code</label>
                <input
                  name="invite_code"
                  type="text"
                  className="w-full px-6 py-4 bg-slate-50/50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 rounded-2xl focus:ring-2 focus:ring-slate-900 dark:focus:ring-white focus:border-transparent transition-all text-sm font-bold text-slate-900 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-700"
                  placeholder="Invite code (optional)"
                  value={formData.invite_code || ''}
                  onChange={handleChange}
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full h-14 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-slate-800 dark:hover:bg-slate-100 transition-all shadow-xl shadow-slate-900/10 active:scale-95 flex items-center justify-center space-x-3 mt-8"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <span>Create {isVendor ? 'Vendor' : 'Customer'} Account</span>}
          </button>
        </form>

        <div className="relative my-10">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-slate-100 dark:border-slate-800/50"></span>
          </div>
          <div className="relative flex justify-center">
            <span className="bg-white dark:bg-slate-900 px-4 text-[9px] font-black uppercase tracking-[0.3em] text-slate-300 dark:text-slate-700">Or Securely</span>
          </div>
        </div>

        <GoogleLoginButton role={isVendor ? 'vendor' : 'customer'} />

        <div className="mt-10 text-center">
          <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
            Already have an account?{' '}
            <Link to="/login" className="text-slate-900 dark:text-white font-black hover:underline underline-offset-4 ml-1">
              Log In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
