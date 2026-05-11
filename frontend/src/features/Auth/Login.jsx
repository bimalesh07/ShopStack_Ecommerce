import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import authService from '../../api/authService';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import GoogleLoginButton from '../../components/GoogleLoginButton';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const data = await authService.login({ email, password });
      
      if (data.otp_required) {
        toast.success('MFA Required: Please verify your device.');
        navigate(`/verify-otp?email=${encodeURIComponent(email)}&mfa=true`);
        return;
      }

      if (data.tokens?.access) {
        login(data.user, data.tokens);
        navigate('/');
      } else {
        setError('Login failed: No access token received');
      }
    } catch (err) {
      console.error('Login error:', err.response?.data);
      const errorMsg = err.response?.data?.error || err.response?.data?.detail || 'Invalid email or password';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen auth-gradient py-8 px-4">
      <div className="glass-card p-8 w-full max-w-md animate-in fade-in slide-in-from-bottom-8 duration-700 shadow-2xl">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-medium text-slate-900 dark:text-white font-serif mb-1 capitalize">Welcome Back</h2>
          <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Log in to your ShopStack account</p>
        </div>

        {error && (
          <div className="bg-rose-50 dark:bg-rose-900/10 text-rose-600 dark:text-rose-400 p-3.5 rounded-2xl text-[9px] font-black uppercase tracking-widest mb-6 border border-rose-100 dark:border-rose-900/20 animate-in shake duration-500">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Email Address</label>
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 dark:text-slate-600 group-focus-within:text-slate-900 dark:group-focus-within:text-white transition-colors" />
              <input
                type="email"
                required
                className="w-full pl-12 pr-6 py-3.5 bg-slate-50/50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 rounded-2xl focus:ring-2 focus:ring-slate-900 dark:focus:ring-white focus:border-transparent transition-all text-sm font-bold text-slate-900 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-700"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Password</label>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 dark:text-slate-600 group-focus-within:text-slate-900 dark:group-focus-within:text-white transition-colors" />
              <input
                type="password"
                required
                className="w-full pl-12 pr-6 py-3.5 bg-slate-50/50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 rounded-2xl focus:ring-2 focus:ring-slate-900 dark:focus:ring-white focus:border-transparent transition-all text-sm font-bold text-slate-900 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-700"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-slate-800 dark:hover:bg-slate-100 transition-all shadow-xl shadow-slate-900/10 active:scale-95 flex items-center justify-center space-x-3 mt-2"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <span>Sign In</span>}
          </button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-slate-100 dark:border-slate-800/50"></span>
          </div>
          <div className="relative flex justify-center">
            <span className="bg-white dark:bg-slate-900 px-4 text-[8px] font-black uppercase tracking-[0.3em] text-slate-300 dark:text-slate-700">Or Securely</span>
          </div>
        </div>

        <GoogleLoginButton role="customer" />

        <div className="mt-6 text-center">
          <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
            Don't have an account?{' '}
            <Link to="/signup" className="text-slate-900 dark:text-white font-black hover:underline underline-offset-4 ml-1">
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
