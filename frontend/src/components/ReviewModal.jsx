import React, { useState } from 'react';
import { Star, X, Loader2 } from 'lucide-react';
import reviewService from '../api/reviewService';
import toast from 'react-hot-toast';

const ReviewModal = ({ product, isOpen, onClose, onSuccess }) => {
  const [rating, setRating] = useState(5);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (comment.length < 10) {
      toast.error('Please write at least 10 characters.');
      return;
    }

    setLoading(true);
    try {
      await reviewService.createReview(product.id, { rating, comment });
      toast.success('Thank you for your review!');
      onSuccess?.();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.error || err.response?.data?.non_field_errors?.[0] || 'Failed to submit review');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in duration-300">
        <div className="p-8">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">Review Product</h3>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
              <X className="h-6 w-6 text-slate-400" />
            </button>
          </div>

          <div className="flex items-center space-x-4 mb-8 bg-slate-50 p-4 rounded-2xl">
            <div className="h-16 w-16 rounded-xl bg-white shadow-sm overflow-hidden border border-slate-100">
              <img src={product.image} alt="" className="w-full h-full object-cover" />
            </div>
            <div>
              <p className="font-bold text-slate-900 line-clamp-1">{product.name}</p>
              <p className="text-xs text-slate-500 font-medium">Delivered on your recent order</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-3">
              <label className="block text-sm font-bold text-slate-700 uppercase tracking-wider">Your Rating</label>
              <div className="flex space-x-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    className="p-1 transition-transform active:scale-90"
                    onMouseEnter={() => setHover(star)}
                    onMouseLeave={() => setHover(0)}
                    onClick={() => setRating(star)}
                  >
                    <Star
                      className={`h-8 w-8 transition-colors ${
                        (hover || rating) >= star ? 'fill-amber-400 text-amber-400' : 'text-slate-200'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-bold text-slate-700 uppercase tracking-wider">Share your thoughts</label>
              <textarea
                required
                rows="4"
                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all font-medium"
                placeholder="How was the quality? Would you recommend it?"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black hover:bg-primary-600 transition-all flex items-center justify-center space-x-2 shadow-xl shadow-slate-900/10 active:scale-[0.98]"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <span>Submit Review</span>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ReviewModal;
