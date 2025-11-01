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

  // Phone number with country code
  telephone: {
    countryCode: '+30', // Default Greece
    number: '',
  },

  bio: '',
  avatarUrl: '',
  location: {
    address: '', // Full address from Google Maps or manual
    isVerified: false, // True if from Google Maps autocomplete
  },

  // Social media links
  socialMedia: {
    linkedin: '',
    instagram: '',
    facebook: '',
  },

  // Privacy settings - which fields are public
  privacy: {
    emailPublic: false,
    telephonePublic: false,
    locationPublic: false,
  },

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
  platforms: [], // Array of platforms (optional)

  createdAt: null, // Timestamp
  updatedAt: null, // Timestamp
};

/**
 * News Structure
 */
export const News = {
  id: '', // Auto-generated
  submittedBy: '', // User UID who submitted the news

  title: '',
  description: '', // Short summary
  content: '', // Full news content
  imageUrl: '', // Optional thumbnail image

  // Admin approval workflow
  status: 'pending', // 'pending', 'approved', 'rejected'

  // Optional platforms
  platforms: [], // Array of platforms (optional)

  // External links
  externalLink: '', // Optional link to full article or source

  createdAt: null, // Timestamp
  updatedAt: null, // Timestamp
  publishedAt: null, // Timestamp when approved/published
};

