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
    <div className="min-h-screen pb-24 bg-transparent transition-colors duration-500">
      <div className="container-tight">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 pt-16">
          <div className="space-y-1">
            <h1 className="text-4xl font-bold text-slate-900 dark:text-white tracking-tight">Shopping Cart</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Review your curated selection before checkout.</p>
          </div>
          <Link to="/products" className="text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors border-b border-transparent hover:border-slate-900 dark:hover:border-white pb-1">
            Continue Shopping
          </Link>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
          <div className="lg:col-span-2 space-y-4">
            {cart.items.map((item) => (
              <div key={item.id} className="bg-white dark:bg-transparent border border-slate-100 dark:border-slate-800/60 rounded-3xl p-4 md:p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4 md:gap-6 shadow-sm hover:shadow-md transition-all">
                <div className="h-24 w-24 md:h-28 md:w-28 rounded-2xl bg-slate-50 dark:bg-transparent border border-slate-100/50 dark:border-slate-800/40 overflow-hidden flex-shrink-0">
                  <img 
                    src={item.product_image || 'https://via.placeholder.com/150'} 
                    alt={item.product_name} 
                    className="h-full w-full object-contain p-2" 
                  />
                </div>
                
                <div className="flex-grow w-full flex flex-col justify-between py-1">
                  <div className="flex justify-between items-start">
                    <div className="space-y-0.5">
                      <Link to={`/products/${item.product_id || item.product}`} className="text-lg font-bold text-slate-900 dark:text-white hover:text-primary-600 transition-colors leading-tight">
                        {item.product_name}
                      </Link>
                      <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Vendor: {item.vendor_name || 'Generic Vendor'}</p>
                    </div>
                    <button 
                      onClick={() => removeFromCart(item.id)}
                      className="p-2 text-slate-300 hover:text-red-500 transition-all"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                  
                  <div className="flex justify-between items-end mt-4">
                    <div className="flex items-center gap-3 bg-transparent rounded-xl px-3 py-1.5 border border-slate-200 dark:border-slate-800 transition-colors">
                      <button 
                        onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                        className="text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="font-bold text-sm text-slate-900 dark:text-white min-w-[1.5rem] text-center">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-0.5">Subtotal</p>
                      <p className="text-xl font-bold text-slate-900 dark:text-white">₹{parseFloat(item.total_price).toLocaleString('en-IN')}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
  
          {/* Summary Sidebar */}
          <div className="lg:col-span-1 lg:sticky lg:top-28">
            <div className="bg-white dark:bg-transparent border border-slate-100 dark:border-slate-800/60 rounded-[2rem] p-8 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-8">Order Summary</h3>
              
              <div className="space-y-5 mb-10">
                <div className="flex justify-between text-slate-500 dark:text-slate-400">
                  <span className="text-sm font-medium">Subtotal ({cart.items.length} items)</span>
                  <span className="text-slate-900 dark:text-white font-bold">₹{parseFloat(cart.subtotal).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-slate-500 dark:text-slate-400">
                  <span className="text-sm font-medium">Shipping</span>
                  {parseFloat(cart.shipping_fee) === 0 ? (
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold text-xs uppercase tracking-widest">Free</span>
                  ) : (
                    <span className="text-slate-900 dark:text-white font-bold">₹{parseFloat(cart.shipping_fee).toLocaleString('en-IN')}</span>
                  )}
                </div>
                
                <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex justify-between items-end">
                  <div className="space-y-0.5">
                    <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Total Amount</p>
                    <p className="text-4xl font-bold text-slate-900 dark:text-white">₹{parseFloat(cart.total_amount).toLocaleString('en-IN')}</p>
                  </div>
                </div>

                {/* Free Shipping Progress Bar */}
                {parseFloat(cart.subtotal) < 500 && (
                  <div className="mt-6 space-y-3">
                    <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest">
                      <span className="text-slate-400">Free Shipping Goal</span>
                      <span className="text-primary-600">₹{parseFloat(500 - cart.subtotal).toLocaleString('en-IN')} more to go</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary-500 rounded-full transition-all duration-500 ease-out"
                        style={{ width: `${Math.min(100, (cart.subtotal / 500) * 100)}%` }}
                      />
                    </div>
                    <p className="text-[9px] text-slate-400 font-medium">Add ₹500 or more to your cart to enjoy free shipping!</p>
                  </div>
                )}
                {parseFloat(cart.subtotal) >= 500 && (
                  <div className="mt-6 flex items-center gap-2 px-4 py-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-100 dark:border-emerald-800/30">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                    <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold uppercase tracking-widest">You've unlocked Free Shipping!</span>
                  </div>
                )}
              </div>
              
              <button 
                onClick={() => navigate('/checkout')}
                className="w-full bg-slate-900 text-white dark:bg-white dark:text-slate-900 py-4 rounded-2xl font-bold text-base hover:bg-slate-800 dark:hover:bg-slate-100 transition-all active:scale-[0.98] flex items-center justify-center gap-3 group shadow-xl hover:shadow-2xl"
              >
                <span>Checkout Now</span>
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </button>
              
              <div className="mt-8 flex items-center justify-center gap-2">
                <div className="w-1 h-1 bg-emerald-500 rounded-full" />
                <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Secure Checkout</span>
              </div>
            </div>
            
            {/* Minimal Trust Indicator */}
            <div className="mt-6 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 flex items-center gap-4">
              <div className="h-10 w-10 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl flex items-center justify-center">
                <ShoppingBag className="h-5 w-5 text-slate-400 dark:text-slate-500" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">Buyer Protection</p>
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
