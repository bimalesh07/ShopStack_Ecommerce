import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { Trash2, Minus, Plus, ShoppingBag, ArrowRight, Loader2 } from 'lucide-react';

const Cart = () => {
  const { cart, loading, updateQuantity, removeFromCart } = useCart();
  const navigate = useNavigate();

  if (loading && !cart) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-12 w-12 animate-spin text-primary-600" />
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="bg-slate-100 p-6 rounded-full mb-6">
          <ShoppingBag className="h-12 w-12 text-slate-400" />
        </div>
        <h2 className="text-3xl font-bold text-slate-900 mb-2">Your cart is empty</h2>
        <p className="text-slate-600 mb-8 max-w-md">Looks like you haven't added anything to your cart yet. Explore our products and find something you love!</p>
        <Link to="/products" className="btn-primary px-8 py-3">Start Shopping</Link>
      </div>
    );
  }

  return (
    <div className="py-12">
      <h1 className="text-4xl font-black text-slate-900 mb-8 tracking-tight">Shopping Cart</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-6">
          {cart.items.map((item) => (
            <div key={item.id} className="glass-card p-4 flex items-center space-x-6">
              <div className="h-24 w-24 rounded-xl bg-slate-100 overflow-hidden flex-shrink-0">
                <img src={item.product_image || 'https://via.placeholder.com/150'} alt={item.product_name} className="h-full w-full object-cover" />
              </div>
              
              <div className="flex-grow">
                <div className="flex justify-between items-start">
                  <div>
                    <Link to={`/products/${item.product}`} className="text-lg font-bold text-slate-900 hover:text-primary-600 transition-colors">
                      {item.product_name}
                    </Link>
                    <p className="text-sm text-slate-500 mt-1">Sold by {item.vendor_name}</p>
                  </div>
                  <button 
                    onClick={() => removeFromCart(item.id)}
                    className="text-slate-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
                
                <div className="flex justify-between items-center mt-4">
                  <div className="flex items-center space-x-3 bg-slate-100 rounded-lg p-1">
                    <button 
                      onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                      className="p-1 hover:bg-white rounded-md transition-colors"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="font-bold w-8 text-center">{item.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="p-1 hover:bg-white rounded-md transition-colors"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  <p className="text-lg font-black text-slate-900">${item.total_price}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="glass-card p-6 sticky top-24">
            <h3 className="text-xl font-bold text-slate-900 mb-6">Order Summary</h3>
            <div className="space-y-4 mb-6">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal ({cart.items.length} items)</span>
                <span>${cart.total_amount}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Shipping</span>
                <span className="text-green-600 font-bold">FREE</span>
              </div>
              <div className="border-t border-slate-100 pt-4 flex justify-between items-end">
                <span className="font-bold text-slate-900">Total</span>
                <span className="text-3xl font-black text-primary-600">${cart.total_amount}</span>
              </div>
            </div>
            
            <button 
              onClick={() => navigate('/checkout')}
              className="w-full btn-primary py-4 flex items-center justify-center space-x-2 text-lg group"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </button>
            
            <p className="text-center text-[10px] text-slate-400 mt-4 uppercase tracking-widest font-bold">
              Secure Checkout Powered by ShopStack
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
