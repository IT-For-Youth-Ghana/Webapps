# 🔄 Shared Resources

This folder contains shared code and resources used by both the **IT Youth Talent Incubator** and **Course Management Platform** frontends.

## 📁 Structure

```
shared/
├── auth/
│   └── AuthService.js        # Shared authentication service
├── colors.js                  # Shared color palette
└── README.md                  # This file
```

## 🔐 Authentication Service

The `AuthService` provides a unified authentication system for both platforms.

### Features

- ✅ **JWT-based authentication** with access and refresh tokens
- ✅ **Module access control** (incubator, courses)
- ✅ **Role-based permissions** (student, teacher, company, admin)
- ✅ **Token management** with automatic refresh
- ✅ **Local storage** for persistence
- ✅ **Profile management**

### Usage

```javascript
import AuthService from '../../../shared/auth/AuthService';

// Initialize with backend URL
const authService = new AuthService('http://localhost:5000/api');

// Login
const result = await authService.login(email, password);
console.log(result.user);

// Check authentication
if (authService.isAuthenticated()) {
  // User is logged in
}

// Check module access
if (authService.hasIncubatorAccess()) {
  // User can access IT Incubator
}

if (authService.hasCoursesAccess()) {
  // User can access Course Management
}

// Check role
if (authService.isStudent()) {
  // User is a student
}

// Get current user
const user = authService.getUser();

// Logout
await authService.logout();
```

### Available Methods

#### Authentication
- `register(userData)` - Register new user
- `login(email, password)` - Login user
- `logout()` - Logout and clear tokens
- `getProfile()` - Get current user profile
- `updateProfile(data)` - Update user profile
- `forgotPassword(email)` - Request password reset
- `resetPassword(token, newPassword)` - Reset password

#### Token Management
- `getAccessToken()` - Get current access token
- `getRefreshToken()` - Get refresh token
- `refreshAccessToken()` - Refresh expired access token
- `isAuthenticated()` - Check if user is logged in

#### Module Access Control
- `hasModuleAccess(module)` - Check if user has access to module
- `hasIncubatorAccess()` - Check incubator access
- `hasCoursesAccess()` - Check courses access
- `getAccessibleModules()` - Get all accessible modules

#### Role Management
- `getUserRole()` - Get current user role
- `hasRole(role)` - Check if user has specific role
- `isStudent()` - Check if user is a student
- `isTeacher()` - Check if user is a teacher
- `isCompany()` - Check if user is a company
- `isAdmin()` - Check if user is an admin

## 🎨 Colors

Shared color palette used across both platforms.

```javascript
import colors from '../../../shared/colors';

// Use in components
const primaryColor = colors.primary;
```

## 🔌 Integration in Projects

### IT Youth Talent Incubator

```javascript
// it-youth-talent-incubator/src/config/api.js
import AuthService from '../../../shared/auth/AuthService';

export const API_BASE_URL = import.meta.env.VITE_API_URL;
export const authService = new AuthService(API_BASE_URL);
```

### Course Management Platform

```javascript
// course-Management-Plattform/src/config/api.js
import AuthService from '../../../shared/auth/AuthService';

export const API_BASE_URL = import.meta.env.VITE_API_URL;
export const authService = new AuthService(API_BASE_URL);
```

## 🔧 Backend Requirements

The shared AuthService expects the following backend endpoints:

### Authentication Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password
- `POST /api/auth/token/refresh` - Refresh access token

### User Endpoints
- `GET /api/users/me` - Get user profile
- `PUT /api/users/me` - Update user profile
- `GET /api/users/teachers` - Get all teachers (for course platform)

### Expected User Schema

```javascript
{
  _id: ObjectId,
  email: String,
  role: String,              // 'student', 'teacher', 'company', 'admin'
  modules: [String],         // ['incubator', 'courses']
  photo_url: String,
  is_active: Boolean,
  status: String,
  created_at: Date,
  updated_at: Date
}
```

## 🌐 CORS Configuration

Backend must allow both frontend origins:

```javascript
// Backend CORS config
const allowedOrigins = [
  'http://localhost:3000',      // IT Incubator
  'http://localhost:3001',      // Course Management
  'http://localhost:5173',      // Vite dev server
];
```

## 🚀 Benefits

1. **Single Sign-On (SSO)** - Users login once, access both platforms
2. **Consistent Authentication** - Same auth flow across platforms
3. **Reduced Code Duplication** - Write auth logic once
4. **Easier Maintenance** - Update in one place
5. **Shared User Base** - Single user database
6. **Module-Based Access** - Fine-grained control over platform access

## 📝 Notes

- Both platforms use the **same backend** and **same user database**
- Users can access both platforms with **one account**
- Module access is controlled by the `modules` array in user profile
- Tokens are stored in **localStorage** for persistence
- Automatic token refresh on 401 errors
- CORS must be configured for both frontend origins

## 🔐 Security

- Access tokens are short-lived (1 day)
- Refresh tokens stored securely with rotation
- Automatic logout on token expiration
- HTTPS required in production
- Credentials included in all requests
