import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Mail, Loader2, ShieldCheck, ArrowRight, RefreshCcw } from 'lucide-react';
import authService from '../../api/authService';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const OTPVerification = () => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(60);
  const [resending, setResending] = useState(false);
  const inputRefs = useRef([]);
  
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  
  const queryParams = new URLSearchParams(location.search);
  const email = queryParams.get('email');
  const role = queryParams.get('role') || 'customer';
  const isMfa = queryParams.get('mfa') === 'true';

  useEffect(() => {
    if (!email) {
      toast.error('Email missing. Please try again.');
      navigate('/login');
    }
  }, [email, navigate]);

  useEffect(() => {
    let interval = null;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleChange = (index, value) => {
    if (isNaN(value)) return;
    
    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    // Auto-focus next
    if (value && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const data = e.clipboardData.getData('text').substring(0, 6);
    if (!/^\d+$/.test(data)) return;

    const newOtp = [...otp];
    data.split('').forEach((char, i) => {
      if (i < 6) newOtp[i] = char;
    });
    setOtp(newOtp);
    
    const nextIndex = data.length < 6 ? data.length : 5;
    inputRefs.current[nextIndex].focus();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const otpCode = otp.join('');
    if (otpCode.length < 6) {
      toast.error('Please enter the complete 6-digit code');
      return;
    }

    setLoading(true);
    try {
      const data = await authService.verifyOTP(email, otpCode);
      
      if (data.tokens) {
        // Customer success or Login success
        login(data.user, data.tokens, true);
        toast.success(isMfa ? 'Security verified! Welcome back.' : 'Account verified successfully!');
        navigate('/');
      } else {
        // Vendor success (Pending Approval)
        toast.success('Email verified! Redirecting to approval status...');
        navigate('/pending-approval');
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (timer > 0) return;
    
    setResending(true);
    try {
      await authService.resendOTP(email);
      setTimer(60);
      toast.success('A new OTP has been sent to your email.');
    } catch (err) {
      toast.error('Failed to resend OTP. Please try again.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[80vh] px-4">
      <div className="glass-card p-8 w-full max-w-md animate-in fade-in zoom-in duration-300">
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-primary-50 rounded-full flex items-center justify-center mb-4 text-primary-600 ring-4 ring-primary-50">
            <ShieldCheck className="h-8 w-8" />
          </div>
          <h2 className="text-3xl font-bold text-slate-900">Verify Email</h2>
          <p className="text-slate-600 mt-2">
            We've sent a 6-digit code to <br />
            <span className="font-semibold text-slate-900">{email}</span>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="flex justify-between gap-2">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={handlePaste}
                className="w-12 h-14 text-center text-2xl font-bold bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all"
              />
            ))}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary py-4 rounded-xl flex items-center justify-center space-x-2 group"
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                <span>Verify & Proceed</span>
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center space-y-4">
          <div className="text-sm text-slate-600">
            Didn't receive the code?
          </div>
          
          <button
            onClick={handleResend}
            disabled={timer > 0 || resending}
            className={`flex items-center justify-center space-x-2 mx-auto font-bold transition-all ${
              timer > 0 || resending ? 'text-slate-400 cursor-not-allowed' : 'text-primary-600 hover:text-primary-700 underline'
            }`}
          >
            {resending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCcw className={`h-4 w-4 ${timer > 0 ? '' : 'animate-pulse-slow'}`} />
            )}
            <span>
              {timer > 0 ? `Resend in ${timer}s` : 'Resend Code Now'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default OTPVerification;
