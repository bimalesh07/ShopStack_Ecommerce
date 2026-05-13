import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle, ShoppingBag, ArrowRight, Package, MapPin, CreditCard, Loader2, ShieldCheck } from 'lucide-react';
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
        <div className="text-center space-y-6">
          <div className="relative inline-block">
            <div className="absolute inset-0 bg-emerald-100 dark:bg-emerald-500/20 rounded-full scale-150 blur-3xl opacity-30" />
            <div className="relative bg-emerald-500 p-4 rounded-full shadow-lg shadow-emerald-500/20">
              <CheckCircle className="h-8 w-8 text-white" />
            </div>
          </div>
          
          <div className="space-y-2">
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tighter uppercase">
              Order Placed
            </h1>
            <p className="text-slate-400 dark:text-slate-500 text-xs font-black uppercase tracking-[0.3em]">
              Confirmation ID: #{id?.slice(0, 8)}
            </p>
          </div>

          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium max-w-sm mx-auto leading-relaxed">
            Your selection has been received and is currently being prepared for dispatch.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
            <Link 
              to="/dashboard" 
              className="w-full sm:w-auto flex items-center justify-center space-x-3 bg-slate-900 text-white dark:bg-white dark:text-slate-900 px-10 py-4 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] hover:opacity-90 transition-all shadow-xl group"
            >
              <Package className="h-4 w-4" />
              <span>Track Orders</span>
            </Link>
            <Link 
              to="/products" 
              className="w-full sm:w-auto flex items-center justify-center space-x-3 bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white px-10 py-4 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
            >
              <span>Continue Shopping</span>
            </Link>
          </div>
        </div>

        {/* 2. Shipping & Payment Grid - Neat & Clean */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-y border-slate-100 dark:border-slate-800 py-10">
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="bg-slate-900 dark:bg-white p-1.5 rounded-md">
                <MapPin className="h-3 w-3 text-white dark:text-slate-900" />
              </div>
              <h3 className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-widest">Shipping Address</h3>
            </div>
            {order?.address ? (
              <div className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed pl-9">
                <p className="font-black text-slate-900 dark:text-white uppercase tracking-tight mb-1">{order.address.name}</p>
                <p>{order.address.street}, {order.address.city}</p>
                <p>{order.address.state} - {order.address.pincode}</p>
                <p className="font-bold mt-2">{order.address.phone}</p>
              </div>
            ) : (
              <p className="text-[10px] text-slate-400 pl-9 uppercase">Details unavailable</p>
            )}
          </div>

          <div className="space-y-4 md:pl-12 md:border-l border-slate-100 dark:border-slate-800">
            <div className="flex items-center space-x-3">
              <div className="bg-slate-900 dark:bg-white p-1.5 rounded-md">
                <CreditCard className="h-3 w-3 text-white dark:text-slate-900" />
              </div>
              <h3 className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-widest">Payment Method</h3>
            </div>
            <div className="pl-9 pt-1">
              <span className="inline-flex items-center px-4 py-2 bg-slate-50 dark:bg-slate-800/50 rounded-lg text-[9px] font-black text-slate-700 dark:text-slate-300 border border-slate-100 dark:border-slate-800 uppercase tracking-widest">
                {order?.payment_method === 'cod' ? 'Cash on Delivery' : 'Online Payment'}
              </span>
            </div>
          </div>
        </div>

        {/* 3. Order Summary - Gallery Style */}
        <div className="space-y-8 bg-white dark:bg-slate-900/40 rounded-2xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm">
          <h3 className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-[0.2em] border-b border-slate-100 dark:border-slate-800 pb-4">Curated Selection</h3>
          
          <div className="space-y-6">
            {order?.items?.map((item) => (
              <div key={item.id} className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  {/* Item Image - Pure White */}
                  <div className="h-16 w-16 bg-white rounded-xl border border-slate-100 dark:border-white/5 overflow-hidden flex-shrink-0 flex items-center justify-center shadow-sm">
                    {item.product_image && (
                      <img 
                        src={item.product_image.replace('/upload/', '/upload/q_auto,f_auto,w_600/')} 
                        alt="" 
                        loading="lazy"
                        className="h-[80%] w-[80%] object-contain mix-blend-multiply" 
                      />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-tight truncate max-w-[200px] sm:max-w-[300px]">
                      {item.product_name}
                    </p>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">
                      Qty: {item.quantity}
                    </p>
                  </div>
                </div>
                <p className="text-sm font-black text-slate-900 dark:text-white tracking-tighter">
                  ₹{parseFloat(item.total_price).toLocaleString('en-IN')}
                </p>
              </div>
            ))}
          </div>

          <div className="pt-8 border-t border-slate-100 dark:border-slate-800 space-y-4">
            <div className="flex justify-between items-center text-slate-400 text-[10px] font-black uppercase tracking-widest">
              <span>Subtotal</span>
              <span className="text-slate-900 dark:text-white">₹{parseFloat(order?.total_amount || 0).toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between items-center text-slate-400 text-[10px] font-black uppercase tracking-widest">
              <span>Shipping Fee</span>
              <span className="text-emerald-600 font-black">Complimentary</span>
            </div>
            <div className="flex justify-between items-end pt-6 border-t border-slate-100 dark:border-slate-800">
              <div className="space-y-1">
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em]">Total Investment</p>
                <p className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">
                  ₹{parseFloat(order?.total_amount || 0).toLocaleString('en-IN')}
                </p>
              </div>
              <div className="flex items-center gap-2 opacity-40">
                <ShieldCheck className="h-3 w-3 text-emerald-500" />
                <span className="text-[7px] font-black text-slate-400 uppercase tracking-widest">Authenticated</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default OrderSuccess;
