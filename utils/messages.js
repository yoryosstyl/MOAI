import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp,
  getDoc,
  increment,
  writeBatch,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

/**
 * Get or create a conversation between two users
 */
export async function getOrCreateConversation(userId1, user1Data, userId2, user2Data) {
  try {
    // Check if conversation already exists
    const conversationsRef = collection(db, 'conversations');
    const q = query(
      conversationsRef,
      where('participants', 'array-contains', userId1)
    );
    const querySnapshot = await getDocs(q);

    // Find conversation with both participants
    let existingConversation = null;
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.participants.includes(userId2)) {
        existingConversation = { id: doc.id, ...data };
      }
    });

    if (existingConversation) {
      return existingConversation;
    }

    // Create new conversation
    const newConversation = {
      participants: [userId1, userId2],
      participantData: {
        [userId1]: {
          name: user1Data.name,
          email: user1Data.email,
          photoURL: user1Data.photoURL || null,
        },
        [userId2]: {
          name: user2Data.name,
          email: user2Data.email,
          photoURL: user2Data.photoURL || null,
        },
      },
      lastMessage: '',
      lastMessageTimestamp: serverTimestamp(),
      lastMessageSenderId: null,
      unreadCount: {
        [userId1]: 0,
        [userId2]: 0,
      },
      deletedFor: {
        [userId1]: false,
        [userId2]: false,
      },
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const docRef = await addDoc(conversationsRef, newConversation);
    return { id: docRef.id, ...newConversation };
  } catch (error) {
    console.error('Error getting or creating conversation:', error);
    throw error;
  }
}

/**
 * Get all conversations for a user
 */
export async function getUserConversations(userId) {
  try {
    const conversationsRef = collection(db, 'conversations');
    const q = query(
      conversationsRef,
      where('participants', 'array-contains', userId),
      orderBy('lastMessageTimestamp', 'desc')
    );
    const querySnapshot = await getDocs(q);

    const conversations = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      // Don't include conversations deleted by this user
      if (!data.deletedFor || !data.deletedFor[userId]) {
        conversations.push({ id: doc.id, ...data });
      }
    });

    return conversations;
  } catch (error) {
    console.error('Error fetching conversations:', error);
    return [];
  }
}

/**
 * Send a message in a conversation
 */
export async function sendMessage(conversationId, senderId, senderData, recipientId, text) {
  try {
    const batch = writeBatch(db);

    // Add message to messages subcollection
    const messagesRef = collection(db, 'conversations', conversationId, 'messages');
    const messageData = {
      conversationId,
      senderId,
      senderName: senderData.name,
      senderPhotoURL: senderData.photoURL || null,
      recipientId,
      text: text.trim(),
      readAt: null,
      deletedFor: [],
      createdAt: serverTimestamp(),
    };

    const messageRef = await addDoc(messagesRef, messageData);

    // Update conversation
    const conversationRef = doc(db, 'conversations', conversationId);
    batch.update(conversationRef, {
      lastMessage: text.trim(),
      lastMessageTimestamp: serverTimestamp(),
      lastMessageSenderId: senderId,
      [`unreadCount.${recipientId}`]: increment(1),
      updatedAt: serverTimestamp(),
    });

    await batch.commit();

    return { id: messageRef.id, ...messageData };
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
}

/**
 * Get messages for a conversation
 */
export async function getConversationMessages(conversationId, userId) {
  try {
    const messagesRef = collection(db, 'conversations', conversationId, 'messages');
    const q = query(messagesRef, orderBy('createdAt', 'asc'));
    const querySnapshot = await getDocs(q);

    const messages = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      // Don't include messages deleted by this user
      if (!data.deletedFor || !data.deletedFor.includes(userId)) {
        messages.push({ id: doc.id, ...data });
      }
    });

    return messages;
  } catch (error) {
    console.error('Error fetching messages:', error);
    return [];
  }
}

