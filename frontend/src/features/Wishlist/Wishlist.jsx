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
    <div className="py-12">
      <div className="flex justify-between items-end mb-8">
        <h1 className="text-4xl font-black text-slate-900 tracking-tight">My Wishlist</h1>
        <p className="text-slate-500 font-medium">{wishlist.items.length} items saved</p>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {wishlist.items.map((item) => (
          <div key={item.id} className="bg-white rounded-2xl overflow-hidden border border-slate-100 hover:shadow-xl transition-all duration-300 flex flex-col group relative">
            {/* Image Section */}
            <div className="relative h-[200px] bg-slate-50 overflow-hidden">
              <img 
                src={item.product?.images?.[0]?.image || 'https://via.placeholder.com/200'} 
                alt={item.product?.name} 
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
              />
              <button 
                onClick={() => handleRemove(item.id)}
                className="absolute top-2 right-2 p-1.5 bg-white/90 backdrop-blur-md rounded-lg text-slate-400 hover:text-red-500 transition-colors shadow-sm z-10"
                title="Remove from wishlist"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
            
            {/* Info Section */}
            <div className="p-4 flex-grow flex flex-col">
              <div className="mb-3">
                <Link to={`/products/${item.product?.id}`} className="text-sm font-bold text-slate-900 hover:text-primary-600 transition-colors line-clamp-1 block">
                  {item.product?.name}
                </Link>
                <p className="text-lg font-black text-primary-600 mt-0.5">
                  ${item.product?.price ? parseFloat(item.product.price).toFixed(2) : '0.00'}
                </p>
              </div>
              
              <button 
                onClick={() => handleMoveToCart(item)}
                className="mt-auto w-full flex items-center justify-center space-x-1.5 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-primary-600 transition-all active:scale-[0.98]"
              >
                <ShoppingCart className="h-3.5 w-3.5" />
                <span>Move to Cart</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Wishlist;
