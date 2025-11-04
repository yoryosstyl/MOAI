'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from '@/contexts/LanguageContext';
import RatingInput from './RatingInput';
import { saveReview, deleteReview } from '@/utils/reviews';

export default function ReviewForm({ toolkitId, existingReview, onReviewSubmitted, onCancel }) {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [rating, setRating] = useState(existingReview?.rating || 0);
  const [review, setReview] = useState(existingReview?.review || '');
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (existingReview) {
      setRating(existingReview.rating || 0);
      setReview(existingReview.review || '');
    }
  }, [existingReview]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      alert(t('reviewForm.pleaseSignIn'));
      return;
    }

    if (rating === 0) {
      alert(t('reviewForm.pleaseSelectRating'));
      return;
    }

    setSubmitting(true);
    try {
      await saveReview({
        userId: user.uid,
        userName: user.displayName || user.email,
        toolkitId,
        rating,
        review: review.trim(),
        existingReviewId: existingReview?.id || null,
      });

      // Reset form if new review
      if (!existingReview) {
        setRating(0);
        setReview('');
      }

      if (onReviewSubmitted) {
        onReviewSubmitted();
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      alert(t('reviewForm.failedToSubmit'));
    }
    setSubmitting(false);
  };

  const handleDelete = async () => {
    if (!confirm(t('reviewForm.confirmDelete'))) return;

    setDeleting(true);
    try {
      await deleteReview(existingReview.id);
      if (onReviewSubmitted) {
        onReviewSubmitted();
      }
    } catch (error) {
      console.error('Error deleting review:', error);
      alert(t('reviewForm.failedToDelete'));
    }
    setDeleting(false);
  };

  if (!user) {
    return (
      <div className="bg-gray-50 rounded-lg p-6 text-center">
        <p className="text-gray-600">{t('reviewForm.pleaseSignIn')}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        {existingReview ? t('reviewForm.editReview') : t('reviewForm.writeReview')}
      </h3>

      {/* Rating */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t('reviewForm.rating')} <span className="text-red-500">*</span>
        </label>
        <RatingInput value={rating} onChange={setRating} size="lg" />
      </div>

      {/* Review Text */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t('reviewForm.reviewOptional')}
        </label>
        <textarea
          value={review}
          onChange={(e) => setReview(e.target.value)}
          rows={4}
          className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder={t('reviewForm.reviewPlaceholder')}
        />
      </div>

      {/* Buttons */}
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={submitting || rating === 0}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? t('reviewForm.submitting') : existingReview ? t('reviewForm.updateReview') : t('reviewForm.submitReview')}
        </button>

        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={submitting || deleting}
            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition disabled:opacity-50"
          >
            {t('reviewForm.cancel')}
          </button>
        )}

        {existingReview && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting || submitting}
            className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed ml-auto"
          >
            {deleting ? t('reviewForm.deleting') : t('reviewForm.deleteReview')}
          </button>
        )}
      </div>
    </form>
  );
}
