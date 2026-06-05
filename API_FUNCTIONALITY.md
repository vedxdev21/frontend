# ProjectX API Functionality (Frontend + Backend Snapshot)

This document maps the Postman collection to the current implementation in this repository.

## Base Configuration

- Base URL (frontend client): `/api/v1`
- API proxy/handler: `app/api/[[...path]]/route.js`
- Auth: Bearer token in `Authorization` header
- Frontend client: `lib/api.js` (domain-structured API modules)

## Frontend API Modules (`lib/api.js`)

- `authAPI`: register, OTP login, email login, refresh, forgot/reset password, logout, googleAuth.
- `userAPI`: get/update profile, profile setup, location/language updates, stats, public profile.
- `locationAPI`: cities, city areas, detect location, area guide.
- `propertyAPI`: browse/create/read/update/delete, save/unsave, inquiry, show number, compare, alerts, owner dashboard.
- `roommateAPI`: profile CRUD, browse, interests, connections, groups.
- `messAPI`: browse/register/read/update, menu, save, dashboard.
- `cookAPI`: browse/register/read/update, save, dashboard.
- `chatAPI`: conversations and messages.
- `notificationAPI`: list, unread count, mark read/all.
- `reviewAPI`: review list/create/update/delete.
- `comingSoonAPI`: services, service detail, notify.
- `adminAPI`: admin login/dashboard/users/properties/reports/analytics/settings and related actions.

## Backend Coverage Status (`app/api/[[...path]]/route.js`)

### Implemented

- **Auth**
  - `POST /auth/register`
  - `POST /auth/send-otp`
  - `POST /auth/verify-otp`
  - `POST /auth/login/phone`
  - `POST /auth/login/email`
  - `POST /auth/refresh-token`
  - `POST /auth/logout`
  - `POST /auth/forgot-password`
  - `POST /auth/reset-password`

- **User**
  - `GET /users/me`
  - `PUT /users/profile-setup`
  - `PUT /users/me`

- **Location**
  - `GET /location/cities`
  - `GET /location/cities/:city/areas`
  - `POST /location/detect`

- **Property**
  - `GET /properties`
  - `POST /properties`
  - `GET /properties/my-listings`
  - `GET /properties/saved`
  - `GET /properties/:id`
  - `PUT /properties/:id`
  - `DELETE /properties/:id`
  - `POST /properties/:id/save`
  - `POST /properties/:id/show-number`
  - `POST /properties/:id/inquiry`

- **Coming Soon**
  - `GET /coming-soon/services`
  - `POST /coming-soon/services/:serviceId/notify`

- **Notifications**
  - `GET /notifications`
  - `GET /notifications/unread-count`

### Not Yet Implemented in Current Backend

- Health route in Postman (`GET /api/health`) is outside `/api/v1` handler scope.
- User:
  - `PUT /users/me/location`
  - `PUT /users/me/language`
  - `GET /users/me/stats`
  - `GET /users/:id`
- Location:
  - `GET /location/area-guide/:city`
- Property:
  - `PATCH /properties/:id/status`
  - `GET /properties/:id/inquiries`
  - `GET /properties/compare`
  - `POST /properties/alerts`
  - `GET /properties/alerts`
  - `GET /properties/owner/dashboard`
- Entire feature groups currently missing:
  - Roommate APIs
  - Mess APIs
  - Cook APIs
  - Chat APIs
  - Reviews APIs
  - Admin APIs
  - Notification mutation endpoints (`PATCH /notifications/:id/read`, `PATCH /notifications/read-all`)
  - Coming-soon service detail (`GET /coming-soon/services/:id`)
  - Auth Google login (`POST /auth/google`)

## Structural Improvements Applied

- Refactored `lib/api.js` to a clearer domain-first structure.
- Added endpoint constants and consistent naming for readability.
- Preserved existing method names used by pages/redux (backward-compatible).
- Added extra methods required by Postman coverage (even where backend support is pending).
- Fixed syntax issue in `lib/constants.js` that prevented production build.

## Recommended Next Backend Steps

1. Implement missing routes listed above in `app/api/[[...path]]/route.js`.
2. Standardize response shapes (`{ data: ... }` vs direct objects) across all endpoints.
3. Add role checks before admin routes.
4. Add request validation for each route payload/query.
