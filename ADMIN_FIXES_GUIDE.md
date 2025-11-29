# Admin Side Error Fixes - Complete Guide

## Issues Fixed

### 1. **Backend Connection Errors**
- **Problem**: Admin Dashboard and Analytics were trying to connect to backend at `http://localhost:5000` but the backend server was not running
- **Solution**: 
  - Fixed axios configuration to use the custom axios instance with proper interceptors
  - Added better error handling for backend connection failures
  - Added fallback mock data when backend is unavailable

### 2. **Axios Configuration Issues**
- **Problem**: Dashboard and Analytics were using the raw `axios` import instead of the configured `axiosInstance`
- **Solution**: Updated both files to import and use `axiosInstance` from `../utils/axios.js`

### 3. **Error Handling**
- **Problem**: When backend was down, the app crashed with unclear error messages
- **Solution**: 
  - Added comprehensive error handling in both Dashboard and Analytics
  - Added mock/demo data as fallback
  - Added user-friendly error messages with instructions

## Changes Made

### Files Modified:

1. **`admin/src/pages/Dashboard.jsx`**
   - Changed `import axios from 'axios'` to `import axiosInstance from '../utils/axios'`
   - Updated all `axios.get()` and `axios.post()` calls to use `axiosInstance`
   - Removed hardcoded timeout values (now handled by axios instance)
   - Improved error messages with backend startup instructions

2. **`admin/src/pages/Analytics.jsx`**
   - Changed `import axios from 'axios'` to `import axiosInstance from '../utils/axios'`
   - Updated all API calls to use `axiosInstance`
   - Added comprehensive mock data for fallback
   - Added better error handling with user-friendly messages

### Files Created:

3. **`start-backend.ps1`**
   - PowerShell script to easily start the backend server
   - Checks for dependencies and .env file
   - Provides clear status messages

4. **`start-all.ps1`**
   - PowerShell script to start all services (Backend, Frontend, Admin) at once
   - Opens each service in a separate PowerShell window
   - Shows URLs for all services

## How to Start the Application

### Option 1: Start Everything at Once
```powershell
.\start-all.ps1
```

This will open three PowerShell windows:
- Backend Server (http://localhost:5000)
- Frontend (http://localhost:5173)
- Admin Panel (http://localhost:5174)

### Option 2: Start Services Individually

**Start Backend:**
```powershell
.\start-backend.ps1
# OR manually:
cd backend
npm start
```

**Start Admin Panel:**
```powershell
cd admin
npm run dev
```

**Start Frontend:**
```powershell
cd frontend
npm run dev
```

## Testing the Fixes

1. **Test with Backend Running:**
   - Start backend: `.\start-backend.ps1`
   - Start admin: `cd admin; npm run dev`
   - Navigate to Dashboard - should load real data
   - Navigate to Analytics - should load real data
   - No errors in console (except normal warnings)

2. **Test with Backend Stopped:**
   - Stop backend server (Ctrl+C)
   - Keep admin panel running
   - Navigate to Dashboard - should show demo data with yellow warning banner
   - Navigate to Analytics - should show demo data with error toast
   - Can click "Retry" button to reconnect when backend is back

## Key Features Added

### 1. Connection Warning Banner
When backend is unavailable, Dashboard shows a prominent yellow banner with:
- Clear indication of connection issue
- Instructions to start backend
- Retry button to attempt reconnection

### 2. Fallback Demo Data
Both Dashboard and Analytics now show realistic demo data when backend is unavailable:
- Dashboard: Mock orders, sellers, revenue trends
- Analytics: Mock sales by category, seller performance, payment methods

### 3. Better Error Messages
All error messages now clearly indicate:
- Whether it's a network error, server error, or other issue
- How to fix the problem (e.g., "Start backend: cd backend && npm start")
- What data is being shown (demo vs real)

### 4. Axios Instance Benefits
Using the configured axios instance provides:
- Consistent timeout handling (15 seconds)
- Request/response interceptors for logging
- CORS headers configured
- Centralized error handling

## Environment Variables

Make sure your backend `.env` file has:
```env
MONGODB_URI=<your-mongodb-uri>
JWT_SECRET=<your-jwt-secret>
ADMIN_EMAIL=<your-admin-email>
ADMIN_PASSWORD=<your-admin-password>
CLOUDINARY_NAME=<your-cloudinary-name>
CLOUDINARY_API_KEY=<your-cloudinary-key>
CLOUDINARY_SECRET_KEY=<your-cloudinary-secret>
```

## Troubleshooting

### Issue: "Cannot connect to backend"
**Solution**: Make sure backend is running on port 5000
```powershell
cd backend
npm start
```

### Issue: "Port 5000 already in use"
**Solution**: Kill the process using port 5000
```powershell
# Find process
netstat -ano | findstr :5000
# Kill process (replace <PID> with actual process ID)
taskkill /PID <PID> /F
```

### Issue: Admin login fails
**Solution**: Check that your login credentials match backend .env:
- Email: malithdamsara87@gmail.com
- Password: malith123

### Issue: Mock data showing but backend is running
**Solution**: 
1. Check backend console for errors
2. Verify MongoDB connection is working
3. Check that JWT_SECRET, ADMIN_EMAIL, and ADMIN_PASSWORD are set in backend .env
4. Click "Retry" button in Dashboard to reconnect

## What Happens Now

✅ **With Backend Running:**
- Dashboard shows real data from database
- Analytics shows real sales statistics
- All features work normally
- Can refresh data with "Refresh Data" button

✅ **Without Backend Running:**
- Dashboard shows demo data with warning banner
- Analytics shows demo data with error toast
- App doesn't crash
- Can retry connection when backend starts
- Clear instructions shown to start backend

## Summary

The main issue was that the **backend server was not running** when you were testing the admin panel. The errors you saw were:
- `AxiosError` - Network error trying to connect to localhost:5000
- `Error fetching dashboard data` - Could not fetch from non-running backend
- `Using mock data as fallback` - Falling back to demo data

Now the application:
1. Uses the proper axios instance with better configuration
2. Handles backend unavailability gracefully
3. Shows helpful error messages
4. Provides demo data as fallback
5. Includes easy-to-use startup scripts

**To completely fix the errors, simply start the backend server first before accessing the admin panel.**
