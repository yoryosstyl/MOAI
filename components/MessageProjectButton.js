'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import UserAvatar from './UserAvatar';
import { getOrCreateConversation } from '@/utils/messages';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

/**
 * MessageProjectButton - Button to message a project owner
 * @param {string} ownerId - Project owner's user ID
 * @param {object} ownerData - Preloaded owner data (optional, to avoid refetch)
 * @param {boolean} showAvatar - Whether to show the owner avatar (default: true)
 * @param {string} buttonText - Custom button text
 */
export default function MessageProjectButton({
  ownerId,
  ownerData: preloadedOwnerData = null,
  showAvatar = true,
  buttonText = 'Message',
}) {
  const router = useRouter();
  const { user, userProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [ownerData, setOwnerData] = useState(preloadedOwnerData);

  const handleMessageOwner = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      alert('Please sign in to send messages');
      router.push('/login');
      return;
    }

    if (ownerId === user.uid) {
      alert("You can't message yourself");
      return;
    }

    setLoading(true);

    try {
      // Fetch owner data if not provided
      let owner = ownerData;
      if (!owner) {
        const ownerDoc = await getDoc(doc(db, 'users', ownerId));
        if (ownerDoc.exists()) {
          owner = { id: ownerDoc.id, ...ownerDoc.data() };
          setOwnerData(owner);
        } else {
          alert('User not found');
          setLoading(false);
          return;
        }
      }

      // Create or get conversation
      const user1Data = {
        name: userProfile?.displayName || user.email,
        email: user.email,
        photoURL: userProfile?.avatarUrl || null,
      };

      const user2Data = {
        name: owner.displayName || owner.email,
        email: owner.email,
        photoURL: owner.avatarUrl || null,
      };

      const conversation = await getOrCreateConversation(
        user.uid,
        user1Data,
        ownerId,
        user2Data
      );

      // Redirect to messages page with this conversation
      router.push(`/messages?conversation=${conversation.id}`);
    } catch (error) {
      console.error('Error starting conversation:', error);
      alert('Failed to start conversation');
    }

    setLoading(false);
  };

  // Don't show button if viewing own project
  if (user && ownerId === user.uid) {
    return null;
  }

  return (
    <div className="flex items-center gap-2">
      {showAvatar && ownerData && (
        <UserAvatar
          photoURL={ownerData.avatarUrl}
          name={ownerData.displayName || ownerData.email}
          size="sm"
        />
      )}
      <button
        onClick={handleMessageOwner}
        disabled={loading}
        className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Loading...' : buttonText}
      </button>
    </div>
  );
}
