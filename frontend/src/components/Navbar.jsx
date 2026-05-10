import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import productService from '../api/productService';
import useDebounce from '../hooks/useDebounce';
import { ShoppingCart, Heart, Search, User as UserIcon, Menu, Plus, LogOut, ChevronDown, X, HelpCircle } from 'lucide-react';


const Navbar = () => {
  const { token, user, logout } = useAuth();
  const { cart } = useCart();
  const { wishlistCount } = useWishlist();
  const navigate = useNavigate();
  const location = useLocation();
  const [categories, setCategories] = useState([]);
  const [showCategories, setShowCategories] = useState(false);
  const [searchTerm, setSearchTerm] = useState(new URLSearchParams(location.search).get('search') || '');
  const [isScrolled, setIsScrolled] = useState(false);
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // Handle scroll for sticky effect
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Sync searchTerm with URL when navigating
  useEffect(() => {
    const searchParam = new URLSearchParams(location.search).get('search') || '';
    if (searchParam !== searchTerm) {
      setSearchTerm(searchParam);
    }
  }, [location.search]);

  useEffect(() => {
    if (debouncedSearchTerm === '' && !new URLSearchParams(location.search).get('search')) return;
    
    // Only auto-navigate if we are on the products page or if we are on home/other and starting to search
    // BUT do NOT navigate if we are on a product detail page (/products/:slug)
    const isProductDetailPage = location.pathname.startsWith('/products/') && location.pathname !== '/products';
    
    if (isProductDetailPage) return;

    const params = new URLSearchParams(location.search);
    if (debouncedSearchTerm) {
      params.set('search', debouncedSearchTerm);
    } else {
      params.delete('search');
    }
    
    const currentSearch = new URLSearchParams(location.search).get('search') || '';
    if (debouncedSearchTerm !== currentSearch) {
      // If we are not on the products page, we want to go there
      // If we are on the products page, we just update the query params
      navigate(`/products?${params.toString()}`);
    }
  }, [debouncedSearchTerm, navigate, location.pathname]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm) {
      const params = new URLSearchParams(location.search);
      params.set('search', searchTerm);
      navigate(`/products?${params.toString()}`);
    }
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await productService.getCategories();
        setCategories(data);
      } catch (err) {
        console.error('Failed to fetch categories:', err);
      }
    };
    fetchCategories();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className={`sticky top-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white shadow-md py-3' : 'bg-[#f8f9f6] py-5'}`}>
      <div className="w-full max-w-[1600px] mx-auto px-6 md:px-12 lg:px-20">
        <div className="flex justify-between items-center gap-8">
          {/* Left: Logo & Main Nav */}
          <div className="flex items-center space-x-12">
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="bg-slate-900 p-2 rounded-xl transition-all group-hover:bg-primary-600 shadow-lg shadow-slate-900/10">
                <svg className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/>
                </svg>
              </div>
              <span className="text-2xl font-black text-slate-900 tracking-tighter uppercase font-heading">ShopStack</span>
            </Link>

            <div className="hidden lg:flex items-center space-x-8">
              <Link to="/" className={`text-xs font-bold uppercase tracking-widest hover:text-primary-600 transition-colors ${location.pathname === '/' ? 'text-primary-600' : 'text-slate-500'}`}>Home</Link>
              <Link to="/products" className={`text-xs font-bold uppercase tracking-widest hover:text-primary-600 transition-colors ${location.pathname === '/products' ? 'text-primary-600' : 'text-slate-500'}`}>Shop</Link>
              
              <div 
                className="relative group h-full flex items-center"
                onMouseEnter={() => setShowCategories(true)}
                onMouseLeave={() => setShowCategories(false)}
              >
                <button className="flex items-center space-x-1.5 text-xs font-bold uppercase tracking-widest text-slate-500 hover:text-primary-600 transition-colors">
                  <span>Collections</span>
                  <ChevronDown className={`h-3 w-3 transition-transform duration-300 ${showCategories ? 'rotate-180' : ''}`} />
                </button>

                {showCategories && (
                  <div className="absolute top-[100%] left-0 pt-2 z-50">
                    <div className="min-w-[220px] bg-white border border-slate-100 rounded-2xl shadow-2xl py-4 animate-in fade-in slide-in-from-top-2 duration-200">
                      <div className="px-6 pb-3 mb-2 border-b border-slate-50">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Our Collections</p>
                      </div>
                      <div className="space-y-1">
                        {categories.length > 0 ? (
                          categories.map(cat => (
                            <Link 
                              key={cat.id} 
                              to={`/products?category=${cat.name}`}
                              onClick={() => setShowCategories(false)}
                              className="flex items-center px-6 py-2.5 text-sm font-bold text-slate-600 hover:text-primary-600 hover:bg-slate-50 transition-all duration-300 group/item"
                            >
                              <div className="h-1.5 w-1.5 rounded-full bg-slate-200 mr-3 group-hover/item:bg-primary-600 group-hover/item:scale-125 transition-all"></div>
                              <span>{cat.name}</span>
                            </Link>
                          ))
                        ) : (
                          <p className="px-6 py-2 text-xs text-slate-400 italic">No categories found</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Center: Search Bar */}
          <div className="flex-grow max-w-xl hidden md:block">
            <form onSubmit={handleSearchSubmit} className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search products, vendors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-full py-2.5 pl-12 pr-12 text-sm focus:outline-none focus:ring-1 focus:ring-slate-300 transition-all shadow-sm"
              />
            </form>
          </div>

          {/* Right: Action Icons */}
          <div className="flex items-center space-x-6 lg:space-x-8 flex-shrink-0">
            <button className="md:hidden text-slate-800 hover:text-primary-600 transition-colors">
              <Search className="h-6 w-6 stroke-[1.5px]" />
            </button>
            
            <Link to="/wishlist" className="text-slate-800 hover:text-primary-600 transition-colors relative">
              <Heart className="h-6 w-6 stroke-[1.5px]" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full ring-2 ring-white">
                  {wishlistCount}
                </span>
              )}
            </Link>

            <Link to="/cart" className="text-slate-800 hover:text-primary-600 transition-colors relative">
              <ShoppingCart className="h-6 w-6 stroke-[1.5px]" />
              {cart?.items?.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-slate-900 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full ring-2 ring-white">
                  {cart.items.length}
                </span>
              )}
            </Link>

            <div className="flex items-center space-x-4">
              {token ? (
                <div className="flex items-center space-x-4">
                  <Link to={user?.role === 'vendor' ? '/vendor/dashboard' : '/dashboard'} className="group">
                    <div className="h-9 w-9 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200 group-hover:border-primary-500 transition-all overflow-hidden">
                      <UserIcon className="h-5 w-5 text-slate-600 group-hover:text-primary-600" />
                    </div>
                  </Link>
                  <button onClick={handleLogout} className="text-slate-400 hover:text-red-500 transition-colors">
                    <LogOut className="h-5 w-5" />
                  </button>
                </div>
              ) : (
                <Link to="/login" className="text-slate-800 hover:text-primary-600 transition-colors">
                  <UserIcon className="h-6 w-6 stroke-[1.5px]" />
                </Link>
              )}
            </div>

            <button className="lg:hidden p-2 text-slate-900">
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
