'use client';

import { useState, useRef } from 'react';
import imageCompression from 'browser-image-compression';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '@/lib/firebase';

export default function AvatarUpload({ currentAvatarUrl, userId, onUploadSuccess, onDelete }) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(currentAvatarUrl);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    // Validate file size (max 2MB before compression)
    if (file.size > 2 * 1024 * 1024) {
      setError('Image must be less than 2MB');
      return;
    }

    setError('');
    setUploading(true);

    try {
      // Compress image
      const options = {
        maxSizeMB: 0.5, // Max 500KB after compression
        maxWidthOrHeight: 400, // Max 400px for avatar
        useWebWorker: true,
        fileType: 'image/jpeg',
      };

      const compressedFile = await imageCompression(file, options);

      // Create preview
      const previewUrl = URL.createObjectURL(compressedFile);
      setPreview(previewUrl);

      // Upload to Firebase Storage
      const storageRef = ref(storage, `avatars/${userId}/${Date.now()}.jpg`);
      await uploadBytes(storageRef, compressedFile);

      // Get download URL
      const downloadURL = await getDownloadURL(storageRef);

      // Delete old avatar if exists
      if (currentAvatarUrl && currentAvatarUrl.includes('firebase')) {
        try {
          const oldRef = ref(storage, currentAvatarUrl);
          await deleteObject(oldRef);
        } catch (err) {
          console.log('Could not delete old avatar:', err);
        }
      }

      setUploading(false);
      onUploadSuccess(downloadURL);
    } catch (err) {
      console.error('Error uploading avatar:', err);
      setError('Failed to upload image. Please try again.');
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!preview) return;

    setUploading(true);
    try {
      // Delete from Firebase Storage if it's a Firebase URL
      if (preview && preview.includes('firebase')) {
        const storageRef = ref(storage, preview);
        await deleteObject(storageRef);
      }

      setPreview(null);
      setUploading(false);
      onDelete();
    } catch (err) {
      console.error('Error deleting avatar:', err);
      setError('Failed to delete image');
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      {/* Avatar Preview */}
      <div className="relative">
        {preview ? (
          <img
            src={preview}
            alt="Avatar"
            className="w-32 h-32 rounded-full object-cover border-4 border-gray-200"
          />
        ) : (
          <div className="w-32 h-32 rounded-full bg-blue-100 flex items-center justify-center border-4 border-gray-200">
            <span className="text-blue-600 text-4xl font-bold">?</span>
          </div>
        )}

        {/* Delete Button (show if avatar exists) */}
        {preview && !uploading && (
          <button
            type="button"
            onClick={handleDelete}
            className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition"
            title="Delete avatar"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}

      {/* Upload Button */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed text-sm"
        >
          {uploading ? 'Uploading...' : preview ? 'Change Photo' : 'Upload Photo'}
        </button>
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Info Text */}
      <p className="text-xs text-gray-500 text-center">
        Max 2MB • JPG, PNG, or WebP<br />
        Image will be resized to 400x400px
      </p>
    </div>
  );
}
