import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import addressService from '../../api/addressService';
import orderService from '../../api/orderService';
import paymentService from '../../api/paymentService';
import { Loader2, Plus, MapPin, CheckCircle2, ChevronRight, CreditCard, Truck, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';

const Checkout = () => {
  const { cart, fetchCart } = useCart();
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cod');
  
  const [newAddress, setNewAddress] = useState({
    name: '',
    phone: '',

    street: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India',
  });

  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      try {
        const addrData = await addressService.getAddresses();
        console.log('Fetched addresses:', addrData);
        setAddresses(addrData);
        if (addrData.length > 0) {
          const defaultAddr = addrData.find(a => a.is_default) || addrData[0];
          setSelectedAddressId(defaultAddr.id);
        }
      } catch (err) {
        console.error('Failed to load checkout data:', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleAddAddress = async (e) => {
    e.preventDefault();
    try {
      const data = await addressService.createAddress(newAddress);
      setAddresses([...addresses, data]);
      setSelectedAddressId(data.id);
      setShowAddressForm(false);
      toast.success('Address added successfully!');
    } catch (err) {
      toast.error('Failed to add address');
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddressId) {
      toast.error('Please select a shipping address');
      return;
    }

    setIsPlacingOrder(true);
    try {
      const orderData = {
        address_id: selectedAddressId,
        payment_method: paymentMethod,
        note: ''
      };
      
      const response = await orderService.createOrder(orderData);
      
      if (paymentMethod === 'cod') {
        toast.success('Order placed successfully!');
        fetchCart(); // Clear cart state
        navigate(`/order-success/${response.id}`);
      } else {
        // Online Payment Flow - response now contains Razorpay details
        await handleOnlinePayment(response);
      }
    } catch (err) {
      const message = err.response?.data?.error || 'Failed to place order';
      toast.error(message);
    } finally {
      setIsPlacingOrder(false);
    }
  };

  const handleOnlinePayment = async (orderResponse) => {
    try {
      const orderId = orderResponse.order.id;
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      
      // Step 4: Open Razorpay Checkout using data already returned from backend
      const options = {
        key: orderResponse.razorpay_key_id,
        amount: orderResponse.amount,
        currency: orderResponse.currency,
        name: "ShopStack",
        description: "Order Payment",
        order_id: orderResponse.razorpay_order_id,
        handler: async function(response) {
          try {
            // Step 5: Verify payment
            await paymentService.verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            });
            
            toast.success('Payment successful!');
            fetchCart();
            navigate(`/order-success/${orderId}`);
          } catch (err) {
            const message = err.response?.data?.error || 'Payment verification failed. Invalid signature.';
            toast.error(message);
            // On failure, stay on page but show error
          }
        },
        prefill: {
          name: user.name || user.full_name || '',
          email: user.email || '',
        },
        theme: { color: "#3399cc" },
        modal: {
          ondismiss: function() {
            toast.error("Payment cancelled.");
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      toast.error('Something went wrong. Please contact support.');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="h-12 w-12 animate-spin text-primary-600 mb-4" />
        <p className="text-slate-600 font-medium">Preparing your checkout...</p>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Your cart is empty</h2>
        <Link to="/products" className="btn-primary px-8 py-3">Start Shopping</Link>
      </div>
    );
  }

  return (
    <div className="container-tight pt-10 transition-colors duration-500">
      <div className="flex items-center space-x-2 text-xs font-bold text-slate-400 mb-6 uppercase tracking-[0.2em]">
        <Link to="/cart" className="hover:text-slate-900 dark:hover:text-white transition-colors">Cart</Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-slate-900 dark:text-white">Checkout</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Main Checkout Content */}
        <div className="lg:col-span-2 space-y-10">
          
          {/* Shipping Address Section - Neat & Clean */}
          <section className="space-y-8">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center space-x-3">
                <div className="bg-slate-900 dark:bg-white p-2 rounded-lg">
                  <MapPin className="h-4 w-4 text-white dark:text-slate-900" />
                </div>
                <div>
                  <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">Shipping Address</h2>
                </div>
              </div>
              {!showAddressForm && (
                  <button 
                  onClick={() => setShowAddressForm(true)}
                  className="text-[10px] font-black text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all uppercase tracking-[0.2em] border-b border-transparent hover:border-slate-900 dark:hover:border-white pb-0.5"
                >
                  + Add New
                </button>
              )}
            </div>

            {showAddressForm ? (
              <form onSubmit={handleAddAddress} className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 space-y-6 shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Full Name</label>
                    <input 
                      type="text" placeholder="John Doe" required 
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-1 focus:ring-slate-900 dark:focus:ring-white outline-none transition-all font-medium text-slate-900 dark:text-white" 
                      value={newAddress.name}
                      onChange={(e) => setNewAddress({...newAddress, name: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Phone</label>
                    <input 
                      type="tel" placeholder="+91 00000 00000" required 
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-1 focus:ring-slate-900 dark:focus:ring-white outline-none transition-all font-medium text-slate-900 dark:text-white" 
                      value={newAddress.phone}
                      onChange={(e) => setNewAddress({...newAddress, phone: e.target.value})}
                    />
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Street Address</label>
                    <input 
                      type="text" placeholder="House No, Street, Landmark" required 
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-1 focus:ring-slate-900 dark:focus:ring-white outline-none transition-all font-medium text-slate-900 dark:text-white" 
                      value={newAddress.street}
                      onChange={(e) => setNewAddress({...newAddress, street: e.target.value})}
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-4 md:col-span-2">
                    <input type="text" placeholder="City" required className="px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-xl outline-none text-slate-900 dark:text-white" value={newAddress.city} onChange={(e) => setNewAddress({...newAddress, city: e.target.value})} />
                    <input type="text" placeholder="State" required className="px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-xl outline-none text-slate-900 dark:text-white" value={newAddress.state} onChange={(e) => setNewAddress({...newAddress, state: e.target.value})} />
                    <input type="text" placeholder="Pincode" required className="px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-xl outline-none text-slate-900 dark:text-white" value={newAddress.pincode} onChange={(e) => setNewAddress({...newAddress, pincode: e.target.value})} />
                  </div>
                </div>
                <div className="flex justify-end space-x-4">
                  <button type="button" onClick={() => setShowAddressForm(false)} className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Cancel</button>
                  <button type="submit" className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest">Save Address</button>
                </div>
              </form>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {addresses.map((addr) => (
                  <div 
                    key={addr.id}
                    onClick={() => setSelectedAddressId(addr.id)}
                    className={`p-5 rounded-2xl border transition-all relative group cursor-pointer ${selectedAddressId === addr.id ? 'border-slate-900 dark:border-white bg-slate-50/50 dark:bg-white/5 ring-1 ring-slate-900 dark:ring-white shadow-sm' : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-600 bg-white dark:bg-slate-900'}`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <p className="text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-tight">{addr.name}</p>
                      {selectedAddressId === addr.id && <CheckCircle2 className="h-4 w-4 text-slate-900 dark:text-white" />}
                    </div>
                    <p className="text-[10px] text-slate-400 font-bold mb-3">{addr.phone}</p>
                    <div className="space-y-0.5">
                      <p className="text-xs text-slate-600 dark:text-slate-400 leading-tight">{addr.street}</p>
                      <p className="text-xs text-slate-600 dark:text-slate-400 font-black uppercase tracking-tight">{addr.city}, {addr.state} - {addr.pincode}</p>
                    </div>
                  </div>
                ))}
                {addresses.length === 0 && (
                  <div className="col-span-full py-16 text-center bg-slate-50 dark:bg-slate-900/30 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                    <MapPin className="h-8 w-8 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No addresses saved yet</p>
                  </div>
                )}
              </div>
            )}
          </section>

          {/* Payment Method Section - Sharp & Professional */}
          <section className="space-y-8 pt-4">
            <div className="flex items-center space-x-3 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="bg-slate-900 dark:bg-white p-2 rounded-lg">
                <CreditCard className="h-4 w-4 text-white dark:text-slate-900" />
              </div>
              <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">Payment Method</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div 
                onClick={() => setPaymentMethod('cod')}
                className={`p-5 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${paymentMethod === 'cod' ? 'border-slate-900 dark:border-white bg-slate-50/50 dark:bg-white/5 ring-1 ring-slate-900 dark:ring-white shadow-sm' : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-600 bg-white dark:bg-slate-900'}`}
              >
                <div className="flex items-center space-x-4">
                  <div className={`p-2.5 rounded-lg transition-colors ${paymentMethod === 'cod' ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900' : 'bg-slate-50 dark:bg-slate-800'}`}>
                    <Truck className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-tight">Cash on Delivery</p>
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Pay when you receive</p>
                  </div>
                </div>
                {paymentMethod === 'cod' && (
                  <CheckCircle2 className="h-4 w-4 text-slate-900 dark:text-white" />
                )}
              </div>

              <div 
                onClick={() => setPaymentMethod('online')}
                className={`p-5 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${paymentMethod === 'online' ? 'border-slate-900 dark:border-white bg-slate-50/50 dark:bg-white/5 ring-1 ring-slate-900 dark:ring-white shadow-sm' : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-600 bg-white dark:bg-slate-900'}`}
              >
                <div className="flex items-center space-x-4">
                  <div className={`p-2.5 rounded-lg transition-colors ${paymentMethod === 'online' ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900' : 'bg-slate-50 dark:bg-slate-800'}`}>
                    <CreditCard className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-tight">Online Payment</p>
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Razorpay Secure</p>
                  </div>
                </div>
                {paymentMethod === 'online' && (
                  <CheckCircle2 className="h-4 w-4 text-slate-900 dark:text-white" />
                )}
              </div>
            </div>
          </section>
        </div>

          {/* Order Summary Sidebar - Premium & Clean */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-slate-900/40 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm sticky top-24 space-y-8">
              <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest border-b border-slate-100 dark:border-slate-800 pb-4">Order Summary</h3>
              
              <div className="space-y-4 max-h-[35vh] overflow-y-auto pr-2 custom-scrollbar">
                {cart.items.map((item) => (
                  <div key={item.id} className="flex items-center space-x-4 group">
                    {/* Item Image - Pure White */}
                    <div className="h-14 w-14 bg-white rounded-lg overflow-hidden flex-shrink-0 border border-slate-100 dark:border-white/5 flex items-center justify-center">
                      <img 
                        src={(item.product_image || 'https://via.placeholder.com/150').replace('/upload/', '/upload/q_auto,f_auto,w_600/')} 
                        alt="" 
                        loading="lazy"
                        className="h-[80%] w-[80%] object-contain mix-blend-multiply" 
                      />
                    </div>
                    <div className="flex-grow min-w-0">
                      <p className="text-[11px] font-black text-slate-900 dark:text-white truncate uppercase tracking-tight">{item.product_name}</p>
                      <p className="text-[9px] font-black text-slate-400 mt-0.5 uppercase tracking-widest">Qty: {item.quantity}</p>
                    </div>
                    <p className="text-[11px] font-black text-slate-900 dark:text-white tracking-tighter">₹{parseFloat(item.total_price).toLocaleString('en-IN')}</p>
                  </div>
                ))}
              </div>

              <div className="pt-6 border-t border-slate-100 dark:border-slate-800 space-y-4">
                <div className="flex justify-between text-slate-500 dark:text-slate-400">
                  <span className="text-[10px] font-black uppercase tracking-widest">Subtotal</span>
                  <span className="text-xs font-black text-slate-900 dark:text-white">₹{parseFloat(cart.subtotal).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-slate-500 dark:text-slate-400">
                  <span className="text-[10px] font-black uppercase tracking-widest">Shipping</span>
                  {parseFloat(cart.shipping_fee) === 0 ? (
                    <span className="text-[10px] font-black text-emerald-600 uppercase">Complimentary</span>
                  ) : (
                    <span className="text-xs font-black text-slate-900 dark:text-white">₹{parseFloat(cart.shipping_fee).toLocaleString('en-IN')}</span>
                  )}
                </div>
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-end">
                  <div className="space-y-1">
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em]">Total Investment</p>
                    <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">₹{parseFloat(cart.total_amount).toLocaleString('en-IN')}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4 pt-2">
                <div className="flex items-center space-x-3 text-[8px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 dark:bg-slate-800/30 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                  <span>Secure Encrypted Payment</span>
                </div>
                
                <button 
                  onClick={handlePlaceOrder}
                  disabled={isPlacingOrder || !selectedAddressId}
                  className="w-full bg-slate-900 text-white dark:bg-sky-500 dark:text-white py-4 rounded-xl font-black text-[10px] uppercase tracking-[0.3em] hover:opacity-90 transition-all active:scale-[0.98] disabled:opacity-30 flex items-center justify-center space-x-3 shadow-xl shadow-slate-900/10 dark:shadow-sky-500/20"
                >
                  {isPlacingOrder ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Authenticating...</span>
                    </>
                  ) : (
                    <>
                      <span>Complete Order</span>
                      <ChevronRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
      </div>
    </div>
  );
};

export default Checkout;
