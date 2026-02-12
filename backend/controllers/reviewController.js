import Review from '../models/reviewModel.js';
import Order from '../models/orderModel.js';
import cloudinary from '../config/cloudinary.js';

// @desc    Add a new review
// @route   POST /api/review/add
// @access  Private
export const addReview = async (req, res) => {
  try {
    const { productId, orderId, rating, comment } = req.body;
    // Get userId from req.userId (set by auth middleware) or req.body.userId
    const userId = req.userId || req.body.userId;

    // Validate userId from auth middleware
    if (!userId) {
      return res.status(401).json({ success: false, message: 'User authentication required' });
    }

    // Validate required fields - at least rating OR comment must be provided
    if (!productId) {
      return res.status(400).json({ success: false, message: 'Product ID is required' });
    }
    
    if (!rating && !comment) {
      return res.status(400).json({ success: false, message: 'Please provide at least a rating or a comment' });
    }

    // Ensure productId is a string
    const productIdStr = typeof productId === 'object' ? productId.toString() : productId;
    const orderIdStr = orderId && typeof orderId === 'object' ? orderId.toString() : orderId;

    // Check if user has already reviewed this product (without order requirement)
    const existingReview = await Review.findOne({
      user: userId,
      product: productIdStr
    });

    if (existingReview) {
      return res.status(400).json({ success: false, message: 'You have already reviewed this product' });
    }

    // If orderId is provided, validate the order
    if (orderIdStr) {
      const order = await Order.findOne({
        _id: orderIdStr,
        user: userId,
        status: 'Delivered'
      });

      if (order) {
        // Check if product exists in order
        const productInOrder = order.items.find(item => 
          item.product.toString() === productIdStr
        );

        if (productInOrder) {
          // Update order item to mark as reviewed
          order.items = order.items.map(item => {
            if (item.product.toString() === productIdStr) {
              item.reviewed = true;
            }
            return item;
          });
          await order.save();
        }
      }
    }

    // Handle image upload if exists
    let imageData = {};
    if (req.file) {
      try {
        const result = await cloudinary.uploader.upload(req.file.path, {
          folder: 'reviews',
          width: 800,
          height: 800,
          crop: 'limit'
        });
        imageData = {
          public_id: result.public_id,
          url: result.secure_url
        };
      } catch (error) {
        console.error('Cloudinary upload error:', error);
        return res.status(500).json({ success: false, message: 'Image upload failed' });
      }
    }

    // Create new review
    const review = new Review({
      user: userId,
      product: productIdStr,
      order: orderIdStr || null,
      rating,
      comment,
      image: imageData
    });

    const createdReview = await review.save();

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully',
      review: {
        _id: createdReview._id,
        rating: createdReview.rating,
        comment: createdReview.comment,
        image: createdReview.image,
        createdAt: createdReview.createdAt
      }
    });
  } catch (error) {
    console.error('Error adding review:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

// @desc    Get all reviews for a product
// @route   GET /api/review/product/:productId
// @access  Public
export const getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;
    console.log('Getting reviews for product ID:', productId);

    const reviews = await Review.find({ product: productId })
      .populate('user', 'name')
      .sort({ createdAt: -1 })
      .lean();

    console.log('Found reviews count:', reviews.length);
    console.log('Reviews data:', JSON.stringify(reviews, null, 2));

    // Calculate average rating (only from reviews that have ratings)
    const reviewsWithRatings = reviews.filter(review => review.rating && review.rating > 0);
    const totalReviews = reviews.length;
    const averageRating = reviewsWithRatings.length > 0
      ? reviewsWithRatings.reduce((sum, review) => sum + review.rating, 0) / reviewsWithRatings.length
      : 0;

    const responseData = {
      success: true,
      reviews: reviews.map(review => ({
        _id: review._id,
        userName: review.user?.name || 'Anonymous',
        rating: review.rating || null,
        comment: review.comment || null,
        image: review.image || null,
        createdAt: review.createdAt
      })),
      totalReviews,
      averageRating: Math.round(averageRating * 10) / 10
    };

    console.log('Sending response:', JSON.stringify(responseData, null, 2));
    res.status(200).json(responseData);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

// @desc    Get products eligible for review by user
// @route   GET /api/review/eligible
// @access  Private
export const getEligibleProducts = async (req, res) => {
  try {
    // Get userId from auth middleware (req.userId for GET requests)
    const userId = req.userId || req.body.userId;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'User authentication required' });
    }

    console.log('Fetching eligible products for user:', userId);

    // Find all delivered orders for the user
    const orders = await Order.find({
      user: userId,
      status: 'Delivered'
    }).populate('items.product').sort({ updatedAt: -1 });

    console.log(`Found ${orders.length} delivered orders`);

    // Extract products that haven't been reviewed
    const eligibleProducts = [];
    
    // Get all reviews by this user to double-check
    const userReviews = await Review.find({ user: userId }).lean();
    const reviewedProductIds = new Set(
      userReviews.map(review => review.product.toString())
    );
    
    console.log(`User has reviewed ${reviewedProductIds.size} products`);
    
    orders.forEach(order => {
      order.items.forEach(item => {
        if (item.product) {
          const productIdStr = item.product._id.toString();
          
          // Only include if: 
          // 1. Not marked as reviewed in order AND
          // 2. No review exists in Review collection
          if (!item.reviewed && !reviewedProductIds.has(productIdStr)) {
            eligibleProducts.push({
              orderId: order._id.toString(),
              productId: productIdStr,
              productName: item.name,
              productImage: item.image[0],
              deliveredDate: order.updatedAt,
              orderDate: order.date
            });
          }
        }
      });
    });

    console.log(`Found ${eligibleProducts.length} products eligible for review`);

    res.status(200).json({
      success: true,
      products: eligibleProducts
    });
  } catch (error) {
    console.error('Error fetching eligible products:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};