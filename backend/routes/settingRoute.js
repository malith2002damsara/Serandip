import express from 'express';
import { getReviewSettings, updateReviewSettings } from '../controllers/settingController.js';
import adminAuth from '../middleware/adminAuth.js';

const settingRouter = express.Router();

settingRouter.get('/reviews', getReviewSettings);
settingRouter.post('/reviews', adminAuth, updateReviewSettings);

export default settingRouter;
