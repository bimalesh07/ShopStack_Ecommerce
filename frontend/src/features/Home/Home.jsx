import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import productService from '../../api/productService';
import ProductCard from '../Products/ProductCard';
import { Loader2, ArrowRight, ShoppingBag, Sparkles, Smartphone, Shirt, Home as HomeIcon, Palette, Watch } from 'lucide-react';

import heroModern from '../../assets/hero_modern.png';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  useEffect(() => {
    const fetchRecentProducts = async () => {
      try {
        const data = await productService.getProducts({ limit: 8 });
        setProducts(data);
      } catch (err) {
        console.error('Error fetching products:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchRecentProducts();
  }, []);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail('');
    }
  };

  const categories = [
    { id: 1, name: 'Electronics', icon: '📱', color: 'bg-blue-50' },
    { id: 2, name: 'Fashion', icon: '👕', color: 'bg-orange-50' },
    { id: 3, name: 'Home & Decor', icon: '🏠', color: 'bg-emerald-50' },
    { id: 4, name: 'Art', icon: '🎨', color: 'bg-purple-50' },
    { id: 5, name: 'Accessories', icon: '⌚', color: 'bg-rose-50' },
  ];

  return (
    <div className="space-y-6 pb-20 overflow-hidden">
      {/* 1. Hero Section: The "Curated Stack" Look (60:40) */}
      <section className="bg-[#f8f9f6] py-8 lg:py-12">
        <div className="w-full max-w-[1600px] mx-auto px-6 md:px-12 lg:px-20 flex flex-col lg:flex-row items-center gap-20">
          {/* Left Side: Messaging (Horizontal/Wide) */}
          <div className="lg:w-[60%] space-y-8 animate-in fade-in slide-in-from-left-12 duration-1000">
            <div className="space-y-6">
              <h1 className="text-4xl md:text-6xl font-black text-slate-900 leading-[1.1] tracking-tighter uppercase font-heading max-w-5xl">
                Everyday Quality. <br className="hidden md:block" />
                Simplified for You.
              </h1>
              <p className="text-lg md:text-xl text-slate-600 font-medium max-w-xl leading-relaxed">
                Explore reliable products from trusted sellers you can count on. Authentic items, simple shopping, and honest value.
              </p>
            </div>
            
            <Link 
              to="/products" 
              className="inline-flex items-center px-10 py-4 bg-slate-900 text-white rounded-xl font-bold text-lg hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/20 active:scale-95 group"
            >
              <span>Discover More</span>
              <ArrowRight className="h-5 w-5 ml-3 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Right Side: Visuals (40%) */}
          <div className="lg:w-[40%] animate-in fade-in slide-in-from-right-12 duration-1000">
            <div className="relative group lg:max-w-xl ml-auto">
              {/* Soft Decorative Glow */}
              <div className="absolute -inset-10 bg-slate-200/30 rounded-full blur-[100px] opacity-50 group-hover:opacity-80 transition-opacity duration-1000" />
              
              <div className="relative rounded-[3rem] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.18)] border border-slate-100 overflow-hidden transition-all duration-700">
                <img 
                  src={heroModern} 
                  alt="Curated daily essentials" 
                  className="w-full h-auto object-cover transition-transform duration-1000 group-hover:scale-105"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Category Quick-Links Section */}
      <section className="w-full max-w-[1600px] mx-auto px-6 md:px-12 lg:px-20 py-4">
        <div className="flex flex-col items-center text-center space-y-4 mb-10">
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Curated Selection</span>
          <h2 className="text-4xl font-black text-slate-900 uppercase tracking-tight font-heading">Explore Collections</h2>
          <div className="h-1.5 w-12 bg-primary-600 rounded-full" />
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">
          {[
            { id: 1, name: 'Electronics', icon: Smartphone, color: 'text-blue-600', bg: 'bg-blue-50/50' },
            { id: 2, name: 'Fashion', icon: Shirt, color: 'text-orange-600', bg: 'bg-orange-50/50' },
            { id: 3, name: 'Home & Decor', icon: HomeIcon, color: 'text-emerald-600', bg: 'bg-emerald-50/50' },
            { id: 4, name: 'Art', icon: Palette, color: 'text-purple-600', bg: 'bg-purple-50/50' },
            { id: 5, name: 'Accessories', icon: Watch, color: 'text-rose-600', bg: 'bg-rose-50/50' },
          ].map(cat => (
            <Link 
              key={cat.id}
              to={`/products?category=${cat.name}`}
              className="group relative flex flex-col items-center p-10 rounded-[2.5rem] bg-white border border-slate-100 hover:border-slate-200 hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.05)] transition-all duration-500 overflow-hidden"
            >
              {/* Hover Gradient Background */}
              <div className="absolute inset-0 bg-gradient-to-br from-slate-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div className={`relative z-10 w-24 h-24 ${cat.bg} rounded-[2rem] flex items-center justify-center mb-8 transition-all duration-700 group-hover:scale-110 group-hover:rotate-6 shadow-sm group-hover:shadow-md`}>
                <cat.icon className={`h-10 w-10 ${cat.color} stroke-[1.5px]`} />
              </div>
              
              <div className="relative z-10 text-center space-y-2">
                <span className="block font-black text-slate-900 text-lg tracking-tight transition-colors group-hover:text-primary-600">{cat.name}</span>
                <div className="flex items-center justify-center space-x-1 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-500">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Explore</span>
                  <ArrowRight className="h-3 w-3 text-slate-400" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. New Arrivals Section: The Gallery Look */}
      <section className="relative w-full max-w-[1600px] mx-auto px-6 md:px-12 lg:px-20 py-4">
        {/* Decorative background element */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-slate-50/50 rounded-full blur-[120px] -mr-40 -mt-40 pointer-events-none" />
        
        <div className="relative z-10 flex flex-col items-center text-center space-y-3 mb-8">
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary-600 bg-primary-50 px-4 py-1.5 rounded-full border border-primary-100/50">Trending</span>
          <div className="space-y-2">
            <h2 className="text-4xl font-black text-slate-900 uppercase tracking-tight font-heading">New Arrivals</h2>
            <p className="text-slate-500 font-medium">Discover the latest treasures hand-picked for our community.</p>
          </div>
          <Link to="/products" className="group flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-all mt-4">
            <span>View All Products</span>
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-10">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="animate-pulse space-y-6">
                <div className="bg-slate-50 aspect-[4/5] rounded-[2.5rem]" />
                <div className="space-y-3">
                  <div className="h-4 bg-slate-50 rounded-full w-2/3" />
                  <div className="h-4 bg-slate-50 rounded-full w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-10 gap-y-20">
            {products.filter(p => p.stock > 0).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      <section className="w-full max-w-[1600px] mx-auto px-6 md:px-12 lg:px-20 pb-24">
        <div className="bg-[#f8f9f6]/80 backdrop-blur-xl rounded-[2.5rem] px-8 md:px-20 py-12 md:py-16 text-center relative overflow-hidden border border-slate-200/50 shadow-xl shadow-slate-200/40 animate-in fade-in zoom-in duration-1000">
          {/* Subtle Decorative Elements */}
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary-500/5 rounded-full blur-[100px] -mr-32 -mt-32" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-slate-400/5 rounded-full blur-[100px] -ml-32 -mb-32" />
          
          <div className="relative z-10 space-y-8">
            <div className="space-y-4">
              <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-[0.15em] uppercase font-heading leading-tight">
                STAY IN THE <span className="text-primary-600">LOOP</span>
              </h2>
              {!subscribed ? (
                <p className="text-slate-500 text-sm md:text-base max-w-lg mx-auto font-medium leading-relaxed opacity-80">
                  Be the first to know about new arrivals, exclusive lookbooks, and community events.
                </p>
              ) : (
                <p className="text-primary-600 text-sm md:text-base max-w-lg mx-auto font-bold leading-relaxed animate-in fade-in slide-in-from-bottom-4 duration-500">
                  Thanks for subscribing! We'll keep you updated.
                </p>
              )}
            </div>
            
            {!subscribed && (
              <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row max-w-md mx-auto gap-3 p-1.5 bg-white rounded-2xl border border-slate-100 shadow-sm focus-within:shadow-xl focus-within:shadow-slate-200/50 transition-all duration-500 group">
                <input 
                  type="email" 
                  placeholder="your@email.com" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="flex-grow px-6 py-3 bg-transparent text-slate-900 focus:outline-none placeholder:text-slate-400 text-sm font-medium"
                />
                <button type="submit" className="bg-slate-900 text-white px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all active:scale-95 shadow-lg shadow-slate-900/20">
                  Join Now
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
