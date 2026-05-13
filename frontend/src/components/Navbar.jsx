import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useTheme } from '../context/ThemeContext';
import productService from '../api/productService';
import useDebounce from '../hooks/useDebounce';
import { ShoppingCart, Heart, Search, User as UserIcon, Menu, Plus, LogOut, ChevronDown, ChevronRight, X, HelpCircle, ShoppingBag, Sun, Moon, LayoutDashboard, ArrowRight } from 'lucide-react';


const getInitials = (name) => {
  if (!name) return 'U';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].substring(0, 1).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase().substring(0, 2);
};

const getAvatarColor = (name) => {
  if (!name) return 'bg-slate-900';
  const colors = [
    'bg-slate-900', 'bg-sky-600', 'bg-indigo-600',
    'bg-emerald-600', 'bg-rose-600', 'bg-amber-600',
    'bg-violet-600', 'bg-fuchsia-600'
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

const Navbar = () => {
  const { token, user, logout } = useAuth();
  const { cart } = useCart();
  const { wishlistCount } = useWishlist();
  const { isDarkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [categories, setCategories] = useState([]);
  const [showCategories, setShowCategories] = useState(false);
  const [searchTerm, setSearchTerm] = useState(new URLSearchParams(location.search).get('search') || '');
  const [isScrolled, setIsScrolled] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const desktopDropdownRef = React.useRef(null);
  const mobileDropdownRef = React.useRef(null);
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // Outside click to close profile dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      const isOutsideDesktop = desktopDropdownRef.current && !desktopDropdownRef.current.contains(event.target);
      const isOutsideMobile = mobileDropdownRef.current && !mobileDropdownRef.current.contains(event.target);
      
      if (isOutsideDesktop && isOutsideMobile) {
        setShowProfileDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Sticky header on scroll
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Sync search with URL
  useEffect(() => {
    const searchParam = new URLSearchParams(location.search).get('search') || '';
    if (searchParam !== searchTerm) {
      setSearchTerm(searchParam);
    }
  }, [location.search]);

  // Auto-navigate on search
  useEffect(() => {
    if (debouncedSearchTerm && isTyping) {
      const params = new URLSearchParams(location.search);
      params.set('search', debouncedSearchTerm);
      navigate(`/products?${params.toString()}`);
      setIsTyping(false);
      setSearchTerm(''); // Clear search box after search
      setIsMobileSearchOpen(false); // Close mobile search after navigation
      setIsMobileMenuOpen(false);
    }
  }, [debouncedSearchTerm, navigate, isTyping]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm) {
      const params = new URLSearchParams(location.search);
      params.set('search', searchTerm);
      navigate(`/products?${params.toString()}`);
    } else {
      navigate('/products');
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
    setShowProfileDropdown(false);
    navigate('/login');
  };

  return (
    <>
      <nav className={`sticky top-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white/90 dark:bg-slate-900/90 backdrop-blur-md shadow-md py-2' : 'bg-[#f8f9f6] dark:bg-slate-950 py-3.5'}`}>
      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 md:px-12 lg:px-20 overflow-visible">
        <div className="flex justify-between items-center gap-2 lg:gap-8">
          {/* Brand */}
          <div className="flex items-center space-x-3 lg:space-x-12">
            <Link to="/" className="flex items-center space-x-2 md:space-x-3 group">
              <div className="bg-slate-900 p-1.5 rounded-xl group-hover:bg-primary-600 shadow-lg transition-all">
                <svg className="h-4 w-4 md:h-5 md:w-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" /><path d="M3 6h18" /><path d="M16 10a4 4 0 0 1-8 0" />
                </svg>
              </div>
              <span className="text-lg md:text-2xl font-black text-slate-900 dark:text-white tracking-tighter uppercase font-heading flex items-baseline">
                Shop<span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-indigo-600 dark:from-primary-400 dark:to-indigo-400">Stack</span>
              </span>
            </Link>

            <div className="hidden lg:flex items-center space-x-10">
              <Link to="/" className={`text-[10px] font-black uppercase tracking-[0.2em] transition-all hover:translate-y-[-1px] ${location.pathname === '/' ? 'text-primary-600' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}>Home</Link>

              {user?.role !== 'vendor' && (
                <>
                  <Link to="/products" className={`text-[10px] font-black uppercase tracking-[0.2em] transition-all hover:translate-y-[-1px] ${location.pathname === '/products' ? 'text-primary-600' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}>Shop</Link>

                  <div
                    className="relative group h-full flex items-center"
                    onMouseEnter={() => setShowCategories(true)}
                    onMouseLeave={() => setShowCategories(false)}
                  >
                    <button className="flex items-center space-x-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all">
                      <span>Collections</span>
                      <ChevronDown className={`h-3 w-3 transition-transform duration-500 ${showCategories ? 'rotate-180' : ''}`} />
                    </button>

                    {showCategories && (
                      <div className="absolute top-[100%] left-0 pt-4 z-50 animate-in fade-in slide-in-from-top-2 duration-500">
                        <div className="min-w-[280px] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[1.75rem] shadow-[0_30px_60px_rgba(0,0,0,0.12)] overflow-hidden">
                          <div className="px-7 py-4 bg-slate-50/50 dark:bg-white/5 border-b border-slate-100 dark:border-slate-800">
                            <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em]">Curation Selection</p>
                          </div>
                          <div className="p-3">
                            {categories.length > 0 ? (
                              categories.map(cat => (
                                <Link
                                  key={cat.id}
                                  to={`/products?category=${cat.name}`}
                                  onClick={() => setShowCategories(false)}
                                  className="flex items-center group/item px-4 py-3 rounded-[1.25rem] transition-all hover:bg-slate-50 dark:hover:bg-white/5"
                                >
                                  <div className="h-1.5 w-1.5 rounded-full bg-slate-200 dark:bg-slate-700 mr-4 group-hover/item:bg-primary-600 group-hover/item:scale-125 transition-all shadow-sm"></div>
                                  <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] group-hover/item:text-slate-900 dark:group-hover/item:text-white transition-all">
                                    {cat.name}
                                  </span>
                                  <div className="ml-auto opacity-0 group-hover/item:opacity-100 transition-all -translate-x-2 group-hover/item:translate-x-0">
                                    <ChevronRight className="h-3 w-3 text-slate-300 dark:text-slate-600" />
                                  </div>
                                </Link>
                              ))
                            ) : (
                              <p className="px-8 py-4 text-[10px] text-slate-400 font-bold uppercase tracking-widest">No categories found</p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Center: Search Bar */}
          <div className="flex-grow max-w-2xl hidden lg:block">
            <form onSubmit={handleSearchSubmit} className="relative group">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-primary-600 transition-colors" />
              <input
                type="text"
                placeholder="Search curated products..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setIsTyping(true);
                }}
                className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full py-2.5 pl-14 pr-12 text-sm font-medium dark:text-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:border-2 transition-all duration-300 shadow-sm hover:border-slate-300 dark:hover:border-slate-600 placeholder:text-slate-400 dark:placeholder:text-slate-500"
              />
            </form>
          </div>

          <div className="flex items-center space-x-2 md:space-x-6 lg:space-x-8 flex-shrink-0">

            {/* Theme Toggle - Visible for all users */}
            <div className="hidden md:flex items-center space-x-6">
              <button 
                onClick={toggleTheme}
                className="flex items-center space-x-2 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-primary-50 dark:hover:bg-primary-900/30 hover:text-primary-600 transition-all duration-300"
                title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              >
                {isDarkMode ? (
                  <>
                    <Sun className="h-4 w-4" />
                    <span className="hidden md:block text-[9px] font-black uppercase tracking-widest">Light</span>
                  </>
                ) : (
                  <>
                    <Moon className="h-4 w-4" />
                    <span className="hidden md:block text-[9px] font-black uppercase tracking-widest">Dark</span>
                  </>
                )}
              </button>
            </div>

            <div className="flex items-center space-x-2 md:space-x-6">
              {/* Wishlist - Hidden on mobile, moved to menu */}
              <Link to="/wishlist" className="hidden md:block text-slate-800 dark:text-slate-200 hover:text-rose-500 transition-all relative group p-2 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-900/20" title="Your Wishlist">
                <Heart className="h-5 w-5 md:h-6 md:w-6 stroke-[1.5px] group-hover:fill-rose-500 transition-all group-hover:scale-110" />
                {wishlistCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-rose-600 text-white text-[9px] font-black min-w-[18px] h-[18px] flex items-center justify-center rounded-full ring-2 ring-white dark:ring-slate-900 animate-in zoom-in duration-300">
                    {wishlistCount}
                  </span>
                )}
              </Link>

              {/* Cart - Hidden on mobile header, moved to burger menu */}
              <Link to="/cart" className="hidden md:block text-slate-800 dark:text-slate-200 hover:text-orange-500 transition-all relative group p-2 rounded-xl hover:bg-orange-50 dark:hover:bg-orange-900/20" title="View Cart">
                <ShoppingCart className="h-5 w-5 md:h-6 md:w-6 stroke-[1.5px] group-hover:fill-orange-500 transition-all group-hover:scale-110" />
                {cart?.items?.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-orange-600 text-white text-[9px] font-black min-w-[18px] h-[18px] flex items-center justify-center rounded-full ring-2 ring-white dark:ring-slate-900 animate-in zoom-in duration-300">
                    {cart.items.length}
                  </span>
                )}
              </Link>
            </div>

            <div className="relative flex items-center space-x-4">
              {token && user?.role === 'vendor' && (
                <Link
                  to="/profile?tab=inventory"
                  className="hidden md:flex items-center space-x-2 px-5 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-full text-[11px] font-black uppercase tracking-widest hover:bg-primary-600 dark:hover:bg-primary-50 transition-all shadow-xl shadow-slate-900/10 active:scale-95 group"
                >
                  <Plus className="h-4 w-4 group-hover:rotate-90 transition-transform duration-300" />
                  <span>Add Product</span>
                </Link>
              )}

              {token ? (
                <div
                  className="relative hidden lg:block"
                  ref={desktopDropdownRef}
                >
                  <button 
                    onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                    className="flex items-center space-x-3 group p-1 pr-0 md:pr-3 rounded-full hover:bg-slate-50 dark:hover:bg-slate-800 transition-all border border-transparent hover:border-slate-100 dark:hover:border-slate-700 relative"
                  >
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center border-2 border-white dark:border-slate-800 group-hover:border-primary-400 transition-all overflow-hidden shadow-md relative ${getAvatarColor(user?.name)}`}>
                      <span className="text-xs font-black text-white uppercase">
                        {getInitials(user?.name)}
                      </span>
                      {user?.role === 'vendor' && (
                        <div className="absolute inset-0 bg-primary-600/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                           <LayoutDashboard className="h-4 w-4 text-white" />
                        </div>
                      )}
                    </div>
                    {user?.role === 'vendor' && (
                      <div className="absolute -top-1 -left-1 h-4 w-4 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-900 shadow-sm" title="Verified Merchant"></div>
                    )}
                    <ChevronDown className={`h-3 w-3 text-slate-400 transition-transform duration-300 ${showProfileDropdown ? 'rotate-180' : ''}`} />
                  </button>

                  {showProfileDropdown && (
                    <div className="absolute top-[100%] right-0 pt-4 z-50 animate-in fade-in slide-in-from-top-2 duration-300">
                      <div className="min-w-[260px] bg-white/80 dark:bg-slate-900/90 backdrop-blur-xl border border-white/20 dark:border-slate-800 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] overflow-hidden">
                        <div className="px-8 py-6 bg-slate-900/5 dark:bg-white/5 border-b border-slate-100 dark:border-slate-800">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Signed in as</p>
                          <p className="text-sm font-black text-slate-900 dark:text-white truncate tracking-tight">{user?.name}</p>
                        </div>
                        <div className="p-2">
                          {user?.role === 'vendor' && (
                            <Link
                              to="/profile?tab=inventory"
                              onClick={() => setShowProfileDropdown(false)}
                              className="flex items-center space-x-3 px-6 py-3.5 rounded-2xl text-[11px] font-bold text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all uppercase tracking-widest group"
                            >
                              <div className="p-2 rounded-xl bg-primary-100 dark:bg-primary-900/40 group-hover:bg-primary-200 dark:group-hover:bg-primary-800 transition-colors">
                                <LayoutDashboard className="h-4 w-4" />
                              </div>
                              <span>Vendor Dashboard</span>
                            </Link>
                          )}
                          <Link
                            to="/profile?tab=overview"
                            onClick={() => setShowProfileDropdown(false)}
                            className="flex items-center space-x-3 px-6 py-3.5 rounded-2xl text-[11px] font-bold text-slate-600 dark:text-slate-400 hover:text-primary-600 hover:bg-white dark:hover:bg-slate-800 transition-all uppercase tracking-widest group"
                          >
                            <div className="p-2 rounded-xl bg-slate-50 dark:bg-white/5 group-hover:bg-primary-50 dark:group-hover:bg-primary-900/30 transition-colors">
                              <UserIcon className="h-4 w-4" />
                            </div>
                            <span>My Profile</span>
                          </Link>

                          {user?.role !== 'vendor' && (
                            <>
                              <Link
                                to="/profile?tab=orders"
                                onClick={() => setShowProfileDropdown(false)}
                                className="flex items-center space-x-3 px-6 py-3.5 rounded-2xl text-[11px] font-bold text-slate-600 dark:text-slate-400 hover:text-primary-600 hover:bg-white dark:hover:bg-slate-800 transition-all uppercase tracking-widest group"
                              >
                                <div className="p-2 rounded-xl bg-slate-50 dark:bg-white/5 group-hover:bg-primary-50 dark:group-hover:bg-primary-900/30 transition-colors">
                                  <ShoppingBag className="h-4 w-4" />
                                </div>
                                <span>My Orders</span>
                              </Link>
                              <Link
                                to="/wishlist"
                                onClick={() => setShowProfileDropdown(false)}
                                className="flex items-center space-x-3 px-6 py-3.5 rounded-2xl text-[11px] font-bold text-slate-600 dark:text-slate-400 hover:text-rose-600 hover:bg-white dark:hover:bg-slate-800 transition-all uppercase tracking-widest group"
                              >
                                <div className="p-2 rounded-xl bg-slate-50 dark:bg-white/5 group-hover:bg-rose-50 dark:group-hover:bg-rose-900/30 transition-colors">
                                  <Heart className="h-4 w-4" />
                                </div>
                                <span>Wishlist</span>
                              </Link>
                            </>
                          )}

                          <div className="my-2 border-t border-slate-100/50 mx-4"></div>

                          <button
                            onClick={handleLogout}
                            className="w-full flex items-center space-x-3 px-6 py-3.5 rounded-2xl text-[11px] font-bold text-rose-500 hover:bg-rose-50 transition-all uppercase tracking-widest group"
                          >
                            <div className="p-2 rounded-xl bg-rose-50/50 group-hover:bg-rose-100 transition-colors">
                              <LogOut className="h-4 w-4" />
                            </div>
                            <span>Logout</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Link 
                  to="/login" 
                  className="group flex items-center space-x-2 md:space-x-3 px-3 md:px-8 py-2 md:py-3.5 bg-gradient-to-r from-slate-950 to-slate-800 text-white rounded-full text-[10px] font-black uppercase tracking-[0.2em] hover:from-primary-600 hover:to-indigo-600 transition-all duration-500 shadow-[0_10px_20px_rgba(0,0,0,0.2)] hover:shadow-[0_20px_35px_rgba(37,99,235,0.25)] hover:-translate-y-1 hover:scale-105 active:scale-95 border border-white/5"
                >
                  <UserIcon className="h-4 w-4 group-hover:scale-110 transition-transform duration-500" />
                  <span className="hidden md:block">Login</span>
                </Link>
              )}
            </div>

            {/* Mobile Header Icons */}
            <div className="flex lg:hidden items-center space-x-2">
              {token && (
                <div className="relative" ref={mobileDropdownRef}>
                  <button 
                    onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                    className={`h-10 w-10 rounded-full flex items-center justify-center border-2 border-white dark:border-slate-800 shadow-md relative ${getAvatarColor(user?.name)}`}
                  >
                    <span className="text-xs font-black text-white uppercase">{getInitials(user?.name)}</span>
                  </button>

                  {showProfileDropdown && (
                    <div className="absolute top-[100%] right-[-60px] pt-4 z-[110] animate-in fade-in slide-in-from-top-2 duration-500">
                      <div className="min-w-[280px] bg-white/90 dark:bg-slate-900/95 backdrop-blur-xl border border-white/20 dark:border-slate-800 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.2)] overflow-hidden">
                        <div className="px-8 py-6 bg-slate-900/5 dark:bg-white/5 border-b border-slate-100 dark:border-slate-800">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Signed in as</p>
                          <p className="text-sm font-black text-slate-900 dark:text-white truncate tracking-tight">{user?.name}</p>
                        </div>
                        <div className="p-2">
                          {user?.role === 'vendor' && (
                            <Link
                              to="/profile?tab=inventory"
                              onClick={() => setShowProfileDropdown(false)}
                              className="flex items-center space-x-3 px-6 py-3.5 rounded-2xl text-[11px] font-bold text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all uppercase tracking-widest group"
                            >
                              <div className="p-2 rounded-xl bg-primary-100 dark:bg-primary-900/40 group-hover:bg-primary-200 dark:group-hover:bg-primary-800 transition-colors">
                                <LayoutDashboard className="h-4 w-4" />
                              </div>
                              <span>Vendor Dashboard</span>
                            </Link>
                          )}
                          <Link
                            to="/profile?tab=overview"
                            onClick={() => setShowProfileDropdown(false)}
                            className="flex items-center space-x-3 px-6 py-3.5 rounded-2xl text-[11px] font-bold text-slate-600 dark:text-slate-400 hover:text-primary-600 hover:bg-white dark:hover:bg-slate-800 transition-all uppercase tracking-widest group"
                          >
                            <div className="p-2 rounded-xl bg-slate-50 dark:bg-white/5 group-hover:bg-primary-50 dark:group-hover:bg-primary-900/30 transition-colors">
                              <UserIcon className="h-4 w-4" />
                            </div>
                            <span>My Profile</span>
                          </Link>

                          {user?.role !== 'vendor' && (
                            <>
                              <Link
                                to="/profile?tab=orders"
                                onClick={() => setShowProfileDropdown(false)}
                                className="flex items-center space-x-3 px-6 py-3.5 rounded-2xl text-[11px] font-bold text-slate-600 dark:text-slate-400 hover:text-primary-600 hover:bg-white dark:hover:bg-slate-800 transition-all uppercase tracking-widest group"
                              >
                                <div className="p-2 rounded-xl bg-slate-50 dark:bg-white/5 group-hover:bg-primary-50 dark:group-hover:bg-primary-900/30 transition-colors">
                                  <ShoppingBag className="h-4 w-4" />
                                </div>
                                <span>My Orders</span>
                              </Link>
                              <Link
                                to="/wishlist"
                                onClick={() => setShowProfileDropdown(false)}
                                className="flex items-center space-x-3 px-6 py-3.5 rounded-2xl text-[11px] font-bold text-slate-600 dark:text-slate-400 hover:text-rose-600 hover:bg-white dark:hover:bg-slate-800 transition-all uppercase tracking-widest group"
                              >
                                <div className="p-2 rounded-xl bg-slate-50 dark:bg-white/5 group-hover:bg-rose-50 dark:group-hover:bg-rose-900/30 transition-colors">
                                  <Heart className="h-4 w-4" />
                                </div>
                                <span>Wishlist</span>
                              </Link>
                            </>
                          )}

                          <div className="my-2 border-t border-slate-100/50 mx-4"></div>

                          <button
                            onClick={() => { handleLogout(); setShowProfileDropdown(false); }}
                            className="w-full flex items-center space-x-3 px-6 py-3.5 rounded-2xl text-[11px] font-bold text-rose-500 hover:bg-rose-50 transition-all uppercase tracking-widest group"
                          >
                            <div className="p-2 rounded-xl bg-rose-50/50 group-hover:bg-rose-100 transition-colors">
                              <LogOut className="h-4 w-4" />
                            </div>
                            <span>Logout</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <button
                className="p-2 text-slate-900 dark:text-white transition-all active:scale-90"
                onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
              >
                <Search className="h-5 w-5" />
              </button>

              <button
                className="p-2 text-slate-900 dark:text-white transition-all active:scale-90"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Search Overlay */}
      {isMobileSearchOpen && (
        <div className="lg:hidden absolute top-full left-0 w-full bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 px-6 py-4 animate-in slide-in-from-top duration-300 shadow-xl z-[60]">
          <form onSubmit={handleSearchSubmit} className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              autoFocus
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setIsTyping(true);
              }}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl py-3 pl-10 pr-10 text-sm font-medium dark:text-white focus:outline-none focus:border-slate-400 transition-all"
            />
            <button 
              type="button"
              onClick={() => setIsMobileSearchOpen(false)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
            >
              <X className="h-4 w-4" />
            </button>
          </form>
        </div>
      )}
    </nav>

    {/* Premium Mobile Menu */}
    {isMobileMenuOpen && (
      <div className="fixed inset-0 z-[100] lg:hidden">
        <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)}></div>
        <div className="absolute top-0 right-0 h-full w-[80%] max-w-[320px] bg-white dark:bg-slate-950 shadow-2xl flex flex-col animate-in slide-in-from-right duration-500 overflow-hidden">
          
          {/* Menu Header */}
          <div className="flex justify-between items-center p-6 border-b border-slate-50 dark:border-slate-900">
            <div className="flex items-center space-x-2">
              <div className="h-2 w-2 rounded-full bg-primary-500"></div>
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Navigation</span>
            </div>
            <button 
              onClick={() => setIsMobileMenuOpen(false)} 
              className="p-2 bg-slate-50 dark:bg-slate-900 rounded-full text-slate-400 transition-transform active:scale-90"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Menu Links */}
          <div className="flex-grow overflow-y-auto px-4 py-8 space-y-2">
            {[
              { name: 'Home', to: '/', icon: Plus },
              { name: 'Shop', to: '/products', icon: Plus },
              { name: 'Collections', to: '/products', icon: ArrowRight },
            ].map((item) => (
              <Link 
                key={item.name}
                to={item.to} 
                onClick={() => setIsMobileMenuOpen(false)} 
                className="flex items-center justify-between px-6 py-4 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-900 transition-all group"
              >
                <span className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest group-hover:translate-x-1 transition-transform">{item.name}</span>
                <item.icon className="h-4 w-4 text-slate-200 dark:text-slate-800 group-hover:text-primary-500 transition-colors" />
              </Link>
            ))}

            {(!user || user.role !== 'vendor') && (
              <div className="pt-4 mt-4 border-t border-slate-50 dark:border-slate-900 space-y-2">
                {[
                  { name: 'Wishlist', to: '/wishlist', icon: Heart },
                  { name: 'My Cart', to: '/cart', icon: ShoppingCart },
                ].map((item) => (
                  <Link 
                    key={item.name}
                    to={item.to} 
                    onClick={() => setIsMobileMenuOpen(false)} 
                    className="flex items-center justify-between px-6 py-4 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-900 transition-all group"
                  >
                    <span className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest group-hover:translate-x-1 transition-transform">{item.name}</span>
                    <item.icon className="h-4 w-4 text-slate-200 dark:text-slate-800 group-hover:text-rose-500 transition-colors" />
                  </Link>
                ))}
              </div>
            )}

            {/* Theme Toggle in Menu */}
            <button 
              onClick={() => { toggleTheme(); setIsMobileMenuOpen(false); }}
              className="w-full flex items-center justify-between px-6 py-4 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-900 transition-all group mt-4 border-t border-slate-50 dark:border-slate-900 pt-8"
            >
              <span className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
              {isDarkMode ? <Sun className="h-4 w-4 text-amber-500" /> : <Moon className="h-4 w-4 text-indigo-500" />}
            </button>
          </div>

          {/* Menu Footer */}
          <div className="p-8 bg-slate-50/50 dark:bg-slate-900/30 border-t border-slate-100 dark:border-slate-900">
            {token ? (
              <div className="space-y-6">
                <div className="flex items-center space-x-3">
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center text-[10px] font-black text-white ${getAvatarColor(user?.name)}`}>
                    {getInitials(user?.name)}
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Account</p>
                    <p className="text-xs font-black text-slate-900 dark:text-white uppercase truncate max-w-[150px]">{user?.name}</p>
                  </div>
                </div>
                <button 
                  onClick={handleLogout} 
                  className="w-full py-4 border border-rose-100 dark:border-rose-900/30 text-rose-500 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] hover:bg-rose-500 hover:text-white transition-all active:scale-95 shadow-sm"
                >
                  Logout Session
                </button>
              </div>
            ) : (
              <Link 
                to="/login" 
                onClick={() => setIsMobileMenuOpen(false)} 
                className="block w-full py-5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-center rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] shadow-xl shadow-slate-900/10 active:scale-95"
              >
                Member Login
              </Link>
            )}
            
            <div className="mt-8 flex justify-center">
               <span className="text-[8px] font-black text-slate-300 dark:text-slate-700 uppercase tracking-[0.5em]">ShopStack © 2024</span>
            </div>
          </div>
        </div>
      </div>
    )}
  </>
);
};

export default Navbar;
