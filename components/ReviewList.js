'use client';

import { useState } from 'react';
import RatingDisplay from './RatingDisplay';

export default function ReviewList({ reviews, currentUserId, onEditReview }) {
  if (!reviews || reviews.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No reviews yet. Be the first to review this toolkit!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <div key={review.id} className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h4 className="font-semibold text-gray-900">{review.userName}</h4>
                {review.userId === currentUserId && (
                  <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded">
                    Your review
                  </span>
                )}
              </div>
              <RatingDisplay rating={review.rating} size="sm" />
            </div>

            {/* Edit button for own review */}
            {review.userId === currentUserId && onEditReview && (
              <button
                onClick={() => onEditReview(review)}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Edit
              </button>
            )}
          </div>

          {/* Review text */}
          {review.review && review.review.trim() && (
            <p className="text-gray-700 mb-3">{review.review}</p>
          )}

          {/* Date */}
          <p className="text-xs text-gray-400">
            {review.createdAt
              ? new Date(
                  review.createdAt.toDate
                    ? review.createdAt.toDate()
                    : review.createdAt
                ).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })
              : 'Recently'}
            {review.updatedAt && review.updatedAt !== review.createdAt && ' (edited)'}
          </p>
        </div>
      ))}
    </div>
  );
}
