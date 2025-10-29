import { collection, query, where, getDocs, addDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

/**
 * Check if user has favorited a toolkit
 */
export async function checkIsFavorited(userId, toolkitId) {
  try {
    const favoritesRef = collection(db, 'favorites');
    const q = query(
      favoritesRef,
      where('userId', '==', userId),
      where('toolkitId', '==', toolkitId)
    );
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty ? querySnapshot.docs[0].id : null;
  } catch (error) {
    console.error('Error checking favorite status:', error);
    return null;
  }
}

/**
 * Add toolkit to favorites
 */
export async function addFavorite(userId, toolkitId) {
  try {
    const docRef = await addDoc(collection(db, 'favorites'), {
      userId,
      toolkitId,
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding favorite:', error);
    throw error;
  }
}

/**
 * Remove toolkit from favorites
 */
export async function removeFavorite(favoriteId) {
  try {
    await deleteDoc(doc(db, 'favorites', favoriteId));
  } catch (error) {
    console.error('Error removing favorite:', error);
    throw error;
  }
}

/**
 * Get all favorites for a user
 */
export async function getUserFavorites(userId) {
  try {
    const favoritesRef = collection(db, 'favorites');
    const q = query(
      favoritesRef,
      where('userId', '==', userId)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error('Error fetching user favorites:', error);
    return [];
  }
}

/**
 * Get favorite count for a toolkit
 */
export async function getToolkitFavoriteCount(toolkitId) {
  try {
    const favoritesRef = collection(db, 'favorites');
    const q = query(favoritesRef, where('toolkitId', '==', toolkitId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.size;
  } catch (error) {
    console.error('Error getting favorite count:', error);
    return 0;
  }
}
