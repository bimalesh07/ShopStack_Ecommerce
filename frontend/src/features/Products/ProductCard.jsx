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
    <div className="group bg-white rounded-[20px] overflow-hidden border border-slate-100 hover:border-primary-100 hover:shadow-[0_20px_50px_rgba(0,0,0,0.05)] transition-all duration-500 flex flex-col h-full relative">
      {/* Product Image Section */}
      <div className="relative aspect-[3/4] overflow-hidden bg-slate-50">
        <img 
          src={product.images?.[0]?.image || 'https://via.placeholder.com/400x533'} 
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        
        {/* Quick View Overlay (Mobile Hidden) */}
        <div className="absolute inset-0 bg-slate-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <Link 
            to={`/products/${product.id}`}
            className="bg-white text-slate-900 px-6 py-2.5 rounded-full font-bold text-sm shadow-xl transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 hover:bg-primary-600 hover:text-white"
          >
            Quick View
          </Link>
        </div>

        {/* Wishlist Button */}
        {user?.role !== 'vendor' && (
          <button 
            className={`absolute top-4 right-4 p-2.5 bg-white/90 backdrop-blur-md rounded-full shadow-lg transition-all duration-300 z-10 ${isInWishlist(product.id) ? 'text-red-500' : 'text-slate-400 hover:text-red-500 hover:scale-110'}`}
            onClick={handleWishlist}
          >
            <Heart className={`h-4.5 w-4.5 ${isInWishlist(product.id) ? 'fill-current' : ''}`} />
          </button>
        )}

        {/* Category Badge */}
        <div className="absolute bottom-4 left-4">
          <span className="bg-primary-50 text-primary-700 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm border border-primary-100">
            {product.category_name}
          </span>
        </div>
      </div>

      {/* Product Details Section */}
      <div className="p-6 flex-grow flex flex-col">
        <div className="mb-3">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-1">{product.vendor_name}</p>
          <Link to={`/products/${product.id}`}>
            <h3 className="text-lg font-bold text-slate-900 line-clamp-2 leading-tight hover:text-primary-600 transition-colors">
              {product.name}
            </h3>
          </Link>
        </div>
        
        <div className="mt-auto pt-4 flex justify-between items-center border-t border-slate-50">
          <div className="space-y-0.5">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Price</p>
            <p className="text-xl font-black text-primary-600 tracking-tight">
              ${parseFloat(product.price).toFixed(2)}
            </p>
          </div>
          
          <div className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-full ${product.stock > 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
            <div className={`h-1.5 w-1.5 rounded-full ${product.stock > 0 ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className="text-[10px] font-black uppercase">
              {product.stock > 0 ? 'In Stock' : 'Sold Out'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
