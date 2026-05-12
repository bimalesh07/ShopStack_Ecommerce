import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle, ShoppingBag, ArrowRight, Package, MapPin, CreditCard, Loader2 } from 'lucide-react';
import orderService from '../../api/orderService';

const OrderSuccess = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const data = await orderService.getOrderById(id);
        setOrder(data);
      } catch (err) {
        console.error('Failed to fetch order details:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="h-10 w-10 animate-spin text-slate-900 mb-4" />
        <p className="text-slate-500 font-medium">Finalizing order details...</p>
      </div>
    );
  }

  return (
    <div className="container-tight py-12 lg:py-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="max-w-3xl mx-auto space-y-16">
        
        {/* 1. Airy Header & Confirmation Message */}
        <div className="text-center space-y-8">
          <div className="relative inline-block">
            <div className="absolute inset-0 bg-emerald-100 rounded-full scale-150 blur-2xl opacity-40" />
            <div className="relative bg-emerald-50 p-4 rounded-full border border-emerald-100">
              <CheckCircle className="h-12 w-12 text-emerald-600" />
            </div>
          </div>
          
          <div className="space-y-3">
            <h1 className="text-3xl md:text-4xl font-medium text-slate-900 tracking-tight">
              Order Placed Successfully!
            </h1>
            <p className="text-slate-500 text-lg max-w-lg mx-auto leading-relaxed">
              Thank you for your purchase. Your order <span className="font-bold text-slate-900">#{id?.slice(0, 8)}</span> has been received and is being processed.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link 
              to="/dashboard" 
              className="w-full sm:w-auto flex items-center justify-center space-x-3 bg-slate-900 text-white px-8 py-4 rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/10 group"
            >
              <Package className="h-5 w-5" />
              <span>View My Orders</span>
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link 
              to="/products" 
              className="w-full sm:w-auto flex items-center justify-center space-x-3 bg-white border border-slate-200 text-slate-600 px-8 py-4 rounded-xl font-bold hover:bg-slate-50 transition-all"
            >
              <ShoppingBag className="h-5 w-5" />
              <span>Continue Shopping</span>
            </Link>
          </div>
        </div>

        {/* 2. Shipping & Payment Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-y border-slate-100 py-12">
          <div className="space-y-4">
            <div className="flex items-center space-x-3 text-slate-900">
              <MapPin className="h-5 w-5 text-slate-400" />
              <h3 className="font-medium">Shipping Address</h3>
            </div>
            {order?.address ? (
              <div className="text-sm text-slate-500 leading-relaxed pl-8">
                <p className="font-bold text-slate-800 mb-1">{order.address.name}</p>
                <p>{order.address.street}</p>
                <p>{order.address.city}, {order.address.state} - {order.address.pincode}</p>
                <p>{order.address.phone}</p>
              </div>
            ) : (
              <p className="text-sm text-slate-400 pl-8">Address details unavailable.</p>
            )}
          </div>

          <div className="space-y-4 border-t md:border-t-0 md:border-l border-slate-100 pt-8 md:pt-0 md:pl-12">
            <div className="flex items-center space-x-3 text-slate-900">
              <CreditCard className="h-5 w-5 text-slate-400" />
              <h3 className="font-medium">Payment Method</h3>
            </div>
            <div className="pl-8">
              <span className="inline-flex items-center px-4 py-2 bg-slate-50 rounded-lg text-sm font-medium text-slate-700 border border-slate-100 uppercase tracking-widest text-[10px]">
                {order?.payment_method === 'cod' ? 'Cash on Delivery' : 'Online Payment'}
              </span>
            </div>
          </div>
        </div>

        {/* 3. Order Summary */}
        <div className="space-y-8 bg-slate-50/50 rounded-3xl p-8 lg:p-12 border border-slate-100">
          <h3 className="text-xl font-medium text-slate-900">Order Summary</h3>
          
          <div className="space-y-6">
            {order?.items?.map((item) => (
              <div key={item.id} className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 bg-slate-200 dark:bg-slate-800 animate-pulse rounded-lg border border-slate-200 overflow-hidden flex-shrink-0">
                    {item.product_image && (
                      <img 
                        src={item.product_image.replace('/upload/', '/upload/q_auto,f_auto,w_600/')} 
                        alt="" 
                        loading="lazy"
                        className="w-full h-full object-cover" 
                      />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-900 truncate max-w-[200px] sm:max-w-[300px]">
                      {item.product_name}
                    </p>
                    <p className="text-[11px] font-medium text-slate-400 uppercase tracking-widest mt-0.5">
                      Qty: {item.quantity}
                    </p>
                  </div>
                </div>
                <p className="text-sm font-bold text-slate-900 whitespace-nowrap">
                  ₹{parseFloat(item.total_price).toLocaleString('en-IN')}
                </p>
              </div>
            ))}
          </div>

          <div className="pt-8 border-t border-slate-200 space-y-4">
            <div className="flex justify-between items-center text-slate-500 text-xs font-medium uppercase tracking-widest">
              <span>Subtotal</span>
              <span>₹{parseFloat(order?.total_amount || 0).toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between items-center text-slate-500 text-xs font-medium uppercase tracking-widest">
              <span>Shipping</span>
              <span className="text-emerald-600 font-bold">Free</span>
            </div>
            <div className="flex justify-between items-center pt-6 border-t border-slate-200">
              <span className="text-xl font-medium text-slate-900">Total</span>
              <span className="text-2xl font-bold text-slate-900 tracking-tight">
                ₹{parseFloat(order?.total_amount || 0).toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default OrderSuccess;
