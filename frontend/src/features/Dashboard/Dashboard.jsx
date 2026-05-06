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

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    
    try {
      await orderService.cancelOrder(orderId);
      toast.success('Order cancelled successfully');
      // Refresh orders
      const updatedOrders = await orderService.getOrders();
      setOrders(updatedOrders.results || updatedOrders);
    } catch (error) {
      const msg = error.response?.data?.error || 'Failed to cancel order';
      toast.error(msg);
    }
  };

  const handleLogout = () => {
    logout();
    toast.success('You have been logged out. See you soon!');
    navigate('/login');
  };

  const stats = [
    { 
      label: 'Total Orders', 
      value: orders.length, 
      icon: Package, 
      color: 'text-blue-600', 
      bg: 'bg-blue-100' 
    },
    { 
      label: 'Active Cart', 
      value: `${cart?.total_items || 0} Items`, 
      icon: ShoppingCart, 
      color: 'text-green-600', 
      bg: 'bg-green-100' 
    },
    { 
      label: 'Wishlist', 
      value: `${wishlist?.items?.length || 0} Items`, 
      icon: Heart, 
      color: 'text-purple-600', 
      bg: 'bg-purple-100' 
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Welcome, {user?.name || 'Shopper'}!</h1>
          <p className="text-slate-600">Here's what's happening with your account today.</p>
        </div>
        <div className="flex items-center space-x-6">
          <button 
            onClick={() => navigate('/profile')}
            className="flex items-center space-x-2 text-slate-600 hover:text-primary-600 font-medium transition-colors"
          >
            <UserIcon className="h-5 w-5" />
            <span>Account Settings</span>
          </button>
          <button 
            onClick={handleLogout}
            className="flex items-center space-x-2 text-red-600 hover:text-red-700 font-medium transition-colors"
          >
            <LogOut className="h-5 w-5" />
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
              <div key={stat.label} className="glass-card p-6 flex items-center space-x-4">
                <div className={`${stat.bg} p-3 rounded-xl`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-sm text-slate-500 font-medium">{stat.label}</p>
                  <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="glass-card p-8 min-h-[400px]">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">Recent Orders</h3>
              <button 
                onClick={() => navigate('/products')}
                className="text-sm font-bold text-primary-600 hover:underline"
              >
                View Catalog
              </button>
            </div>

            {orders.length > 0 ? (
              <div className="space-y-6">
                {orders.slice(0, 5).map((order) => (
                    <div key={order.id} className="group relative bg-white border border-slate-100 rounded-[2rem] p-6 hover:border-primary-200 hover:shadow-xl transition-all duration-300">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                      <div className="flex items-center space-x-5">
                        <div className="bg-slate-50 p-4 rounded-2xl group-hover:bg-primary-50 transition-colors">
                          <Package className="h-6 w-6 text-slate-400 group-hover:text-primary-600" />
                        </div>
                        <div>
                          <div className="flex items-center space-x-3 mb-1">
                            <p className="font-black text-slate-900 text-lg tracking-tight">
                              {order.items?.[0]?.product_name || 'Order'}
                              {order.items?.length > 1 && (
                                <span className="text-slate-400 font-bold ml-2">
                                  + {order.items.length - 1} more items
                                </span>
                              )}
                            </p>
                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm ${
                              order.order_status?.toLowerCase() === 'delivered' ? 'bg-green-100 text-green-700' :
                              order.order_status?.toLowerCase() === 'cancelled' ? 'bg-red-100 text-red-700' :
                              order.order_status?.toLowerCase() === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-blue-100 text-blue-700'
                            }`}>
                              {order.order_status}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
                            <span>ID: #{order.id.slice(0, 8)}</span>
                            <span>•</span>
                            <span>{new Date(order.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between md:justify-end md:space-x-12 px-2">
                        <div className="text-left md:text-right">
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Total</p>
                          <p className="text-xl font-black text-primary-600">${parseFloat(order.total_amount).toFixed(2)}</p>
                        </div>
                        
                        {order.order_status?.toLowerCase() === 'pending' && (
                          <button 
                            onClick={() => handleCancelOrder(order.id)}
                            className="bg-red-50 text-red-600 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="mt-6 pt-6 border-t border-slate-50 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Shipping To</p>
                        <p className="text-sm text-slate-700 font-medium leading-relaxed">
                          {order.address?.full_name}, {order.address?.street}, {order.address?.city}
                        </p>
                      </div>
                      <div className="flex items-end justify-end space-x-4">
                        {order.order_status?.toLowerCase() === 'delivered' && (
                          <button 
                            onClick={() => openReviewModal({
                              id: order.items[0].product,
                              product_name: order.items[0].product_name,
                              image: order.items[0].product_image
                            })}
                            className="text-sm font-bold text-primary-600 hover:text-primary-700 transition-colors flex items-center space-x-1"
                          >
                            <Star className="h-4 w-4 fill-primary-600" />
                            <span>Write a Review</span>
                          </button>
                        )}
                        <button 
                          onClick={() => navigate(`/order-success/${order.id}`)}
                          className="text-sm font-bold text-slate-400 hover:text-primary-600 transition-colors flex items-center space-x-1"
                        >
                          <span>Track Order</span>
                          <ChevronRight className="h-4 w-4" />
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
