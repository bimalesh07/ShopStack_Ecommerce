import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import productService from '../../api/productService';
import { Package, Upload, X, Loader2, ArrowLeft, Save } from 'lucide-react';
import toast from 'react-hot-toast';

const EditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    description: '',
    price: '',
    stock: '',
    is_active: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const [productData, categoriesData] = await Promise.all([
        productService.getProductById(id),
        productService.getCategories()
      ]);
      
      setCategories(categoriesData);
      setFormData({
        name: productData.name,
        category: productData.category,
        description: productData.description,
        price: productData.price,
        stock: productData.stock,
        is_active: productData.is_active,
      });
    } catch (err) {
      console.error('Failed to fetch product data:', err);
      toast.error('Failed to load product data');
      navigate('/vendor/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      await productService.updateProduct(id, formData);
      toast.success('Product updated successfully!');
      navigate('/vendor/dashboard');
    } catch (err) {
      const errorData = err.response?.data;
      if (typeof errorData === 'object') {
        const firstError = Object.values(errorData)[0];
        setError(Array.isArray(firstError) ? firstError[0] : firstError || 'Failed to update product');
      } else {
        setError('Failed to update product. Please check all fields.');
      }
    } finally {
      setSaving(false);
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
    <div className="max-w-4xl mx-auto py-8">
      <button 
        onClick={() => navigate('/vendor/dashboard')} 
        className="flex items-center space-x-2 text-slate-500 hover:text-primary-600 mb-8 transition-colors"
      >
        <ArrowLeft className="h-5 w-5" />
        <span className="font-medium">Back to Dashboard</span>
      </button>

      <div className="glass-card p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Edit Product</h1>
          <p className="text-slate-600 mt-2">Update your product details</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm mb-8 border border-red-100 font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-bold text-slate-700">Product Name</label>
              <input
                name="name"
                type="text"
                required
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 transition-all"
                value={formData.name}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-bold text-slate-700">Category</label>
              <select
                name="category"
                required
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 transition-all"
                value={formData.category}
                onChange={handleChange}
              >
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-bold text-slate-700">Description</label>
            <textarea
              name="description"
              rows="4"
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 transition-all"
              value={formData.description}
              onChange={handleChange}
            ></textarea>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-bold text-slate-700">Price ($)</label>
              <input
                name="price"
                type="number"
                step="0.01"
                required
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 transition-all"
                value={formData.price}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-bold text-slate-700">Stock Quantity</label>
              <input
                name="stock"
                type="number"
                required
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 transition-all"
                value={formData.stock}
                onChange={handleChange}
              />
            </div>
            <div className="flex items-center space-x-3 pt-8">
              <input
                name="is_active"
                type="checkbox"
                id="is_active"
                className="h-5 w-5 text-primary-600 rounded border-slate-300 focus:ring-primary-500"
                checked={formData.is_active}
                onChange={handleChange}
              />
              <label htmlFor="is_active" className="text-sm font-bold text-slate-700 cursor-pointer">Active for Sale</label>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="btn-primary flex items-center justify-center space-x-2 px-12 py-3"
            >
              {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : (
                <>
                  <Save className="h-5 w-5" />
                  <span>Update Product</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProduct;
