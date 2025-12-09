import express from 'express';
import { addReview, getProductReviews, getEligibleProducts } from '../controllers/reviewController.js';
import authUser from '../middleware/auth.js';
import upload from '../middleware/multer.js';

const reviewRouter = express.Router();

// POST /api/review/add - Add a new review
reviewRouter.post('/add', authUser, upload.single('image'), addReview);

// GET /api/review/product/:productId - Get all reviews for a product
reviewRouter.get('/product/:productId', getProductReviews);

// GET /api/review/eligible - Get products eligible for review
reviewRouter.get('/eligible', authUser, getEligibleProducts);

export default reviewRouter;