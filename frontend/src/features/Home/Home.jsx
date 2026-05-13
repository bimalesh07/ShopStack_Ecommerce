import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import productService from '../../api/productService';
import ProductCard from '../Products/ProductCard';
import { Loader2, ArrowRight, ShoppingBag, Sparkles, Smartphone, Shirt, Home as HomeIcon, Palette, Watch } from 'lucide-react';

import heroTech from '../../assets/hero_vibrant_tech.png';
import heroFashion from '../../assets/hero_vibrant_fashion.png';
import heroHome from '../../assets/hero_vibrant_home.png';
import heroArt from '../../assets/hero_banner.png';
import heroAccessories from '../../assets/hero_modern.png';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      image: heroTech,
      title: "VIBRANT",
      subtitle: "TECH STACK.",
      color: "text-cyan-400",
      accent: "bg-cyan-500",
      description: "Modern tech layered for your digital lifestyle."
    },
    {
      image: heroFashion,
      title: "ENERGETIC",
      subtitle: "STYLE EDIT.",
      color: "text-orange-400",
      accent: "bg-orange-500",
      description: "A curated stack of everything you wear and carry."
    },
    {
      image: heroHome,
      title: "DIVERSE",
      subtitle: "LIVING ART.",
      color: "text-amber-400",
      accent: "bg-amber-500",
      description: "Daylight-rich design stacked for your modern home."
    }
  ];

  // Fetch home data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsData, categoriesData] = await Promise.all([
          productService.getProducts({ limit: 50 }),
          productService.getCategories()
        ]);
        setProducts(productsData);
        setCategories(categoriesData);
      } catch (err) {
        console.error('Home data error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();

    // Auto-slide hero
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail('');
    }
  };


  return (
    <div className="w-full bg-white dark:bg-slate-950 transition-colors duration-500 overflow-x-hidden font-inter">
      {/* 1. Dynamic Vibrant Hero Slider */}
      <section className="relative w-full max-w-[1600px] mx-auto h-[85vh] md:h-[95vh] px-6 md:px-12 lg:px-20 pt-4 flex items-center overflow-hidden">
        {/* Slide Transitions */}
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-x-6 md:inset-x-12 lg:inset-x-20 inset-y-4 md:inset-y-8 lg:inset-y-12 transition-opacity duration-1000 ease-in-out rounded-2xl md:rounded-[2.5rem] overflow-hidden shadow-2xl ${index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
          >
            {/* Background Image */}
            <div className="absolute inset-0 bg-slate-200 dark:bg-slate-800 animate-pulse">
              <img
                src={typeof slide.image === 'string' ? slide.image.replace('/upload/', '/upload/q_auto,f_auto,w_600/') : slide.image}
                alt={slide.title}
                loading={index < 2 ? "eager" : "lazy"}
                className="w-full h-full object-cover object-center scale-105 animate-slow-zoom"
              />
              {/* Dynamic Vibrant Overlay */}
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-950/20 to-slate-950/60 dark:to-slate-950/80" />
            </div>

            <div className="relative z-20 h-full max-w-[1600px] mx-auto px-6 md:px-12 lg:px-20 flex flex-col items-center justify-center text-center">
              <div className="max-w-4xl space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-12 duration-1000">
                <div className="space-y-4">
                  <div className="flex items-center justify-center space-x-3 text-white/90">
                    <Sparkles className="h-4 w-4 md:h-5 md:w-5" />
                    <span className="text-[8px] md:text-[10px] font-bold uppercase tracking-[0.5em]">THE SHOPSTACK EDIT</span>
                  </div>
                  <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight tracking-widest uppercase drop-shadow-lg">
                    {slide.title} <br />
                    <span className={`${slide.color} drop-shadow-none`}>{slide.subtitle}</span>
                  </h1>
                  <p className="max-w-2xl mx-auto text-base md:text-xl text-white/90 font-medium leading-relaxed drop-shadow-md">
                    {slide.description}
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                  <Link
                    to="/products"
                    className={`inline-flex items-center px-12 py-5 ${slide.accent} text-white rounded-full font-black text-[11px] uppercase tracking-widest hover:scale-105 transition-all duration-500 shadow-2xl group`}
                  >
                    <span>Shop The Stack</span>
                    <ArrowRight className="h-4 w-4 ml-3 group-hover:translate-x-2 transition-transform duration-500" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Custom Navigation Dots */}
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-30 flex items-center space-x-2 md:space-x-4">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`h-1.5 transition-all duration-500 rounded-full ${index === currentSlide ? 'w-8 md:w-12 bg-white' : 'w-2 md:w-3 bg-white/30 hover:bg-white/50'}`}
            />
          ))}
        </div>

        {/* Symmetrical Scroll Indicator */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 opacity-40">
          <div className="w-[1px] h-10 bg-gradient-to-b from-white to-transparent animate-pulse" />
        </div>
      </section>

      {/* 2. Category Section: Theme Sync Fix */}
      <section className="w-full bg-transparent pt-24 pb-12 border-y border-slate-100 dark:border-slate-800/40">
        <div className="max-w-[1600px] mx-auto px-6 md:px-12 lg:px-20">
          {/* Heading Area */}
          <div className="flex flex-col md:flex-row items-baseline justify-between mb-20 gap-6">
            <div className="space-y-3">
              <span className="text-[10px] font-bold text-primary-600 uppercase tracking-[0.6em] block">
                Curated Categories
              </span>
              <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Explore Collections
              </h2>
            </div>

            <Link
              to="/products"
              className="group flex items-center space-x-2 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all pb-1 border-b-2 border-transparent hover:border-slate-900 dark:hover:border-white"
            >
              <span>View All Series</span>
              <ArrowRight className="h-3 w-3 group-hover:translate-x-1.5 transition-transform duration-300" />
            </Link>
          </div>

          {/* Responsive Grid - 1 col on small mobile, 2 on sm */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-8">
            {categories.map((cat, idx) => (
              <Link
                key={cat.id || idx}
                to={`/products?category=${cat.name}`}
                className="group relative aspect-[3/4] overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-950 border border-slate-200/50 dark:border-white/5 shadow-lg hover:shadow-2xl transition-all duration-700 hover:-translate-y-2"
              >
                <div className="absolute inset-0 bg-slate-200 dark:bg-slate-800 animate-pulse">
                  <img
                    src={(cat.image || [heroTech, heroFashion, heroHome, heroArt, heroAccessories][idx % 5]).replace('/upload/', '/upload/q_auto,f_auto,w_600/')}
                    alt={cat.name}
                    loading="lazy"
                    className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-[1.5s] ease-out group-hover:scale-110"
                  />
                </div>

                {/* Overlay - Modernized gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-500" />

                {/* Content Overlay */}
                <div className="absolute inset-0 p-4 md:p-8 flex flex-col items-center sm:items-start justify-center sm:justify-end text-center sm:text-left">
                  <div className="space-y-2 translate-y-2 group-hover:translate-y-0 transition-transform duration-500 flex flex-col items-center sm:items-start">
                    <div className="flex items-center space-x-2 opacity-80 group-hover:opacity-100 transition-opacity">
                      {(cat.name === 'Electronics' || idx === 0) && <Smartphone className="h-5 w-5 text-white" />}
                      {(cat.name === 'Fashion' || idx === 1) && <Shirt className="h-5 w-5 text-white" />}
                      {(cat.name === 'Home & Decor' || idx === 2) && <HomeIcon className="h-5 w-5 text-white" />}
                      {(cat.name === 'Art' || idx === 3) && <Palette className="h-5 w-5 text-white" />}
                      {(cat.name === 'Accessories' || idx === 4) && <Watch className="h-5 w-5 text-white" />}
                      <div className="h-px w-3 bg-white/50" />
                      <span className="text-[8px] font-black text-white uppercase tracking-[0.2em]">
                        Series
                      </span>
                    </div>
                    <h3 className="text-2xl font-black text-white tracking-tight uppercase group-hover:text-primary-400 transition-colors">
                      {cat.name}
                    </h3>

                    {/* Action Peek */}
                    <div className="pt-2 flex items-center space-x-2 text-[9px] font-black text-white/70 uppercase tracking-[0.2em] opacity-0 group-hover:opacity-100 transition-all duration-700">
                      <span>Explore Edit</span>
                      <ArrowRight className="h-3 w-3" />
                    </div>
                  </div>
                </div>

                {/* Minimal ID Badge */}
                <div className="absolute top-6 right-6 h-8 w-8 rounded-full border border-white/10 flex items-center justify-center backdrop-blur-md bg-white/5 shadow-xl transition-all duration-500 group-hover:scale-110 group-hover:rotate-12">
                  <span className="text-[9px] font-black text-white/40">0{idx + 1}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 3. New Arrivals Section: The Gallery Look */}
      <section className="relative w-full bg-white dark:bg-transparent transition-colors duration-300 pt-8 pb-12">
        <div className="max-w-[1600px] mx-auto px-6 md:px-12 lg:px-20">
          {/* Decorative element */}
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-slate-50/20 dark:bg-primary-500/2 rounded-full blur-[120px] -mr-40 -mt-40 pointer-events-none" />

          <div className="relative z-10 flex flex-col items-center text-center space-y-4 mb-10">
            <div className="inline-flex items-center space-x-2 px-5 py-2 bg-gradient-to-r from-primary-600/10 to-indigo-600/10 dark:from-primary-500/10 dark:to-indigo-500/10 border border-primary-200/50 dark:border-primary-800/50 rounded-full animate-in fade-in zoom-in duration-1000">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-600"></span>
              </span>
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary-700 dark:text-primary-400">Trending Now</span>
            </div>

            <div className="space-y-4">
              <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-none">
                New <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-indigo-600 dark:from-primary-400 dark:to-indigo-400">Arrivals</span>
              </h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm md:text-base font-medium max-w-lg mx-auto">Discover the latest treasures hand-picked for our curated community.</p>
            </div>

            <Link to="/products" className="group flex items-center space-x-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-primary-600 transition-all pt-2">
              <span>View All Series</span>
              <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1.5 transition-transform" />
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
            <div className="relative w-full overflow-hidden py-10 group">
              {/* Infinite Marquee Container */}
              <div className="flex w-max animate-marquee space-x-12 group-hover:[animation-play-state:paused] cursor-pointer">
                {/* Combine unique products (LATEST per category) and repeat multiple times for a full-screen dense flow */}
                {(() => {
                  const latestUniqueProducts = [...new Map(
                    [...products]
                      .sort((a, b) => (b.id || 0) - (a.id || 0))
                      .map(p => [p.category_name, p])
                  ).values()];

                  // Repeat 20 times to ensure full width on all screens and no gaps
                  const displayItems = Array(20).fill(latestUniqueProducts).flat();

                  return displayItems.map((product, idx) => (
                    <div key={`${product.id}-${idx}`} className="w-[300px] flex-shrink-0">
                      <ProductCard product={product} />
                    </div>
                  ));
                })()}
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="w-full max-w-[1600px] mx-auto px-6 md:px-12 lg:px-20 pb-24">
        <div className="bg-white dark:bg-transparent backdrop-blur-xl rounded-[2.5rem] px-8 md:px-20 py-12 md:py-16 text-center relative overflow-hidden border border-slate-200/50 dark:border-slate-800/50 shadow-xl shadow-slate-200/40 dark:shadow-none animate-in fade-in zoom-in duration-1000">
          {/* Subtle Decorative Elements */}
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary-500/2 rounded-full blur-[100px] -mr-32 -mt-32" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-slate-400/2 dark:bg-primary-400/2 rounded-full blur-[100px] -ml-32 -mb-32" />

          <div className="relative z-10 space-y-8">
            <div className="space-y-4">
              <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-[0.15em] uppercase font-heading leading-tight">
                STAY IN THE <span className="text-primary-600 dark:text-primary-400">LOOP</span>
              </h2>
              {!subscribed ? (
                <p className="text-slate-500 dark:text-slate-400 text-sm md:text-base max-w-lg mx-auto font-medium leading-relaxed opacity-80">
                  Be the first to know about new arrivals, exclusive lookbooks, and community events.
                </p>
              ) : (
                <p className="text-primary-600 dark:text-primary-400 text-sm md:text-base max-w-lg mx-auto font-bold leading-relaxed animate-in fade-in slide-in-from-bottom-4 duration-500">
                  Thanks for subscribing! We'll keep you updated.
                </p>
              )}
            </div>

            {!subscribed && (
              <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row max-w-md mx-auto gap-3 p-1.5 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm focus-within:shadow-xl transition-all duration-500 group">
                <input 
                  type="email" 
                  placeholder="your@email.com" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="flex-grow px-6 py-4 sm:py-3 bg-transparent text-slate-900 dark:text-white focus:outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500 text-sm font-medium"
                />
                <button type="submit" className="bg-slate-900 dark:bg-white dark:text-slate-900 text-white px-8 h-14 sm:h-auto rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 dark:hover:bg-primary-50 transition-all active:scale-95 shadow-lg">
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
