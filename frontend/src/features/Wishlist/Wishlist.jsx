import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useWishlist } from '../../context/WishlistContext';
import { useCart } from '../../context/CartContext';
import { Heart, ShoppingBag, Trash2, Loader2, ArrowRight, ShoppingCart } from 'lucide-react';
import toast from 'react-hot-toast';

const Wishlist = () => {
  const { wishlist, loading, removeFromWishlist, wishlistCount: itemsCount } = useWishlist();
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const handleRemove = async (itemId) => {
    removeFromWishlist(itemId);
  };

  const handleMoveToCart = async (item) => {
    // Note: item.product might be an ID or an object depending on serializer
    const productId = typeof item.product === 'object' ? item.product.id : item.product;
    const success = await addToCart(productId, 1);
    if (success) {
      handleRemove(item.id);
    }
  };

  const wishlistItems = wishlist?.results || wishlist?.items || [];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-12 w-12 animate-spin text-primary-600" />
      </div>
    );
  }

  if (!wishlist || wishlistItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="bg-slate-100 dark:bg-slate-900 p-6 rounded-full mb-6">
          <Heart className="h-12 w-12 text-slate-400 dark:text-slate-600" />
        </div>
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Your wishlist is empty</h2>
        <p className="text-slate-600 dark:text-slate-400 mb-8 max-w-md">Save your favorite items here to keep track of them!</p>
        <Link to="/products" className="btn-primary px-8 py-3 dark:bg-white dark:text-slate-900 dark:hover:bg-primary-50">Explore Products</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24 bg-slate-50/30 dark:bg-transparent">
      <div className="container-tight">
        {/* Professional Header Section - Streamlined */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-10 pt-12 border-b border-slate-100 dark:border-slate-800 pb-8">
          <div className="space-y-2">
            <div className="flex items-center space-x-3 text-primary-600 dark:text-primary-400">
               <Heart className="h-4 w-4 fill-current" />
               <span className="text-[9px] font-black uppercase tracking-[0.3em]">Personal Collection</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tighter uppercase font-heading">My Wishlist</h1>
            <p className="text-slate-400 dark:text-slate-500 text-[11px] font-bold uppercase tracking-wider">A curated selection of the pieces you love most.</p>
          </div>
          
          <div className="flex flex-col items-end gap-3">
             <div className="bg-slate-900 dark:bg-white px-5 py-1.5 rounded-full shadow-lg shadow-slate-900/10">
                <span className="text-[9px] font-black uppercase tracking-widest text-white dark:text-slate-900">
                  {itemsCount} {itemsCount === 1 ? 'Object' : 'Objects'} Saved
                </span>
             </div>
             <button 
                onClick={() => navigate('/products')}
                className="group flex items-center space-x-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white transition-all"
             >
                <span>Continue Exploring</span>
                <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
             </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
          {wishlistItems.map((item) => (
            <div key={item.id} className="group bg-white dark:bg-transparent rounded-[2.5rem] overflow-hidden border border-slate-100 dark:border-slate-800/60 hover:border-primary-100 dark:hover:border-primary-900/50 hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.08)] transition-all duration-700 flex flex-col relative">
              {/* Image Section - Compact */}
              <div className="relative aspect-square bg-slate-200 dark:bg-slate-800 animate-pulse p-6 overflow-hidden flex items-center justify-center">
                <img 
                  src={(item.product?.images?.[0]?.image || 'https://via.placeholder.com/400').replace('/upload/', '/upload/q_auto,f_auto,w_600/')} 
                  alt={item.product?.name} 
                  loading="lazy"
                  className="w-full h-full object-contain transition-transform duration-1000 group-hover:scale-105" 
                />
                
                {/* Floating Remove Action */}
                <button 
                  onClick={() => handleRemove(item.id)}
                  className="absolute top-6 right-6 p-3 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-2xl text-slate-300 dark:text-slate-600 hover:text-rose-500 dark:hover:text-rose-400 transition-all shadow-xl shadow-slate-900/5 hover:scale-110 border border-slate-100 dark:border-slate-800 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0"
                  title="Remove"
                >
                  <Trash2 className="h-4 w-4" />
                </button>

                {/* Stock Indicator - Top Left */}
                <div className="absolute top-6 left-6 opacity-0 group-hover:opacity-100 -translate-y-2 group-hover:translate-y-0 transition-all duration-500">
                  <div className={`px-3 py-1.5 rounded-full border text-[8px] font-black uppercase tracking-widest backdrop-blur-sm ${item.product?.stock > 0 ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800' : 'bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 border-rose-100 dark:border-rose-800'}`}>
                    {item.product?.stock > 0 ? 'Available' : 'Sold Out'}
                  </div>
                </div>
              </div>
              
              {/* Info Section - Tightened */}
              <div className="px-8 pb-8 pt-0 flex-grow flex flex-col space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.25em]">
                      {item.product?.category_name || 'Piece'}
                    </span>
                    <span className="text-[8px] font-bold text-slate-300 dark:text-slate-600 uppercase tracking-widest">#{item.product?.id?.slice(0, 5)}</span>
                  </div>
                  <Link to={`/products/${item.product?.slug}`} className="text-lg font-black text-slate-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400 transition-colors line-clamp-1 block tracking-tight">
                    {item.product?.name}
                  </Link>
                  <div className="flex items-baseline space-x-3">
                    <p className="text-xl font-black text-slate-900 dark:text-white tracking-tighter">
                      ₹{item.product?.selling_price ? parseFloat(item.product.selling_price).toLocaleString('en-IN') : '0'}
                    </p>
                    {item.product?.mrp_price > item.product?.selling_price && (
                      <p className="text-[10px] font-bold text-slate-300 dark:text-slate-600 line-through">
                        ₹{parseFloat(item.product.mrp_price).toLocaleString('en-IN')}
                      </p>
                    )}
                  </div>
                </div>
                
                <button 
                  onClick={() => handleMoveToCart(item)}
                  disabled={item.product?.stock <= 0}
                  className="w-full flex items-center justify-center space-x-3 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-[1.25rem] text-[10px] font-black uppercase tracking-[0.2em] hover:bg-primary-600 dark:hover:bg-primary-50 transition-all duration-500 shadow-xl shadow-slate-900/10 dark:shadow-none active:scale-[0.98] group disabled:opacity-30 disabled:hover:bg-slate-900 dark:disabled:hover:bg-white"
                >
                  <ShoppingCart className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-1 group-hover:translate-x-1" />
                  <span>Move to Bag</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Wishlist;
