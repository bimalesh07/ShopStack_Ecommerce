import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import productService from '../../api/productService';
import orderService from '../../api/orderService';
import { 
  Package, Plus, Trash2, Edit, ExternalLink, Loader2, 
  DollarSign, Truck, ShoppingBag, ArrowUpRight, TrendingUp, 
  AlertCircle, Settings, BarChart3, Layers, Zap
} from 'lucide-react';
import toast from 'react-hot-toast';

const VendorDashboard = () => {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setError(null);
      const [productsData, ordersData] = await Promise.all([
        productService.getVendorProducts(),
        orderService.getVendorOrders()
      ]);
      
      setProducts(Array.isArray(productsData) ? productsData : []);
      const orderList = ordersData?.results || (Array.isArray(ordersData) ? ordersData : []);
      setOrders(orderList);
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
      const message = err.response?.data?.error || 'Failed to fetch dashboard data';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const totalSales = orders
    .filter(order => order.order_status?.toLowerCase() !== 'cancelled')
    .reduce((sum, order) => sum + parseFloat(order.total_amount), 0);

  const pendingShipments = orders.filter(order => 
    ['pending', 'confirmed', 'shipped'].includes(order.order_status?.toLowerCase())
  ).length;

  const inTransit = orders.filter(order => order.order_status?.toLowerCase() === 'shipped').length;

  const stats = [
    { 
      label: 'Revenue', 
      value: `₹${totalSales.toLocaleString('en-IN')}`, 
      icon: DollarSign, 
      color: 'text-emerald-500', 
      bg: 'bg-emerald-500/10',
      gradient: 'from-emerald-500/20 to-teal-500/0',
      trend: '+12.5%',
      trendUp: true
    },
    { 
      label: 'Inventory', 
      value: products.length, 
      icon: Layers, 
      color: 'text-blue-500', 
      bg: 'bg-blue-500/10',
      gradient: 'from-blue-500/20 to-indigo-500/0',
      trend: 'Live',
      trendUp: true
    },
    { 
      label: 'To Ship', 
      value: pendingShipments, 
      icon: Zap, 
      color: 'text-orange-500', 
      bg: 'bg-orange-500/10',
      gradient: 'from-orange-500/20 to-amber-500/0',
      trend: 'Action',
      trendUp: false
    },
    { 
      label: 'In Transit', 
      value: inTransit, 
      icon: Truck, 
      color: 'text-purple-500', 
      bg: 'bg-purple-500/10',
      gradient: 'from-purple-500/20 to-indigo-500/0',
      trend: 'Moving',
      trendUp: true
    },
    { 
      label: 'Orders', 
      value: orders.length, 
      icon: BarChart3, 
      color: 'text-slate-500', 
      bg: 'bg-slate-500/10',
      gradient: 'from-slate-500/20 to-slate-400/0',
      trend: 'Total',
      trendUp: true
    },
  ];

  const handleDelete = (id) => {
    toast((t) => (
      <div className="flex flex-col gap-4">
        <div className="space-y-1">
          <p className="text-sm font-bold text-slate-900 uppercase tracking-tight">Delete Product?</p>
          <p className="text-[10px] text-slate-500 font-medium uppercase tracking-widest leading-relaxed">This action will permanently remove the item from ShopStack.</p>
        </div>
        <div className="flex gap-3 justify-end">
          <button 
            onClick={() => toast.dismiss(t.id)}
            className="px-4 py-2 text-[10px] font-black text-slate-400 hover:text-slate-900 transition-colors uppercase tracking-widest"
          >
            Cancel
          </button>
          <button 
            onClick={async () => {
              toast.dismiss(t.id);
              await confirmDelete(id);
            }}
            className="px-5 py-2 text-[10px] font-black bg-slate-900 text-white rounded-xl hover:bg-rose-600 transition-all uppercase tracking-widest active:scale-95 shadow-lg shadow-slate-900/10"
          >
            Confirm
          </button>
        </div>
      </div>
    ));
  };

  const confirmDelete = async (id) => {
    const loadingToast = toast.loading('Removing product...');
    try {
      await productService.deleteProduct(id);
      setProducts(products.filter(p => p.id !== id));
      toast.success('Product removed', { id: loadingToast });
    } catch (err) {
      toast.error('Failed to remove', { id: loadingToast });
    }
  };

  const [editingId, setEditingId] = useState(null);
  const [editValues, setEditValues] = useState({ stock: 0, selling_price: 0 });

  const startEditing = (product) => {
    setEditingId(product.id);
    setEditValues({ stock: product.stock, selling_price: product.selling_price });
  };

  const handleQuickUpdate = async (id) => {
    try {
      setLoading(true);
      await productService.updateProduct(id, editValues);
      setProducts(products.map(p => p.id === id ? { ...p, ...editValues } : p));
      setEditingId(null);
      toast.success('Updated successfully');
    } catch (err) {
      toast.error('Update failed');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !editingId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
        <div className="relative h-20 w-20">
          <div className="absolute inset-0 rounded-full border-2 border-slate-100" />
          <div className="absolute inset-0 rounded-full border-t-2 border-slate-900 animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Zap className="h-6 w-6 text-slate-900 animate-pulse" />
          </div>
        </div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Syncing Merchant Data</p>
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto py-8 px-4 space-y-12 animate-in fade-in duration-1000">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <div>
              <div className="flex items-center space-x-3 mb-1">
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">Shop Console</h1>
                <span className="flex items-center space-x-1.5 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[8px] font-black uppercase tracking-widest border border-emerald-100 shadow-sm">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Verified Store</span>
                </span>
              </div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Global Shop Performance & Operations</p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <Link 
            to="/vendor/orders" 
            className="group h-14 px-8 bg-white border border-slate-200 text-slate-900 rounded-2xl font-black text-[10px] uppercase tracking-[0.15em] flex items-center space-x-3 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm"
          >
            <BarChart3 className="h-4 w-4 text-slate-400 group-hover:text-slate-900 transition-colors" />
            <span>Manage Orders</span>
          </Link>
          <Link 
            to="/vendor/add-product" 
            className="h-14 px-10 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.15em] flex items-center space-x-3 hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/10 active:scale-95"
          >
            <Plus className="h-4 w-4" />
            <span>List New Product</span>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div 
            key={stat.label} 
            className="group relative overflow-hidden bg-white rounded-[2.5rem] p-8 border border-slate-100 hover:border-slate-200 transition-all duration-500 shadow-sm hover:shadow-xl hover:shadow-slate-200/40"
          >
            <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${stat.gradient} blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700`} />
            
            <div className="relative flex flex-col h-full space-y-6">
              <div className="flex items-center justify-between">
                <div className={`${stat.bg} p-4 rounded-2xl group-hover:scale-110 transition-transform duration-500`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div className={`flex items-center space-x-1.5 px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${stat.trendUp ? 'text-emerald-600 bg-emerald-50' : 'text-amber-600 bg-amber-50'}`}>
                  {stat.trendUp ? <TrendingUp className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
                  <span>{stat.trend}</span>
                </div>
              </div>
              
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1.5">{stat.label}</p>
                <p className="text-3xl font-black text-slate-900 tracking-tighter">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Inventory Section */}
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-6 border-b border-slate-100 pb-8">
          <div className="flex items-center space-x-5">
            <div className="h-14 w-14 bg-slate-50 rounded-[1.5rem] flex items-center justify-center text-slate-900 border border-slate-100">
              <Layers className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">Active Inventory</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-1">{products.length} Listing{products.length !== 1 ? 's' : ''} currently live</p>
            </div>
          </div>
          
          <div className="flex items-center px-4 py-2 bg-amber-50 rounded-xl border border-amber-100/50">
            <Zap className="h-3.5 w-3.5 text-amber-500 mr-2" />
            <p className="text-[9px] font-black text-amber-700 uppercase tracking-widest">Click metrics to quick-edit</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3">
          {products.length > 0 ? (
            products.map((product) => (
              <div 
                key={product.id} 
                className="group relative bg-white border border-slate-100 rounded-3xl p-5 hover:border-slate-900/10 hover:shadow-xl hover:shadow-slate-200/40 transition-all duration-500"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  {/* Product Info - More Compact */}
                  <div className="flex items-center space-x-5 flex-1 min-w-0">
                    <div className="h-20 w-20 rounded-2xl bg-slate-50 overflow-hidden border border-slate-100 flex-shrink-0 group-hover:scale-105 transition-transform duration-700 shadow-sm">
                      {product.images?.[0] ? (
                        <img src={product.images[0].image} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center">
                          <Package className="h-6 w-6 text-slate-200" />
                        </div>
                      )}
                    </div>
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded-lg text-[8px] font-black uppercase tracking-widest border border-slate-200/30">
                          {product.category_name}
                        </span>
                        <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest">#{product.id.toString().slice(-6)}</span>
                      </div>
                      <h4 className="text-lg font-black text-slate-900 group-hover:text-primary-600 transition-colors tracking-tight line-clamp-1">{product.name}</h4>
                      <div className={`inline-flex items-center px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest border ${
                        product.stock > 0 && product.is_active 
                          ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                          : 'bg-rose-50 text-rose-600 border-rose-100'
                      }`}>
                        <div className={`h-1 w-1 rounded-full mr-1.5 ${
                          product.stock > 0 && product.is_active ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'
                        }`} />
                        {product.stock > 0 && product.is_active ? 'Active' : 'Hidden'}
                      </div>
                    </div>
                  </div>

                  {/* Metrics & Actions - Better Aligned */}
                  <div className="flex items-center justify-between lg:justify-end gap-12 lg:gap-16">
                    {/* Price */}
                    <div className="space-y-0.5 text-right lg:text-left">
                      <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em]">Price</p>
                      {editingId === product.id ? (
                        <div className="flex items-center space-x-1 animate-in zoom-in-95">
                          <span className="text-slate-400 font-black text-xs">₹</span>
                          <input 
                            type="number"
                            className="w-24 h-9 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-black outline-none focus:ring-2 focus:ring-slate-900 transition-all"
                            value={editValues.selling_price}
                            onChange={(e) => setEditValues({ ...editValues, selling_price: e.target.value })}
                          />
                        </div>
                      ) : (
                        <div 
                          onClick={() => startEditing(product)}
                          className="cursor-pointer group/price hover:opacity-70 transition-opacity"
                        >
                          <p className="text-xl font-black text-slate-900 tracking-tighter">
                            ₹{parseFloat(product.selling_price).toLocaleString('en-IN')}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Stock */}
                    <div className="space-y-0.5 text-right lg:text-left">
                      <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em]">Stock</p>
                      {editingId === product.id ? (
                        <input 
                          type="number"
                          className="w-20 h-9 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-black outline-none focus:ring-2 focus:ring-slate-900 transition-all"
                          value={editValues.stock}
                          onChange={(e) => setEditValues({ ...editValues, stock: e.target.value })}
                        />
                      ) : (
                        <div 
                          onClick={() => startEditing(product)}
                          className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl cursor-pointer transition-all ${
                            product.stock < 5 ? 'bg-amber-50 text-amber-600' : 'bg-slate-50 text-slate-900 hover:bg-slate-100'
                          }`}
                        >
                          <span className="text-sm font-black">{product.stock}</span>
                          <span className="text-[9px] font-bold uppercase tracking-widest opacity-40">Units</span>
                        </div>
                      )}
                    </div>

                    {/* Quick Actions - Sleek Buttons */}
                    <div className="flex items-center space-x-2">
                      {editingId === product.id ? (
                        <div className="flex items-center space-x-1.5">
                          <button 
                            onClick={() => handleQuickUpdate(product.id)}
                            className="h-9 px-5 bg-slate-900 text-white rounded-xl text-[8px] font-black uppercase tracking-widest hover:bg-slate-800 shadow-lg shadow-slate-900/10 transition-all active:scale-95"
                          >
                            Save
                          </button>
                          <button 
                            onClick={() => setEditingId(null)}
                            className="h-9 w-9 bg-slate-100 text-slate-400 rounded-xl flex items-center justify-center hover:bg-slate-200 transition-all"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ) : (
                        <>
                          <Link 
                            to={`/vendor/edit-product/${product.id}`} 
                            className="h-10 w-10 bg-slate-50 text-slate-400 rounded-xl flex items-center justify-center hover:text-slate-900 hover:bg-white hover:shadow-lg hover:shadow-slate-200/50 transition-all group/edit"
                          >
                            <Edit className="h-4 w-4 transition-transform group-hover/edit:scale-110" />
                          </Link>
                          <button 
                            onClick={() => handleDelete(product.id)}
                            className="h-10 w-10 bg-slate-50 text-slate-400 rounded-xl flex items-center justify-center hover:text-rose-500 hover:bg-white hover:shadow-lg hover:shadow-rose-500/10 transition-all group/del"
                          >
                            <Trash2 className="h-4 w-4 transition-transform group-hover/del:scale-110" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white border border-slate-100 border-dashed rounded-[3rem] p-24 text-center">
              <div className="max-w-xs mx-auto space-y-6">
                <div className="h-20 w-20 bg-slate-50 rounded-full mx-auto flex items-center justify-center border border-slate-100">
                  <Package className="h-8 w-8 text-slate-200" />
                </div>
                <div className="space-y-2">
                  <h4 className="text-xl font-black text-slate-900 tracking-tight uppercase">Ready to start selling?</h4>
                  <p className="text-sm font-medium text-slate-500 leading-relaxed">Your digital storefront is currently empty. List your first product to go live.</p>
                </div>
                <Link to="/vendor/add-product" className="h-14 px-10 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest inline-flex items-center shadow-xl shadow-slate-900/10 hover:bg-slate-800 transition-all active:scale-95">Add First Product</Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VendorDashboard;
