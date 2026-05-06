import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import addressService from '../../api/addressService';
import orderService from '../../api/orderService';
import { Loader2, Plus, MapPin, CheckCircle2, ChevronRight, CreditCard, Truck, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';

const Checkout = () => {
  const { cart, fetchCart } = useCart();
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(false);
  
  const [newAddress, setNewAddress] = useState({
    full_name: '',
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
        payment_method: 'cod',
        note: ''
      };
      const response = await orderService.createOrder(orderData);
      toast.success('Order placed successfully!');
      fetchCart(); // Clear cart state
      navigate(`/order-success/${response.id}`);
    } catch (err) {
      const message = err.response?.data?.error || 'Failed to place order';
      toast.error(message);
    } finally {
      setIsPlacingOrder(false);
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
    <div className="max-w-6xl mx-auto py-12 px-4">
      <div className="flex items-center space-x-2 text-sm font-bold text-slate-400 mb-8 uppercase tracking-widest">
        <Link to="/cart" className="hover:text-primary-600">Cart</Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-slate-900 underline decoration-primary-500 decoration-4 underline-offset-8">Checkout</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Main Checkout Content */}
        <div className="lg:col-span-2 space-y-10">
          
          {/* Shipping Address Section */}
          <section className="space-y-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <div className="bg-primary-100 p-2 rounded-xl">
                  <MapPin className="h-5 w-5 text-primary-600" />
                </div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Shipping Address</h2>
              </div>
              {!showAddressForm && (
                <button 
                  onClick={() => setShowAddressForm(true)}
                  className="flex items-center space-x-2 text-sm font-bold text-primary-600 hover:text-primary-700"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add New Address</span>
                </button>
              )}
            </div>

            {showAddressForm ? (
              <form onSubmit={handleAddAddress} className="bg-white p-8 rounded-3xl border-2 border-primary-100 space-y-6 animate-in slide-in-from-top-4 duration-300">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <input 
                    type="text" placeholder="Full Name" required 
                    className="form-input" value={newAddress.full_name}
                    onChange={(e) => setNewAddress({...newAddress, full_name: e.target.value})}
                  />
                  <input 
                    type="text" placeholder="Phone Number" required 
                    className="form-input" value={newAddress.phone}
                    onChange={(e) => setNewAddress({...newAddress, phone: e.target.value})}
                  />
                  <div className="md:col-span-2">
                    <input 
                      type="text" placeholder="Street Address" required 
                      className="form-input" value={newAddress.street}
                      onChange={(e) => setNewAddress({...newAddress, street: e.target.value})}
                    />
                  </div>
                  <input 
                    type="text" placeholder="City" required 
                    className="form-input" value={newAddress.city}
                    onChange={(e) => setNewAddress({...newAddress, city: e.target.value})}
                  />
                  <input 
                    type="text" placeholder="State" required 
                    className="form-input" value={newAddress.state}
                    onChange={(e) => setNewAddress({...newAddress, state: e.target.value})}
                  />
                  <input 
                    type="text" placeholder="Pincode" required 
                    className="form-input" value={newAddress.pincode}
                    onChange={(e) => setNewAddress({...newAddress, pincode: e.target.value})}
                  />
                </div>
                <div className="flex justify-end space-x-4">
                  <button type="button" onClick={() => setShowAddressForm(false)} className="px-6 py-3 font-bold text-slate-500">Cancel</button>
                  <button type="submit" className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-primary-600 transition-colors">Save Address</button>
                </div>
              </form>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {addresses.map((addr) => (
                  <div 
                    key={addr.id}
                    onClick={() => setSelectedAddressId(addr.id)}
                    className={`p-6 rounded-3xl border-2 cursor-pointer transition-all relative ${selectedAddressId === addr.id ? 'border-primary-500 bg-primary-50/30' : 'border-slate-100 hover:border-primary-200 bg-white'}`}
                  >
                    {selectedAddressId === addr.id && (
                      <CheckCircle2 className="absolute top-4 right-4 h-5 w-5 text-primary-600" />
                    )}
                    <p className="font-black text-slate-900 mb-1">{addr.full_name}</p>
                    <p className="text-sm text-slate-500 font-medium mb-4">{addr.phone}</p>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      {addr.street}, {addr.city}<br />
                      {addr.state}, {addr.pincode}
                    </p>
                  </div>
                ))}
                {addresses.length === 0 && (
                  <div className="col-span-full py-12 text-center bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                    <p className="text-slate-500 font-medium">No saved addresses found.</p>
                  </div>
                )}
              </div>
            )}
          </section>

          {/* Payment Method Section */}
          <section className="space-y-6">
            <div className="flex items-center space-x-3">
              <div className="bg-primary-100 p-2 rounded-xl">
                <CreditCard className="h-5 w-5 text-primary-600" />
              </div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Payment Method</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-6 rounded-3xl border-2 border-primary-500 bg-primary-50/30 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="bg-white p-3 rounded-2xl shadow-sm">
                    <Truck className="h-6 w-6 text-slate-900" />
                  </div>
                  <div>
                    <p className="font-black text-slate-900">Cash on Delivery</p>
                    <p className="text-xs font-bold text-primary-600 uppercase tracking-widest">Active Option</p>
                  </div>
                </div>
                <CheckCircle2 className="h-5 w-5 text-primary-600" />
              </div>

              <div className="p-6 rounded-3xl border-2 border-slate-100 bg-slate-50 opacity-60 flex items-center justify-between cursor-not-allowed">
                <div className="flex items-center space-x-4">
                  <div className="bg-white p-3 rounded-2xl shadow-sm">
                    <CreditCard className="h-6 w-6 text-slate-400" />
                  </div>
                  <div>
                    <p className="font-black text-slate-400">Online Payment</p>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest italic">Coming Soon</p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Order Summary Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-[3rem] border border-slate-100 p-8 shadow-xl sticky top-24 space-y-8">
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">Order Summary</h3>
            
            <div className="space-y-4 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
              {cart.items.map((item) => (
                <div key={item.id} className="flex items-center space-x-4">
                  <div className="h-16 w-16 bg-slate-50 rounded-2xl overflow-hidden flex-shrink-0">
                    <img src={item.product?.images?.[0]?.image} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-grow min-w-0">
                    <p className="text-sm font-bold text-slate-900 truncate">{item.product?.name}</p>
                    <p className="text-xs font-bold text-slate-400">Qty: {item.quantity}</p>
                  </div>
                  <p className="text-sm font-black text-slate-900">${parseFloat(item.total_price).toFixed(2)}</p>
                </div>
              ))}
            </div>

            <div className="pt-6 border-t border-slate-100 space-y-3">
              <div className="flex justify-between text-slate-500 font-medium">
                <span>Subtotal</span>
                <span>${parseFloat(cart.total_amount).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-500 font-medium">
                <span>Shipping</span>
                <span className="text-green-600 font-bold uppercase tracking-widest text-xs">Free</span>
              </div>
              <div className="flex justify-between pt-4">
                <span className="text-xl font-black text-slate-900">Total</span>
                <span className="text-2xl font-black text-primary-600">${parseFloat(cart.total_amount).toFixed(2)}</span>
              </div>
            </div>

            <div className="space-y-4 pt-4">
              <div className="flex items-center space-x-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 p-3 rounded-xl">
                <ShieldCheck className="h-4 w-4 text-green-500" />
                <span>Secure Checkout Guaranteed</span>
              </div>
              
              <button 
                onClick={handlePlaceOrder}
                disabled={isPlacingOrder || !selectedAddressId}
                className="w-full bg-slate-900 text-white py-5 rounded-[2rem] font-black text-lg hover:bg-primary-600 transition-all active:scale-[0.98] disabled:opacity-50 shadow-2xl shadow-slate-900/20 flex items-center justify-center space-x-3"
              >
                {isPlacingOrder ? (
                  <>
                    <Loader2 className="h-6 w-6 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <span>Place Order</span>
                    <ChevronRight className="h-6 w-6" />
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
