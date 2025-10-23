# 🚀 Project Setup Guide

This guide will help you set up and run both the **IT Youth Talent Incubator** and **Course Management Platform** frontends.

## 📋 Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Backend API running (by John)

## 🏗️ Project Structure

```
TalentIncubatorITForYouthGhana/
├── incubator-backend/              # Backend API (Node.js + Express + MongoDB)
├── it-youth-talent-incubator/      # IT Incubator Frontend (Vue/React)
├── course-Management-Plattform/    # Course Management Frontend (Vue/React)
└── shared/                         # Shared resources (AuthService, etc.)
```

## 🔧 Setup Instructions

### 1️⃣ **Backend Setup** (John's part)

Ask John for:
- Backend port (default: `5000`)
- Backend URL (default: `http://localhost:5000/api`)
- When the backend will be ready

### 2️⃣ **IT Youth Talent Incubator Frontend**

```bash
# Navigate to project
cd it-youth-talent-incubator

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env and set the backend URL
# VITE_API_URL=http://localhost:5000/api

# Start development server
npm run dev

# Open browser at http://localhost:3000
```

### 3️⃣ **Course Management Platform Frontend**

```bash
# Navigate to project
cd course-Management-Plattform

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env
# VITE_API_URL=http://localhost:5000/api
# VITE_USE_MOCK_DATA=true  (use mock data until backend course endpoints ready)

# Start development server
npm run dev

# Open browser at http://localhost:3001
```

## 🌐 Environment Configuration

### IT Incubator (`.env`)

```env
# Backend API URL
VITE_API_URL=http://localhost:5000/api

# App Configuration
VITE_APP_NAME=IT Youth Talent Incubator
VITE_APP_MODULE=incubator

# File Upload
VITE_MAX_FILE_SIZE=5242880
VITE_ALLOWED_FILE_TYPES=application/pdf,image/jpeg,image/png

# Features
VITE_ENABLE_ANALYTICS=false
VITE_ENABLE_NOTIFICATIONS=false
```

### Course Management (`.env`)

```env
# Backend API URL
VITE_API_URL=http://localhost:5000/api

# App Configuration
VITE_APP_NAME=Course Management Platform
VITE_APP_MODULE=courses

# Mock Data Mode (set to false when backend courses ready)
VITE_USE_MOCK_DATA=true

# File Upload
VITE_MAX_FILE_SIZE=5242880
VITE_ALLOWED_FILE_TYPES=application/pdf,image/jpeg,image/png

# Features
VITE_ENABLE_ANALYTICS=false
VITE_ENABLE_NOTIFICATIONS=false
```

## 🔐 Authentication Flow

Both platforms use the **same authentication system**:

1. User registers/logs in on either platform
2. JWT token is stored in localStorage
3. User can access both platforms with same credentials
4. Module access controlled by `modules` array in user profile

### Testing Authentication

1. Start the backend server
2. Start one of the frontends
3. Register a new user or login
4. User token is shared across both platforms

## 📦 Shared Resources

The `shared/` folder contains:

- **AuthService** - Shared authentication logic
- **Colors** - Shared color palette
- Future: API utilities, constants, etc.

Both frontends import from `../shared/`:

```javascript
// Example
import AuthService from '../../../shared/auth/AuthService';
```

## 🧪 Testing Examples

Both projects include example components:

### IT Incubator
```
it-youth-talent-incubator/src/examples/AuthExample.jsx
```

### Course Management
```
course-Management-Plattform/src/examples/CourseExample.jsx
```

Import these in your app to test the services:

```javascript
// In your main app or router
import AuthExample from './examples/AuthExample';
import CourseExample from './examples/CourseExample';

// Add to your routes
<Route path="/test-auth" element={<AuthExample />} />
<Route path="/test-courses" element={<CourseExample />} />
```

## 🔄 Mock Data Mode (Course Management)

The Course Management Platform can run in **mock data mode** until backend course endpoints are ready:

```env
VITE_USE_MOCK_DATA=true   # Use mock data
VITE_USE_MOCK_DATA=false  # Use real backend API
```

When `true`:
- ✅ All course features work with sample data
- ✅ Can develop UI without waiting for backend
- ✅ Automatic switch to real API later

When `false`:
- Connects to real backend `/api/courses` endpoints
- Requires course module in backend

## 🚨 Troubleshooting

### CORS Errors

**Problem:** Browser shows CORS errors when calling backend

**Solution:** Ask John to add your frontend URLs to CORS allowlist:
```javascript
// Backend needs:
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001,http://localhost:5173
```

### Authentication Not Working

**Problem:** Login fails or returns 401

**Solution:**
1. Check backend is running
2. Check `VITE_API_URL` in `.env` is correct
3. Check browser console for errors
4. Clear localStorage: `localStorage.clear()`

### Module Access Denied

**Problem:** User can't access a platform

**Solution:**
1. Check user's `modules` array in database
2. Should include `'incubator'` and/or `'courses'`
3. Default for new users: `['incubator']`

### Mock Data Not Loading (Course Platform)

**Problem:** Courses not showing

**Solution:**
1. Check `.env` has `VITE_USE_MOCK_DATA=true`
2. Check browser console for errors
3. Restart dev server after changing `.env`

## 📚 Development Workflow

### Current Setup

```
┌─────────────────────────────────────┐
│  IT Incubator Frontend              │
│  (localhost:3000)                   │
│  ✅ Jobs, Applications, Profiles    │
└───────────────┬─────────────────────┘
                │
                │  API Calls
                │
┌───────────────▼─────────────────────┐
│  Backend API (John)                 │
│  (localhost:5000)                   │
│  ✅ Auth, Users, Jobs, Applications │
│  ⏳ Courses (coming later)          │
└───────────────┬─────────────────────┘
                │
                │  API Calls
                │
┌───────────────▼─────────────────────┐
│  Course Management Frontend         │
│  (localhost:3001)                   │
│  🔧 Mock Data Mode                  │
│  ⏳ Backend integration later       │
└─────────────────────────────────────┘
```

### Timeline

**Now:**
- ✅ Both frontends can use authentication
- ✅ IT Incubator connects to real backend
- 🔧 Course Management uses mock data

**Later (during internship):**
- Add `/api/courses` endpoints to backend
- Switch Course Management to real API
- Set `VITE_USE_MOCK_DATA=false`

## 🎯 Next Steps

1. **Install dependencies** for both frontends
2. **Configure .env files** with backend URL
3. **Test authentication** using example components
4. **Start building features** against the APIs
5. **Coordinate with John** on backend readiness

## 📞 Getting Help

- **Backend issues:** Contact John
- **Frontend issues:** Check browser console
- **Shared service issues:** Check `shared/README.md`
- **Environment config:** Check `.env.example` files

## 🔗 Useful Links

- [Vite Documentation](https://vitejs.dev/)
- [Shared Auth Service README](./shared/README.md)
- Backend API Documentation (ask John)

---

**Last Updated:** October 2025
