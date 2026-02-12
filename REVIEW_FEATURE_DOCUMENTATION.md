# Product Review Notification Feature

## Overview
This feature automatically prompts users to rate and review products they have received when they log into the website.

## Features Implemented

### 1. **Automatic Review Prompts** ✅
- When a user logs in, the system checks for delivered products that haven't been reviewed yet
- A notification card appears in the bottom-right corner of the screen
- The notification shows product details and delivery status

### 2. **Flexible Review Submission** ✅
- Users can provide:
  - **Rating only** (1-5 stars)
  - **Written review only**
  - **Both rating and review**
- At least one of the two must be provided

### 3. **Skip Functionality** ✅
- Users can skip reviewing a product by clicking the "Skip" button
- Skipped products won't show notifications again
- If multiple products need reviews, the next product is shown

### 4. **Multiple Product Handling** ✅
- Shows "X of Y products to review" counter when multiple products are pending
- Cycles through products one by one
- Each product can be reviewed or skipped independently

### 5. **Smart Notification System** ✅
- Notifications appear 2 seconds after login for better UX
- Checks every 10 minutes for new delivered products
- Uses localStorage to track which products have been shown
- Clears when user logs out

## Technical Implementation

### Backend Changes

#### 1. Review Model (`backend/models/reviewModel.js`)
```javascript
rating: { type: Number, required: false, min: 1, max: 5 }  // Now optional
comment: { type: String, required: false, trim: true }      // Now optional
```

#### 2. Review Controller (`backend/controllers/reviewController.js`)
- **Fixed `getEligibleProducts` endpoint**:
  - Now uses `req.userId` from auth middleware (was using `req.body.userId`)
  - Added proper error handling and validation
  - Returns products sorted by delivery date
  
- **Updated `addReview` endpoint**:
  - Validates that at least rating OR comment is provided
  - No longer requires both fields

- **Updated `getProductReviews` endpoint**:
  - Calculates average rating only from reviews that have ratings
  - Returns `null` for missing rating/comment (not empty string/0)

#### 3. API Endpoints
- `GET /api/review/eligible` - Fetches products eligible for review (requires authentication)
- `POST /api/review/add` - Submits a review (requires authentication)
- `GET /api/review/product/:productId` - Gets all reviews for a product (public)

### Frontend Changes

#### 1. ReviewNotification Component (`frontend/src/components/ReviewNotification.jsx`)
- Enhanced with better error handling
- Added 2-second delay before showing notification
- Shows product count when multiple products need review
- Clear "Skip" button label
- Auto-hides when user logs out

#### 2. ReviewModal Component (`frontend/src/components/ReviewModal.jsx`)
- Updated validation to require at least one of rating or comment
- Added "(optional)" labels to both fields
- Added "Clear rating" button
- Info banner explaining flexible requirements
- Better error messages

#### 3. Product Display (`frontend/src/pages/Product.jsx`)
- Only shows star ratings if review has a rating
- Shows placeholder text if review has rating but no comment
- Handles null/undefined values gracefully

## User Flow

1. **User logs in** → System checks for delivered products without reviews
2. **Notification appears** (if eligible products found)
3. **User can:**
   - Click "Write Review" → Opens review modal
   - Click "Skip" → Marks product as shown, moves to next
   - Click "×" → Same as skip
4. **In Review Modal, user can:**
   - Provide only rating
   - Provide only written review
   - Provide both
   - Click "Cancel" to close without submitting
5. **After submission:**
   - Product marked as reviewed in database
   - Order item's `reviewed` flag set to `true`
   - Thank you message shown
   - Next eligible product shown (if any)

## Database Schema

### Order Model
```javascript
items: [{
  product: ObjectId,
  name: String,
  image: [String],
  price: Number,
  quantity: Number,
  size: String,
  sellername: String,
  reviewed: Boolean  // Tracks if user reviewed this product
}]
status: String  // Must be 'Delivered' for eligibility
```

### Review Model
```javascript
{
  user: ObjectId (required),
  product: ObjectId (required),
  order: ObjectId (optional),
  rating: Number (optional, 1-5),
  comment: String (optional),
  image: { public_id: String, url: String },
  createdAt: Date,
  updatedAt: Date
}
```

## Local Storage
- `reviewNotificationsShown`: Array of productIds that have been shown to user
- Cleared on logout (handled automatically)

## Testing Checklist

### Backend Testing
- [ ] Test GET /api/review/eligible with authenticated user
- [ ] Test GET /api/review/eligible without authentication (should fail)
- [ ] Test POST /api/review/add with only rating
- [ ] Test POST /api/review/add with only comment
- [ ] Test POST /api/review/add with both rating and comment
- [ ] Test POST /api/review/add without either (should fail)
- [ ] Verify order item's `reviewed` flag updates after review submission

### Frontend Testing
- [ ] Login with account that has delivered orders
- [ ] Verify notification appears after 2 seconds
- [ ] Test "Write Review" button opens modal
- [ ] Test submitting review with only rating
- [ ] Test submitting review with only comment
- [ ] Test submitting review with both
- [ ] Test "Skip" button functionality
- [ ] Test multiple products cycling
- [ ] Verify skipped products don't show again
- [ ] Test notification doesn't show after logout

## Environment Variables Required
```env
JWT_SECRET=your_jwt_secret
MONGODB_URI=your_mongodb_connection_string
```

## Dependencies
All dependencies are already installed in the project:
- Backend: express, mongoose, jsonwebtoken, cloudinary
- Frontend: react, react-router-dom, axios, react-toastify

## Notes
- Review notifications check every 10 minutes for new delivered products
- Users can review products even without the notification via product page
- Average ratings only count reviews that have ratings
- Product detail page displays reviews correctly whether they have rating, comment, or both
