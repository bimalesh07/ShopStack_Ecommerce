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
      className="group bg-white dark:bg-transparent rounded-[24px] overflow-hidden border border-slate-100 dark:border-slate-800/60 hover:border-slate-200 dark:hover:border-slate-600 hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] transition-all duration-500 flex flex-col h-full relative"
    >
      {/* Product Image Section - Standardized Gallery Style */}
      <div className="relative aspect-square overflow-hidden bg-[#F9FAFB] dark:bg-slate-900/50 p-8 flex items-center justify-center">
        <img
          src={product.images?.[0]?.image || 'https://via.placeholder.com/400x400'}
          alt={product.name}
          className="w-full h-full object-contain transition-all duration-700 group-hover:scale-110 drop-shadow-sm"
        />

        {/* Wishlist Button */}
        {user?.role !== 'vendor' && (
          <button
            className={`absolute top-3 right-3 p-2 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/50 rounded-full shadow-lg transition-all duration-300 z-10 ${isInWishlist(product.id) ? 'text-red-500' : 'text-slate-400 dark:text-slate-500 hover:text-red-500 hover:scale-110'}`}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleWishlist(e);
            }}
          >
            <Heart className={`h-4 w-4 ${isInWishlist(product.id) ? 'fill-current' : ''}`} />
          </button>
        )}

        {/* Category Badge - Professional Look */}
        <div className="absolute bottom-4 left-4">
          <span className="bg-slate-900/10 dark:bg-white/10 backdrop-blur-md text-slate-900 dark:text-slate-200 px-3 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest border border-white/20 dark:border-white/10">
            {product.category_name}
          </span>
        </div>

        {/* Stock Status - Top Left */}
        <div className="absolute top-4 left-4">
          <div className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-full backdrop-blur-md border ${product.stock > 0 ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' : 'bg-rose-500/10 text-rose-600 border-rose-500/20'}`}>
            <div className={`h-1.5 w-1.5 rounded-full ${product.stock > 0 ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
            <span className="text-[8px] font-black uppercase tracking-widest">
              {product.stock > 0 ? 'In Stock' : 'Sold Out'}
            </span>
          </div>
        </div>
      </div>

      {/* Details */}
      <div className="p-4 md:p-5 flex-grow flex flex-col space-y-3">
        <div className="flex justify-between items-start">
          <div className="flex-grow">
            <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">{product.vendor_name}</p>
            <h3 className="text-base font-bold text-slate-900 dark:text-white line-clamp-2 leading-snug group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
              {product.name}
            </h3>
          </div>

          {/* Vendor Quick Actions */}
          {user?.role === 'vendor' && product.vendor === user.vendor_details?.id && (
            <div className="flex flex-col space-y-2 ml-4">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  window.location.href = `/vendor/edit-product/${product.id}`;
                }}
                className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/30 transition-all"
                title="Edit Product"
              >
                <Edit className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>

        <div className="mt-auto pt-4 border-t border-slate-50 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <p className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                ₹{parseFloat(product.selling_price).toLocaleString('en-IN')}
              </p>
              {parseFloat(product.mrp_price) > parseFloat(product.selling_price) && (
                <p className="text-xs font-bold text-slate-400 dark:text-slate-500 line-through">
                  ₹{parseFloat(product.mrp_price).toLocaleString('en-IN')}
                </p>
              )}
            </div>
            {product.discount_percentage > 0 && (
              <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">
                {product.discount_percentage}% OFF
              </p>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
