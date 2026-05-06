import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import productService from '../api/productService';
import { ShoppingCart, Heart, Search, User as UserIcon, Menu, Plus, LogOut, ChevronDown } from 'lucide-react';

const Navbar = () => {
  const { token, user, logout } = useAuth();
  const { cart } = useCart();
  const { wishlistCount } = useWishlist();
  const navigate = useNavigate();
  const location = useLocation();
  const [categories, setCategories] = useState([]);
  const [showCategories, setShowCategories] = useState(false);

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
    <nav className="sticky top-0 z-50 bg-white/70 backdrop-blur-lg border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <div className="bg-primary-600 p-2 rounded-lg">
                <svg className="h-6 w-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/>
                </svg>
              </div>
              <span className="text-2xl font-bold text-slate-900 tracking-tight">ShopStack</span>
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className={`font-medium transition-colors ${location.pathname === '/' ? 'text-primary-600' : 'text-slate-600 hover:text-primary-600'}`}>Home</Link>
            <Link to="/products" className={`font-medium transition-colors ${location.pathname === '/products' ? 'text-primary-600' : 'text-slate-600 hover:text-primary-600'}`}>Products</Link>
            
            {/* Categories Dropdown */}
            <div 
              className="relative group h-full flex items-center"
              onMouseEnter={() => setShowCategories(true)}
              onMouseLeave={() => setShowCategories(false)}
            >
              <button className="flex items-center space-x-1 text-slate-600 hover:text-primary-600 font-medium transition-colors py-4">
                <span>Categories</span>
                <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${showCategories ? 'rotate-180' : ''}`} />
              </button>

              {showCategories && (
                <div className="absolute top-full left-0 w-56 bg-white border border-slate-100 rounded-2xl shadow-xl py-4 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                  {categories.length > 0 ? (
                    categories.map(cat => (
                      <Link 
                        key={cat.id} 
                        to={`/products?category=${cat.name}`}
                        onClick={() => setShowCategories(false)}
                        className="block px-6 py-2 text-sm font-medium text-slate-600 hover:text-primary-600 hover:bg-slate-50 transition-all"
                      >
                        {cat.name}
                      </Link>
                    ))
                  ) : (
                    <div className="px-6 py-2 text-sm text-slate-400 italic">No categories found</div>
                  )}
                </div>
              )}
            </div>

            {user?.role === 'vendor' && (
              <Link to="/vendor/dashboard" className={`font-medium transition-colors ${location.pathname.startsWith('/vendor') ? 'text-primary-600' : 'text-slate-600 hover:text-primary-600'}`}>My Shop</Link>
            )}
          </div>

          <div className="flex items-center space-x-4">
            <button className="p-2 text-slate-600 hover:text-primary-600 transition-colors">
              <Search className="h-5 w-5" />
            </button>
            {user?.role !== 'vendor' && (
              <>
                <Link to="/wishlist" className="p-2 text-slate-600 hover:text-primary-600 transition-colors relative">
                  <Heart className="h-5 w-5" />
                  {wishlistCount > 0 && (
                    <span className="absolute top-0 right-0 bg-primary-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                      {wishlistCount}
                    </span>
                  )}
                </Link>
                <Link to="/cart" className="p-2 text-slate-600 hover:text-primary-600 transition-colors relative">
                  <ShoppingCart className="h-5 w-5" />
                  {cart?.items?.length > 0 && (
                    <span className="absolute top-0 right-0 bg-primary-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                      {cart.items.length}
                    </span>
                  )}
                </Link>
              </>
            )}
            {token ? (
              <div className="flex items-center space-x-2">
                {user?.role === 'vendor' && (
                  <Link to="/vendor/dashboard" className="text-sm font-bold text-slate-700 hover:text-primary-600 hidden lg:block">
                    Vendor Dashboard
                  </Link>
                )}
                <Link to={user?.role === 'vendor' ? '/vendor/dashboard' : '/dashboard'} className="p-2 text-slate-600 hover:text-primary-600 transition-colors">
                  <UserIcon className="h-5 w-5" />
                </Link>
                <button 
                  onClick={handleLogout}
                  className="p-2 text-slate-600 hover:text-red-600 transition-colors"
                  title="Logout"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <Link to="/login" className="btn-primary text-sm px-4 py-1.5">
                Login
              </Link>
            )}
            <button className="md:hidden p-2 text-slate-600">
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
