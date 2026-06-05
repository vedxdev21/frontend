# ProjectX - Complete Developer Guide

**Version**: 1.0 | **Last Updated**: 2026-04-22

## Overview

ProjectX is an all-in-one platform for daily life services including:
- **Properties**: Browse, list, and manage rental properties
- **Roommates**: Find compatible roommates and connect
- **Mess/Tiffin**: Browse and manage food services
- **Cooks**: Hire professional cooks
- **Chat**: Real-time messaging
- **Admin**: Manage users, content, and moderation

## Quick Start

### Prerequisites
- Node.js v20+
- npm or yarn
- MongoDB (optional, backend uses Prisma)

### Setup

#### Frontend
```bash
cd masterX
npm install
npm run dev
# Frontend runs on http://localhost:3000
```

#### Backend
```bash
cd masterX_backend
npm install
npm run dev
# Backend runs on http://localhost:5000/api/v1
```

## Architecture

### Frontend (Next.js App Router)
```
masterX/
├── app/                    # Pages and routes
│   ├── page.js            # Landing page
│   ├── login/             # Authentication
│   ├── properties/        # Property listings
│   ├── profile/           # User profiles
│   ├── chat/              # Messaging
│   ├── admin/             # Admin dashboard
│   └── ...
├── components/            # React components
│   ├── common/            # Reusable: GlassCard, ImageUpload, LoadingSpinner
│   ├── ui/                # Radix UI components
│   ├── Navbar.js
│   └── Footer.js
├── lib/                   # Utilities
│   ├── api.js            # Axios instance + API endpoints
│   ├── store.js          # Zustand store
│   ├── constants.js      # App constants
│   └── utils.js
├── hooks/                # Custom React hooks
│   └── useAPI.js        # API fetching hooks
├── context/             # React context
│   └── AuthContext.js   # Authentication
├── app/globals.css      # Global styles + design tokens
└── public/              # Static assets
```

### Backend (Express.js + Prisma)
```
masterX_backend/
├── src/
│   ├── server.ts        # Main server file
│   ├── modules/         # Feature modules
│   │   ├── auth/       # Authentication
│   │   ├── user/       # User management
│   │   ├── property/   # Properties
│   │   ├── chat/       # Chat & messaging
│   │   ├── cook/       # Cook profiles
│   │   ├── mess/       # Mess/Tiffin
│   │   ├── admin/      # Admin features
│   │   └── ...
│   ├── utils/          # Utilities
│   ├── middleware/     # Express middleware
│   └── sockets/        # Socket.io for chat
├── prisma/             # Database schema
│   └── schema.prisma
└── postman/            # API collection
```

## Design System

### Colors (Hero Gradient)
- Primary: `#f97316` (Orange)
- Primary Light: `#fb923c` (Light Orange)
- Primary Lighter: `#facc15` (Amber)
- Text Primary: `#ffffff` (White)
- Text Dark: `#1f2937` (Dark Gray)

### Glass UI
- Background: `rgba(255, 255, 255, 0.15)`
- Border: `rgba(255, 255, 255, 0.3)`
- Backdrop Filter: `blur(8px)`

### Animations
- `float-img`: Hero image floating effect
- `fadeUp`: Fade and slide up on page load
- `shimmer`: Skeleton loading effect
- `pulse`: Live indicator effect
- `glow`: Glowing accent effect

### Typography
- Display Font: **Space Grotesk** (headers, bold)
- Body Font: **Plus Jakarta Sans** (body text, regular)

## Key Features Implemented

### ✅ Complete
- [x] Modern glassmorphic UI design
- [x] Design token system in globals.css
- [x] Reusable component library
- [x] Profile image upload
- [x] API integration structure
- [x] Authentication flow
- [x] Properties browsing with filters

### 🔄 In Progress
- [ ] Multi-image uploads for listings
- [ ] Socket.io real-time chat
- [ ] Admin dashboard
- [ ] Cook/Mess profile uploads

## Custom Hooks

### useAPI
```javascript
import { useAPI } from '@/hooks/useAPI';

// Manual control
const { data, loading, error, execute, fetch } = useAPI('/endpoint');

// GET request
await fetch('/user/profile');

// POST/PUT request
const result = await execute('POST', { name: 'John' }, '/user/create');
```

### useFetch
```javascript
import { useFetch } from '@/hooks/useAPI';

// Auto-fetch on mount
const { data, loading, error, refetch } = useFetch('/user/profile');
```

### useUpload
```javascript
import { useUpload } from '@/hooks/useAPI';

const { upload, loading, progress } = useUpload();

// Upload with progress tracking
const result = await upload('/user/upload-image', file, { userId: '123' });
```

## API Integration

### Base URL
- Development: `http://localhost:5000/api/v1`
- Production: `https://api.projectx.com/v1`

### Authentication
All endpoints (except auth) require JWT Bearer token:
```javascript
headers: {
  'Authorization': 'Bearer {accessToken}',
  'Content-Type': 'application/json'
}
```

### Request/Response Format
```javascript
// Success
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}

// Error
{
  "success": false,
  "message": "Error description",
  "error": { ... }
}
```

## Image Upload

### Implementation
```javascript
import ImageUpload from '@/components/common/ImageUpload';

export function MyComponent() {
  const handleImageSelected = (file, preview) => {
    // Send to backend
    const result = await upload('/endpoint', file);
  };

  return (
    <ImageUpload
      label="Upload Image"
      onImageSelect={handleImageSelected}
      maxSize={5}
      preview={true}
    />
  );
}
```

