import React from 'react';
import { Heart, Edit } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useWishlist } from '../../context/WishlistContext';

const ProductCard = ({ product }) => {
  const { user } = useAuth();
  const { addToWishlist, isInWishlist } = useWishlist();

  // Toggle wishlist
  const handleWishlist = (e) => {
    e.preventDefault();
    if (!user) return;
    addToWishlist(product.id);
  };

  return (
    <Link
      to={`/products/${product.slug}`}
      className="group bg-white dark:bg-slate-900/40 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 transition-all duration-500 flex flex-col h-full relative hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.08)] dark:hover:shadow-none"
    >
      {/* Product Image Section - Clean Gallery Frame */}
      <div className="relative aspect-square overflow-hidden bg-white rounded-xl mb-4 flex items-center justify-center border border-slate-100 dark:border-white/10 shadow-sm transition-all duration-500">
        <img
          src={(product.images?.[0]?.image || 'https://via.placeholder.com/400x400').replace('/upload/', '/upload/q_auto,f_auto,w_600/')}
          alt={product.name}
          loading="lazy"
          className="w-[88%] h-[88%] object-contain transition-transform duration-700 group-hover:scale-110"
        />

        {/* Stock Status Badge */}
        <div className="absolute top-3 left-3">
          <div className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-md border ${product.stock > 0 ? 'bg-emerald-50/80 text-emerald-600 border-emerald-100' : 'bg-rose-50/80 text-rose-600 border-rose-100'} backdrop-blur-sm`}>
            <div className={`h-1 w-1 rounded-full ${product.stock > 0 ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
            <span className="text-[8px] font-black uppercase tracking-widest">{product.stock > 0 ? 'In Stock' : 'Sold Out'}</span>
          </div>
        </div>

        {/* Wishlist Button - High Visibility */}
        {user?.role !== 'vendor' && (
          <button
            className={`absolute top-2.5 right-2.5 p-2 rounded-full transition-all duration-300 backdrop-blur shadow-sm border ${
              isInWishlist(product.id) 
                ? 'bg-red-50 dark:bg-red-500/10 border-red-100 dark:border-red-500/20 text-red-500' 
                : 'bg-white/90 dark:bg-slate-900/90 border-slate-100 dark:border-white/10 text-slate-400 hover:text-red-500 hover:scale-110'
            }`}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleWishlist(e);
            }}
          >
            <Heart className={`h-4 w-4 ${isInWishlist(product.id) ? 'fill-current' : ''}`} />
          </button>
        )}
      </div>

      {/* Details - Bold & Clean */}
      <div className="flex flex-col space-y-2">
        <div className="flex justify-between items-start">
          <div className="flex-grow">
            <p className="text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">{product.category_name}</p>
            <h3 className="text-sm font-black text-slate-900 dark:text-white leading-tight tracking-tight line-clamp-2">
              {product.name}
            </h3>
          </div>
          {user?.role === 'vendor' && product.vendor === user.vendor_details?.id && (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                window.location.href = `/vendor/edit-product/${product.id}`;
              }}
              className="p-1.5 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all bg-slate-50 dark:bg-slate-800 rounded-lg"
            >
              <Edit className="h-3 w-3" />
            </button>
          )}
        </div>

        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center space-x-2">
            <p className="text-lg font-black text-slate-900 dark:text-white tracking-tighter">
              ₹{parseFloat(product.selling_price).toLocaleString('en-IN')}
            </p>
            {parseFloat(product.mrp_price) > parseFloat(product.selling_price) && (
              <p className="text-[10px] font-bold text-slate-400 line-through">
                ₹{parseFloat(product.mrp_price).toLocaleString('en-IN')}
              </p>
            )}
          </div>
          {product.discount_percentage > 0 && (
            <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">
              {product.discount_percentage}% OFF
            </span>
          )}
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
