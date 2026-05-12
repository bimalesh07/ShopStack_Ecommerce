import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import productService from '../../api/productService';
import { Package, Upload, X, Loader2, ArrowLeft, Save, Image as ImageIcon } from 'lucide-react';
import toast from 'react-hot-toast';

const EditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    description: '',
    mrp_price: '',
    selling_price: '',
    stock: '',
    is_active: true,
  });
  const [existingImages, setExistingImages] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    setCategoriesLoading(true);
    try {
      const [productData, categoriesData] = await Promise.all([
        productService.getVendorProductById(id),
        productService.getCategories()
      ]);
      
      setCategories(Array.isArray(categoriesData) ? categoriesData : []);
      setFormData({
        name: productData.name,
        category: productData.category?.id || productData.category,
        description: productData.description,
        mrp_price: productData.mrp_price,
        selling_price: productData.selling_price,
        stock: productData.stock,
        is_active: productData.is_active,
      });
      setExistingImages(productData.images || []);
    } catch (err) {
      console.error('Failed to fetch product data:', err);
      toast.error('Failed to load product data');
      navigate('/vendor/dashboard');
    } finally {
      setLoading(false);
      setCategoriesLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleImageChange = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploadingImage(true);
    try {
      for (const file of files) {
        const data = new FormData();
        data.append('image', file);
        const newImg = await productService.uploadImage(id, data);
        setExistingImages(prev => [...prev, newImg]);
      }
      toast.success('Images uploaded successfully');
    } catch (err) {
      toast.error('Failed to upload images');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleDeleteImage = async (imageId) => {
    try {
      await productService.deleteImage(id, imageId);
      setExistingImages(existingImages.filter(img => img.id !== imageId));
      toast.success('Image deleted');
    } catch (err) {
      toast.error('Failed to delete image');
    }
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
    <div className="container-tight max-w-5xl py-8">
      <button 
        onClick={() => navigate('/vendor/dashboard')} 
        className="flex items-center space-x-2 text-slate-500 hover:text-slate-900 mb-8 transition-all group"
      >
        <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
        <span className="font-bold text-xs uppercase tracking-widest">Back to Dashboard</span>
      </button>

      <div className="glass-card p-8 md:p-12 border border-slate-100 rounded-[2.5rem]">
        <div className="mb-10">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Edit Product</h1>
          <p className="text-sm font-medium text-slate-500 mt-2">Update your product listing details and media</p>
        </div>

        {error && (
          <div className="bg-rose-50 text-rose-600 p-4 rounded-2xl text-xs font-bold uppercase tracking-widest mb-10 border border-rose-100">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-10">
          {/* Images Section */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black text-slate-900 uppercase tracking-widest">Product Media</label>
              {uploadingImage && <Loader2 className="h-4 w-4 animate-spin text-primary-600" />}
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {existingImages.map((img) => (
                <div key={img.id} className="relative aspect-square rounded-2xl overflow-hidden border border-slate-100 group shadow-sm bg-slate-200 dark:bg-slate-800 animate-pulse">
                  <img 
                    src={img.image.replace('/upload/', '/upload/q_auto,f_auto,w_600/')} 
                    alt="" 
                    loading="lazy"
                    className="h-full w-full object-cover" 
                  />
                  <button 
                    type="button"
                    onClick={() => handleDeleteImage(img.id)}
                    className="absolute top-2 right-2 p-1.5 bg-white/90 backdrop-blur rounded-xl text-rose-500 opacity-0 group-hover:opacity-100 transition-all hover:bg-rose-500 hover:text-white"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
              
              <label className="flex flex-col items-center justify-center aspect-square rounded-2xl border-2 border-dashed border-slate-200 hover:border-slate-900 hover:bg-slate-50 cursor-pointer transition-all group">
                <Upload className="h-6 w-6 text-slate-300 group-hover:text-slate-900 transition-colors" />
                <span className="text-[10px] font-bold text-slate-400 group-hover:text-slate-900 mt-2 uppercase tracking-widest">Add Image</span>
                <input type="file" multiple className="hidden" onChange={handleImageChange} accept="image/*" disabled={uploadingImage} />
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-slate-50">
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Product Name</label>
              <input
                name="name"
                type="text"
                required
                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-slate-900 focus:bg-white outline-none transition-all font-medium text-slate-900"
                value={formData.name}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Category</label>
              <select
                name="category"
                required
                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-slate-900 focus:bg-white outline-none transition-all font-medium text-slate-900 disabled:opacity-50 appearance-none"
                value={formData.category}
                onChange={handleChange}
                disabled={categoriesLoading}
              >
                <option value="">{categoriesLoading ? 'Loading...' : 'Select Category'}</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Detailed Description</label>
            <textarea
              name="description"
              rows="4"
              className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-slate-900 focus:bg-white outline-none transition-all font-medium text-slate-900 resize-none"
              value={formData.description}
              onChange={handleChange}
            ></textarea>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pt-6 border-t border-slate-50">
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">MRP (₹)</label>
              <input
                name="mrp_price"
                type="number"
                step="0.01"
                required
                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-slate-900 focus:bg-white outline-none transition-all font-medium text-slate-900"
                value={formData.mrp_price}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Selling Price (₹)</label>
              <input
                name="selling_price"
                type="number"
                step="0.01"
                required
                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-slate-900 focus:bg-white outline-none transition-all font-medium text-slate-900"
                value={formData.selling_price}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Stock Units</label>
              <input
                name="stock"
                type="number"
                required
                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-slate-900 focus:bg-white outline-none transition-all font-medium text-slate-900"
                value={formData.stock}
                onChange={handleChange}
              />
            </div>
            <div className="flex items-center space-x-3 pt-8 pl-2">
              <input
                name="is_active"
                type="checkbox"
                id="is_active"
                className="h-6 w-6 text-slate-900 rounded-lg border-slate-300 focus:ring-slate-900 transition-all cursor-pointer"
                checked={formData.is_active}
                onChange={handleChange}
              />
              <label htmlFor="is_active" className="text-xs font-black text-slate-700 cursor-pointer uppercase tracking-widest">Active for Sale</label>
            </div>
          </div>

          <div className="pt-10 border-t border-slate-50 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="bg-slate-900 text-white px-12 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/10 disabled:opacity-50 flex items-center space-x-3 active:scale-95"
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
