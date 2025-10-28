/**
 * Data models for MOAI platform
 * These define the structure of documents in Firestore collections
 */

/**
 * User Profile Structure
 */
export const UserProfile = {
  uid: '', // Firebase Auth UID
  displayName: '',
  email: '',
  telephone: '',
  bio: '',
  avatarUrl: '',
  location: '',

  // Privacy settings - which fields are public
  privacy: {
    emailPublic: false,
    telephonePublic: false,
    locationPublic: false,
  },

  // Preferred communication methods (multiple selections)
  preferredContact: [], // ['email', 'telephone', 'website']

  createdAt: null, // Timestamp
  updatedAt: null, // Timestamp
};

/**
 * Project Structure
 */
export const Project = {
  id: '', // Auto-generated
  ownerId: '', // User UID who created the project

  // Basic info
  name: '', // Max 10 words
  description: '', // Max 50 words

  // Classification
  typeOfSharing: '', // e.g., 'open', 'collaborative', 'closed'
  shape: '', // Project shape/format
  color: '', // Associated color
  kindOfProject: '', // Category/type
  tags: [], // Array of tags (max 5)
  size: '', // Project size/scale
  location: '',

  // Media
  images: [], // Array of image URLs from Firebase Storage
  thumbnailUrl: '', // Main thumbnail

  // External links
  links: {
    googleDrive: '',
    website: '',
    trello: '', // or Miro
    moreInfo: '',
  },

  // Contact person
  contactPerson: {
    name: '',
    contactInfo: {}, // Based on user's public profile settings
  },

  createdAt: null, // Timestamp
  updatedAt: null, // Timestamp
};

/**
 * Toolkit Structure
 */
export const Toolkit = {
  id: '', // Auto-generated
  createdBy: '', // User UID

  title: '',
  description: '',
  category: '',
  tags: [], // Array of tags
  resourceLinks: [], // Array of URLs

  createdAt: null, // Timestamp
  updatedAt: null, // Timestamp
};

/**
 * Message Structure (for one-to-one messaging)
 */
export const Message = {
  id: '', // Auto-generated
  conversationId: '', // Unique ID for the conversation
  senderId: '', // User UID
  recipientId: '', // User UID

  content: '', // Message text

  read: false,

  createdAt: null, // Timestamp
};

/**
 * Conversation Structure (tracks message threads)
 */
export const Conversation = {
  id: '', // Auto-generated
  participants: [], // Array of 2 User UIDs [uid1, uid2]
  lastMessage: '',
  lastMessageAt: null, // Timestamp

  unreadCount: {
    // uid: count
  },

  createdAt: null, // Timestamp
  updatedAt: null, // Timestamp
};
