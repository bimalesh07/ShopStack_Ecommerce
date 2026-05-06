import React, { useState, useEffect } from 'react';
import orderService from '../../api/orderService';
import { ShoppingBag, Loader2, ChevronRight, Package, Mail, Clock, CheckCircle, Truck, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const VendorOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const data = await orderService.getVendorOrders();
      setOrders(data.results || data);
    } catch (err) {
      toast.error('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    console.log(`[DEBUG] Attempting to update order ${orderId} to status: ${newStatus}`);
    setUpdatingId(orderId);
    try {
      const response = await orderService.updateOrderStatus(orderId, { order_status: newStatus });
      console.log('[DEBUG] Update successful:', response);
      toast.success(`Order status updated to ${newStatus}`);
      fetchOrders();
    } catch (err) {
      console.error('[DEBUG] Update failed:', err.response?.data || err.message);
      const msg = err.response?.data?.order_status?.[0] || err.response?.data?.error || 'Failed to update status';
      toast.error(msg);
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusIcon = (status) => {
    const s = status.toLowerCase();
    switch (s) {
      case 'delivered': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'shipped': return <Truck className="h-4 w-4 text-blue-500" />;
      case 'cancelled': return <XCircle className="h-4 w-4 text-red-500" />;
      default: return <Clock className="h-4 w-4 text-amber-500" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-12 w-12 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div className="py-8 space-y-8">
      <div>
        <h1 className="text-4xl font-black text-slate-900 tracking-tight">Order Management</h1>
        <p className="text-slate-600 mt-2">Track and fulfill your customer orders</p>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-bold">
              <tr>
                <th className="px-6 py-4">Order Details</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Update Fulfillment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {orders.length > 0 ? (
                orders.map((item) => (
                  <tr key={item.order_id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <p className="font-bold text-slate-900">{item.product_name}</p>
                        <div className="flex items-center space-x-2 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                          <span>#{item.order_id.slice(0, 8)}</span>
                          <span>•</span>
                          <span>{item.quantity} Unit(s)</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <Mail className="h-3.5 w-3.5 text-slate-400" />
                        <span className="text-sm font-medium text-slate-600">{item.customer_email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-black text-slate-900">${parseFloat(item.total_price).toFixed(2)}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">{item.payment_method}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(item.order_status)}
                        <span className="text-xs font-bold text-slate-700 capitalize">{item.order_status.toLowerCase()}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {updatingId === item.order_id ? (
                        <Loader2 className="h-5 w-5 animate-spin text-primary-600 ml-auto" />
                      ) : (
                        <select 
                          value={item.order_status.toLowerCase()}
                          onChange={(e) => handleStatusChange(item.order_id, e.target.value)}
                          disabled={item.order_status.toLowerCase() === 'delivered' || item.order_status.toLowerCase() === 'cancelled'}
                          className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <option value="pending">Mark Pending</option>
                          <option value="confirmed">Confirm Order</option>
                          <option value="shipped">Ship Items</option>
                          <option value="delivered">Mark Delivered</option>
                        </select>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <ShoppingBag className="h-12 w-12 text-slate-200" />
                      <p className="text-slate-500 font-medium italic">No orders received yet. Your sales will appear here!</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default VendorOrders;