### Supported Endpoints
- `POST /user/upload-image` - Profile picture
- `POST /property/create` - Property images (multipart)
- `POST /cook/register` - Cook profile image
- `POST /mess/register` - Mess profile image

### Constraints
- Max size: 5MB
- Types: JPEG, PNG, GIF, WebP
- Validation on both frontend and backend

## Common Workflows

### Login Flow
```javascript
// 1. Send OTP
await api.post('/auth/send-otp', { phone: '+919876543210' });

// 2. Verify OTP
const { data } = await api.post('/auth/verify-otp', {
  phone: '+919876543210',
  otp: '123456'
});

// 3. Save token
localStorage.setItem('accessToken', data.accessToken);
```

### Browse Properties
```javascript
// 1. Get all properties with filters
const { data } = await api.get('/property/browse', {
  params: {
    city: 'Bhopal',
    type: '2BHK',
    page: 1,
    limit: 12
  }
});

// 2. Get single property
const property = await api.get(`/property/${propertyId}`);

// 3. Save property
await api.post(`/property/${propertyId}/save`);
```

### Chat Messaging
```javascript
// 1. Get conversations
const convs = await api.get('/chat/conversations');

// 2. Get messages in conversation
const msgs = await api.get(`/chat/${convId}/messages`);

// 3. Send message
await api.post('/chat/send', {
  conversationId: convId,
  content: 'Hello!'
});
```

## Pages & Routes

| Route | Component | Features |
|-------|-----------|----------|
| `/` | Landing | Hero, CTAs |
| `/login` | Auth | Email/Phone login |
| `/register` | Auth | User registration |
| `/profile` | Profile | Image upload, edit |
| `/profile-setup` | Setup | Multi-step onboarding |
| `/properties` | Browse | Grid, filters, search |
| `/properties/create` | Create | Form, image upload |
| `/properties/[id]` | Detail | Full details, inquiry |
| `/chat` | Chat | Conversations, messages |
| `/admin` | Admin | Dashboard, user mgmt |
| `/roommate` | Browse | Roommate profiles |
| `/cook` | Browse | Cook profiles |
| `/mess` | Browse | Mess listings |

## Debugging

### Frontend
```bash
# Run with debug output
DEBUG=* npm run dev

# Build and preview
npm run build
npm run start

# Check for build errors
npm run build 2>&1 | grep -i error
```

### Backend
```bash
# Run with logging
DEBUG=projectx:* npm run dev

# Check database
npx prisma studio

# View logs
tail -f logs/server.log
```

### API Testing
```bash
# Use Postman collection
/masterX_backend/postman/ProjectX_API_v1.postman_collection.json

# Or test with curl
curl -X GET http://localhost:5000/api/health
```

## Environment Variables

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
NEXT_PUBLIC_APP_NAME=ProjectX
```

### Backend (.env)
```
PORT=5000
DATABASE_URL=mongodb://localhost:27017/projectx
JWT_SECRET=your-secret-key
IMAGE_UPLOAD_DIR=./uploads
```

## Performance Tips

1. **Image Optimization**
   - Compress before upload
   - Use WebP format
   - Lazy load images
   - Serve from CDN

2. **API Requests**
   - Use request caching (30s default)
   - Implement pagination
   - Throttle rapid requests
   - Retry on network errors

3. **Frontend**
   - Code splitting (automatic with Next.js)
   - Lazy load routes
   - Memoize expensive computations
   - Use `loading` boundaries

4. **Backend**
   - Database indexing
   - Query optimization
   - Caching layer (Redis)
   - Rate limiting

## Security Checklist

- [x] JWT authentication
- [x] CORS configured
- [x] Input validation
- [x] File upload validation
- [ ] Rate limiting
- [ ] SQL injection prevention
- [ ] XSS prevention
- [ ] CSRF tokens
- [ ] Secure headers

## Deployment

### Frontend (Vercel)
```bash
# Connect GitHub repo
# Automatic deployment on push to main
# Set env variables in Vercel dashboard
```

### Backend (AWS/GCP/Railway)
```bash
# Build
npm run build

# Start
npm start

# Set environment variables
DATABASE_URL=...
JWT_SECRET=...
```

## Support & Documentation

- **API Docs**: See `API_ENDPOINTS.md`
- **Image Upload**: See `IMAGE_UPLOAD_GUIDE.md`
- **Integration**: See `BACKEND_SYNC_CHECKLIST.md`
- **Postman**: `/masterX_backend/postman/ProjectX_API_v1.postman_collection.json`

## Troubleshooting

### Common Issues

**Port already in use**
```bash
# Kill process on port 3000/5000
lsof -ti:3000 | xargs kill -9
```

**CORS errors**
```javascript
// Check backend CORS configuration
// Update frontend API URL in env
```

**Image upload fails**
```
- Check file size < 5MB
- Verify image type (JPEG/PNG/GIF/WebP)
- Check backend upload directory permissions
- Verify auth token is valid
```

**Build fails**
```bash
# Clear cache
rm -rf .next
npm run build
```

## Team Members & Contributions

- Created with modern design system
- Glassmorphic UI throughout
- Real-time capabilities with Socket.io
- Production-ready code structure

---

**Happy Coding! 🚀**
