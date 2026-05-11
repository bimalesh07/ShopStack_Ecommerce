import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, ChevronRight, Loader2, ShoppingCart, Clock, CheckCircle, XCircle, Truck } from 'lucide-react';
import orderService from '../../api/orderService';
import toast from 'react-hot-toast';

const OrderList = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const data = await orderService.getOrders();
      // Handle paginated or direct array responses
      const orderList = data?.results || (Array.isArray(data) ? data : []);
      setOrders(orderList);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to load order history');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = (orderId) => {
    toast((t) => (
      <div className="flex flex-col gap-4">
        <div className="space-y-1">
          <p className="text-sm font-bold text-slate-900">Cancel this order?</p>
          <p className="text-[10px] text-slate-500 font-medium uppercase tracking-widest">This action cannot be undone.</p>
        </div>
        <div className="flex gap-3 justify-end">
          <button onClick={() => toast.dismiss(t.id)} className="px-4 py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">No</button>
          <button 
            onClick={async () => {
              toast.dismiss(t.id);
              await confirmCancel(orderId);
            }}
            className="px-5 py-2 text-[10px] font-black bg-rose-500 text-white rounded-xl uppercase tracking-widest"
          >
            Yes, Cancel
          </button>
        </div>
      </div>
    ));
  };

  const confirmCancel = async (orderId) => {
    const loadingToast = toast.loading('Cancelling...');
    try {
      await orderService.cancelOrder(orderId);
      toast.success('Order cancelled', { id: loadingToast });
      fetchOrders(); // Refresh the list
    } catch (error) {
      toast.error('Failed to cancel', { id: loadingToast });
    }
  };

  const handleDeleteOrder = (orderId) => {
    toast((t) => (
      <div className="flex flex-col gap-4">
        <div className="space-y-1">
          <p className="text-sm font-bold text-slate-900">Remove from history?</p>
          <p className="text-[10px] text-slate-500 font-medium uppercase tracking-widest">This will permanently hide this order.</p>
        </div>
        <div className="flex gap-3 justify-end">
          <button onClick={() => toast.dismiss(t.id)} className="px-4 py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">Keep It</button>
          <button 
            onClick={async () => {
              toast.dismiss(t.id);
              await confirmDelete(orderId);
            }}
            className="px-5 py-2 text-[10px] font-black bg-slate-900 text-white rounded-xl uppercase tracking-widest"
          >
            Yes, Remove
          </button>
        </div>
      </div>
    ));
  };

  const confirmDelete = async (orderId) => {
    const loadingToast = toast.loading('Removing...');
    try {
      await orderService.deleteOrder(orderId);
      toast.success('Order removed', { id: loadingToast });
      fetchOrders();
    } catch (error) {
      toast.error('Failed to remove', { id: loadingToast });
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const getStatusStyle = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending': return 'bg-amber-50 text-amber-600 border-amber-100';
      case 'confirmed': return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'shipped': return 'bg-purple-50 text-purple-600 border-purple-100';
      case 'delivered': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'cancelled': return 'bg-rose-50 text-rose-600 border-rose-100';
      default: return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'delivered':
        return <CheckCircle className="h-3 w-3" />;
      case 'cancelled':
        return <XCircle className="h-3 w-3" />;
      case 'pending':
        return <Clock className="h-3 w-3" />;
      case 'shipped':
        return <Truck className="h-3 w-3" />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Loading your history...</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="bg-white rounded-[2rem] border border-slate-100 p-12 text-center space-y-6">
        <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto">
          <Package className="h-10 w-10 text-slate-200" />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-black text-slate-900">No Orders Found</h3>
          <p className="text-slate-500 max-w-xs mx-auto text-sm font-medium">
            Looks like you haven't placed any orders yet. Start shopping to build your history!
          </p>
        </div>
        <button 
          onClick={() => navigate('/products')}
          className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-primary-600 transition-all active:scale-95 text-sm"
        >
          Go Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em]">Purchase History</h3>
        <span className="text-[10px] font-bold text-slate-400 uppercase bg-slate-50 px-3 py-1 rounded-full">
          {orders.length} {orders.length === 1 ? 'Order' : 'Orders'}
        </span>
      </div>

      <div className="space-y-4">
        {orders.map((order) => (
          <div 
            key={order.id} 
            className="group bg-white border border-slate-100 rounded-[2rem] p-6 hover:border-primary-200 hover:shadow-xl hover:shadow-primary-900/5 transition-all duration-300"
          >
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="flex items-center space-x-5">
                <div className="bg-slate-50 p-4 rounded-2xl group-hover:bg-primary-50 transition-colors">
                  <Package className="h-6 w-6 text-slate-400 group-hover:text-primary-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">
                      Ref: SS-{order.id.slice(-5).toUpperCase()}
                    </h3>
                    <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest border ${getStatusStyle(order.order_status)}`}>
                      {getStatusIcon(order.order_status)}
                      <span className="ml-1">{order.order_status}</span>
                    </span>
                  </div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Placed on {new Date(order.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between lg:justify-end lg:space-x-12 border-t lg:border-t-0 pt-4 lg:pt-0 border-slate-50">
                <div className="text-left lg:text-right">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Total Amount</p>
                  <p className="text-xl font-black text-slate-900">₹{parseFloat(order.total_amount).toLocaleString('en-IN')}</p>
                </div>
                
                <div className="flex items-center space-x-6">
                  {order.order_status?.toLowerCase() === 'pending' && (
                    <button 
                      onClick={() => handleCancelOrder(order.id)}
                      className="text-rose-500 hover:text-rose-600 text-[10px] font-black uppercase tracking-widest pl-6 border-l border-slate-100"
                    >
                      Cancel
                    </button>
                  )}

                  {(order.order_status?.toLowerCase() === 'cancelled' || order.order_status?.toLowerCase() === 'delivered') && (
                    <button 
                      onClick={() => handleDeleteOrder(order.id)}
                      className="text-slate-400 hover:text-slate-900 text-[10px] font-black uppercase tracking-widest pl-6 border-l border-slate-100"
                    >
                      Remove
                    </button>
                  )}

                  <button 
                    onClick={() => navigate(`/order-success/${order.id}`)}
                    className="flex items-center space-x-2 text-[10px] font-black text-slate-400 hover:text-slate-900 uppercase tracking-[0.2em] transition-all group/btn"
                  >
                    <span>Details</span>
                    <ChevronRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Preview of items */}
            {order.items?.length > 0 && (
              <div className="mt-6 pt-6 border-t border-slate-50 space-y-4">
                <div className="flex items-center space-x-4 overflow-x-auto no-scrollbar">
                  {order.items.slice(0, 4).map((item, idx) => (
                    <div key={idx} className="flex-shrink-0 flex flex-col gap-3">
                      <div className="flex items-center space-x-3 bg-slate-50/50 rounded-xl px-3 py-2 border border-slate-100">
                        <div className="w-8 h-8 rounded-lg bg-white border border-slate-100 flex items-center justify-center text-[10px] font-black text-slate-400">
                          {item.quantity}x
                        </div>
                        <span className="text-[10px] font-bold text-slate-600 truncate max-w-[100px]">{item.product_name}</span>
                      </div>
                      
                      {order.order_status?.toLowerCase() === 'delivered' && (
                        item.is_reviewed ? (
                          <div className="w-full py-1.5 bg-emerald-50 text-emerald-600 rounded-lg text-[9px] font-black uppercase tracking-widest text-center border border-emerald-100 flex items-center justify-center gap-1">
                            <CheckCircle className="h-2.5 w-2.5" />
                            <span>Reviewed</span>
                          </div>
                        ) : (
                          <button 
                            onClick={() => {
                              if (window.openReviewModal) {
                                window.openReviewModal({
                                  id: item.product,
                                  product_name: item.product_name,
                                  image: item.product_image,
                                  order_id: order.id,
                                  onSuccess: fetchOrders
                                });
                              }
                            }}
                            className="w-full py-1.5 bg-slate-900 text-white rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-all active:scale-95 shadow-lg shadow-slate-900/10"
                          >
                            Write Review
                          </button>
                        )
                      )}
                    </div>
                  ))}
                  {order.items.length > 4 && (
                    <span className="text-[10px] font-bold text-slate-400">+{order.items.length - 4} more</span>
                  )}
                </div>
              </div>
            )}

            {/* Cancellation Reason */}
            {order.order_status?.toLowerCase() === 'cancelled' && order.cancel_reason && (
              <div className="mt-6 p-4 bg-amber-50/50 border border-amber-100 rounded-2xl flex items-start gap-3 animate-in slide-in-from-top-2 duration-500">
                <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest">Message from Merchant</p>
                  <p className="text-xs text-amber-800 font-medium italic leading-relaxed">"{order.cancel_reason}"</p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrderList;
