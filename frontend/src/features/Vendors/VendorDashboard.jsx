import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import productService from '../../api/productService';
import orderService from '../../api/orderService';
import { Package, Plus, Trash2, Edit, ExternalLink, Loader2, DollarSign, Truck, ShoppingBag } from 'lucide-react';

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
      
      // Ensure we always have arrays even if API returns something else
      setProducts(Array.isArray(productsData) ? productsData : []);
      setOrders(Array.isArray(ordersData) ? ordersData : []);
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
      const message = err.response?.data?.error || 'Failed to fetch dashboard data';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const totalSales = orders
    .filter(order => order.order_status !== 'CANCELLED')
    .reduce((sum, order) => sum + parseFloat(order.total_amount), 0);

  const pendingShipments = orders.filter(order => order.order_status === 'PENDING').length;

  const stats = [
    { label: 'Total Sales', value: `$${totalSales.toFixed(2)}`, icon: DollarSign, color: 'text-green-600', bg: 'bg-green-100' },
    { label: 'My Products', value: products.length, icon: Package, color: 'text-blue-600', bg: 'bg-blue-100' },
    { label: 'Pending Shipments', value: pendingShipments, icon: Truck, color: 'text-amber-600', bg: 'bg-amber-100' },
    { label: 'Total Orders', value: orders.length, icon: ShoppingBag, color: 'text-purple-600', bg: 'bg-purple-100' },
  ];

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await productService.deleteProduct(id); // I should add this to service
        setProducts(products.filter(p => p.id !== id));
      } catch (err) {
        alert('Failed to delete product');
      }
    }
  };

  const [editingId, setEditingId] = useState(null);
  const [editValues, setEditValues] = useState({ stock: 0, price: 0 });

  const startEditing = (product) => {
    setEditingId(product.id);
    setEditValues({ stock: product.stock, price: product.price });
  };

  const handleQuickUpdate = async (id) => {
    try {
      setLoading(true);
      await productService.updateProduct(id, editValues);
      setProducts(products.map(p => p.id === id ? { ...p, ...editValues } : p));
      setEditingId(null);
      toast.success('Inventory updated successfully');
    } catch (err) {
      toast.error('Failed to update inventory');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !editingId) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-12 w-12 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div className="space-y-8 py-8">
      {error && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-xl flex items-center space-x-3">
          <Package className="h-5 w-5" />
          <p className="font-medium">{error}</p>
        </div>
      )}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Vendor Dashboard</h1>
          <p className="text-slate-600 mt-2">Manage your shop and products</p>
        </div>
        <div className="flex items-center space-x-4">
          <Link to="/profile" className="text-slate-600 hover:text-primary-600 font-bold flex items-center space-x-2 mr-4 transition-colors">
            <Edit className="h-5 w-5" />
            <span>Settings</span>
          </Link>
          <Link to="/vendor/orders" className="bg-white border-2 border-slate-900 text-slate-900 px-6 py-2.5 rounded-xl font-bold flex items-center space-x-2 hover:bg-slate-50 transition-all">
            <ShoppingBag className="h-5 w-5" />
            <span>Manage Orders</span>
          </Link>
          <Link to="/vendor/add-product" className="btn-primary flex items-center space-x-2">
            <Plus className="h-5 w-5" />
            <span>Add Product</span>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.label} className="glass-card p-6 flex items-center space-x-4">
            <div className={`${stat.bg} p-3 rounded-xl`}>
              <stat.icon className={`h-6 w-6 ${stat.color}`} />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">{stat.label}</p>
              <p className="text-2xl font-black text-slate-900">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="glass-card overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <h3 className="font-bold text-slate-900">Your Inventory</h3>
            <span className="bg-primary-100 text-primary-700 px-2 py-0.5 rounded text-[10px] font-black uppercase">Live</span>
          </div>
          <p className="text-xs text-slate-400 font-medium italic">Click Stock or Price to quick-edit</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-bold">
              <tr>
                <th className="px-6 py-4">Product</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Price</th>
                <th className="px-6 py-4">Stock</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {products.length > 0 ? (
                products.map((product) => (
                  <tr key={product.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="h-12 w-12 rounded-xl bg-slate-100 flex-shrink-0 overflow-hidden shadow-inner border border-slate-200/50">
                          {product.images?.[0] ? (
                            <img src={product.images[0].image} alt="" className="h-full w-full object-cover" />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center">
                              <Package className="h-5 w-5 text-slate-300" />
                            </div>
                          )}
                        </div>
                        <span className="font-bold text-slate-900">{product.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600 text-sm font-medium">{product.category_name}</td>
                    <td className="px-6 py-4">
                      {editingId === product.id ? (
                        <div className="flex items-center space-x-1">
                          <span className="text-slate-400 font-bold">$</span>
                          <input 
                            type="number"
                            className="w-20 px-2 py-1 bg-white border border-primary-200 rounded-lg text-sm font-bold outline-none ring-2 ring-primary-50 focus:border-primary-500"
                            value={editValues.price}
                            onChange={(e) => setEditValues({ ...editValues, price: e.target.value })}
                          />
                        </div>
                      ) : (
                        <span 
                          onClick={() => startEditing(product)}
                          className="font-bold text-slate-900 cursor-pointer hover:text-primary-600 hover:underline decoration-dotted transition-colors"
                        >
                          ${parseFloat(product.price).toFixed(2)}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {editingId === product.id ? (
                        <input 
                          type="number"
                          className="w-16 px-2 py-1 bg-white border border-primary-200 rounded-lg text-sm font-bold outline-none ring-2 ring-primary-50 focus:border-primary-500"
                          value={editValues.stock}
                          onChange={(e) => setEditValues({ ...editValues, stock: e.target.value })}
                        />
                      ) : (
                        <button 
                          onClick={() => startEditing(product)}
                          className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
                            product.stock === 0 ? 'bg-red-100 text-red-600 hover:bg-red-600 hover:text-white' : 
                            product.stock < 5 ? 'bg-amber-100 text-amber-600 hover:bg-amber-600 hover:text-white' : 
                            'bg-slate-100 text-slate-600 hover:bg-primary-600 hover:text-white'
                          }`}
                        >
                          {product.stock} units
                        </button>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {product.stock > 0 ? (
                        <span className="flex items-center text-green-600 text-[10px] font-black uppercase tracking-widest">
                          <span className="h-1.5 w-1.5 rounded-full bg-green-500 mr-2 animate-pulse"></span>
                          In Stock
                        </span>
                      ) : (
                        <span className="flex items-center text-red-500 text-[10px] font-black uppercase tracking-widest">
                          <span className="h-1.5 w-1.5 rounded-full bg-red-500 mr-2"></span>
                          Sold Out
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-1">
                        {editingId === product.id ? (
                          <>
                            <button 
                              onClick={() => handleQuickUpdate(product.id)}
                              className="bg-primary-600 text-white px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-primary-700 shadow-md shadow-primary-200 transition-all"
                            >
                              Save
                            </button>
                            <button 
                              onClick={() => setEditingId(null)}
                              className="text-slate-400 hover:text-slate-600 p-2"
                            >
                              <Plus className="h-4 w-4 rotate-45" />
                            </button>
                          </>
                        ) : (
                          <>
                            <Link to={`/vendor/edit-product/${product.id}`} className="p-2 text-slate-400 hover:text-primary-600 transition-colors" title="Edit Full Product">
                              <Edit className="h-4 w-4" />
                            </Link>
                            <button 
                              onClick={() => handleDelete(product.id)}
                              className="p-2 text-slate-400 hover:text-red-500 transition-colors" 
                              title="Delete Product"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <Package className="h-10 w-10 text-slate-200" />
                      <p className="font-medium italic">No products found. Start by adding your first product!</p>
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

export default VendorDashboard;
