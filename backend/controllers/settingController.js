import Setting from '../models/settingModel.js';

export const REVIEWS_KEY = 'reviewsInitialCount';
const MIN_COUNT = 1;
const MAX_COUNT = 50;

// Default comes from .env (REVIEWS_INITIAL_COUNT), falls back to 3
export const getEnvDefaultCount = () => {
  const n = parseInt(process.env.REVIEWS_INITIAL_COUNT, 10);
  return Number.isInteger(n) && n >= MIN_COUNT && n <= MAX_COUNT ? n : 3;
};

// Value saved by admin (DB) wins over the .env default
export const getReviewsInitialCount = async () => {
  try {
    const setting = await Setting.findOne({ key: REVIEWS_KEY }).lean();
    const n = parseInt(setting?.value, 10);
    if (Number.isInteger(n) && n >= MIN_COUNT && n <= MAX_COUNT) return n;
  } catch (error) {
    console.error('Error reading review setting:', error.message);
  }
  return getEnvDefaultCount();
};

// GET /api/settings/reviews  (public)
export const getReviewSettings = async (req, res) => {
  const initialCount = await getReviewsInitialCount();
  res.status(200).json({ success: true, initialCount, envDefault: getEnvDefaultCount(), min: MIN_COUNT, max: MAX_COUNT });
};

// POST /api/settings/reviews  (admin only)  body: { initialCount }
export const updateReviewSettings = async (req, res) => {
  try {
    const n = parseInt(req.body.initialCount, 10);
    if (!Number.isInteger(n) || n < MIN_COUNT || n > MAX_COUNT) {
      return res.status(400).json({ success: false, message: `Count must be a whole number between ${MIN_COUNT} and ${MAX_COUNT}` });
    }
    await Setting.findOneAndUpdate({ key: REVIEWS_KEY }, { value: n }, { upsert: true, new: true });
    res.status(200).json({ success: true, message: 'Setting updated', initialCount: n });
  } catch (error) {
    console.error('Error updating review setting:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};
