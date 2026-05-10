import React from 'react';
import { Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useWishlist } from '../../context/WishlistContext';

const ProductCard = ({ product }) => {
  const { user } = useAuth();
  const { addToWishlist, isInWishlist } = useWishlist();

  const handleWishlist = (e) => {
    e.preventDefault();
    if (!user) return;
    addToWishlist(product.id);
  };

  return (
    <Link 
      to={`/products/${product.slug}`}
      className="group bg-white rounded-[24px] overflow-hidden border border-slate-100 hover:border-slate-200 hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] transition-all duration-500 flex flex-col h-full relative"
    >
      {/* Product Image Section */}
      <div className="relative aspect-square overflow-hidden bg-white p-2">
        <img 
          src={product.images?.[0]?.image || 'https://via.placeholder.com/400x533'} 
          alt={product.name}
          className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-105"
        />
        
        {/* Wishlist Button */}
        {user?.role !== 'vendor' && (
          <button 
            className={`absolute top-3 right-3 p-2 bg-white/80 backdrop-blur-xl border border-slate-200/50 rounded-full shadow-lg transition-all duration-300 z-10 ${isInWishlist(product.id) ? 'text-red-500' : 'text-slate-400 hover:text-red-500 hover:scale-110'}`}
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
          <span className="bg-slate-900/5 backdrop-blur-md text-slate-900 px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border border-slate-900/5">
            {product.category_name}
          </span>
        </div>
      </div>

      {/* Product Details Section */}
      <div className="p-5 flex-grow flex flex-col space-y-3">
        <div>
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">{product.vendor_name}</p>
          <h3 className="text-base font-bold text-slate-900 line-clamp-2 leading-snug group-hover:text-primary-600 transition-colors">
            {product.name}
          </h3>
        </div>
        
        <div className="mt-auto pt-4 flex justify-between items-center border-t border-slate-50">
          <div className="flex flex-col">
            <div className="flex items-center space-x-2">
              <p className="text-xl font-black text-slate-900 tracking-tight">
                ₹{parseFloat(product.selling_price).toLocaleString('en-IN')}
              </p>
              <p className="text-sm font-bold text-slate-400 line-through">
                ₹{parseFloat(product.mrp_price).toLocaleString('en-IN')}
              </p>
            </div>
            {product.discount_percentage > 0 && (
              <p className="text-[10px] font-black text-green-600 uppercase tracking-widest mt-0.5">
                {product.discount_percentage}% OFF
              </p>
            )}
          </div>
          
          <div className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-full ${product.stock > 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
            <div className={`h-1.5 w-1.5 rounded-full ${product.stock > 0 ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className="text-[10px] font-black uppercase">
              {product.stock > 0 ? 'In Stock' : 'Sold Out'}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
