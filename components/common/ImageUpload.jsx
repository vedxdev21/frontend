'use client';

import React, { useState, useRef } from 'react';
import { Upload, X } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ImageUpload({
  label = 'Upload Image',
  onImageSelect,
  maxSize = 5, // in MB
  accept = 'image/*',
  preview = true,
  className = '',
}) {
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size
    const sizeInMB = file.size / (1024 * 1024);
    if (sizeInMB > maxSize) {
      toast.error(`File size must be less than ${maxSize}MB`);
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    setLoading(true);

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result;
      setImage(result);
      if (onImageSelect) {
        onImageSelect(file, result);
      }
      setLoading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleRemove = () => {
    setImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={className}>
      <label className="block text-sm font-semibold text-gray-700 mb-3">
        {label}
      </label>

      {preview && image ? (
        <div className="relative mb-4">
          <img
            src={image}
            alt="Preview"
            className="w-full h-64 object-cover rounded-lg border border-orange-200"
          />
          <button
            onClick={handleRemove}
            className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
            type="button"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : null}

      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileSelect}
        className="hidden"
        disabled={loading}
      />

      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={loading}
        type="button"
        className="w-full border-2 border-dashed border-orange-300 rounded-lg p-6 hover:border-orange-400 hover:bg-orange-50 transition-colors disabled:opacity-50 flex flex-col items-center justify-center gap-2"
      >
        <Upload className="w-6 h-6 text-orange-500" />
        <span className="text-sm font-medium text-gray-700">
          {loading ? 'Uploading...' : 'Click to upload or drag and drop'}
        </span>
        <span className="text-xs text-gray-500">
          PNG, JPG, GIF up to {maxSize}MB
        </span>
      </button>
    </div>
  );
}
