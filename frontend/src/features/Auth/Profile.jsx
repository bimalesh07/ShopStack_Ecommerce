import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { 
  User as UserIcon, Mail, Phone, Store, MapPin, Loader2, Save, 
  Lock, ShieldCheck, ShoppingBag, Settings, LayoutDashboard, 
  Package, ShoppingCart, Heart, LogOut, ChevronRight, Star, Truck,
  BarChart3
} from 'lucide-react';
import toast from 'react-hot-toast';
import axiosInstance from '../../api/axiosInstance';
import orderService from '../../api/orderService';
import OrderList from '../Order/OrderList';
import ReviewModal from '../../components/ReviewModal';
import VendorDashboard from '../Vendors/VendorDashboard';
import VendorOrders from '../Vendors/VendorOrders';

const Profile = () => {
  const { user, fetchProfile, logout } = useAuth();
  const { cart } = useCart();
  const { wishlist } = useWishlist();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Tab management
  const queryParams = new URLSearchParams(location.search);
  const activeTab = queryParams.get('tab') || (user?.role === 'vendor' ? 'performance' : 'overview');

  const setActiveTab = (tab) => {
    navigate(`/profile?tab=${tab}`);
  };

  // Dashboard Data State
  const [orders, setOrders] = useState([]);
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    shop_name: '',
    shop_descriptions: '',
  });

  // Review Modal State
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const openReviewModal = (productData) => {
    setSelectedProduct({
      id: productData.id,
      name: productData.product_name || productData.name,
      image: productData.image || productData.product_image,
      order_id: productData.order_id,
      onSuccess: productData.onSuccess
    });
    setIsReviewModalOpen(true);
  };

  useEffect(() => {
    window.openReviewModal = openReviewModal;
    return () => {
      window.openReviewModal = null;
    };
  }, []);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        phone: user.phone || '',
        shop_name: user.vendor_details?.shop_name || '',
        shop_descriptions: user.vendor_details?.shop_descriptions || '',
      });
    }
  }, [user]);

  // Get dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (activeTab !== 'overview') return;
      try {
        const ordersData = user.role === 'vendor' 
          ? await orderService.getVendorOrders() 
          : await orderService.getOrders();
          
        const orderList = ordersData?.results || (Array.isArray(ordersData) ? ordersData : []);
        const activeOrders = orderList.filter(order => 
          order && order.order_status?.toLowerCase() !== 'cancelled'
        );
        setOrders(activeOrders);
      } catch (error) {
        console.error('Dashboard data error:', error);
      } finally {
        setDashboardLoading(false);
      }
    };

    fetchDashboardData();
  }, [activeTab]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axiosInstance.patch('/profile/', {
        name: formData.name,
        phone: formData.phone,
      });

      if (user.role === 'vendor') {
        await axiosInstance.patch('/vendors/profile/', {
          shop_name: formData.shop_name,
          shop_descriptions: formData.shop_descriptions,
        });
      }

      await fetchProfile();
      toast.success('Profile updated successfully!');
    } catch (err) {
      toast.error('Failed to update profile');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const [passwords, setPasswords] = useState({
    old_password: '',
    new_password: '',
    new_password2: '',
  });
  const [changingPassword, setChangingPassword] = useState(false);

  const handlePasswordChange = (e) => {
    setPasswords({ ...passwords, [e.target.name]: e.target.value });
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwords.new_password !== passwords.new_password2) {
      toast.error('New passwords do not match');
      return;
    }
    setChangingPassword(true);
    try {
      await axiosInstance.post('/change-password/', passwords);
      toast.success('Password updated successfully! Please login again.');
      setTimeout(() => {
        logout();
        navigate('/login');
      }, 2000);
    } catch (err) {
      toast.error(err.response?.data?.old_password || 'Failed to update password');
    } finally {
      setChangingPassword(false);
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
      const updated = await orderService.getOrders();
      setOrders(updated.results || updated);
    } catch (error) {
      toast.error('Failed to cancel', { id: loadingToast });
    }
  };

  const stats = user.role === 'vendor' ? [
    { label: 'Merchant Listing', value: user.vendor_details?.product_count || 0, icon: Package, color: 'text-primary-600', bg: 'bg-primary-50', gradient: 'from-primary-50/50 to-indigo-50/30' },
    { label: 'Fulfillment Status', value: user.is_active ? 'Verified' : 'Reviewing', icon: ShieldCheck, color: 'text-emerald-600', bg: 'bg-emerald-50', gradient: 'from-emerald-50/50 to-teal-50/30' },
    { label: 'Shop Identity', value: user.vendor_details?.shop_name || 'My Shop', icon: Store, color: 'text-amber-600', bg: 'bg-amber-50', gradient: 'from-amber-50/50 to-orange-50/30' },
  ] : [
    { label: 'Total Orders', value: orders.length, icon: Package, color: 'text-slate-600', bg: 'bg-slate-50', gradient: 'from-slate-50 to-slate-100' },
    { label: 'Active Cart', value: `${cart?.total_items || 0} Items`, icon: ShoppingCart, color: 'text-slate-600', bg: 'bg-slate-50', gradient: 'from-slate-50 to-slate-100' },
    { label: 'Wishlist Items', value: `${wishlist?.items?.length || wishlist?.results?.length || wishlist?.total_items || 0} Items`, icon: Heart, color: 'text-slate-600', bg: 'bg-slate-50', gradient: 'from-slate-50 to-slate-100' },
  ];

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending': return 'bg-amber-50 text-amber-600 border-amber-100';
      case 'confirmed': return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'shipped': return 'bg-purple-50 text-purple-600 border-purple-100';
      case 'delivered': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'cancelled': return 'bg-rose-50 text-rose-600 border-rose-100';
      default: return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-[1600px] mx-auto py-8 md:py-12 px-6 md:px-12 lg:px-20 space-y-12">
      {/* Refined Navigation Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-6 border-b border-slate-100 dark:border-slate-800 pb-10">
        <div className="flex items-center space-x-4">
          <div className="h-12 w-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-slate-900/10">
            <LayoutDashboard className="h-6 w-6" />
          </div>
          <div className="space-y-0.5">
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.25em]">Portal Identity</p>
            <p className="text-sm text-slate-900 dark:text-white font-black uppercase tracking-tight">
              {user?.role === 'vendor' ? 'Merchant Control' : 'Customer Account'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-6">
          <div className="hidden lg:block text-right border-r border-slate-100 dark:border-slate-800 pr-6 mr-6">
            <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mb-0.5">Authenticated User</p>
            <p className="text-xs text-slate-900 dark:text-white font-black uppercase tracking-tight">{user?.name}</p>
          </div>
          
          <div className="flex items-center space-x-3">
            <button 
              onClick={() => setActiveTab('profile')}
              className={`p-3 rounded-xl transition-all ${activeTab === 'profile' ? 'bg-slate-100 text-slate-900' : 'text-slate-400 hover:text-slate-900 hover:bg-slate-50'}`}
              title="Account Settings"
            >
              <Settings className="h-5 w-5" />
            </button>
            <button 
              onClick={() => { logout(); navigate('/login'); }}
              className="p-3 bg-rose-50 text-rose-500 rounded-xl hover:bg-rose-500 hover:text-white transition-all shadow-sm"
              title="Logout"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
        {/* Professional Console Sidebar */}
        <div className="md:col-span-1 space-y-8">
          <div className="flex md:flex-col overflow-x-auto md:overflow-visible pb-4 md:pb-0 gap-2 no-scrollbar bg-slate-50/50 dark:bg-slate-900/50 rounded-[2.5rem] p-3 border border-slate-100 dark:border-slate-800">
            {user.role === 'vendor' ? (
              <>
                <button 
                  onClick={() => setActiveTab('performance')}
                  className={`flex-shrink-0 md:w-full flex items-center space-x-4 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 ${activeTab === 'performance' ? 'bg-slate-900 text-white shadow-xl shadow-slate-900/20 scale-[1.02]' : 'text-slate-400 hover:text-slate-900 hover:bg-white'}`}
                >
                  <BarChart3 className="h-4 w-4" />
                  <span>Performance</span>
                </button>
                <button 
                  onClick={() => setActiveTab('inventory')}
                  className={`flex-shrink-0 md:w-full flex items-center space-x-4 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 ${activeTab === 'inventory' ? 'bg-slate-900 text-white shadow-xl shadow-slate-900/20 scale-[1.02]' : 'text-slate-400 hover:text-slate-900 hover:bg-white'}`}
                >
                  <Package className="h-4 w-4" />
                  <span>Inventory</span>
                </button>
                <button 
                  onClick={() => setActiveTab('vendor_orders')}
                  className={`flex-shrink-0 md:w-full flex items-center space-x-4 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 ${activeTab === 'vendor_orders' ? 'bg-slate-900 text-white shadow-xl shadow-slate-900/20 scale-[1.02]' : 'text-slate-400 hover:text-slate-900 hover:bg-white'}`}
                >
                  <Truck className="h-4 w-4" />
                  <span>Shipments</span>
                </button>
              </>
            ) : (
              <>
                <button 
                  onClick={() => setActiveTab('overview')}
                  className={`flex-shrink-0 md:w-full flex items-center space-x-4 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 ${activeTab === 'overview' ? 'bg-slate-900 text-white shadow-xl shadow-slate-900/20 scale-[1.02]' : 'text-slate-400 hover:text-slate-900 hover:bg-white'}`}
                >
                  <LayoutDashboard className="h-4 w-4" />
                  <span>Overview</span>
                </button>
                <button 
                  onClick={() => setActiveTab('orders')}
                  className={`flex-shrink-0 md:w-full flex items-center space-x-4 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 ${activeTab === 'orders' ? 'bg-slate-900 text-white shadow-xl shadow-slate-900/20 scale-[1.02]' : 'text-slate-400 hover:text-slate-900 hover:bg-white'}`}
                >
                  <ShoppingBag className="h-4 w-4" />
                  <span>Orders</span>
                </button>
              </>
            )}

            <div className="h-px bg-slate-100 dark:bg-slate-800 my-2 mx-4" />

            <button 
              onClick={() => setActiveTab('profile')}
              className={`flex-shrink-0 md:w-full flex items-center space-x-4 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 ${activeTab === 'profile' ? 'bg-slate-900 text-white shadow-xl shadow-slate-900/20 scale-[1.02]' : 'text-slate-400 hover:text-slate-900 hover:bg-white'}`}
            >
              <Settings className="h-4 w-4" />
              <span>Settings</span>
            </button>
          </div>

          {/* Security & Trust Badge */}
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-100 dark:border-slate-800 shadow-sm group">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] mb-6">Security Clearance</p>
            <div className="flex items-center space-x-4 mb-6">
              <div className="h-12 w-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 group-hover:scale-110 transition-transform">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight">Verified Profile</p>
                <p className="text-[9px] text-emerald-500 font-black uppercase tracking-widest">Lvl 1 Authenticated</p>
              </div>
            </div>
            <div className="py-3 px-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
               <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest text-center">
                 Partnered since {user?.created_at ? new Date(user.created_at).getFullYear() : '2024'}
               </p>
            </div>
          </div>
        </div>

        {/* Tab Content */}
        <div className="md:col-span-3">
          {activeTab === 'performance' && <VendorDashboard />}
          
          {activeTab === 'overview' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {stats.map((stat) => (
                  <div key={stat.label} className="group relative overflow-hidden bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-100 dark:border-slate-800/50 shadow-[0_20px_50px_rgba(0,0,0,0.02)] hover:shadow-[0_30px_70px_rgba(0,0,0,0.05)] transition-all duration-500">
                    <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${stat.gradient} blur-3xl opacity-30 group-hover:opacity-60 transition-opacity`} />
                    <div className="relative flex items-center space-x-4">
                      <div className={`${stat.bg} dark:bg-white/5 p-4 rounded-[1.25rem] transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3`}>
                        <stat.icon className={`h-6 w-6 ${stat.color}`} />
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 font-black uppercase tracking-[0.2em] mb-1">{stat.label}</p>
                        <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{stat.value}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Recent Orders Section */}
              <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-8 shadow-sm border border-slate-50 dark:border-slate-800 min-h-[400px]">
                <div className="flex justify-between items-center mb-8">
                  <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Recent Orders</h3>
                  <button onClick={() => setActiveTab('orders')} className="text-xs font-black text-primary-600 hover:text-primary-700 uppercase tracking-widest">View All</button>
                </div>

                {dashboardLoading ? (
                  <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-slate-200 dark:text-slate-700" /></div>
                ) : orders.length > 0 ? (
                  <div className="space-y-6">
                    {orders.slice(0, 5).map((order) => (
                      <div key={order.id} className="group relative bg-white dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-[2rem] p-6 hover:border-primary-100 dark:hover:border-primary-900/50 hover:shadow-xl hover:shadow-primary-900/5 transition-all">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                          <div className="flex items-center space-x-5">
                            <div className="bg-slate-50 dark:bg-white/5 p-4 rounded-2xl"><Package className="h-5 w-5 text-slate-400" /></div>
                            <div>
                              <div className="flex items-center space-x-3 mb-1">
                                <p className="font-black text-slate-900 dark:text-white text-sm">{order.items?.[0]?.product_name || 'Order'}</p>
                                <span className={`px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest border ${getStatusColor(order.order_status)}`}>
                                  {order.order_status}
                                </span>
                              </div>
                              <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                                Ref: SS-{order.id.slice(-5).toUpperCase()} • {new Date(order.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center justify-between md:justify-end md:space-x-8">
                             <div className="text-left md:text-right">
                                <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase">Total</p>
                                <p className="text-lg font-black text-slate-900 dark:text-white">₹{parseFloat(order.total_amount).toLocaleString('en-IN')}</p>
                             </div>
                             
                             {order.order_status?.toLowerCase() === 'pending' && (
                               <button 
                                 onClick={() => handleCancelOrder(order.id)}
                                 className="text-rose-500 hover:text-rose-600 text-[10px] font-black uppercase tracking-widest pl-6 border-l border-slate-100 dark:border-slate-700"
                               >
                                 Cancel
                               </button>
                             )}
                             
                             <button 
                               onClick={() => navigate(`/order-success/${order.id}`)} 
                               className="p-2 hover:bg-slate-50 dark:hover:bg-white/5 rounded-full transition-colors"
                             >
                               <ChevronRight className="h-5 w-5 text-slate-300 dark:text-slate-600" />
                             </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
                    <div className="bg-slate-50 p-6 rounded-full"><ShoppingCart className="h-10 w-10 text-slate-200" /></div>
                    <p className="text-slate-500 font-medium">No recent orders found.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'orders' && <OrderList />}
          {activeTab === 'inventory' && <VendorDashboard />}
          {activeTab === 'vendor_orders' && <VendorOrders />}

          {activeTab === 'profile' && (
            <div className="max-w-4xl space-y-12 animate-in fade-in slide-in-from-right-4 duration-500">
              {/* Profile Form */}
              <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-10 border border-slate-100 dark:border-slate-800 shadow-sm space-y-10">
                <div className="flex items-center space-x-4">
                  <div className="h-12 w-12 rounded-2xl bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center text-primary-600 dark:text-primary-400">
                    <UserIcon className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">Personal Details</h3>
                    <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Manage your public information</p>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] ml-1">Full Name</label>
                      <input 
                        name="name" 
                        type="text" 
                        placeholder="e.g. John Doe"
                        className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-2xl focus:bg-white dark:focus:bg-slate-800 focus:ring-4 focus:ring-primary-500/5 focus:border-primary-500 transition-all duration-300 font-bold text-slate-900 dark:text-white text-sm" 
                        value={formData.name} 
                        onChange={handleChange} 
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] ml-1">Phone Number</label>
                      <input 
                        name="phone" 
                        type="tel" 
                        placeholder="+91 00000 00000"
                        className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-2xl focus:bg-white dark:focus:bg-slate-800 focus:ring-4 focus:ring-primary-500/5 focus:border-primary-500 transition-all duration-300 font-bold text-slate-900 dark:text-white text-sm" 
                        value={formData.phone} 
                        onChange={handleChange} 
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-4">
                    <button 
                      type="submit" 
                      disabled={loading} 
                      className="group flex items-center space-x-3 px-10 py-4 bg-slate-900 text-white rounded-[1.5rem] font-black text-xs uppercase tracking-widest hover:bg-primary-600 transition-all duration-500 shadow-2xl shadow-slate-900/10 active:scale-95"
                    >
                      {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : (
                        <>
                          <span>Save Changes</span>
                          <Save className="h-4 w-4 group-hover:scale-110 transition-transform" />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>

              {/* Security Form */}
              <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-10 border border-slate-100 dark:border-slate-800 shadow-sm space-y-10">
                <div className="flex items-center space-x-4">
                  <div className="h-12 w-12 rounded-2xl bg-rose-50 dark:bg-rose-900/20 flex items-center justify-center text-rose-600 dark:text-rose-400">
                    <Lock className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">Security</h3>
                    <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Update your account credentials</p>
                  </div>
                </div>

                <form onSubmit={handlePasswordSubmit} className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="md:col-span-3 space-y-3">
                      <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] ml-1">Current Password</label>
                      <input 
                        name="old_password" 
                        type="password" 
                        className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-2xl focus:bg-white dark:focus:bg-slate-800 focus:ring-4 focus:ring-rose-500/5 focus:border-rose-500 transition-all duration-300 font-bold text-slate-900 dark:text-white text-sm" 
                        value={passwords.old_password} 
                        onChange={handlePasswordChange} 
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] ml-1">New Password</label>
                      <input 
                        name="new_password" 
                        type="password" 
                        className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-2xl focus:bg-white dark:focus:bg-slate-800 focus:ring-4 focus:ring-rose-500/5 focus:border-rose-500 transition-all duration-300 font-bold text-slate-900 dark:text-white text-sm" 
                        value={passwords.new_password} 
                        onChange={handlePasswordChange} 
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] ml-1">Confirm New Password</label>
                      <input 
                        name="new_password2" 
                        type="password" 
                        className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-2xl focus:bg-white dark:focus:bg-slate-800 focus:ring-4 focus:ring-rose-500/5 focus:border-rose-500 transition-all duration-300 font-bold text-slate-900 dark:text-white text-sm" 
                        value={passwords.new_password2} 
                        onChange={handlePasswordChange} 
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-4">
                    <button 
                      type="submit" 
                      disabled={changingPassword}
                      className="group flex items-center space-x-3 px-10 py-4 bg-white dark:bg-white/5 border-2 border-slate-100 dark:border-slate-800 text-slate-900 dark:text-slate-200 rounded-[1.5rem] font-black text-xs uppercase tracking-widest hover:border-rose-500 dark:hover:border-rose-500 hover:text-rose-600 dark:hover:text-rose-400 transition-all duration-500 active:scale-95"
                    >
                      {changingPassword ? <Loader2 className="h-5 w-5 animate-spin" /> : (
                        <>
                          <span>Update Security</span>
                          <ShieldCheck className="h-4 w-4 group-hover:scale-110 transition-transform" />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>

      {isReviewModalOpen && selectedProduct && (
        <ReviewModal
          isOpen={isReviewModalOpen}
          product={selectedProduct}
          onClose={() => setIsReviewModalOpen(false)}
          onSuccess={selectedProduct.onSuccess}
        />
      )}
    </div>
  );
};

export default Profile;
