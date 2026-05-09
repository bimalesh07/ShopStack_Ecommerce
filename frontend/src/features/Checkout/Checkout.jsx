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
    <div className="container-tight">
      <div className="flex items-center space-x-2 text-xs font-bold text-slate-400 mb-6 uppercase tracking-[0.2em]">
        <Link to="/cart" className="hover:text-slate-900 transition-colors">Cart</Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-slate-900">Checkout</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Main Checkout Content */}
        <div className="lg:col-span-2 space-y-10">
          
          {/* Shipping Address Section */}
          <section className="space-y-8">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-4">
                <div className="bg-slate-100 p-2.5 rounded-xl">
                  <MapPin className="h-5 w-5 text-slate-900" />
                </div>
                <div>
                  <h2 className="text-xl font-medium text-slate-900 tracking-tight">Shipping Address</h2>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Where should we send it?</p>
                </div>
              </div>
              {!showAddressForm && (
                  <button 
                  onClick={() => setShowAddressForm(true)}
                  className="flex items-center space-x-2 text-xs font-bold text-slate-900 hover:bg-slate-100 px-4 py-2 rounded-lg border border-slate-200 transition-all uppercase tracking-widest"
                >
                  <Plus className="h-3 w-3" />
                  <span>Add New</span>
                </button>
              )}
            </div>

            {showAddressForm ? (
              <form onSubmit={handleAddAddress} className="glass-card p-10 space-y-8 animate-in fade-in zoom-in duration-300">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Name</label>

                    <input 
                      type="text" placeholder="John Doe" required 
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:bg-white focus:border-transparent outline-none transition-all font-medium" 
                      value={newAddress.name}
                      onChange={(e) => setNewAddress({...newAddress, name: e.target.value})}

                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Phone Number</label>
                    <input 
                      type="tel" placeholder="+91 98765 43210" required 
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:bg-white focus:border-transparent outline-none transition-all font-medium" 
                      value={newAddress.phone}
                      onChange={(e) => setNewAddress({...newAddress, phone: e.target.value})}
                    />
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Street Address</label>
                    <input 
                      type="text" placeholder="House No, Building, Street" required 
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:bg-white focus:border-transparent outline-none transition-all font-medium" 
                      value={newAddress.street}
                      onChange={(e) => setNewAddress({...newAddress, street: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">City</label>
                    <input 
                      type="text" placeholder="Mumbai" required 
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:bg-white focus:border-transparent outline-none transition-all font-medium" 
                      value={newAddress.city}
                      onChange={(e) => setNewAddress({...newAddress, city: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">State</label>
                    <input 
                      type="text" placeholder="Maharashtra" required 
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:bg-white focus:border-transparent outline-none transition-all font-medium" 
                      value={newAddress.state}
                      onChange={(e) => setNewAddress({...newAddress, state: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Pincode</label>
                    <input 
                      type="text" placeholder="400001" required 
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:bg-white focus:border-transparent outline-none transition-all font-medium" 
                      value={newAddress.pincode}
                      onChange={(e) => setNewAddress({...newAddress, pincode: e.target.value})}
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-4 pt-4">
                  <button type="button" onClick={() => setShowAddressForm(false)} className="px-8 py-4 font-black text-slate-400 hover:text-slate-600 transition-colors uppercase tracking-widest text-xs">Cancel</button>
                  <button type="submit" className="bg-slate-900 text-white px-10 py-4 rounded-2xl font-black hover:bg-primary-600 transition-all shadow-xl shadow-slate-900/10">Save & Use This Address</button>
                </div>
              </form>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {addresses.map((addr) => (
                  <div 
                    key={addr.id}
                    onClick={() => setSelectedAddressId(addr.id)}
                    className={`p-6 rounded-2xl border transition-all relative group ${selectedAddressId === addr.id ? 'border-slate-900 bg-slate-50/50 ring-1 ring-slate-900 shadow-sm' : 'border-slate-200 hover:border-slate-300 bg-white'}`}
                  >
                    <div className={`absolute top-6 right-6 h-5 w-5 rounded-full border flex items-center justify-center transition-all ${selectedAddressId === addr.id ? 'bg-slate-900 border-slate-900' : 'border-slate-200 group-hover:border-slate-300'}`}>
                      {selectedAddressId === addr.id && <CheckCircle2 className="h-3 w-3 text-white" />}
                    </div>
                    <p className="font-bold text-slate-900 mb-1">{addr.name}</p>

                    <p className="text-xs text-slate-400 font-medium mb-4 tracking-wide">{addr.phone}</p>
                    <div className="space-y-1">
                      <p className="text-sm text-slate-600 leading-relaxed font-normal">
                        {addr.street}, {addr.city}
                      </p>
                      <p className="text-sm text-slate-600 font-medium">
                        {addr.state} - {addr.pincode}
                      </p>
                    </div>
                  </div>
                ))}
                {addresses.length === 0 && (
                  <div className="col-span-full py-20 text-center bg-white rounded-[2.5rem] border-2 border-dashed border-slate-200">
                    <MapPin className="h-10 w-10 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-500 font-black">No addresses saved yet</p>
                    <p className="text-xs text-slate-400 mt-1 uppercase tracking-widest">Add your first address to proceed</p>
                  </div>
                )}
              </div>
            )}
          </section>

          {/* Payment Method Section */}
          <section className="space-y-8">
            <div className="flex items-center space-x-4 border-t border-slate-100 pt-10">
              <div className="bg-slate-100 p-2.5 rounded-xl">
                <CreditCard className="h-5 w-5 text-slate-900" />
              </div>
              <div>
                <h2 className="text-xl font-medium text-slate-900 tracking-tight">Payment Method</h2>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Select how you want to pay</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div 
                onClick={() => setPaymentMethod('cod')}
                className={`p-6 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${paymentMethod === 'cod' ? 'border-slate-900 bg-slate-50/50 ring-1 ring-slate-900' : 'border-slate-200 hover:border-slate-300 bg-white'}`}
              >
                <div className="flex items-center space-x-4">
                  <div className={`p-3 rounded-xl transition-colors ${paymentMethod === 'cod' ? 'bg-white shadow-sm' : 'bg-slate-50'}`}>
                    <Truck className="h-5 w-5 text-slate-900" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">Cash on Delivery</p>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Pay when you receive</p>
                  </div>
                </div>
                {paymentMethod === 'cod' && (
                  <CheckCircle2 className="h-5 w-5 text-slate-900" />
                )}
              </div>

              <div 
                onClick={() => setPaymentMethod('online')}
                className={`p-6 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${paymentMethod === 'online' ? 'border-slate-900 bg-slate-50/50 ring-1 ring-slate-900' : 'border-slate-200 hover:border-slate-300 bg-white'}`}
              >
                <div className="flex items-center space-x-4">
                  <div className={`p-3 rounded-xl transition-colors ${paymentMethod === 'online' ? 'bg-white shadow-sm' : 'bg-slate-900 text-white'}`}>
                    <CreditCard className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">Online Payment</p>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Razorpay Secure</p>
                  </div>
                </div>
                {paymentMethod === 'online' && (
                  <CheckCircle2 className="h-5 w-5 text-slate-900" />
                )}
              </div>
            </div>
          </section>
        </div>

        {/* Order Summary Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-3xl border border-slate-100 p-8 shadow-sm sticky top-24 space-y-8">
            <h3 className="text-xl font-medium text-slate-900 tracking-tight">Order Summary</h3>
            
            <div className="space-y-5 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
              {cart.items.map((item) => (
                <div key={item.id} className="flex items-center space-x-4 group">
                  <div className="h-16 w-16 bg-slate-50 rounded-xl overflow-hidden flex-shrink-0 border border-slate-100">
                    <img src={item.product_image || 'https://via.placeholder.com/150'} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-grow min-w-0">
                    <p className="text-xs font-bold text-slate-900 truncate">{item.product_name}</p>
                    <p className="text-[10px] font-medium text-slate-400 mt-0.5 uppercase tracking-widest">Qty: {item.quantity}</p>
                  </div>
                  <p className="text-xs font-bold text-slate-900">₹{parseFloat(item.total_price).toLocaleString('en-IN')}</p>
                </div>
              ))}
            </div>

            <div className="pt-6 border-t border-slate-100 space-y-3">
              <div className="flex justify-between text-slate-500 font-medium text-[11px] uppercase tracking-widest">
                <span>Subtotal</span>
                <span>₹{parseFloat(cart.total_amount).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-slate-500 font-medium text-[11px] uppercase tracking-widest">
                <span>Shipping</span>
                <span className="text-emerald-600 font-bold">Free</span>
              </div>
              <div className="flex justify-between pt-4 border-t border-slate-50">
                <span className="text-lg font-medium text-slate-900 tracking-tight">Total</span>
                <div className="text-right">
                  <span className="text-2xl font-bold text-slate-900 tracking-tight">₹{parseFloat(cart.total_amount).toLocaleString('en-IN')}</span>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Inclusive of all taxes</p>
                </div>
              </div>
            </div>

            <div className="space-y-4 pt-2">
              <div className="flex items-center space-x-3 text-[9px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 p-3 rounded-xl border border-slate-100">
                <ShieldCheck className="h-4 w-4 text-emerald-500" />
                <span>SSL encrypted Checkout</span>
              </div>
              
              <button 
                onClick={handlePlaceOrder}
                disabled={isPlacingOrder || !selectedAddressId}
                className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold text-base hover:bg-slate-800 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center space-x-3 group"
              >
                {isPlacingOrder ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <span>Confirm Order</span>
                    <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
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
