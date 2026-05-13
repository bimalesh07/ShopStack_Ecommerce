import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
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
  const currentSearch = queryParams.get('search') || '';


  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params = {
          category: currentCategory,
          ordering: currentOrdering,
          min_price: currentMinPrice,
          max_price: currentMaxPrice,
          search: currentSearch
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
    <div className="container-tight pb-20">
      {/* Header & Controls */}
      <div className="relative mb-4 pt-1 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
          <div className="space-y-4 max-w-2xl">
            <nav className="flex items-center space-x-2 text-[9px] font-black uppercase tracking-[0.3em] text-slate-400">
              <Link to="/" className="hover:text-primary-600 transition-colors">Home</Link>
              <span className="opacity-30">/</span>
              <span className="text-slate-900 dark:text-white">The Shop</span>
            </nav>
            
            <h1 className="text-4xl md:text-6xl font-medium text-slate-900 dark:text-white tracking-tight font-serif leading-none">
              {currentCategory ? currentCategory : 'The Collection'}
            </h1>
            
            <div className="flex items-center space-x-4">
              <div className="h-px w-8 bg-slate-200 dark:bg-slate-800 hidden sm:block"></div>
              {currentSearch ? (
                <p className="text-slate-400 dark:text-slate-500 text-sm font-medium italic">
                  Curated results for <span className="text-slate-900 dark:text-white font-bold not-italic">"{currentSearch}"</span>
                </p>
              ) : (
                <p className="text-slate-400 dark:text-slate-500 text-sm font-medium italic">
                  Explore {products.length} hand-picked treasures curated for your lifestyle.
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto mt-4 lg:mt-0">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`w-full sm:w-auto group flex items-center justify-center space-x-3 px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border ${showFilters ? 'bg-slate-900 text-white border-slate-900 dark:bg-white dark:text-slate-900' : 'bg-white text-slate-900 border-slate-200 hover:border-slate-900 dark:bg-slate-800 dark:text-white dark:border-slate-700 dark:hover:border-white'}`}
            >
              <Filter className={`h-4 w-4 transition-transform duration-500 ${showFilters ? 'rotate-90' : ''}`} />
              <span>{showFilters ? 'Hide Filters' : 'Filters'}</span>
            </button>

            <div className="relative group w-full sm:w-auto">
              <select
                value={currentOrdering}
                onChange={handleSort}
                className="w-full appearance-none bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full px-8 py-3 pr-12 text-[10px] font-black uppercase tracking-widest text-slate-900 dark:text-white focus:ring-0 focus:border-slate-900 dark:focus:border-white outline-none cursor-pointer hover:border-slate-900 dark:hover:border-white transition-all shadow-sm"
              >
                <option value="-created_at">Newest First</option>
                <option value="price">Price: Low to High</option>
                <option value="-price">Price: High to Low</option>
                <option value="created_at">Oldest First</option>
              </select>
              <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none transition-transform group-hover:translate-y-[-40%]" />
            </div>
          </div>
        </div>
      </div>

      {/* Filter Sidebar (Collapsible) */}
      {showFilters && (
        <div className="bg-slate-50/50 dark:bg-white/5 p-5 md:p-8 rounded-[2rem] md:rounded-[2.5rem] border border-slate-100 dark:border-slate-800 flex flex-col md:flex-row flex-wrap gap-6 md:gap-12 animate-in slide-in-from-top-4 duration-500 mb-12">
          <div className="space-y-4">
            <h4 className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-[0.2em]">Price Range</h4>
            <div className="flex items-center gap-3 md:gap-4">
              <div className="relative flex-1 sm:flex-none">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400">₹</span>
                <input
                  type="number"
                  placeholder="Min"
                  defaultValue={currentMinPrice}
                  onBlur={(e) => updateFilters({ min_price: e.target.value })}
                  className="w-32 pl-8 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl text-[11px] font-bold outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white transition-all"
                />
              </div>
              <span className="h-px w-4 bg-slate-200 dark:bg-slate-800"></span>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400">₹</span>
                <input
                  type="number"
                  placeholder="Max"
                  defaultValue={currentMaxPrice}
                  onBlur={(e) => updateFilters({ max_price: e.target.value })}
                  className="w-32 pl-8 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl text-[11px] font-bold outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white transition-all"
                />
              </div>
            </div>
          </div>

          <div className="flex items-end pb-1">
            <button
              onClick={clearFilters}
              className="text-[10px] font-black text-rose-500 hover:text-rose-600 uppercase tracking-widest border-b-2 border-rose-500/20 hover:border-rose-500 transition-all pb-1"
            >
              Reset All Filters
            </button>
          </div>
        </div>
      )}

      {/* Product Grid */}
      {products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
