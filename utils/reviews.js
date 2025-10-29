import { collection, query, where, orderBy, getDocs, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

/**
 * Get all reviews for a toolkit
 */
export async function getToolkitReviews(toolkitId) {
  try {
    const reviewsRef = collection(db, 'reviews');
    const q = query(
      reviewsRef,
      where('toolkitId', '==', toolkitId),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return [];
  }
}

/**
 * Get user's review for a specific toolkit
 */
export async function getUserReview(userId, toolkitId) {
  try {
    const reviewsRef = collection(db, 'reviews');
    const q = query(
      reviewsRef,
      where('userId', '==', userId),
      where('toolkitId', '==', toolkitId)
    );
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      return {
        id: querySnapshot.docs[0].id,
        ...querySnapshot.docs[0].data(),
      };
    }
    return null;
  } catch (error) {
    console.error('Error fetching user review:', error);
    return null;
  }
}

/**
 * Add or update a review
 */
export async function saveReview({ userId, userName, toolkitId, rating, review, existingReviewId = null }) {
  try {
    const reviewData = {
      userId,
      userName,
      toolkitId,
      rating,
      review: review || '',
      updatedAt: serverTimestamp(),
    };

    if (existingReviewId) {
      // Update existing review
      const reviewRef = doc(db, 'reviews', existingReviewId);
      await updateDoc(reviewRef, reviewData);
      return existingReviewId;
    } else {
      // Create new review
      reviewData.createdAt = serverTimestamp();
      const docRef = await addDoc(collection(db, 'reviews'), reviewData);
      return docRef.id;
    }
  } catch (error) {
    console.error('Error saving review:', error);
    throw error;
  }
}

/**
 * Delete a review
 */
export async function deleteReview(reviewId) {
  try {
    await deleteDoc(doc(db, 'reviews', reviewId));
  } catch (error) {
    console.error('Error deleting review:', error);
    throw error;
  }
}

/**
 * Calculate average rating for a toolkit
 */
export async function getToolkitAverageRating(toolkitId) {
  try {
    const reviews = await getToolkitReviews(toolkitId);
    if (reviews.length === 0) {
      return { average: 0, count: 0 };
    }

    const total = reviews.reduce((sum, review) => sum + (review.rating || 0), 0);
    const average = total / reviews.length;

    return {
      average: Math.round(average * 10) / 10, // Round to 1 decimal place
      count: reviews.length,
    };
  } catch (error) {
    console.error('Error calculating average rating:', error);
    return { average: 0, count: 0 };
  }
}
