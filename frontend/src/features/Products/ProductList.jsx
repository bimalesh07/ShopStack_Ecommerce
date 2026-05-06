import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import ProductCard from './ProductCard';
import productService from '../../api/productService';
import { Filter, ChevronDown, Loader2, PackageSearch } from 'lucide-react';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const queryParams = new URLSearchParams(location.search);
  const currentCategory = queryParams.get('category') || '';
  const currentOrdering = queryParams.get('ordering') || '-created_at';
  const currentMinPrice = queryParams.get('min_price') || '';
  const currentMaxPrice = queryParams.get('max_price') || '';

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params = {
          category: currentCategory,
          ordering: currentOrdering,
          min_price: currentMinPrice,
          max_price: currentMaxPrice
        };
        const data = await productService.getProducts(params);
        setProducts(data);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [location.search]);

  const updateFilters = (newParams) => {
    const params = new URLSearchParams(location.search);
    Object.keys(newParams).forEach(key => {
      if (newParams[key]) {
        params.set(key, newParams[key]);
      } else {
        params.delete(key);
      }
    });
    navigate(`/products?${params.toString()}`);
  };

  const handleSort = (e) => {
    updateFilters({ ordering: e.target.value });
  };

  const clearFilters = () => {
    navigate('/products');
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh]">
        <Loader2 className="h-10 w-10 animate-spin text-primary-600 mb-4" />
        <p className="text-slate-600 font-medium italic">Curating best products for you...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">
            {currentCategory ? `${currentCategory} Collection` : 'Our Collection'}
          </h1>
          <p className="text-slate-600 mt-1">Discover {products.length} exclusive items tailored for you.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center space-x-2 px-4 py-2 border rounded-xl text-sm font-bold transition-all ${showFilters ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'}`}
          >
            <Filter className="h-4 w-4" />
            <span>Filters</span>
          </button>
          
          <div className="relative">
            <select 
              value={currentOrdering}
              onChange={handleSort}
              className="appearance-none bg-white border border-slate-200 rounded-xl px-4 py-2 pr-10 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none cursor-pointer hover:bg-slate-50 transition-all"
            >
              <option value="-created_at">Newest First</option>
              <option value="price">Price: Low to High</option>
              <option value="-price">Price: High to Low</option>
              <option value="created_at">Oldest First</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Filter Sidebar (Collapsible) */}
      {showFilters && (
        <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 flex flex-wrap gap-8 animate-in slide-in-from-top-4 duration-300">
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Price Range</h4>
            <div className="flex items-center gap-3">
              <input 
                type="number" 
                placeholder="Min" 
                defaultValue={currentMinPrice}
                onBlur={(e) => updateFilters({ min_price: e.target.value })}
                className="w-24 px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500"
              />
              <span className="text-slate-400">to</span>
              <input 
                type="number" 
                placeholder="Max" 
                defaultValue={currentMaxPrice}
                onBlur={(e) => updateFilters({ max_price: e.target.value })}
                className="w-24 px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
          
          <div className="flex items-end">
            <button 
              onClick={clearFilters}
              className="text-sm font-bold text-red-600 hover:text-red-700 underline underline-offset-4"
            >
              Reset All Filters
            </button>
          </div>
        </div>
      )}

      {/* Product Grid */}
      {products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
          <PackageSearch className="h-16 w-16 text-slate-300 mb-4" />
          <h3 className="text-xl font-bold text-slate-900">No products found</h3>
          <p className="text-slate-500">We couldn't find any items matching your selection.</p>
          <button 
            onClick={clearFilters}
            className="mt-6 text-primary-600 font-bold hover:underline"
          >
            Clear all filters
          </button>
        </div>
      )}
    </div>
  );
};

export default ProductList;
