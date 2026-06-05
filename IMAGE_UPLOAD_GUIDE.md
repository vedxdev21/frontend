/**
 * IMAGE_UPLOAD_GUIDE.md
 * Complete guide for implementing image uploads across ProjectX
 */

# Image Upload Implementation Guide

## Overview
Images can be uploaded to multiple endpoints:
- Profile pictures: `POST /user/upload-image`
- Property listings: `POST /property/create` or `PUT /property/:id` (multipart)
- Cook profiles: `POST /cook/register` (multipart)
- Mess photos: `POST /mess/register` (multipart)

## Frontend Implementation

### 1. Using useUpload Hook

```javascript
'use client';
import { useUpload } from '@/hooks/useAPI';

export function MyComponent() {
  const { upload, loading, progress } = useUpload();

  const handleUpload = async (file) => {
    try {
      const result = await upload('/user/upload-image', file, {
        // Additional data
        userId: user.id
      });
      
      console.log('Uploaded:', result.imageUrl);
    } catch (err) {
      console.error('Upload failed:', err);
    }
  };

  return (
    <div>
      <input
        type="file"
        accept="image/*"
        onChange={(e) => handleUpload(e.target.files[0])}
        disabled={loading}
      />
      {loading && <div>Progress: {progress}%</div>}
    </div>
  );
}
```

### 2. Using ImageUpload Component

```javascript
import ImageUpload from '@/components/common/ImageUpload';

export function ProfileSetup() {
  const handleImageSelected = (file, preview) => {
    // file: File object
    // preview: base64 data URL for preview
    console.log('Image selected:', file.name);
  };

  return (
    <ImageUpload
      label="Upload Profile Picture"
      onImageSelect={handleImageSelected}
      maxSize={5}
      accept="image/*"
      preview={true}
      className="mb-4"
    />
  );
}
```

### 3. Manual FormData Upload

```javascript
const uploadManual = async (file, endpoint) => {
  const formData = new FormData();
  formData.append('file', file);
  
  // Add additional fields
  formData.append('title', 'My Image');
  formData.append('description', 'Image description');

  try {
    const response = await api.post(endpoint, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress: (progressEvent) => {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        console.log('Upload progress:', percentCompleted);
      }
    });
    
    return response.data.data;
  } catch (err) {
    console.error('Upload failed:', err);
  }
};
```

## Backend Implementation

### Express Multer Setup (Already configured)

```javascript
// Backend already uses:
const multer = require('multer');
const upload = multer({
  dest: './uploads/',
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files allowed'));
    }
  }
});
```

## API Endpoints

### Upload Profile Image
```
POST /user/upload-image
Content-Type: multipart/form-data

Body:
- file: <image file>

Response:
{
  "success": true,
  "data": {
    "imageUrl": "https://cdn.example.com/images/profile-123.jpg",
    "imageId": "img-123"
  }
}
```

### Create Property with Images
```
POST /property/create
Content-Type: multipart/form-data

Body:
- title: "2 BHK Apartment"
- description: "Nice apartment"
- price: 15000
- images: <multiple files>
- city: "Bhopal"
- area: "Arera Colony"
- type: "2BHK"

Response:
{
  "success": true,
  "data": {
    "id": "prop-123",
    "imageUrls": [
      "https://cdn.example.com/images/prop-123-1.jpg",
      "https://cdn.example.com/images/prop-123-2.jpg"
    ]
  }
}
```

### Update Property Images
```
PUT /property/:id
Content-Type: multipart/form-data

Body:
- newImages: <file(s)>
- removeImages: ["image-id-1", "image-id-2"]
```

## File Size & Type Validation

### Frontend Validation (Required)
```javascript
const validateImage = (file) => {
  const MAX_SIZE = 5 * 1024 * 1024; // 5MB
  const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

  if (file.size > MAX_SIZE) {
    throw new Error(`File size must be less than 5MB`);
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error(`Only JPEG, PNG, GIF, WebP allowed`);
  }

  return true;
};

// Usage
try {
  validateImage(file);
  await upload('/user/upload-image', file);
} catch (err) {
  toast.error(err.message);
}
```

### Backend Validation (Already in place)
- Max file size: 5MB
- Allowed types: image/jpeg, image/png, image/gif, image/webp
- Returns 400 if validation fails

## Image Optimization Tips

1. **Compression**: Use ImageOptim or similar before upload
2. **WebP Format**: Better compression than JPEG
3. **Lazy Loading**: Use `loading="lazy"` on img tags
4. **Responsive Images**: Use srcset for different screen sizes

## Error Handling

```javascript
const handleUploadError = (err) => {
  if (err.response?.status === 413) {
    toast.error('File too large');
  } else if (err.response?.status === 400) {
    toast.error('Invalid file type or size');
  } else if (err.response?.status === 401) {
    toast.error('Authentication required');
  } else {
    toast.error(err.response?.data?.message || 'Upload failed');
  }
};
```

## Pages with Image Upload

### Already Implemented:
- ✅ Profile page (`/app/profile/page.js`) - Profile picture

### Need Implementation:
- Property creation (`/app/properties/create/`)
- Property editing (`/app/properties/[id]/`)
- Cook profile (`/app/cook/`)
- Mess profile (`/app/mess/`)
- Roommate profile (`/app/roommate/`)

## Testing Image Upload

```bash
# Test with curl
curl -X POST http://localhost:5000/api/v1/user/upload-image \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@/path/to/image.jpg"

# Expected response
{
  "success": true,
  "data": {
    "imageUrl": "https://cdn.example.com/images/...",
    "imageId": "img-123"
  }
}
```

## CDN / Storage

Current setup: Uploads stored in `/backend/uploads/`

For production, configure:
- AWS S3
- Google Cloud Storage
- Cloudinary
- Supabase

(See backend `.env` for configuration)

## Performance Considerations

1. **Compression**: Compress images before upload
2. **Chunked Upload**: For large files, implement chunking
3. **Caching**: Set appropriate cache headers
4. **CDN**: Serve images from CDN, not origin server
5. **Lazy Loading**: Load images on demand

## Mobile Optimization

```javascript
// Detect and optimize for mobile
const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
const maxSize = isMobile ? 3 : 5; // MB

// Compress before upload on mobile
if (isMobile) {
  const compressed = await compressImage(file);
  await upload(endpoint, compressed);
}
```
