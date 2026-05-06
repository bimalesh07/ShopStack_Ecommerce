import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle, ShoppingBag, ArrowRight, Package } from 'lucide-react';

const OrderSuccess = () => {
  const { id } = useParams();

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4">
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-green-100 rounded-full scale-150 blur-3xl opacity-50" />
        <div className="relative bg-white p-6 rounded-full shadow-2xl">
          <CheckCircle className="h-20 w-20 text-green-500 animate-in zoom-in duration-500" />
        </div>
      </div>
      
      <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-4">
        Order Placed Successfully!
      </h1>
      
      <p className="text-xl text-slate-600 mb-8 max-w-lg mx-auto leading-relaxed">
        Thank you for your purchase. Your order <span className="font-black text-slate-900">#{id?.slice(0, 8)}</span> has been received and is being processed.
      </p>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <Link 
          to="/dashboard" 
          className="flex items-center space-x-2 bg-slate-900 text-white px-8 py-4 rounded-2xl font-bold hover:bg-primary-600 transition-all group"
        >
          <Package className="h-5 w-5" />
          <span>View My Orders</span>
          <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
        </Link>
        <Link 
          to="/products" 
          className="flex items-center space-x-2 bg-white border-2 border-slate-100 px-8 py-4 rounded-2xl font-bold text-slate-600 hover:border-primary-500 hover:text-primary-600 transition-all"
        >
          <ShoppingBag className="h-5 w-5" />
          <span>Continue Shopping</span>
        </Link>
      </div>
    </div>
  );
};

export default OrderSuccess;
