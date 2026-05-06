import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import productService from '../../api/productService';
import { Package, Upload, X, Loader2, ArrowLeft } from 'lucide-react';

const AddProduct = () => {
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    description: '',
    price: '',
    stock: '1',
    is_active: true,
  });
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const data = await productService.getCategories();
      setCategories(data);
      if (data.length > 0) {
        setFormData(prev => ({ ...prev, category: data[0].id }));
      }
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImages([...images, ...files]);
  };

  const removeImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const data = new FormData();
    Object.keys(formData).forEach(key => {
      data.append(key, formData[key]);
    });
    
    images.forEach((image) => {
      data.append('images', image);
    });

    try {
      await productService.createProduct(data);
      navigate('/vendor/dashboard');
    } catch (err) {
      console.log('Backend Error:', err.response?.data);
      const errorData = err.response?.data;
      if (typeof errorData === 'object' && errorData !== null) {
        // If it's a field-level error (e.g. { name: ['This field is required'] })
        const firstErrorKey = Object.keys(errorData)[0];
        const firstError = errorData[firstErrorKey];
        setError(Array.isArray(firstError) ? `${firstErrorKey}: ${firstError[0]}` : firstError || 'Failed to create product');
      } else {
        setError(err.response?.data?.error || 'Failed to create product. Please check all fields.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8">
      <button 
        onClick={() => navigate(-1)} 
        className="flex items-center space-x-2 text-slate-500 hover:text-primary-600 mb-8 transition-colors"
      >
        <ArrowLeft className="h-5 w-5" />
        <span className="font-medium">Back to Dashboard</span>
      </button>

      <div className="glass-card p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Add New Product</h1>
          <p className="text-slate-600 mt-2">Fill in the details to list your product</p>
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
                placeholder="Ex: Wireless Headphones"
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
              placeholder="Describe your product in detail..."
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
                placeholder="0.00"
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

          <div className="space-y-4">
            <label className="block text-sm font-bold text-slate-700">Product Images</label>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {images.map((img, index) => (
                <div key={index} className="relative aspect-square rounded-xl overflow-hidden border border-slate-200 group">
                  <img src={URL.createObjectURL(img)} alt="" className="h-full w-full object-cover" />
                  <button 
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-1 right-1 p-1 bg-white/80 backdrop-blur rounded-full text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
              <label className="flex flex-col items-center justify-center aspect-square rounded-xl border-2 border-dashed border-slate-300 hover:border-primary-500 hover:bg-primary-50 cursor-pointer transition-all">
                <Upload className="h-6 w-6 text-slate-400" />
                <span className="text-[10px] font-bold text-slate-500 mt-2">Upload</span>
                <input type="file" multiple className="hidden" onChange={handleImageChange} accept="image/*" />
              </label>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex items-center justify-center space-x-2 px-12 py-3"
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <span>List Product</span>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProduct;
