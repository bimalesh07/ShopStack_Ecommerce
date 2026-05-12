import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import productService from '../../api/productService';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { ShoppingCart, ChevronLeft, Minus, Plus, ShieldCheck, Truck, RefreshCcw, Loader2, Info, Star, Edit, Package, ArrowRight, Store, Heart, Share2 } from 'lucide-react';
import toast from 'react-hot-toast';
import reviewService from '../../api/reviewService';
import { useWishlist } from '../../context/WishlistContext';
import ProductCard from './ProductCard';
import ReviewModal from '../../components/ReviewModal';


const getInitials = (name) => {
  if (!name) return 'U';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].substring(0, 1).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase().substring(0, 2);
};

const getAvatarColor = (name) => {
  if (!name) return 'bg-slate-900';
  const colors = [
    'bg-slate-900', 'bg-sky-600', 'bg-indigo-600',
    'bg-emerald-600', 'bg-rose-600', 'bg-amber-600',
    'bg-violet-600', 'bg-fuchsia-600'
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};


const ProductDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const { wishlist, addToWishlist, removeFromWishlist } = useWishlist();
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

  // Fetch data on load
  useEffect(() => {
    const fetchProductData = async () => {
      setLoading(true);
      try {
        const productData = await productService.getProductBySlug(slug);
        if (productData) {
          setProduct(productData);

          // Get related items
          try {
            const related = await productService.getProducts({
              category: productData.category,
              limit: 5
            });
            setRelatedProducts(related.filter(p => p.id !== productData.id).slice(0, 4));
          } catch (relatedErr) {
            console.error('Related error:', relatedErr);
          }
        } else {
          navigate('/products');
          return;
        }

        // Get reviews
        try {
          const [reviewsData, ratingStats] = await Promise.all([
            reviewService.getProductReviews(productData.id),
            reviewService.getProductRating(productData.id)
          ]);
          setReviews(reviewsData);
          setRatingData(ratingStats);
        } catch (reviewErr) {
          console.error('Review error:', reviewErr);
        }

      } catch (error) {
        console.error('Fetch error:', error);
        toast.error('Failed to load product');
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

  const handleShare = async () => {
    const shareData = {
      title: product.name,
      text: `Check out this amazing product on ShopStack: ${product.name}`,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast.success('Link copied to clipboard!', {
          style: {
            background: '#0F172A',
            color: '#fff',
            borderRadius: '12px',
            fontSize: '12px',
            fontWeight: '900',
            textTransform: 'uppercase',
            letterSpacing: '0.1em'
          }
        });
      }
    } catch (err) {
      console.error('Error sharing:', err);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 transition-colors duration-500">
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8 selection:bg-slate-900 selection:text-white dark:selection:bg-white dark:selection:text-slate-950">
        {/* 1. Layout & Image Gallery (Two-column desktop) */}
        <div className="lg:grid lg:grid-cols-2 lg:gap-x-16 lg:items-start">

          {/* Gallery Column */}
          <div className="flex flex-col">
            <div className="w-full aspect-square rounded-2xl bg-slate-200 dark:bg-slate-800 animate-pulse overflow-hidden border border-slate-100 dark:border-slate-800 relative group">
              <img
                src={currentImage.replace('/upload/', '/upload/q_auto,f_auto,w_600/')}
                alt={product.name}
                loading="eager"
                className="w-full h-full object-contain p-4 md:p-16 transition-transform duration-700 group-hover:scale-105"
              />
              {product.stock <= 0 && (
                <div className="absolute inset-0 bg-white/60 dark:bg-slate-950/60 backdrop-blur-sm flex items-center justify-center">
                  <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-900 dark:text-white border-2 border-slate-900 dark:border-white px-4 py-2">Out of Stock</span>
                </div>
              )}
            </div>

            {/* Thumbnail Strip */}
            {product.images?.length > 1 && (
              <div className="mt-6 grid grid-cols-4 gap-4">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImageIndex(i)}
                    className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all ${activeImageIndex === i ? 'border-slate-900 dark:border-white ring-2 ring-slate-900/10' : 'border-transparent opacity-50 hover:opacity-100'
                      }`}
                  >
                    <div className="w-full h-full bg-slate-200 dark:bg-slate-800 animate-pulse">
                      <img 
                        src={img.image.replace('/upload/', '/upload/q_auto,f_auto,w_600/')} 
                        alt="" 
                        loading="lazy"
                        className="w-full h-full object-cover" 
                      />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 2. Product Info & Typography (Right Column) */}
          <div className="mt-10 px-4 sm:px-0 sm:mt-16 lg:mt-0 space-y-8">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500">{product.category_name}</span>
                <div className="flex items-center space-x-1 text-amber-400">
                  <Star className="h-3 w-3 fill-current" />
                  <span className="text-[10px] font-black text-slate-900 dark:text-white">{ratingData.average_rating}</span>
                </div>
              </div>
              <h1 className="text-2xl md:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
                {product.name}
              </h1>
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <p className="text-2xl md:text-3xl font-medium text-slate-900 dark:text-white">₹{parseFloat(product.selling_price).toLocaleString('en-IN')}</p>
                {parseFloat(product.mrp_price) > parseFloat(product.selling_price) && (
                  <div className="flex items-center space-x-3">
                    <p className="text-lg text-slate-400 dark:text-slate-600 line-through">₹{parseFloat(product.mrp_price).toLocaleString('en-IN')}</p>
                    <span className="bg-emerald-100/50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 text-[11px] font-[900] px-3 py-1 rounded-full uppercase tracking-[0.15em] shadow-sm">
                      {product.discount_percentage}% OFF
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4 pt-6 border-t border-slate-100 dark:border-slate-800">
              <h3 className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-widest">Product Details</h3>
              <div className="text-base text-slate-600 dark:text-slate-300 leading-relaxed space-y-4">
                <div
                  className="prose prose-slate dark:prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: product.description }}
                />
              </div>
            </div>

            {/* 3. Premium Buttons & Interaction */}
            <div className="space-y-6 pt-8">
              {user?.role !== 'vendor' ? (
                <div className="space-y-6">
                  <div className="flex items-center space-x-6">
                    <div className="flex items-center border border-slate-200 dark:border-slate-800 rounded-full p-1 group">
                      <button onClick={() => handleQuantity('dec')} className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors" disabled={quantity <= 1}><Minus className="h-4 w-4" /></button>
                      <span className="w-12 text-center text-sm font-bold text-slate-900 dark:text-white">{quantity}</span>
                      <button onClick={() => handleQuantity('inc')} className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors" disabled={quantity >= product.stock}><Plus className="h-4 w-4" /></button>
                    </div>
                    <p className={`text-[10px] font-black uppercase tracking-widest ${product.stock > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600'}`}>
                      {product.stock > 0 ? `${product.stock} Units left` : 'Out of Stock'}
                    </p>
                  </div>
                  <div className="flex flex-col space-y-4">
                    <div className="flex flex-col sm:flex-row gap-3">
                      <button
                        onClick={handleAddToCart}
                        disabled={product.stock <= 0}
                        className="w-full sm:flex-1 bg-white dark:bg-sky-500 border border-slate-200 dark:border-transparent text-slate-900 dark:text-white h-14 md:h-16 rounded-2xl md:rounded-full font-bold text-[10px] md:text-sm uppercase tracking-[0.2em] md:tracking-[0.3em] transition-all duration-300 hover:bg-slate-50 dark:hover:bg-sky-400 hover:border-slate-900 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center space-x-3 shadow-sm dark:shadow-lg dark:shadow-sky-500/20"
                      >
                        <ShoppingCart className="h-4 w-4" />
                        <span>Add to Bag</span>
                      </button>
                      <button
                        onClick={handleBuyItNow}
                        disabled={product.stock <= 0}
                        className="w-full sm:flex-1 bg-slate-900 dark:bg-white text-white dark:text-slate-900 h-14 md:h-16 rounded-2xl md:rounded-full font-bold text-[10px] md:text-sm uppercase tracking-[0.2em] md:tracking-[0.3em] transition-all duration-300 hover:bg-slate-800 dark:hover:bg-slate-100 hover:scale-[1.01] active:scale-[0.98] disabled:opacity-50 flex items-center justify-center space-x-3 shadow-xl shadow-slate-900/20 dark:shadow-white/5"
                      >
                        <ArrowRight className="h-4 w-4" />
                        <span>Buy Now</span>
                      </button>
                      <button 
                        onClick={handleShare}
                        className="w-full sm:h-14 sm:w-14 md:h-16 md:w-16 h-14 flex items-center justify-center rounded-2xl md:rounded-full border border-slate-200 dark:border-slate-800 hover:border-slate-900 dark:hover:border-white hover:bg-slate-50 dark:hover:bg-slate-900 transition-all active:scale-95 group flex-shrink-0"
                      >
                        <span className="sm:hidden text-[10px] font-black uppercase tracking-widest mr-3">Share Piece</span>
                        <Share2 className="h-4 w-4 md:h-5 md:w-5 text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white" />
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-6 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-slate-900 dark:bg-white rounded-xl flex items-center justify-center text-white dark:text-slate-900 font-black text-xs uppercase">VB</div>
                    <div>
                      <p className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">Merchant Console</p>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-widest">Administrative Access</p>
                    </div>
                  </div>
                  <button onClick={() => navigate(`/vendor/edit-product/${product.id}`)} className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-[0.2em] hover:underline transition-all">Edit Listing</button>
                </div>
              )}
            </div>

            {/* 5. Spacing & Trusted Badges */}
            <div className="grid grid-cols-2 gap-6 pt-8 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-slate-50 dark:bg-slate-900 rounded-full flex items-center justify-center text-slate-900 dark:text-white"><Truck className="h-4 w-4" /></div>
                <div>
                  <p className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-widest">Global Express</p>
                  <p className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest">Fast Delivery</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-slate-50 dark:bg-slate-900 rounded-full flex items-center justify-center text-slate-900 dark:text-white"><ShieldCheck className="h-4 w-4" /></div>
                <div>
                  <p className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-widest">Certified Quality</p>
                  <p className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest">Guaranteed</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 4. Review Section (Modern Look) */}
        <section className="mt-24 pt-16 border-t border-slate-100 dark:border-slate-800">
          <div className="lg:grid lg:grid-cols-12 lg:gap-x-16 items-start">

            {/* Rating Summary Bar */}
            <div className="lg:col-span-4 space-y-8">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Customer Testimonials</h2>
                <div className="mt-4 flex items-center space-x-6">
                  <span className="text-6xl font-bold text-slate-900 dark:text-white tracking-tighter">{ratingData.average_rating}</span>
                  <div className="space-y-1">
                    <div className="flex items-center space-x-1 text-amber-400">
                      {[1, 2, 3, 4, 5].map(s => <Star key={s} className={`h-4 w-4 ${ratingData.average_rating >= s ? 'fill-current' : 'text-slate-100 dark:text-slate-800'}`} />)}
                    </div>
                    <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Based on {ratingData.review_count} reviews</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                {[5, 4, 3, 2, 1].map((star) => (
                  <div key={star} className="flex items-center space-x-4">
                    <span className="text-xs font-bold text-slate-400 dark:text-slate-500 w-3">{star}</span>
                    <div className="flex-grow h-1.5 bg-slate-50 dark:bg-slate-900 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-slate-900 dark:bg-white rounded-full transition-all duration-1000"
                        style={{ width: `${ratingData.average_rating >= star ? '85%' : '10%'}` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Individual Reviews */}
            <div className="mt-16 lg:mt-0 lg:col-span-8">
              <div className="grid grid-cols-1 gap-12">
                {reviews.length > 0 ? (
                  reviews.map((review) => (
                    <div key={review.id} className="pb-12 border-b border-slate-50 dark:border-slate-900 last:border-0">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center space-x-4">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-black text-sm shadow-lg uppercase ring-2 ring-white dark:ring-slate-900 ${getAvatarColor(review.user_name)}`}>
                            {getInitials(review.user_name)}
                          </div>
                          <div>
                            <div className="flex items-center space-x-2">
                              <p className="text-sm font-bold text-slate-900 dark:text-white">{review.user_name}</p>
                              <div className="flex items-center space-x-1 px-2 py-0.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-full">
                                <ShieldCheck className="h-3 w-3" />
                                <span className="text-[8px] font-black uppercase">Verified Purchase</span>
                              </div>
                            </div>
                            <p className="text-[10px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                              {new Date(review.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-1 text-amber-400">
                          {[1, 2, 3, 4, 5].map(s => <Star key={s} className="h-3 w-3 fill-current" />)}
                        </div>
                      </div>
                      <p className="mt-6 text-slate-600 dark:text-slate-400 leading-relaxed italic text-base">"{review.comment}"</p>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-20 bg-slate-50/50 dark:bg-slate-900/50 rounded-[3rem] border border-dashed border-slate-200 dark:border-slate-800">
                    <Star className="h-10 w-10 text-slate-200 dark:text-slate-700 mx-auto mb-4" />
                    <p className="text-[10px] font-black text-slate-400 dark:text-slate-300 uppercase tracking-widest">No reviews yet for this masterpiece</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Related Products Section (Curated Selection) */}
        {relatedProducts.length > 0 && (
          <div className="mt-32 pt-20 border-t border-slate-100 dark:border-slate-800">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 space-y-4 md:space-y-0">
              <div className="space-y-3">
                <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.4em]">Curated For You</span>
                <h2 className="text-4xl font-bold text-slate-900 dark:text-white tracking-tight">You May Also Like</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium max-w-lg">Discover more premium pieces from our {product.category_name} collection, handpicked to complement your style.</p>
              </div>
              <button
                onClick={() => navigate('/products')}
                className="group flex items-center space-x-3 text-[10px] font-black uppercase tracking-[0.2em] text-slate-900 dark:text-white transition-all"
              >
                <span className="border-b-2 border-slate-900 dark:border-white pb-1 group-hover:border-slate-300 dark:group-hover:border-slate-600 transition-colors">Explore All</span>
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
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
    </div>
  );
};

export default ProductDetail;
