import React, { useState, useEffect } from 'react';
import { ShoppingBag, Loader2, Package, Truck, CheckCircle, XCircle, Clock, MapPin, Phone, User, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';
import orderService from '../../api/orderService';
import toast from 'react-hot-toast';

const VendorOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [expandedOrder, setExpandedOrder] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await orderService.getVendorOrders();
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch orders:', err);
      setError(err.response?.data?.detail || 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      await orderService.updateOrderStatus(orderId, { order_status: newStatus });
      toast.success(`Order updated to ${newStatus}`);
      fetchOrders(); // Refresh orders
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to update status';
      toast.error(msg);
    }
  };

  const filteredOrders = filterStatus === 'ALL' 
    ? orders 
    : orders.filter(order => order.order_status === filterStatus);

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING': return 'bg-amber-100 text-amber-600 border-amber-200';
      case 'CONFIRMED': return 'bg-blue-100 text-blue-600 border-blue-200';
      case 'SHIPPED': return 'bg-purple-100 text-purple-600 border-purple-200';
      case 'DELIVERED': return 'bg-green-100 text-green-600 border-green-200';
      case 'CANCELLED': return 'bg-red-100 text-red-600 border-red-200';
      default: return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'PENDING': return <Clock className="h-4 w-4" />;
      case 'CONFIRMED': return <ShoppingBag className="h-4 w-4" />;
      case 'SHIPPED': return <Truck className="h-4 w-4" />;
      case 'DELIVERED': return <CheckCircle className="h-4 w-4" />;
      case 'CANCELLED': return <XCircle className="h-4 w-4" />;
      default: return <Package className="h-4 w-4" />;
    }
  };

  if (loading && orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary-600" />
        <p className="text-slate-500 font-medium">Loading your orders...</p>
      </div>
    );
  }

  return (
    <div className="container-tight py-8 space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Manage Orders</h1>
          <p className="text-slate-600 mt-2">Track and fulfill your customer orders</p>
        </div>

        <div className="flex flex-wrap gap-2 bg-slate-100 p-1 rounded-xl border border-slate-200">
          {['ALL', 'PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED'].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${
                filterStatus === status 
                ? 'bg-white text-slate-900 shadow-sm' 
                : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-2xl flex items-center gap-3">
          <XCircle className="h-5 w-5" />
          <p className="font-bold">{error}</p>
        </div>
      )}

      {filteredOrders.length === 0 ? (
        <div className="glass-card p-12 text-center flex flex-col items-center space-y-4">
          <div className="bg-slate-100 p-6 rounded-full">
            <ShoppingBag className="h-12 w-12 text-slate-300" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900">No orders found</h3>
            <p className="text-slate-500">Try changing your filter or wait for new orders.</p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <div key={order.id} className="glass-card overflow-hidden group border border-slate-100 hover:border-primary-200 transition-all">
              {/* Order Header */}
              <div className="p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-2xl border ${getStatusColor(order.order_status)} shadow-sm`}>
                    {getStatusIcon(order.order_status)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-black text-slate-900 uppercase tracking-tight">Order #{order.id.slice(0, 8)}</h3>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase border ${getStatusColor(order.order_status)}`}>
                        {order.order_status}
                      </span>
                    </div>
                    <p className="text-sm text-slate-500 font-medium">
                      {new Date(order.created_at).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end">
                  <div className="text-right">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Amount</p>
                    <p className="text-xl font-black text-slate-900">₹{parseFloat(order.total_amount).toLocaleString('en-IN')}</p>
                  </div>
                  <button 
                    onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                    className="p-2 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors"
                  >
                    {expandedOrder === order.id ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {/* Status Actions */}
              <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex flex-wrap items-center gap-3">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mr-2">Update Status:</span>
                
                {order.order_status === 'PENDING' && (
                  <>
                    <button 
                      onClick={() => handleStatusUpdate(order.id, 'CONFIRMED')}
                      className="px-4 py-1.5 bg-blue-600 text-white rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-sm"
                    >
                      Confirm Order
                    </button>
                    <button 
                      onClick={() => handleStatusUpdate(order.id, 'CANCELLED')}
                      className="px-4 py-1.5 bg-white border border-red-200 text-red-600 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-red-50 transition-all"
                    >
                      Cancel
                    </button>
                  </>
                )}

                {order.order_status === 'CONFIRMED' && (
                  <>
                    <button 
                      onClick={() => handleStatusUpdate(order.id, 'SHIPPED')}
                      className="px-4 py-1.5 bg-purple-600 text-white rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-purple-700 transition-all shadow-sm"
                    >
                      Mark as Shipped
                    </button>
                    <button 
                      onClick={() => handleStatusUpdate(order.id, 'CANCELLED')}
                      className="px-4 py-1.5 bg-white border border-red-200 text-red-600 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-red-50 transition-all"
                    >
                      Cancel
                    </button>
                  </>
                )}

                {order.order_status === 'SHIPPED' && (
                  <button 
                    onClick={() => handleStatusUpdate(order.id, 'DELIVERED')}
                    className="px-4 py-1.5 bg-green-600 text-white rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-green-700 transition-all shadow-sm"
                  >
                    Mark as Delivered
                  </button>
                )}

                {(order.order_status === 'DELIVERED' || order.order_status === 'CANCELLED') && (
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No further actions available</span>
                )}
              </div>

              {/* Expanded Details */}
              {expandedOrder === order.id && (
                <div className="p-6 border-t border-slate-100 bg-white grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in slide-in-from-top-2 duration-200">
                  {/* Items List */}
                  <div className="space-y-4">
                    <h4 className="font-bold text-slate-900 flex items-center gap-2">
                      <Package className="h-4 w-4" />
                      Order Items
                    </h4>
                    <div className="space-y-3">
                      {order.items.map((item) => (
                        <div key={item.id} className="flex items-center gap-4 p-3 rounded-xl bg-slate-50 border border-slate-100">
                          <div className="h-16 w-16 rounded-lg bg-white border border-slate-200 overflow-hidden flex-shrink-0">
                            {item.product_image ? (
                              <img src={item.product_image} alt={item.product_name} className="h-full w-full object-cover" />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center bg-slate-50">
                                <Package className="h-6 w-6 text-slate-300" />
                              </div>
                            )}
                          </div>
                          <div className="flex-grow">
                            <h5 className="font-bold text-slate-900 line-clamp-1">{item.product_name}</h5>
                            <div className="flex justify-between items-center mt-1">
                              <p className="text-xs text-slate-500 font-bold">Qty: {item.quantity}</p>
                              <p className="text-sm font-black text-slate-900">₹{parseFloat(item.total_price).toLocaleString('en-IN')}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Customer & Shipping Details */}
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <h4 className="font-bold text-slate-900 flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        Shipping Address
                      </h4>
                      {order.address ? (
                        <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
                          <p className="text-sm font-bold text-slate-900">{order.address.name}</p>

                          <p className="text-sm text-slate-600 leading-relaxed">
                            {order.address.street}, {order.address.city}, {order.address.state} - {order.address.pincode}
                          </p>
                          <div className="flex items-center gap-4 pt-2">
                            <span className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
                              <Phone className="h-3 w-3" />
                              {order.address.phone}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm text-slate-400 italic">Address details unavailable</p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Payment Method</p>
                        <p className="text-sm font-bold text-slate-900 uppercase">{order.payment_method}</p>
                      </div>
                      <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Payment Status</p>
                        <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${
                          order.payment_status === 'PAID' ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'
                        }`}>
                          {order.payment_status}
                        </span>
                      </div>
                    </div>

                    {order.note && (
                      <div className="p-4 rounded-xl bg-amber-50 border border-amber-100">
                        <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-1">Customer Note</p>
                        <p className="text-sm text-amber-800 font-medium italic">"{order.note}"</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default VendorOrders;