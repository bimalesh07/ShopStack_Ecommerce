import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, CheckCircle2, Store, Mail, ArrowLeft } from 'lucide-react';

const VendorPendingApproval = () => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-center min-h-[80vh] px-4">
      <div className="glass-card p-10 w-full max-w-2xl text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="relative mx-auto w-24 h-24 mb-8">
          <div className="absolute inset-0 bg-amber-100 rounded-full animate-ping opacity-20"></div>
          <div className="relative w-24 h-24 bg-amber-50 rounded-full flex items-center justify-center text-amber-600 ring-8 ring-amber-50">
            <Clock className="h-12 w-12" />
          </div>
          <div className="absolute -right-2 -bottom-2 w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white border-4 border-white">
            <CheckCircle2 className="h-6 w-6" />
          </div>
        </div>

        <h1 className="text-4xl font-black text-slate-900 mb-4">
          Application Received!
        </h1>
        
        <p className="text-xl text-slate-600 mb-8 max-w-lg mx-auto leading-relaxed">
          Your email has been verified. Our admin team is currently reviewing your shop details. 
          We'll notify you via email once your account is activated.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
            <Mail className="h-6 w-6 text-primary-600 mx-auto mb-3" />
            <h3 className="font-bold text-slate-900 text-sm mb-1">Step 1</h3>
            <p className="text-xs text-slate-500">Email Verified</p>
          </div>
          <div className="p-6 bg-primary-50 rounded-2xl border border-primary-100 ring-2 ring-primary-500/20">
            <Clock className="h-6 w-6 text-primary-600 mx-auto mb-3" />
            <h3 className="font-bold text-slate-900 text-sm mb-1">Step 2</h3>
            <p className="text-xs text-slate-500">Admin Review</p>
          </div>
          <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 opacity-50">
            <Store className="h-6 w-6 text-slate-400 mx-auto mb-3" />
            <h3 className="font-bold text-slate-400 text-sm mb-1">Step 3</h3>
            <p className="text-xs text-slate-500">Start Selling</p>
          </div>
        </div>

        <div className="space-y-4">
          <button 
            onClick={() => navigate('/')}
            className="btn-primary px-8 py-3 rounded-xl flex items-center justify-center space-x-2 mx-auto group"
          >
            <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
            <span>Back to Home</span>
          </button>
          
          <p className="text-sm text-slate-500">
            Usually takes 24-48 hours. Check your inbox for updates.
          </p>
        </div>
      </div>
    </div>
  );
};

export default VendorPendingApproval;
