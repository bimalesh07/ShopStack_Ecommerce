import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import productService from '../../api/productService';
import ProductCard from '../Products/ProductCard';
import { Loader2, ArrowRight, ShoppingBag, Sparkles } from 'lucide-react';

import heroShelves from '../../assets/hero_shelves.png';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const categories = [
    { id: 1, name: 'Electronics', icon: '📱', color: 'bg-blue-50' },
    { id: 2, name: 'Fashion', icon: '👕', color: 'bg-orange-50' },
    { id: 3, name: 'Home & Decor', icon: '🏠', color: 'bg-emerald-50' },
    { id: 4, name: 'Art', icon: '🎨', color: 'bg-purple-50' },
    { id: 5, name: 'Accessories', icon: '⌚', color: 'bg-rose-50' },
  ];

  return (
    <div className="space-y-16 pb-20 overflow-hidden">
      {/* 1. Hero Section: The "Curated Stack" Look (60:40) */}
      <section className="bg-[#f8f9f6] py-12 lg:py-20">
        <div className="w-full max-w-[1600px] mx-auto px-6 md:px-12 lg:px-20 flex flex-col lg:flex-row items-center gap-20">
          {/* Left Side: Messaging (Horizontal/Wide) */}
          <div className="lg:w-[60%] space-y-8 animate-in fade-in slide-in-from-left-12 duration-1000">
            <div className="space-y-6">
              <h1 className="text-4xl md:text-6xl font-black text-slate-900 leading-[1.1] tracking-tighter uppercase font-heading max-w-5xl">
                Uncover the Unique. <br className="hidden md:block" />
                Timeless Quality. Global Curation.
              </h1>
              <p className="text-lg md:text-xl text-slate-600 font-medium max-w-xl leading-relaxed">
                Discover a world of hand-picked treasures, from artisanal essentials to unique statement pieces.
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
            <div className="relative group">
              <div className="absolute -inset-4 bg-slate-200/50 rounded-[3rem] blur-2xl group-hover:bg-slate-300/50 transition-colors duration-700" />
              <img 
                src={heroShelves} 
                alt="Curated products on shelves" 
                className="relative w-full h-auto object-contain drop-shadow-2xl hover:scale-[1.02] transition-transform duration-700"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 2. Category Quick-Links Section */}
      <section className="w-full max-w-[1600px] mx-auto px-6 md:px-12 lg:px-20 space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tight font-heading">Explore Top Categories</h2>
          <p className="text-slate-500 font-medium">Quickly find what you're looking for from our verified sellers.</p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {categories.map(cat => (
            <Link 
              key={cat.id}
              to={`/products?category=${cat.name}`}
              className="group flex flex-col items-center p-8 rounded-3xl bg-white border border-slate-100 hover:border-slate-300 hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-300"
            >
              <div className={`w-20 h-20 ${cat.color} rounded-2xl flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform duration-300`}>
                {cat.icon}
              </div>
              <span className="font-bold text-slate-800 text-lg">{cat.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. New Arrivals Section */}
      <section className="w-full max-w-[1600px] mx-auto px-6 md:px-12 lg:px-20 space-y-12">
        <div className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-slate-100 pb-10">
          <div className="space-y-2">
            <h2 className="text-4xl font-black text-slate-900 tracking-tight uppercase font-heading">New Arrivals</h2>
            <p className="text-slate-500 font-medium text-lg italic">The latest drops from our curated community.</p>
          </div>
          <Link to="/products" className="group flex items-center space-x-2 text-slate-900 font-bold hover:text-primary-600 transition-all uppercase tracking-widest text-xs">
            <span>View All Products</span>
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="animate-pulse space-y-4">
                <div className="bg-slate-100 aspect-[4/5] rounded-[2rem]" />
                <div className="h-4 bg-slate-100 rounded w-2/3" />
                <div className="h-4 bg-slate-100 rounded w-1/3" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-8 gap-y-16">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* 5. Final CTA: Newsletter */}
      <section className="w-full max-w-[1600px] mx-auto px-6 md:px-12 lg:px-20 pb-10">
        <div className="bg-slate-900 rounded-[4rem] px-8 md:px-20 py-10 md:py-16 text-center relative overflow-hidden shadow-2xl shadow-slate-900/20">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-slate-800/30 rounded-full blur-[120px] -mr-64 -mt-64" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-slate-800/30 rounded-full blur-[120px] -ml-64 -mb-64" />
          
          <div className="relative z-10 space-y-10">
            <div className="space-y-4">
              <h2 className="text-5xl md:text-6xl font-black text-white tracking-tighter uppercase font-heading leading-none">Join ShopStack Community</h2>
              <p className="text-slate-400 text-xl max-w-xl mx-auto font-medium">Unlock 10% off your first order and get early access to new arrivals.</p>
            </div>
            
            <div className="flex flex-col sm:flex-row max-w-lg mx-auto gap-4 p-2 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 focus-within:border-white/30 transition-all">
              <input 
                type="email" 
                placeholder="your@email.com" 
                className="flex-grow px-6 py-4 bg-transparent text-white focus:outline-none placeholder:text-slate-500 font-medium"
              />
              <button className="bg-white text-slate-900 px-10 py-4 rounded-xl font-black hover:bg-slate-100 transition-all">
                Join Now
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