/**
 * Mark all messages in a conversation as read
 */
export async function markMessagesAsRead(conversationId, userId) {
  try {
    const messagesRef = collection(db, 'conversations', conversationId, 'messages');
    const q = query(
      messagesRef,
      where('recipientId', '==', userId),
      where('readAt', '==', null)
    );
    const querySnapshot = await getDocs(q);

    const batch = writeBatch(db);
    const readTimestamp = serverTimestamp();

    querySnapshot.forEach((messageDoc) => {
      batch.update(messageDoc.ref, {
        readAt: readTimestamp,
      });
    });

    // Reset unread count in conversation
    const conversationRef = doc(db, 'conversations', conversationId);
    batch.update(conversationRef, {
      [`unreadCount.${userId}`]: 0,
    });

    await batch.commit();
  } catch (error) {
    console.error('Error marking messages as read:', error);
  }
}

/**
 * Delete a message (for one user only)
 */
export async function deleteMessage(conversationId, messageId, userId) {
  try {
    const messageRef = doc(db, 'conversations', conversationId, 'messages', messageId);
    const messageDoc = await getDoc(messageRef);

    if (messageDoc.exists()) {
      const currentDeletedFor = messageDoc.data().deletedFor || [];
      await updateDoc(messageRef, {
        deletedFor: [...currentDeletedFor, userId],
      });
    }
  } catch (error) {
    console.error('Error deleting message:', error);
    throw error;
  }
}

/**
 * Delete a conversation (for one user only)
 */
export async function deleteConversation(conversationId, userId) {
  try {
    const conversationRef = doc(db, 'conversations', conversationId);
    await updateDoc(conversationRef, {
      [`deletedFor.${userId}`]: true,
    });
  } catch (error) {
    console.error('Error deleting conversation:', error);
    throw error;
  }
}

/**
 * Block a user
 */
export async function blockUser(currentUserId, userToBlockId) {
  try {
    const userRef = doc(db, 'users', currentUserId);
    const userDoc = await getDoc(userRef);

    if (userDoc.exists()) {
      const currentBlockedUsers = userDoc.data().blockedUsers || [];
      if (!currentBlockedUsers.includes(userToBlockId)) {
        await updateDoc(userRef, {
          blockedUsers: [...currentBlockedUsers, userToBlockId],
        });
      }
    }
  } catch (error) {
    console.error('Error blocking user:', error);
    throw error;
  }
}

/**
 * Unblock a user
 */
export async function unblockUser(currentUserId, userToUnblockId) {
  try {
    const userRef = doc(db, 'users', currentUserId);
    const userDoc = await getDoc(userRef);

    if (userDoc.exists()) {
      const currentBlockedUsers = userDoc.data().blockedUsers || [];
      await updateDoc(userRef, {
        blockedUsers: currentBlockedUsers.filter((id) => id !== userToUnblockId),
      });
    }
  } catch (error) {
    console.error('Error unblocking user:', error);
    throw error;
  }
}

/**
 * Check if a user is blocked
 */
export async function isUserBlocked(currentUserId, otherUserId) {
  try {
    const userRef = doc(db, 'users', currentUserId);
    const userDoc = await getDoc(userRef);

    if (userDoc.exists()) {
      const blockedUsers = userDoc.data().blockedUsers || [];
      return blockedUsers.includes(otherUserId);
    }

    return false;
  } catch (error) {
    console.error('Error checking if user is blocked:', error);
    return false;
  }
}

/**
 * Get total unread message count for a user
 */
export async function getTotalUnreadCount(userId) {
  try {
    const conversations = await getUserConversations(userId);
    let totalUnread = 0;

    conversations.forEach((conversation) => {
      if (conversation.unreadCount && conversation.unreadCount[userId]) {
        totalUnread += conversation.unreadCount[userId];
      }
    });

    return totalUnread;
  } catch (error) {
    console.error('Error getting total unread count:', error);
    return 0;
  }
}
