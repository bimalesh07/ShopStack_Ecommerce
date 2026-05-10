import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import productService from '../../api/productService';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { ShoppingCart, ChevronLeft, Minus, Plus, ShieldCheck, Truck, RefreshCcw, Loader2, Info, Star } from 'lucide-react';
import toast from 'react-hot-toast';
import reviewService from '../../api/reviewService';
import ProductCard from './ProductCard';

const ProductDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [reviews, setReviews] = useState([]);
  const [ratingData, setRatingData] = useState({ average_rating: 0, review_count: 0 });
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);

  const handleAddToCart = async () => {
    if (!product) return;
    const success = await addToCart(product.id, quantity);
    if (!success && !user) {
      navigate('/login');
    }
  };

  const handleBuyItNow = async () => {
    if (!product) return;
    const success = await addToCart(product.id, quantity);
    if (success) {
      navigate('/checkout');
    } else if (!user) {
      navigate('/login');
    }
  };

  useEffect(() => {
    const fetchProductData = async () => {
      setLoading(true);
      try {
        const productData = await productService.getProductBySlug(slug);
        if (productData) {
          setProduct(productData);
          
          // Fetch related products
          try {
            const related = await productService.getProducts({ 
              category: productData.category,
              limit: 5 
            });
            // Filter out current product and take top 4
            setRelatedProducts(related.filter(p => p.id !== productData.id).slice(0, 4));
          } catch (relatedErr) {
            console.error('Failed to fetch related products:', relatedErr);
          }
        } else {
          navigate('/products');
          return;
        }

        try {
          const [reviewsData, ratingStats] = await Promise.all([
            reviewService.getProductReviews(productData.id),
            reviewService.getProductRating(productData.id)
          ]);
          setReviews(reviewsData);
          setRatingData(ratingStats);
        } catch (reviewErr) {
          console.error('Non-critical: Failed to fetch reviews:', reviewErr);
        }

      } catch (error) {
        console.error('Critical: Error fetching product:', error);
        toast.error('Failed to load product details');
      } finally {
        setLoading(false);
      }
    };

    fetchProductData();
  }, [slug, navigate]);

  const handleQuantity = (type) => {
    if (type === 'inc') setQuantity(prev => prev + 1);
    else if (type === 'dec' && quantity > 1) setQuantity(prev => prev - 1);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="h-12 w-12 animate-spin text-primary-600 mb-4" />
        <p className="text-slate-500 font-medium animate-pulse">Refining details...</p>
      </div>
    );
  }

  if (!product) return null;

  const currentImage = product.images?.[activeImageIndex]?.image || 'https://via.placeholder.com/600';

  return (
    <div className="container-tight">
      {/* Minimal Breadcrumb */}
      <nav className="flex items-center space-x-2 text-[10px] font-bold uppercase tracking-[0.2em] mb-8 text-slate-400">
        <button onClick={() => navigate('/products')} className="hover:text-primary-600 transition-colors">Shop</button>
        <span className="text-slate-200">/</span>
        <span className="text-slate-900 truncate">{product.category_name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">
        {/* Left: Refined Image Gallery */}
        <div className="space-y-4">
          <div className="relative aspect-square rounded-3xl overflow-hidden bg-white border border-slate-100 group shadow-sm p-8">
            <img 
              src={currentImage} 
              alt={product.name} 
              className="w-full h-full object-contain transition-transform duration-1000 group-hover:scale-105"
            />
            {product.stock <= 0 && (
              <div className="absolute inset-0 bg-white/70 backdrop-blur-[2px] flex items-center justify-center">
                <span className="text-rose-600 font-black uppercase tracking-[0.3em] text-sm">Sold Out</span>
              </div>
            )}
          </div>
          
          {/* Subtle Thumbnails */}
          {product.images?.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
              {product.images.map((img, i) => (
                <button 
                  key={i} 
                  onClick={() => setActiveImageIndex(i)}
                  className={`relative flex-shrink-0 w-12 h-12 rounded-xl overflow-hidden border transition-all ${
                    activeImageIndex === i 
                    ? 'border-slate-900 shadow-md ring-1 ring-slate-900' 
                    : 'border-slate-100 opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={img.image} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Minimalist Details */}
        <div className="flex flex-col space-y-6">
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-[10px] font-black uppercase tracking-[0.2em] text-primary-600">
              <span>{product.vendor_name}</span>
              <span className="text-slate-200">•</span>
              <div className="flex items-center space-x-0.5">
                <Star className="h-2.5 w-2.5 fill-current" />
                <span className="text-slate-900">{ratingData.average_rating}</span>
              </div>
            </div>
            
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
              {product.name}
            </h1>
            
            <div className="flex items-baseline space-x-3">
              <span className="text-3xl font-black text-slate-900 tracking-tighter">
                ₹{parseFloat(product.selling_price).toLocaleString('en-IN')}
              </span>
              <span className="text-lg font-bold text-slate-400 line-through">
                ₹{parseFloat(product.mrp_price).toLocaleString('en-IN')}
              </span>
              {product.discount_percentage > 0 && (
                <span className="text-sm font-black text-green-600 uppercase tracking-widest bg-green-50 px-3 py-1 rounded-lg">
                  {product.discount_percentage}% OFF
                </span>
              )}
            </div>
          </div>

          <div className="border-t border-slate-100 pt-8">
            <p className="text-slate-600 leading-relaxed font-medium text-base max-w-lg">
              {product.description}
            </p>
          </div>

          {/* Compact Actions */}
          <div className="space-y-6 pt-4">
            {user?.role !== 'vendor' ? (
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center bg-slate-50 rounded-xl p-1 border border-slate-100/50">
                    <button onClick={() => handleQuantity('dec')} className="w-8 h-8 flex items-center justify-center hover:bg-white rounded-lg transition-all text-slate-400" disabled={quantity <= 1}><Minus className="h-3 w-3" /></button>
                    <span className="w-8 text-center text-xs font-bold text-slate-900">{quantity}</span>
                    <button onClick={() => handleQuantity('inc')} className="w-8 h-8 flex items-center justify-center hover:bg-white rounded-lg transition-all text-slate-400" disabled={quantity >= product.stock}><Plus className="h-3 w-3" /></button>
                  </div>
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {product.stock > 0 ? `In Stock` : 'Out of Stock'}
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <button 
                    onClick={handleAddToCart}
                    disabled={product.stock <= 0}
                    className="flex-1 h-14 bg-slate-900 text-white rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-slate-800 transition-all active:scale-[0.98] disabled:opacity-50 shadow-xl shadow-slate-900/10 flex items-center justify-center space-x-3"
                  >
                    <ShoppingCart className="h-4 w-4" />
                    <span>Add to Bag</span>
                  </button>
                  <button 
                    onClick={handleBuyItNow}
                    disabled={product.stock <= 0}
                    className="flex-1 h-14 bg-white border border-slate-200 text-slate-900 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-slate-50 transition-all active:scale-[0.98] disabled:opacity-30"
                  >
                    Buy Now
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="flex items-center space-x-2 text-amber-600 mb-2">
                  <ShieldCheck className="h-4 w-4" />
                  <span className="text-[10px] font-black uppercase tracking-wider">Vendor View</span>
                </div>
                {product.vendor === user.id && (
                  <button onClick={() => navigate(`/vendor/edit-product/${product.id}`)} className="w-full py-2.5 bg-white border border-slate-200 rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all">Edit Product</button>
                )}
              </div>
            )}
          </div>

          {/* Minimalist Trust Badges */}
          <div className="flex items-center space-x-6 pt-6 text-slate-400">
            <div className="flex items-center space-x-2">
              <Truck className="h-3.5 w-3.5" />
              <span className="text-[9px] font-bold uppercase tracking-widest">Free Shipping</span>
            </div>
            <div className="flex items-center space-x-2">
              <RefreshCcw className="h-3.5 w-3.5" />
              <span className="text-[9px] font-bold uppercase tracking-widest">30d Return</span>
            </div>
          </div>
        </div>
      </div>

      {/* Compact Reviews Section */}
      <div className="mt-6 pt-6 border-t border-slate-100">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Product Reviews</h2>
            <div className="flex items-center space-x-3 mt-1">
              <div className="flex items-center space-x-1 text-amber-400">
                {[1, 2, 3, 4, 5].map(s => <Star key={s} className={`h-3 w-3 ${ratingData.average_rating >= s ? 'fill-current' : 'text-slate-100'}`} />)}
              </div>
              <span className="text-xs font-medium text-slate-400">{ratingData.average_rating} avg / {ratingData.review_count} reviews</span>
            </div>
          </div>
        </div>

        {reviews.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {reviews.map((review) => (
              <div key={review.id} className="p-6 bg-slate-50/50 rounded-2xl border border-slate-100/50 space-y-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <div className="h-6 w-6 rounded-lg bg-white shadow-sm flex items-center justify-center text-[10px] font-bold text-slate-900 uppercase">
                      {review.user_name?.charAt(0)}
                    </div>
                    <span className="text-xs font-bold text-slate-900">{review.user_name}</span>
                  </div>
                  <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">{new Date(review.created_at).toLocaleDateString()}</span>
                </div>
                <p className="text-slate-600 text-sm leading-relaxed italic">"{review.comment}"</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center bg-slate-50/50 rounded-3xl border border-dashed border-slate-100">
            <p className="text-xs font-medium text-slate-400">No reviews yet for this product.</p>
          </div>
        )}
      </div>
      {/* Related Products Section */}
      {relatedProducts.length > 0 && (
        <div className="mt-6 pt-6 border-t border-slate-100">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">You May Also Like</h2>
              <p className="text-xs font-medium text-slate-400 mt-1 uppercase tracking-widest">Handpicked for you based on this category</p>
            </div>
            <button 
              onClick={() => navigate('/products')}
              className="text-[10px] font-black uppercase tracking-[0.2em] text-primary-600 hover:text-primary-700 transition-colors"
            >
              View All
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {relatedProducts.map((relatedProduct) => (
              <ProductCard key={relatedProduct.id} product={relatedProduct} />
            ))}
          </div>
        </div>
      )}

      {isReviewModalOpen && selectedProduct && (
        <ReviewModal
          isOpen={isReviewModalOpen}
          product={selectedProduct}
          onClose={() => setIsReviewModalOpen(false)}
        />
      )}
    </div>
  );
};

export default ProductDetail;
