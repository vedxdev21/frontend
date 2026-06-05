/**
 * API_ENDPOINTS.md
 * Complete mapping of all ProjectX backend endpoints
 * Backend: http://localhost:5000/api/v1
 */

// ============ AUTHENTICATION ============
POST   /auth/register              - Register user (name, phone, email, password)
POST   /auth/send-otp              - Send OTP to phone
POST   /auth/verify-otp            - Verify phone with OTP
POST   /auth/login/phone            - Login with phone + OTP
POST   /auth/login/email            - Login with email + password
POST   /auth/google                 - Google OAuth
POST   /auth/refresh-token          - Refresh access token
POST   /auth/forgot-password        - Request password reset
POST   /auth/reset-password         - Reset password with token
POST   /auth/logout                 - Logout user

// ============ USER ============
GET    /user/profile               - Get my profile
PUT    /user/profile-setup         - Profile setup (step 1)
PUT    /user/profile               - Update profile
PUT    /user/location              - Update location
PUT    /user/language              - Update language preference
POST   /user/upload-image          - Upload profile image (multipart/form-data)
GET    /user/stats                 - Get user statistics
GET    /user/public/:id            - Get public profile

// ============ LOCATION ============
GET    /location/cities            - Get all cities
GET    /location/areas/:city       - Get areas for a city
GET    /location/detect            - Detect user location
GET    /location/guide/:area       - Get area guide

// ============ PROPERTIES ============
GET    /property/browse            - Browse properties (query: city, type, area, furnishing, availableFor, budgetMin, budgetMax, verified, negotiable, sort, page, limit)
POST   /property/create            - Create property listing (multipart for images)
GET    /property/:id               - Get property details
PUT    /property/:id               - Update property
PUT    /property/:id/status        - Mark property as rented/unavailable
GET    /property/my-listings       - Get my listings
POST   /property/:id/save          - Save property
GET    /property/saved             - Get saved properties
POST   /property/:id/inquire       - Send inquiry to owner
GET    /property/inquiries         - Get inquiries (owner view)
POST   /property/:id/show-number   - Show owner number (requires inquiry)
GET    /property/compare           - Compare properties
POST   /property/alert             - Create price alert
GET    /property/alerts            - Get my alerts
GET    /property/dashboard         - Owner dashboard
DELETE /property/:id               - Delete property

// ============ ROOMMATE ============
POST   /roommate/profile           - Create roommate profile
GET    /roommate/browse            - Browse roommate profiles
GET    /roommate/:id               - Get profile details
PUT    /roommate/:id               - Update profile
POST   /roommate/:id/interest      - Send interest
GET    /roommate/interests         - Get interests received
PUT    /roommate/interest/:id      - Respond to interest (accept/reject)
GET    /roommate/connections       - Get matched connections
GET    /roommate/groups            - Browse groups
POST   /roommate/group             - Create group
DELETE /roommate/:id               - Delete profile

// ============ MESS / TIFFIN ============
POST   /mess/register              - Register mess
GET    /mess/browse                - Browse mess listings
GET    /mess/:id                   - Get mess details
PUT    /mess/:id/menu              - Update menu
GET    /mess/:id/menu/today        - Get today's menu
POST   /mess/:id/save              - Save mess
GET    /mess/saved                 - Get saved mess
GET    /mess/dashboard             - Mess owner dashboard

// ============ COOK ============
POST   /cook/register              - Register as cook
GET    /cook/browse                - Browse cooks
GET    /cook/:id                   - Get cook details
POST   /cook/:id/save              - Save cook
GET    /cook/saved                 - Get saved cooks

// ============ CHAT ============
GET    /chat/conversations         - Get all conversations
GET    /chat/:conversationId/messages - Get messages in conversation
POST   /chat/send                  - Send message (text or file)
PUT    /chat/:messageId/read       - Mark message as read
DELETE /chat/:messageId            - Delete message

// ============ NOTIFICATIONS ============
GET    /notification/all           - Get notifications
POST   /notification/read/:id      - Mark notification as read
DELETE /notification/:id           - Delete notification

// ============ REVIEWS ============
POST   /review                     - Create review
GET    /review/:targetId           - Get reviews for target
PUT    /review/:id                 - Update review
DELETE /review/:id                 - Delete review

// ============ ADMIN ============
GET    /admin/stats                - Dashboard statistics
GET    /admin/users                - List all users (admin)
GET    /admin/users/:id            - Get user details (admin)
PUT    /admin/users/:id/status     - Update user status
DELETE /admin/users/:id            - Delete user (admin)
GET    /admin/properties           - List all properties (admin)
PUT    /admin/properties/:id/verify - Verify property
DELETE /admin/properties/:id       - Delete property (admin)
POST   /admin/report               - Report content
GET    /admin/reports              - Get reports (admin)

// ============ COMMON PATTERNS ============

// Authentication Header (required for most endpoints)
Headers: {
  'Authorization': 'Bearer <accessToken>',
  'Content-Type': 'application/json'
}

// File Upload (multipart/form-data)
Headers: {
  'Authorization': 'Bearer <accessToken>',
  'Content-Type': 'multipart/form-data'
}

// Response Format (Success)
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}

// Response Format (Error)
{
  "success": false,
  "message": "Error description",
  "error": { ... }
}

// Pagination
Query params: ?page=1&limit=10
Response includes: data, total, totalPages, hasMore

// Sorting
Query param: ?sort=newest|oldest|price_asc|price_desc|popular|rating

// Status Codes
200 - Success
201 - Created
400 - Bad Request
401 - Unauthorized
403 - Forbidden
404 - Not Found
409 - Conflict
500 - Server Error
