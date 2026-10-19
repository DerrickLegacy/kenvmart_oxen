import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { productsApi } from '../../services/api';

export default function ReviewModal({ productId, isOpen, onClose, onReviewSubmitted }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hoveredRating, setHoveredRating] = useState(0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating < 1 || rating > 5) {
      toast.error('Please select a rating between 1 and 5');
      return;
    }

    setIsSubmitting(true);
    try {
      await productsApi.submitReview(productId, { rating, comment });
      toast.success('Review submitted successfully!');
      onReviewSubmitted?.();
      onClose();
    } catch (err) {
      toast.error(err.message || 'Failed to submit review');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal fade show d-block" tabIndex="-1" style={{ background: 'rgba(0,0,0,0.5)', zIndex: 100000 }}>
      <div className="modal-dialog modal-dialog-centered">
        <motion.div
          className="modal-content"
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          style={{ borderRadius: '16px', border: 'none', overflow: 'hidden' }}
        >
          <div className="modal-header border-0 p-4 pb-0">
            <h5 className="modal-title fw-bold">Write a Review</h5>
            <button type="button" className="btn-close" onClick={onClose} aria-label="Close"></button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="modal-body p-4">
              <div className="mb-4 text-center">
                <label className="form-label d-block mb-3 fw-semibold">Overall Rating</label>
                <div className="d-flex justify-content-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoveredRating(star)}
                      onMouseLeave={() => setHoveredRating(0)}
                      className="btn p-0 border-0"
                      style={{ background: 'none' }}
                    >
                      <i
                        className={`lni ${(hoveredRating || rating) >= star ? 'lni-star-filled' : 'lni-star'}`}
                        style={{ fontSize: '32px', color: (hoveredRating || rating) >= star ? '#FF9410' : '#e2e8f0', transition: 'color 0.2s' }}
                      />
                    </button>
                  ))}
                </div>
                <div className="mt-2 text-muted small">
                  {rating === 5 ? 'Excellent' : rating === 4 ? 'Very Good' : rating === 3 ? 'Good' : rating === 2 ? 'Fair' : 'Poor'}
                </div>
              </div>

              <div className="mb-3">
                <label htmlFor="comment" className="form-label fw-semibold">Review Details</label>
                <textarea
                  id="comment"
                  className="form-control"
                  rows="4"
                  placeholder="What did you like or dislike about this product?"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  style={{ borderRadius: '12px', padding: '12px', border: '1px solid #e2e8f0' }}
                />
              </div>

              <div className="bg-light p-3 rounded-3 mb-0" style={{ fontSize: '13px', color: '#64748b' }}>
                Your review will be public and might be used to help others.
              </div>
            </div>

            <div className="modal-footer border-0 p-4 pt-0 gap-2">
              <button
                type="button"
                className="btn w-100 py-2 fw-semibold"
                onClick={onClose}
                style={{ background: '#f8fafc', color: '#475569', borderRadius: '10px', border: 'none' }}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn w-100 py-2 fw-semibold"
                disabled={isSubmitting}
                style={{ background: '#183B9B', color: '#fff', borderRadius: '10px', border: 'none' }}
              >
                {isSubmitting ? (
                  <><span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Submitting...</>
                ) : 'Submit Review'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
