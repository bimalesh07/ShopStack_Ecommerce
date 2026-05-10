import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { LayoutDashboard, Package, ShoppingCart, User as UserIcon, LogOut, Heart, Loader2, ChevronRight, Star } from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import orderService from '../../api/orderService';
import wishlistService from '../../api/wishlistService';
import ReviewModal from '../../components/ReviewModal';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const { cart } = useCart();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [wishlist, setWishlist] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Review Modal State
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const openReviewModal = (product) => {
    setSelectedProduct({
      id: product.id,
      name: product.product_name,
      image: product.image // Ensure backend sends this
    });
    setIsReviewModalOpen(true);
  };

  useEffect(() => {
    if (user?.role === 'vendor') {
      navigate('/vendor/dashboard');
    }
  }, [user?.role, navigate]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [ordersData, wishlistData] = await Promise.all([
          orderService.getOrders(),
          wishlistService.getWishlist()
        ]);
        // Handle paginated response
        const orderList = ordersData.results || ordersData;
        const activeOrders = orderList.filter(order => order.order_status?.toUpperCase() !== 'CANCELLED');
        setOrders(activeOrders);
        setWishlist(wishlistData);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handleCancelOrder = (orderId) => {
    toast((t) => (
      <div className="flex flex-col gap-4">
        <div className="space-y-1">
          <p className="text-sm font-bold text-slate-900">Cancel this order?</p>
          <p className="text-[10px] text-slate-500 font-medium uppercase tracking-widest">This action cannot be undone.</p>
        </div>
        <div className="flex gap-3 justify-end">
          <button 
            onClick={() => toast.dismiss(t.id)}
            className="px-4 py-2 text-[10px] font-black text-slate-400 hover:text-slate-600 transition-colors uppercase tracking-[0.15em]"
          >
            No, Go Back
          </button>
          <button 
            onClick={async () => {
              toast.dismiss(t.id);
              await confirmCancel(orderId);
            }}
            className="px-5 py-2 text-[10px] font-black bg-rose-500 text-white rounded-xl hover:bg-rose-600 transition-all uppercase tracking-[0.15em] shadow-lg shadow-rose-500/20 active:scale-95"
          >
            Yes, Cancel Order
          </button>
        </div>
      </div>
    ), {
      duration: 6000,
      position: 'top-center',
      style: {
        minWidth: '320px',
        borderRadius: '1.5rem',
        padding: '1.25rem',
        border: '1px solid #f1f5f9',
        boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.15)'
      }
    });
  };

  const confirmCancel = async (orderId) => {
    const loadingToast = toast.loading('Cancelling your order...');
    try {
      await orderService.cancelOrder(orderId);
      toast.success('Order cancelled successfully', { id: loadingToast });
      // Refresh orders
      const updatedOrders = await orderService.getOrders();
      setOrders(updatedOrders.results || updatedOrders);
    } catch (error) {
      const msg = error.response?.data?.error || 'Failed to cancel order';
      toast.error(msg, { id: loadingToast });
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const stats = [
    { 
      label: 'Total Orders', 
      value: orders.length, 
      icon: Package, 
      color: 'text-slate-600', 
      bg: 'bg-slate-50' 
    },
    { 
      label: 'Active Cart', 
      value: `${cart?.total_items || 0} Items`, 
      icon: ShoppingCart, 
      color: 'text-slate-600', 
      bg: 'bg-slate-50' 
    },
    { 
      label: 'Wishlist', 
      value: `${wishlist?.items?.length || 0} Items`, 
      icon: Heart, 
      color: 'text-slate-600', 
      bg: 'bg-slate-50' 
    },
  ];

  return (
    <div className="container-tight space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-6 border-b border-slate-100 pb-8">
        <div>
          <h1 className="text-2xl font-medium text-slate-900 tracking-tight">Welcome, {user?.name || 'Shopper'}!</h1>
          <p className="text-sm text-slate-500 font-medium">Here's what's happening with your account today.</p>
        </div>
        <div className="flex items-center space-x-8">
          <button 
            onClick={() => navigate('/profile')}
            className="flex items-center space-x-2 text-xs font-medium text-slate-500 hover:text-slate-900 transition-colors uppercase tracking-widest"
          >
            <UserIcon className="h-4 w-4" />
            <span>Account Settings</span>
          </button>
          <button 
            onClick={handleLogout}
            className="flex items-center space-x-2 text-xs font-medium text-rose-500 hover:text-rose-600 transition-colors uppercase tracking-widest"
          >
            <LogOut className="h-4 w-4" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {stats.map((stat) => (
              <div key={stat.label} className="bg-white rounded-xl p-5 shadow-sm border border-slate-50 flex items-center space-x-4">
                <div className={`${stat.bg} p-2.5 rounded-lg`}>
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{stat.label}</p>
                  <p className="text-lg font-medium text-slate-900">{stat.value}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-xl p-8 shadow-sm border border-slate-50 min-h-[400px]">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-xl font-medium text-slate-900 tracking-tight">Recent Orders</h3>
              <button 
                onClick={() => navigate('/products')}
                className="text-xs font-bold text-slate-400 hover:text-slate-900 transition-colors uppercase tracking-widest"
              >
                View Catalog
              </button>
            </div>

            {orders.length > 0 ? (
              <div className="space-y-6">
                {orders.slice(0, 5).map((order) => (
                    <div key={order.id} className="group relative bg-white border border-slate-100 rounded-xl p-5 hover:border-slate-200 hover:shadow-md transition-all duration-300">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-center space-x-4">
                        <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                          <Package className="h-4 w-4 text-slate-400" />
                        </div>
                        <div>
                          <div className="flex items-center space-x-3 mb-0.5">
                            <p className="font-bold text-slate-900 text-sm">
                              {order.items?.[0]?.product_name || 'Order'}
                              {order.items?.length > 1 && (
                                <span className="text-slate-400 font-medium ml-2">
                                  + {order.items.length - 1} more
                                </span>
                              )}
                            </p>
                            <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-widest ${
                              order.order_status?.toLowerCase() === 'delivered' ? 'bg-emerald-50 text-emerald-600' :
                              order.order_status?.toLowerCase() === 'cancelled' ? 'bg-rose-50 text-rose-600' :
                              order.order_status?.toLowerCase() === 'pending' ? 'bg-amber-50 text-amber-600' :
                              'bg-slate-100 text-slate-600'
                            }`}>
                              {order.order_status}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2 text-[10px] font-medium text-slate-400 uppercase tracking-widest">
                            <span>#{order.id.slice(0, 8)}</span>
                            <span>•</span>
                            <span>{new Date(order.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between md:justify-end md:space-x-8">
                        <div className="text-left md:text-right">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total</p>
                          <p className="text-base font-bold text-slate-900">₹{parseFloat(order.total_amount).toLocaleString('en-IN')}</p>
                        </div>
                        
                        {order.order_status?.toLowerCase() === 'pending' && (
                          <button 
                            onClick={() => handleCancelOrder(order.id)}
                            className="text-rose-500 hover:text-rose-600 text-[10px] font-bold uppercase tracking-[0.15em] transition-colors pl-4 border-l border-slate-100"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-slate-50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <div className="flex items-center space-x-2">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Shipping To:</p>
                        <p className="text-xs text-slate-600 font-medium">
                          {order.address?.street}, {order.address?.city}
                        </p>
                      </div>
                      <div className="flex items-center space-x-6">
                        {order.order_status?.toLowerCase() === 'delivered' && (
                          <button 
                            onClick={() => openReviewModal({
                              id: order.items[0].product,
                              product_name: order.items[0].product_name,
                              image: order.items[0].product_image
                            })}
                            className="text-[10px] font-bold text-slate-500 hover:text-slate-900 transition-colors uppercase tracking-widest flex items-center space-x-1"
                          >
                            <Star className="h-3 w-3" />
                            <span>Rate Product</span>
                          </button>
                        )}
                        <button 
                          onClick={() => navigate(`/order-success/${order.id}`)}
                          className="text-[10px] font-bold text-slate-400 hover:text-slate-900 transition-colors uppercase tracking-widest flex items-center space-x-1"
                        >
                          <span>Track Order</span>
                          <ChevronRight className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                
                {orders.length > 5 && (
                  <div className="text-center pt-4">
                    <p className="text-sm text-slate-400 font-medium italic">Showing latest 5 orders</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="bg-slate-50 p-6 rounded-full mb-6">
                  <ShoppingCart className="h-12 w-12 text-slate-300" />
                </div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">No Recent Active Orders</h3>
                <p className="text-slate-600 max-w-sm mt-2 font-medium">
                  You don't have any active orders at the moment. Start shopping to see your activity here!
                </p>
                <button 
                  onClick={() => navigate('/products')} 
                  className="mt-8 bg-slate-900 text-white px-8 py-4 rounded-2xl font-bold hover:bg-primary-600 transition-all active:scale-[0.98] shadow-xl shadow-slate-900/10"
                >
                  Go Shopping
                </button>
              </div>
            )}
          </div>
        </>
      )}
      
      {isReviewModalOpen && selectedProduct && (
        <ReviewModal
          isOpen={isReviewModalOpen}
          product={selectedProduct}
          onClose={() => setIsReviewModalOpen(false)}
          onSuccess={() => {
            // Optional: refresh reviews if needed
          }}
        />
      )}
    </div>
  );
};

export default Dashboard;
