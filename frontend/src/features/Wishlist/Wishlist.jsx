import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useWishlist } from '../../context/WishlistContext';
import { useCart } from '../../context/CartContext';
import { Heart, ShoppingBag, Trash2, Loader2, ArrowRight, ShoppingCart } from 'lucide-react';
import toast from 'react-hot-toast';

const Wishlist = () => {
  const { wishlist, loading, removeFromWishlist } = useWishlist();
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
      toast.success('Moved to cart!');
      handleRemove(item.id);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-12 w-12 animate-spin text-primary-600" />
      </div>
    );
  }

  if (!wishlist || wishlist.items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="bg-slate-100 p-6 rounded-full mb-6">
          <Heart className="h-12 w-12 text-slate-400" />
        </div>
        <h2 className="text-3xl font-bold text-slate-900 mb-2">Your wishlist is empty</h2>
        <p className="text-slate-600 mb-8 max-w-md">Save your favorite items here to keep track of them!</p>
        <Link to="/products" className="btn-primary px-8 py-3">Explore Products</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24 bg-slate-50/30">
      <div className="container-tight">
        {/* Professional Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 pt-16">
          <div className="space-y-1">
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">My Wishlist</h1>
            <p className="text-slate-500 text-sm">A curated collection of your favorite finds.</p>
          </div>
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
            {wishlist.items.length} {wishlist.items.length === 1 ? 'item' : 'items'} saved
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {wishlist.items.map((item) => (
            <div key={item.id} className="bg-white rounded-[2rem] overflow-hidden border border-slate-100 hover:shadow-2xl hover:shadow-slate-200 transition-all duration-500 flex flex-col group relative">
              {/* Image Section */}
              <div className="relative aspect-square bg-white p-8 overflow-hidden border-b border-slate-50">
                <img 
                  src={item.product?.images?.[0]?.image || 'https://via.placeholder.com/200'} 
                  alt={item.product?.name} 
                  className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-110" 
                />
                
                {/* Floating Actions */}
                <div className="absolute top-4 right-4 translate-x-12 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300">
                  <button 
                    onClick={() => handleRemove(item.id)}
                    className="p-3 bg-white/90 backdrop-blur-md rounded-2xl text-slate-400 hover:text-red-500 transition-all shadow-xl shadow-slate-900/5 hover:scale-110"
                    title="Remove from wishlist"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>

                {/* Quick Add Label */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 translate-y-12 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 delay-75">
                  <span className="bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.2em] px-4 py-2 rounded-full whitespace-nowrap">
                    Curated Item
                  </span>
                </div>
              </div>
              
              {/* Info Section */}
              <div className="p-8 flex-grow flex flex-col">
                <div className="mb-6 space-y-1">
                  <div className="flex justify-between items-start">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                      {item.product?.category_name || 'Essentials'}
                    </p>
                  </div>
                  <Link to={`/products/${item.product?.id}`} className="text-xl font-black text-slate-900 hover:text-primary-600 transition-colors line-clamp-1 block leading-tight">
                    {item.product?.name}
                  </Link>
                  <div className="flex items-center space-x-3 pt-2">
                    <p className="text-2xl font-black text-slate-900 tracking-tight">
                      ₹{item.product?.selling_price ? parseFloat(item.product.selling_price).toLocaleString('en-IN') : '0'}
                    </p>
                    {item.product?.mrp_price > item.product?.selling_price && (
                      <p className="text-sm font-bold text-slate-300 line-through">
                        ₹{parseFloat(item.product.mrp_price).toLocaleString('en-IN')}
                      </p>
                    )}
                  </div>
                </div>
                
                <button 
                  onClick={() => handleMoveToCart(item)}
                  className="mt-auto w-full flex items-center justify-center space-x-3 py-4 bg-slate-900 text-white rounded-2xl text-sm font-black hover:bg-primary-600 transition-all shadow-lg shadow-slate-900/10 active:scale-[0.98] group"
                >
                  <ShoppingCart className="h-5 w-5 transition-transform group-hover:rotate-12" />
                  <span>Move to Cart</span>
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
