import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import productService from '../../api/productService';
import ProductCard from '../Products/ProductCard';
import { Loader2, ArrowRight, ShoppingBag, Sparkles } from 'lucide-react';

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const data = await productService.getProducts();
        // Take first 4 products
        setFeaturedProducts(data.slice(0, 4));
      } catch (error) {
        console.error('Error fetching featured products:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  return (
    <div className="space-y-20">
      {/* Hero Section */}
      <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden rounded-[3rem] mt-4">
        {/* Abstract Background Elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-600/5 via-white to-primary-500/5 -z-10" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary-200/20 rounded-full blur-3xl -mr-48 -mt-48 animate-pulse" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary-300/20 rounded-full blur-3xl -ml-48 -mb-48" />

        <div className="max-w-4xl mx-auto px-6 text-center space-y-8">
          <div className="inline-flex items-center space-x-2 px-4 py-2 bg-white border border-slate-100 rounded-full shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-700">
            <Sparkles className="h-4 w-4 text-primary-600" />
            <span className="text-xs font-bold text-slate-600 uppercase tracking-widest">New Season Collection 2026</span>
          </div>
          
          <h1 className="text-6xl md:text-8xl font-black text-slate-900 leading-[1.1] tracking-tight animate-in fade-in slide-in-from-bottom-8 duration-1000">
            Elevate Your <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-primary-400">Lifestyle</span>
          </h1>
          
          <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed font-medium animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-200">
            Discover a curated collection of premium essentials designed for the modern individual. Minimalist aesthetics meets maximum functionality.
          </p>

          <div className="pt-4 animate-in fade-in slide-in-from-bottom-16 duration-1000 delay-300">
            <Link 
              to="/products" 
              className="group relative inline-flex items-center space-x-3 bg-slate-900 text-white px-10 py-5 rounded-2xl font-black text-lg hover:bg-primary-600 transition-all duration-300 hover:scale-105 hover:shadow-2xl shadow-slate-900/20"
            >
              <span>Shop the Collection</span>
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="container mx-auto px-4 space-y-12">
        <div className="flex justify-between items-end">
          <div>
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">Trending Now</h2>
            <p className="text-slate-500 font-medium mt-2">The most wanted pieces of the week.</p>
          </div>
          <Link to="/products" className="group flex items-center space-x-2 text-primary-600 font-bold hover:text-primary-700 transition-colors">
            <span>View All Products</span>
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="aspect-[4/5] bg-slate-100 rounded-3xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {featuredProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* CTA / Newsletter Section */}
      <section className="bg-slate-900 rounded-[3rem] p-12 md:p-20 text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/10 rounded-full blur-3xl" />
        <div className="relative z-10 space-y-8">
          <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight">Join the ShopStack Inner Circle</h2>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">Get early access to drops, exclusive discounts, and lifestyle inspiration delivered to your inbox.</p>
          <div className="flex flex-col sm:flex-row max-w-md mx-auto gap-4">
            <input 
              type="email" 
              placeholder="your@email.com" 
              className="flex-grow px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
            />
            <button className="bg-white text-slate-900 px-8 py-4 rounded-2xl font-black hover:bg-primary-50 transition-colors">
              Subscribe
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
