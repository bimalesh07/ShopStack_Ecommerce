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
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {wishlistItems.map((item) => (
            <div key={item.id} className="group bg-white dark:bg-slate-900/40 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 transition-all duration-500 flex flex-col h-full relative hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.08)]">
              
              {/* Product Image Section - Pure White & Clean */}
              <div className="relative aspect-square overflow-hidden bg-white rounded-xl mb-4 flex items-center justify-center border border-slate-100 dark:border-white/5 shadow-sm">
                <img
                  src={(item.product?.images?.[0]?.image || 'https://via.placeholder.com/400x400').replace('/upload/', '/upload/q_auto,f_auto,w_600/')}
                  alt={item.product?.name}
                  loading="lazy"
                  className="w-[90%] h-[90%] object-contain transition-transform duration-700 group-hover:scale-110 mix-blend-multiply"
                />

                {/* Remove Button - Top Right */}
                <button 
                  onClick={() => handleRemove(item.id)}
                  className="absolute top-2 right-2 p-2 bg-slate-50/50 dark:bg-slate-800/50 backdrop-blur-md rounded-full text-slate-400 hover:text-rose-500 transition-all opacity-0 group-hover:opacity-100"
                  title="Remove"
                >
                  <Trash2 className="h-4 w-4" />
                </button>

                {/* Stock Status */}
                <div className="absolute top-2 left-2">
                  <div className={`flex items-center space-x-1 px-2 py-1 rounded-md border ${item.product?.stock > 0 ? 'bg-emerald-50/80 text-emerald-600 border-emerald-100' : 'bg-rose-50/80 text-rose-600 border-rose-100'} backdrop-blur-sm`}>
                    <div className={`h-1 w-1 rounded-full ${item.product?.stock > 0 ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                    <span className="text-[7px] font-black uppercase tracking-widest">{item.product?.stock > 0 ? 'In Stock' : 'Sold'}</span>
                  </div>
                </div>
              </div>

              {/* Details - Bold & Clean */}
              <div className="flex flex-col flex-grow space-y-4">
                <div className="space-y-1">
                  <p className="text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">{item.product?.category_name}</p>
                  <Link to={`/products/${item.product?.slug}`} className="text-sm font-black text-slate-900 dark:text-white leading-tight tracking-tight line-clamp-2 block hover:opacity-70 transition-opacity">
                    {item.product?.name}
                  </Link>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <p className="text-lg font-black text-slate-900 dark:text-white tracking-tighter">
                      ₹{item.product?.selling_price ? parseFloat(item.product.selling_price).toLocaleString('en-IN') : '0'}
                    </p>
                    {item.product?.mrp_price > item.product?.selling_price && (
                      <p className="text-[10px] font-bold text-slate-400 line-through">
                        ₹{parseFloat(item.product.mrp_price).toLocaleString('en-IN')}
                      </p>
                    )}
                  </div>
                </div>

                {/* Move to Bag Button - High End */}
                <button 
                  onClick={() => handleMoveToCart(item)}
                  disabled={item.product?.stock <= 0}
                  className="w-full flex items-center justify-center space-x-3 py-3.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] hover:opacity-90 transition-all active:scale-[0.98] disabled:opacity-30 mt-auto"
                >
                  <ShoppingCart className="h-3.5 w-3.5" />
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
