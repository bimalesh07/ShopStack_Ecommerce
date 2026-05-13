import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { Trash2, Minus, Plus, ShoppingBag, ArrowRight, Loader2 } from 'lucide-react';

const Cart = () => {
  const { cart, loading, updateQuantity, removeFromCart } = useCart();
  const navigate = useNavigate();

  // Loading state
  if (loading && !cart) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-12 w-12 animate-spin text-primary-600" />
      </div>
    );
  }

  // Empty cart state
  if (!cart || !Array.isArray(cart.items) || cart.items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6">
        <div className="bg-slate-100 dark:bg-slate-800/50 p-8 rounded-full mb-8 animate-bounce-slow">
          <ShoppingBag className="h-12 w-12 text-slate-400 dark:text-slate-500" />
        </div>
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-3 tracking-tight">Your cart is empty</h2>
        <p className="text-slate-600 dark:text-slate-400 mb-10 max-w-md font-medium leading-relaxed text-sm md:text-base">Looks like you haven't added anything to your cart yet.</p>
        <Link to="/products" className="inline-flex items-center px-10 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold text-[12px] uppercase tracking-widest hover:bg-primary-600 transition-all shadow-xl group">
          <span>Start Shopping</span>
          <ArrowRight className="h-4 w-4 ml-3 group-hover:translate-x-1.5 transition-transform" />
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24 bg-transparent transition-colors duration-500 px-4">
      <div className="container-tight">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 pt-16">
          <div className="space-y-1">
            <h1 className="text-2xl md:text-4xl font-bold text-slate-900 dark:text-white tracking-tight">Shopping Bag</h1>
            <p className="text-slate-500 dark:text-slate-400 text-[10px] md:text-sm font-medium uppercase tracking-widest">Review your curated selection</p>
          </div>
          <Link to="/products" className="text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors border-b border-transparent hover:border-slate-900 dark:hover:border-white pb-1">
            Continue Shopping
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
          <div className="lg:col-span-2 space-y-6">
            {cart.items.map((item) => (
              <div key={item.id} className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex flex-col sm:flex-row items-center gap-6 transition-all duration-300 hover:border-slate-300 dark:hover:border-slate-700 shadow-sm">
                
                {/* Product Image - Pure White & Clean */}
                <div className="h-32 w-32 rounded-xl bg-white border border-slate-100 dark:border-white/5 overflow-hidden flex-shrink-0 flex items-center justify-center shadow-sm">
                  <img
                    src={(item.product_image || 'https://via.placeholder.com/150').replace('/upload/', '/upload/q_auto,f_auto,w_600/')}
                    alt={item.product_name}
                    loading="lazy"
                    className="h-[85%] w-[85%] object-contain mix-blend-multiply"
                  />
                </div>

                <div className="flex-grow w-full flex flex-col py-1">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <p className="text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                        {item.vendor_name || 'Generic Vendor'}
                      </p>
                      <Link to={`/products/${item.product_id || item.product}`} className="text-base font-black text-slate-900 dark:text-white hover:opacity-70 transition-opacity leading-tight block">
                        {item.product_name}
                      </Link>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="p-2 text-slate-300 hover:text-rose-500 transition-all"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="flex justify-between items-end mt-6">
                    {/* Quantity Controls - Minimalist */}
                    <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg px-3 py-1.5 border border-slate-100 dark:border-slate-800">
                      <button
                        onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                        className="text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="font-black text-sm text-slate-900 dark:text-white min-w-[1.2rem] text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <div className="text-right">
                      <p className="text-[8px] text-slate-400 font-black uppercase tracking-widest mb-0.5">Subtotal</p>
                      <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter">₹{parseFloat(item.total_price).toLocaleString('en-IN')}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Summary Sidebar - Premium & Clean */}
          <div className="lg:col-span-1 lg:sticky lg:top-28">
            <div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 shadow-sm">
              <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest mb-8 border-b border-slate-100 dark:border-slate-800 pb-4">Order Summary</h3>

              <div className="space-y-4 mb-8">
                <div className="flex justify-between text-slate-500 dark:text-slate-400">
                  <span className="text-xs font-bold uppercase tracking-wider">Subtotal</span>
                  <span className="text-slate-900 dark:text-white font-black">₹{parseFloat(cart.subtotal).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-slate-500 dark:text-slate-400">
                  <span className="text-xs font-bold uppercase tracking-wider">Shipping</span>
                  {parseFloat(cart.shipping_fee) === 0 ? (
                    <span className="text-emerald-600 font-black text-[10px] uppercase tracking-widest">Complimentary</span>
                  ) : (
                    <span className="text-slate-900 dark:text-white font-black">₹{parseFloat(cart.shipping_fee).toLocaleString('en-IN')}</span>
                  )}
                </div>

                <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex justify-between items-end">
                  <div className="space-y-1">
                    <p className="text-[8px] uppercase tracking-[0.2em] text-slate-400 font-black">Total Amount</p>
                    <p className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">₹{parseFloat(cart.total_amount).toLocaleString('en-IN')}</p>
                  </div>
                </div>

                {/* Free Shipping Progress */}
                {parseFloat(cart.subtotal) < 500 ? (
                  <div className="mt-6 p-4 bg-slate-50 dark:bg-slate-800/30 rounded-xl border border-slate-100 dark:border-slate-800">
                    <div className="flex justify-between items-center text-[8px] font-black uppercase tracking-widest mb-2">
                      <span className="text-slate-400">Shipping Goal</span>
                      <span className="text-slate-900 dark:text-white">₹{parseFloat(500 - cart.subtotal).toLocaleString('en-IN')} more</span>
                    </div>
                    <div className="h-1 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-slate-900 dark:bg-white transition-all duration-700"
                        style={{ width: `${Math.min(100, (cart.subtotal / 500) * 100)}%` }}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="mt-6 flex items-center gap-2 px-4 py-3 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl border border-emerald-100 dark:border-emerald-500/20">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                    <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-black uppercase tracking-widest">You've Unlocked Free Shipping!</span>
                  </div>
                )}
              </div>

              <button 
                onClick={() => navigate('/checkout')}
                className="w-full bg-slate-900 text-white dark:bg-white dark:text-slate-900 h-14 md:h-16 rounded-xl font-black text-[10px] uppercase tracking-[0.3em] hover:opacity-90 transition-all active:scale-[0.98] flex items-center justify-center gap-3 shadow-xl"
              >
                <span>Checkout Securely</span>
                <ArrowRight className="h-4 w-4" />
              </button>

              <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
                <p className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest">Buyer Protection</p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Secure transactions with full refund support.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
