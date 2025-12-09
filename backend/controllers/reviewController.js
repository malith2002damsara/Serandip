import Review from '../models/reviewModel.js';
import Order from '../models/orderModel.js';
import cloudinary from '../config/cloudinary.js';

// @desc    Add a new review
// @route   POST /api/review/add
// @access  Private
export const addReview = async (req, res) => {
  try {
    const { productId, orderId, rating, comment, userId } = req.body;

    // Validate required fields
    if (!productId || !orderId || !rating || !comment) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields' });
    }

    // Check if order exists and belongs to user
    const order = await Order.findOne({
      _id: orderId,
      user: userId,
      status: 'Delivered'
    });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found or not eligible for review' });
    }

    // Check if product exists in order
    const productInOrder = order.items.find(item => 
      item.product.toString() === productId
    );

    if (!productInOrder) {
      return res.status(404).json({ success: false, message: 'Product not found in this order' });
    }

    // Check if already reviewed
    const existingReview = await Review.findOne({
      user: userId,
      product: productId,
      order: orderId
    });

    if (existingReview) {
      return res.status(400).json({ success: false, message: 'You have already reviewed this product' });
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
      product: productId,
      order: orderId,
      rating,
      comment,
      image: imageData
    });

    const createdReview = await review.save();

    // Update order item to mark as reviewed
    order.items = order.items.map(item => {
      if (item.product.toString() === productId) {
        item.reviewed = true;
      }
      return item;
    });

    await order.save();

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

    const reviews = await Review.find({ product: productId })
      .populate('user', 'name')
      .sort({ createdAt: -1 });

    // Calculate average rating
    const totalReviews = reviews.length;
    const averageRating = totalReviews > 0
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews
      : 0;

    res.status(200).json({
      success: true,
      reviews: reviews.map(review => ({
        _id: review._id,
        userName: review.user?.name || 'Anonymous',
        rating: review.rating,
        comment: review.comment,
        image: review.image,
        createdAt: review.createdAt
      })),
      totalReviews,
      averageRating: Math.round(averageRating * 10) / 10
    });
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
    const userId = req.body.userId;

    // Find all delivered orders for the user
    const orders = await Order.find({
      user: userId,
      status: 'Delivered'
    }).populate('items.product');

    // Extract products that haven't been reviewed
    const eligibleProducts = [];
    
    orders.forEach(order => {
      order.items.forEach(item => {
        if (!item.reviewed && item.product) {
          eligibleProducts.push({
            orderId: order._id,
            productId: item.product._id,
            productName: item.name,
            productImage: item.image[0],
            deliveredDate: order.updatedAt
          });
        }
      });
    });

    res.status(200).json({
      success: true,
      products: eligibleProducts
    });
  } catch (error) {
    console.error('Error fetching eligible products:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};