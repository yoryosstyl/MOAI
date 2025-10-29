'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { checkIsFavorited, addFavorite, removeFavorite } from '@/utils/favorites';

export default function FavoriteButton({ toolkitId, showCount = false, favoriteCount: initialCount = 0 }) {
  const { user } = useAuth();
  const [isFavorited, setIsFavorited] = useState(false);
  const [favoriteId, setFavoriteId] = useState(null);
  const [favoriteCount, setFavoriteCount] = useState(initialCount);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const checkFavoriteStatus = async () => {
      if (user && toolkitId) {
        const favId = await checkIsFavorited(user.uid, toolkitId);
        if (favId) {
          setIsFavorited(true);
          setFavoriteId(favId);
        }
      }
    };

    checkFavoriteStatus();
  }, [user, toolkitId]);

  const handleToggleFavorite = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      alert('Please sign in to favorite toolkits');
      return;
    }

    setLoading(true);
    try {
      if (isFavorited && favoriteId) {
        // Remove favorite
        await removeFavorite(favoriteId);
        setIsFavorited(false);
        setFavoriteId(null);
        if (showCount) {
          setFavoriteCount((prev) => Math.max(0, prev - 1));
        }
      } else {
        // Add favorite
        const newFavId = await addFavorite(user.uid, toolkitId);
        setIsFavorited(true);
        setFavoriteId(newFavId);
        if (showCount) {
          setFavoriteCount((prev) => prev + 1);
        }
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      alert('Failed to update favorite');
    }
    setLoading(false);
  };

  return (
    <button
      onClick={handleToggleFavorite}
      disabled={loading}
      className={`flex items-center gap-1 px-3 py-1.5 rounded-md transition ${
        isFavorited
          ? 'bg-red-100 text-red-600 hover:bg-red-200'
          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
      } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
      aria-label={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
    >
      <svg
        className="w-5 h-5"
        fill={isFavorited ? 'currentColor' : 'none'}
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        />
      </svg>
      {showCount && <span className="text-sm font-medium">{favoriteCount}</span>}
    </button>
  );
}
