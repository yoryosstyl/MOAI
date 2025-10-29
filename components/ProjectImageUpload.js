'use client';

import { useState, useRef } from 'react';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '@/lib/firebase';
import imageCompression from 'browser-image-compression';

export default function ProjectImageUpload({ projectId, currentImages = [], onImagesChange }) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files);

    if (files.length === 0) return;

    // Check total number of images (max 10)
    if (currentImages.length + files.length > 10) {
      setError('Maximum 10 images allowed per project');
      return;
    }

    setUploading(true);
    setError('');

    try {
      const newImageUrls = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setUploadProgress(Math.round(((i + 1) / files.length) * 100));

        // Validate file type
        if (!file.type.startsWith('image/')) {
          setError(`${file.name} is not an image file`);
          continue;
        }

        // Validate file size (max 2MB before compression)
        if (file.size > 2 * 1024 * 1024) {
          setError(`${file.name} is larger than 2MB`);
          continue;
        }

        // Compress image
        const options = {
          maxSizeMB: 1,
          maxWidthOrHeight: 800,
          useWebWorker: true,
          fileType: 'image/jpeg',
        };

        const compressedFile = await imageCompression(file, options);

        // Upload to Firebase Storage
        const timestamp = Date.now();
        const fileName = `${timestamp}_${i}.jpg`;
        const storageRef = ref(storage, `projects/${projectId}/${fileName}`);

        await uploadBytes(storageRef, compressedFile);
        const downloadURL = await getDownloadURL(storageRef);

        newImageUrls.push(downloadURL);
      }

      // Update parent component with new images
      onImagesChange([...currentImages, ...newImageUrls]);

      setUploading(false);
      setUploadProgress(0);

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err) {
      console.error('Error uploading images:', err);
      setError('Failed to upload images. Please try again.');
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleRemoveImage = async (imageUrl, index) => {
    if (!confirm('Remove this image?')) return;

    try {
      // Try to delete from storage (if it's a Firebase Storage URL)
      if (imageUrl.includes('firebasestorage.googleapis.com')) {
        try {
          const imageRef = ref(storage, imageUrl);
          await deleteObject(imageRef);
        } catch (err) {
          console.log('Could not delete from storage:', err);
        }
      }

      // Remove from current images array
      const updatedImages = currentImages.filter((_, i) => i !== index);
      onImagesChange(updatedImages);
    } catch (err) {
      console.error('Error removing image:', err);
      setError('Failed to remove image');
    }
  };

  const handleSetThumbnail = (index) => {
    // Move selected image to first position
    const reorderedImages = [...currentImages];
    const [thumbnail] = reorderedImages.splice(index, 1);
    reorderedImages.unshift(thumbnail);
    onImagesChange(reorderedImages);
  };

  return (
    <div className="space-y-4">
      {/* Upload Button */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Project Images <span className="text-xs text-gray-500">(max 10 images, 2MB each)</span>
        </label>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileSelect}
          disabled={uploading || currentImages.length >= 10}
          className="hidden"
        />

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading || currentImages.length >= 10}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {uploading ? `Uploading... ${uploadProgress}%` : 'Upload Images'}
        </button>

        {currentImages.length >= 10 && (
          <p className="text-sm text-amber-600 mt-2">
            Maximum number of images reached (10)
          </p>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Image Grid */}
      {currentImages.length > 0 && (
        <div>
          <p className="text-sm text-gray-600 mb-3">
            {currentImages.length} image{currentImages.length !== 1 ? 's' : ''} uploaded.
            First image is the project thumbnail.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {currentImages.map((imageUrl, index) => (
              <div key={index} className="relative group">
                {/* Image */}
                <img
                  src={imageUrl}
                  alt={`Project image ${index + 1}`}
                  className="w-full h-40 object-cover rounded-lg border-2 border-gray-200"
                />

                {/* Thumbnail Badge */}
                {index === 0 && (
                  <div className="absolute top-2 left-2 px-2 py-1 bg-blue-600 text-white text-xs font-medium rounded">
                    Thumbnail
                  </div>
                )}

                {/* Action Buttons (shown on hover) */}
                <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                  {index !== 0 && (
                    <button
                      type="button"
                      onClick={() => handleSetThumbnail(index)}
                      className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                      title="Set as thumbnail"
                    >
                      Set Thumbnail
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => handleRemoveImage(imageUrl, index)}
                    className="px-3 py-1.5 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                    title="Remove image"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload Instructions */}
      {currentImages.length === 0 && (
        <div className="text-center p-8 border-2 border-dashed border-gray-300 rounded-lg">
          <svg
            className="w-12 h-12 mx-auto mb-3 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <p className="text-sm text-gray-600">
            No images uploaded yet. Click "Upload Images" to add photos to your project.
          </p>
          <p className="text-xs text-gray-500 mt-2">
            Images will be automatically resized to 800px and compressed to ~1MB
          </p>
        </div>
      )}
    </div>
  );
}
