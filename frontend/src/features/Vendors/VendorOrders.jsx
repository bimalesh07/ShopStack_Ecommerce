import React, { useState, useEffect } from 'react';
import { ShoppingBag, Loader2, Package, Truck, CheckCircle, XCircle, Clock, MapPin, Phone, User, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';
import orderService from '../../api/orderService';
import toast from 'react-hot-toast';

const VendorOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [expandedOrder, setExpandedOrder] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await orderService.getVendorOrders();
      const orderList = data?.results || (Array.isArray(data) ? data : []);
      setOrders(orderList);
    } catch (err) {
      console.error('Failed to fetch orders:', err);
      setError(err.response?.data?.detail || 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId, newStatus, reason = '') => {
    try {
      const updateData = { order_status: newStatus.toLowerCase() };
      if (reason) updateData.cancel_reason = reason;
      
      await orderService.updateOrderStatus(orderId, updateData);
      toast.success(`Order updated to ${newStatus.toUpperCase()}`);
      fetchOrders(); // Refresh orders
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to update status';
      toast.error(msg);
    }
  };

  const handleDeleteOrder = (orderId) => {
    toast((t) => (
      <div className="flex flex-col gap-4">
        <div className="space-y-1">
          <p className="text-sm font-black text-slate-900 uppercase tracking-tight">Remove Shipment?</p>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">This will permanently hide this order from your console.</p>
        </div>
        <div className="flex gap-3 justify-end">
          <button onClick={() => toast.dismiss(t.id)} className="px-4 py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">Keep It</button>
          <button 
            onClick={async () => {
              toast.dismiss(t.id);
              try {
                await orderService.deleteOrder(orderId);
                toast.success('Shipment removed');
                fetchOrders();
              } catch (err) {
                toast.error('Failed to remove');
              }
            }}
            className="px-5 py-2 text-[10px] font-black bg-slate-900 text-white rounded-xl uppercase tracking-widest active:scale-95 shadow-lg shadow-slate-900/10"
          >
            Yes, Remove
          </button>
        </div>
      </div>
    ));
  };

  const promptCancellation = (orderId, status) => {
    toast((t) => (
      <div className="flex flex-col gap-4 min-w-[300px]">
        <div className="space-y-1">
          <p className="text-sm font-black text-slate-900 uppercase tracking-tight">Specify Reason</p>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-relaxed">Why are you declining this shipment?</p>
        </div>
        <textarea
          id={`cancel-reason-${orderId}`}
          className="w-full h-24 p-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-medium outline-none focus:ring-2 focus:ring-slate-900 transition-all resize-none"
          placeholder="e.g. Out of stock, Logistics issues..."
        />
        <div className="flex gap-3 justify-end pt-2">
          <button 
            onClick={() => toast.dismiss(t.id)}
            className="px-4 py-2 text-[10px] font-black text-slate-400 hover:text-slate-900 transition-colors uppercase tracking-widest"
          >
            Go Back
          </button>
          <button 
            onClick={async () => {
              const reason = document.getElementById(`cancel-reason-${orderId}`).value;
              if (!reason.trim()) {
                toast.error('Please provide a reason');
                return;
              }
              toast.dismiss(t.id);
              await handleStatusUpdate(orderId, status, reason);
            }}
            className="px-6 py-2.5 text-[10px] font-black bg-rose-500 text-white rounded-xl hover:bg-rose-600 transition-all uppercase tracking-widest active:scale-95 shadow-lg shadow-rose-500/20"
          >
            Confirm Rejection
          </button>
        </div>
      </div>
    ), { duration: 6000 });
  };

  const filteredOrders = filterStatus === 'all' 
    ? orders 
    : orders.filter(order => order.order_status?.toLowerCase() === filterStatus.toLowerCase());

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending': return 'bg-amber-50 text-amber-600 border-amber-100';
      case 'confirmed': return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'shipped': return 'bg-purple-50 text-purple-600 border-purple-100';
      case 'delivered': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'cancelled': return 'bg-rose-50 text-rose-600 border-rose-100';
      default: return 'bg-slate-50 text-slate-400 border-slate-100';
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'confirmed': return <ShoppingBag className="h-4 w-4" />;
      case 'shipped': return <Truck className="h-4 w-4" />;
      case 'delivered': return <CheckCircle className="h-4 w-4" />;
      case 'cancelled': return <XCircle className="h-4 w-4" />;
      default: return <Package className="h-4 w-4" />;
    }
  };

  if (loading && orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 className="h-12 w-12 animate-spin text-slate-900" />
        <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Loading Pipeline...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-8 space-y-10">
      {/* Refined Header & Filters */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 border-b border-slate-100 pb-10 px-4">
        <div className="flex items-center space-x-4">
          <div className="h-14 w-14 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-slate-900/10">
            <Truck className="h-7 w-7" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Shipments</h1>
            <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Fulfillment Console</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 p-1.5 bg-slate-50 border border-slate-100 rounded-2xl">
          {['all', 'pending', 'confirmed', 'shipped', 'delivered', 'cancelled'].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${
                filterStatus === status 
                ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/10' 
                : 'text-slate-400 hover:text-slate-900 hover:bg-white'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-100 text-rose-600 p-5 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
          <XCircle className="h-5 w-5" />
          <p className="text-xs font-black uppercase tracking-widest">{error}</p>
        </div>
      )}

      {filteredOrders.length === 0 ? (
        <div className="bg-white border border-slate-100 rounded-[3rem] p-20 text-center flex flex-col items-center space-y-6">
          <div className="h-20 w-20 bg-slate-50 rounded-full flex items-center justify-center border border-slate-100">
            <ShoppingBag className="h-10 w-10 text-slate-200" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Queue Empty</h3>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">No shipments match your current filters</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredOrders.map((order) => (
            <div key={order.id} className="group bg-white border border-slate-100 rounded-[2rem] overflow-hidden hover:border-slate-900/10 hover:shadow-xl hover:shadow-slate-200/40 transition-all duration-500">
              {/* Order Row */}
              <div className="p-6 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                <div className="flex items-center gap-5">
                  <div className={`h-12 w-12 rounded-xl border flex items-center justify-center transition-transform group-hover:scale-110 duration-500 ${getStatusColor(order.order_status)}`}>
                    {getStatusIcon(order.order_status)}
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-base font-black text-slate-900 uppercase tracking-tight text-opacity-50">Shipment</h3>
                      <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-widest border ${getStatusColor(order.order_status)}`}>
                        {order.order_status}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest">
                      {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} • {order.items.length} {order.items.length === 1 ? 'Item' : 'Items'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-12 w-full lg:w-auto justify-between lg:justify-end">
                  <div className="text-left lg:text-right">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-0.5">Total Value</p>
                    <p className="text-2xl font-black text-slate-900 tracking-tighter">₹{parseFloat(order.total_amount).toLocaleString('en-IN')}</p>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="h-px w-8 bg-slate-100 hidden lg:block" />
                    <button 
                      onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                      className={`h-11 w-11 flex items-center justify-center rounded-xl transition-all ${
                        expandedOrder === order.id ? 'bg-slate-900 text-white shadow-lg' : 'bg-slate-50 text-slate-400 hover:text-slate-900 hover:bg-slate-100'
                      }`}
                    >
                      {expandedOrder === order.id ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Status Management - Sleek Actions */}
              <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex flex-wrap items-center gap-5">
                <div className="flex items-center space-x-2 mr-2">
                  <div className="h-2 w-2 rounded-full bg-slate-300" />
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pipeline Step</span>
                </div>
                
                <div className="flex items-center gap-3">
                  {order.order_status?.toLowerCase() === 'pending' && (
                    <>
                      <button 
                        onClick={() => handleStatusUpdate(order.id, 'confirmed')}
                        className="h-10 px-6 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all active:scale-95 shadow-lg shadow-slate-900/10"
                      >
                        Accept Shipment
                      </button>
                      <button 
                        onClick={() => promptCancellation(order.id, 'cancelled')}
                        className="h-10 px-6 bg-white border border-slate-200 text-rose-500 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-50 hover:border-rose-100 transition-all active:scale-95"
                      >
                        Reject
                      </button>
                    </>
                  )}

                  {order.order_status?.toLowerCase() === 'confirmed' && (
                    <>
                      <button 
                        onClick={() => handleStatusUpdate(order.id, 'shipped')}
                        className="h-10 px-6 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-purple-600 transition-all active:scale-95 shadow-lg shadow-slate-900/10"
                      >
                        Handover to Logistics
                      </button>
                      <button 
                        onClick={() => promptCancellation(order.id, 'cancelled')}
                        className="h-10 px-6 bg-white border border-slate-200 text-rose-500 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-50 hover:border-rose-100 transition-all active:scale-95"
                      >
                        Decline
                      </button>
                    </>
                  )}

                  {order.order_status?.toLowerCase() === 'shipped' && (
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={() => handleStatusUpdate(order.id, 'delivered')}
                        className="h-10 px-6 bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-all active:scale-95 shadow-lg shadow-emerald-900/10"
                      >
                        Verify Delivery
                      </button>
                      <button 
                        onClick={() => promptCancellation(order.id, 'cancelled')}
                        className="h-10 px-6 bg-white border border-slate-200 text-rose-500 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-50 hover:border-rose-100 transition-all active:scale-95"
                      >
                        Cancel / Return
                      </button>
                    </div>
                  )}

                  {(order.order_status?.toLowerCase() === 'delivered' || order.order_status?.toLowerCase() === 'cancelled') && (
                    <div className="flex items-center gap-4">
                      <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">Transaction Finalized</span>
                      <button 
                        onClick={() => handleDeleteOrder(order.id)}
                        className="h-9 px-5 bg-white border border-slate-200 text-slate-400 rounded-xl text-[10px] font-black uppercase tracking-widest hover:text-rose-500 hover:border-rose-100 transition-all active:scale-95"
                      >
                        Remove Shipment
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Expanded Data Pane */}
              {expandedOrder === order.id && (
                <div className="p-8 border-t border-slate-100 bg-white grid grid-cols-1 lg:grid-cols-2 gap-12 animate-in slide-in-from-top-4 duration-500">
                  {/* Fulfillment Manifest */}
                  <div className="space-y-6">
                    <div className="flex items-center justify-between border-b border-slate-50 pb-4">
                      <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.2em] flex items-center gap-2">
                        <Package className="h-4 w-4" />
                        Package Manifest
                      </h4>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{order.items.length} Unique SKUs</span>
                    </div>
                    <div className="space-y-4">
                      {order.items.map((item) => (
                        <div key={item.id} className="group/item flex items-center gap-5 p-4 rounded-2xl bg-slate-50/50 border border-slate-100 hover:bg-white hover:border-slate-200 transition-all">
                          <div className="h-20 w-20 rounded-xl bg-white border border-slate-100 overflow-hidden flex-shrink-0 shadow-sm">
                            {item.product_image ? (
                              <img src={item.product_image} alt={item.product_name} className="h-full w-full object-cover group-hover/item:scale-110 transition-transform duration-500" />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center bg-slate-50 text-slate-200">
                                <Package className="h-8 w-8" />
                              </div>
                            )}
                          </div>
                          <div className="flex-grow min-w-0">
                            <h5 className="text-sm font-black text-slate-900 truncate uppercase tracking-tight">{item.product_name}</h5>
                            <div className="flex justify-between items-center mt-2">
                              <p className="text-[11px] text-slate-400 font-bold uppercase">Qty: <span className="text-slate-900">{item.quantity}</span></p>
                              <p className="text-base font-black text-slate-900">₹{parseFloat(item.total_price).toLocaleString('en-IN')}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Logistics & Payment */}
                  <div className="space-y-10">
                    <div className="space-y-6">
                      <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.2em] flex items-center gap-2 border-b border-slate-50 pb-4">
                        <MapPin className="h-4 w-4" />
                        Destination Logistics
                      </h4>
                      {order.address ? (
                        <div className="p-6 rounded-2xl bg-slate-50/50 border border-slate-100 space-y-4">
                          <p className="text-sm font-black text-slate-900 uppercase tracking-tight">{order.address.name}</p>
                          <p className="text-xs text-slate-500 leading-relaxed font-medium">
                            {order.address.street}, {order.address.city}, {order.address.state} - {order.address.pincode}
                          </p>
                          <div className="flex items-center gap-3 pt-2">
                             <a href={`tel:${order.address.phone}`} className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-black text-slate-600 hover:text-slate-900 transition-all uppercase tracking-widest shadow-sm">
                               <Phone className="h-3.5 w-3.5" />
                               {order.address.phone}
                             </a>
                          </div>
                        </div>
                      ) : (
                        <p className="text-xs text-slate-400 font-bold uppercase italic">Logistics Data Unavailable</p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-5">
                      <div className="p-5 rounded-2xl bg-slate-50/50 border border-slate-100">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Financial Engine</p>
                        <p className="text-[11px] font-black text-slate-900 uppercase tracking-tight">{order.payment_method}</p>
                      </div>
                      <div className="p-5 rounded-2xl bg-slate-50/50 border border-slate-100">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Settlement Status</p>
                        <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg border ${
                          order.payment_status === 'PAID' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'
                        }`}>
                          {order.payment_status}
                        </span>
                      </div>
                    </div>

                    {order.note && (
                      <div className="p-5 rounded-2xl bg-amber-50/50 border border-amber-100">
                        <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-1.5">Merchant Instruction</p>
                        <p className="text-xs text-amber-800 font-medium italic leading-relaxed">"{order.note}"</p>
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