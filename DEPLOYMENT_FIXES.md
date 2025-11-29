# Ceylon E-Commerce - CORS & Deployment Fixes

## Issues Fixed

### 1. CORS Errors (AxiosError)
**Problem**: Frontend and Admin couldn't communicate with the backend due to CORS restrictions.

**Root Causes**:
- Backend vercel.json only allowed `ceylonadmin.vercel.app` but not `ceylonfrontend.vercel.app`
- Missing `token` header in CORS allowed headers
- Frontend .env pointing to localhost instead of deployed backend

**Solutions Applied**:

#### Backend Changes (`backend/server.js` & `backend/vercel.json`)
- ✅ Updated CORS to allow both frontend and admin URLs
- ✅ Added `token` to allowed headers (required for authentication)
- ✅ Added `exposedHeaders: ['token']` to make token accessible
- ✅ Implemented dynamic origin checking
- ✅ Updated vercel.json headers to include `token`

#### Frontend Changes
- ✅ Updated `frontend/.env` to use `https://ceylonbackend.vercel.app`
- ✅ Created `frontend/.env.local` for local development (http://localhost:5000)
- ✅ Updated `frontend/vercel.json` to include build environment variables
- ✅ Improved error handling in ShopContext, Orders, and PlaceOrder
- ✅ Added fallback backend URL in ShopContext

#### Admin Changes
- ✅ Created `admin/.env.local` for local development
- ✅ Existing `admin/.env` already pointed to correct backend

### 2. Environment Configuration

#### Production (Vercel Deployment)
```bash
# Frontend (.env)
VITE_BACKEND_URL=https://ceylonbackend.vercel.app

# Admin (.env)
VITE_BACKEND_URL=https://ceylonbackend.vercel.app
```

#### Local Development
```bash
# Frontend & Admin (.env.local)
VITE_BACKEND_URL=http://localhost:5000
```

**Note**: Vite prioritizes `.env.local` over `.env` for local development.

### 3. Deployment Steps

#### After Code Changes - Backend
```bash
cd backend
git add .
git commit -m "Fixed CORS configuration and added token header support"
git push

# Or if using Vercel CLI
vercel --prod
```

#### After Code Changes - Frontend
```bash
cd frontend
git add .
git commit -m "Updated backend URL and improved error handling"
git push

# Or redeploy on Vercel
```

#### After Code Changes - Admin
```bash
cd admin
git add .
git commit -m "Added local environment configuration"
git push
```

### 4. Testing the Fixes

#### Test Backend CORS
```bash
# From browser console on frontend/admin
fetch('https://ceylonbackend.vercel.app/')
  .then(r => r.json())
  .then(console.log)
```

Expected response:
```json
{
  "success": true,
  "message": "Ceylon Backend API is working!",
  "timestamp": "...",
  "status": "connected"
}
```

#### Test with Token Header
```bash
# Test cart endpoint
fetch('https://ceylonbackend.vercel.app/api/cart/get', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'token': 'your-jwt-token'
  }
})
```

### 5. Common Issues & Solutions

#### Issue: Still getting CORS errors
**Solution**: 
1. Hard refresh browser (Ctrl+Shift+R)
2. Clear browser cache
3. Wait 1-2 minutes for Vercel deployment to propagate
4. Check Network tab to see actual error response

#### Issue: 401 Unauthorized
**Solution**: 
1. Check if token is stored in localStorage
2. Verify token in request headers (Network tab)
3. Ensure user is logged in

#### Issue: Network Error
**Solution**: 
1. Verify backend is running: `https://ceylonbackend.vercel.app/health`
2. Check if MongoDB connection is working
3. Ensure environment variables are set in Vercel dashboard

#### Issue: Frontend still connecting to localhost
**Solution**: 
1. Delete `.env.local` when deploying
2. Restart development server: `npm run dev`
3. Check console logs for actual backend URL being used

### 6. Environment Variables in Vercel Dashboard

Make sure these are set in Vercel project settings:

#### Backend (ceylonbackend.vercel.app)
- `MONGODB_URI` - Your MongoDB connection string
- `JWT_SECRET` - Secret for JWT tokens
- `ADMIN_EMAIL` - Admin email
- `ADMIN_PASSWORD` - Admin password
- `CLOUDINARY_NAME` - Cloudinary cloud name
- `CLOUDINARY_API_KEY` - Cloudinary API key
- `CLOUDINARY_SECRET_KEY` - Cloudinary secret
- `STRIPE_SECRET_KEY` - Stripe secret key

#### Frontend (ceylonfrontend.vercel.app)
- `VITE_BACKEND_URL=https://ceylonbackend.vercel.app`

#### Admin (ceylonadmin.vercel.app)
- `VITE_BACKEND_URL=https://ceylonbackend.vercel.app`

### 7. Verification Checklist

After deployment, verify:

- [ ] Backend health endpoint works: `https://ceylonbackend.vercel.app/health`
- [ ] Products load on frontend
- [ ] Login works on both frontend and admin
- [ ] Cart operations work (add, remove, update)
- [ ] Orders can be placed
- [ ] Admin can view dashboard
- [ ] Admin can manage products
- [ ] No CORS errors in browser console
- [ ] All API calls show proper status codes

### 8. Local Development

To run locally:

```bash
# Terminal 1 - Backend
cd backend
npm install
npm start
# Runs on http://localhost:5000

# Terminal 2 - Frontend
cd frontend
npm install
npm run dev
# Runs on http://localhost:5173

# Terminal 3 - Admin
cd admin
npm install
npm run dev
# Runs on http://localhost:5174
```

### 9. Files Changed

```
✅ backend/server.js - Updated CORS configuration
✅ backend/vercel.json - Added token header and updated origins
✅ frontend/.env - Changed to production backend URL
✅ frontend/.env.local - Created for local development
✅ frontend/vercel.json - Added build environment variables
✅ frontend/src/context/ShopContext.jsx - Added fallback URL
✅ frontend/src/pages/Orders.jsx - Improved error handling
✅ frontend/src/pages/PlaceOrder.jsx - Better error messages
✅ admin/.env.local - Created for local development
```

### 10. Next Steps

1. **Commit and push all changes**
2. **Redeploy on Vercel** (or wait for auto-deployment)
3. **Test all functionality** in production
4. **Monitor** Vercel logs for any runtime errors
5. **Clear browser cache** and test again if issues persist

## Support

If issues persist after these fixes:
1. Check Vercel deployment logs
2. Verify all environment variables are set
3. Test API endpoints directly using Postman
4. Check MongoDB connection status
5. Ensure Cloudinary is configured correctly
