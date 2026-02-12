import { useState, useEffect, useContext } from 'react';
import { ShopContext } from '../context/ShopContext';
import ReviewModal from './ReviewModal';
import axios from '../config/axiosConfig';
import { toast } from 'react-toastify';

const ReviewNotification = () => {
  const { backendUrl, token } = useContext(ShopContext);
  const [eligibleProducts, setEligibleProducts] = useState([]);
  const [showNotification, setShowNotification] = useState(false);
  const [currentProductIndex, setCurrentProductIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchEligibleProducts = async () => {
      if (!token) {
        // Clear notification when user logs out
        setShowNotification(false);
        setEligibleProducts([]);
        setCurrentProductIndex(0);
        return;
      }

      try {
        console.log('Fetching eligible products for review...');
        const response = await axios.get(
          `${backendUrl}/api/review/eligible`,
          { headers: { token } }
        );

        console.log('Eligible products response:', response.data);

        if (response.data.success && response.data.products.length > 0) {
          // Get skipped products from localStorage
          const skippedProducts = JSON.parse(localStorage.getItem('reviewNotificationsShown') || '[]');
          
          // Filter out products that were skipped OR already reviewed
          const newProducts = response.data.products.filter(
            product => !skippedProducts.includes(product.productId)
          );

          console.log(`Total eligible: ${response.data.products.length}, After filtering skipped: ${newProducts.length}`);

          if (newProducts.length > 0) {
            setEligibleProducts(newProducts);
            setCurrentProductIndex(0);
            // Show notification after a small delay for better UX
            setTimeout(() => setShowNotification(true), 2000);
          } else {
            console.log('All eligible products have been skipped or reviewed');
            setShowNotification(false);
          }
        } else {
          console.log('No eligible products found');
          setShowNotification(false);
        }
      } catch (error) {
        console.error('Error fetching eligible products:', error);
        console.error('Error details:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status,
          url: error.config?.url
        });
        
        if (error.response?.status === 401) {
          console.log('Token invalid, clearing notification');
          setShowNotification(false);
        } else if (error.code === 'ERR_NETWORK') {
          console.error('Network error - Cannot connect to backend. Please ensure backend is running on', backendUrl);
        }
        
        setShowNotification(false);
      }
    };

    // Reset and check for eligible products when token changes (user logs in)
    if (token) {
      // Reset state first
      setShowNotification(false);
      setCurrentProductIndex(0);
      // Then fetch
      fetchEligibleProducts();
    }

    // Check periodically (every 10 minutes) for new delivered products
    const interval = setInterval(() => {
      if (token) {
        fetchEligibleProducts();
      }
    }, 10 * 60 * 1000);

    return () => clearInterval(interval);
  }, [token, backendUrl]);

  const handleSkip = () => {
    // Mark current product as shown (skipped)
    const currentProduct = eligibleProducts[currentProductIndex];
    if (currentProduct) {
      const shownProducts = JSON.parse(localStorage.getItem('reviewNotificationsShown') || '[]');
      shownProducts.push(currentProduct.productId);
      localStorage.setItem('reviewNotificationsShown', JSON.stringify(shownProducts));
    }

    // Move to next product or hide notification
    if (currentProductIndex < eligibleProducts.length - 1) {
      setCurrentProductIndex(currentProductIndex + 1);
    } else {
      setShowNotification(false);
      setCurrentProductIndex(0);
    }
  };

  const handleDismiss = () => {
    // Same as skip
    handleSkip();
  };

  const handleReviewClick = () => {
    setIsModalOpen(true);
  };

  const handleReviewSubmitted = async () => {
    // Mark as skipped so it won't show again
    handleDismiss();
    toast.success('Thank you for your review!');
    
    // Refresh eligible products after a short delay
    setTimeout(async () => {
      try {
        const response = await axios.get(
          `${backendUrl}/api/review/eligible`,
          { headers: { token } }
        );
        
        if (response.data.success && response.data.products.length > 0) {
          const skippedProducts = JSON.parse(localStorage.getItem('reviewNotificationsShown') || '[]');
          const newProducts = response.data.products.filter(
            product => !skippedProducts.includes(product.productId)
          );
          
          if (newProducts.length > 0) {
            setEligibleProducts(newProducts);
            setCurrentProductIndex(0);
            setShowNotification(true);
          }
        }
      } catch (error) {
        console.error('Error refreshing eligible products:', error);
      }
    }, 1000);
  };

  if (!showNotification || eligibleProducts.length === 0) {
    return null;
  }

  const currentProduct = eligibleProducts[currentProductIndex];

  return (
    <>
      <div className="fixed bottom-4 right-4 z-40 max-w-sm bg-white rounded-lg shadow-2xl border border-gray-200 p-4 animate-slide-up">
        <div className="flex items-start gap-3">
          <img
            src={currentProduct.productImage}
            alt={currentProduct.productName}
            className="w-16 h-16 object-cover rounded"
          />
          <div className="flex-1">
            <div className="flex items-start justify-between mb-1">
              <h3 className="font-semibold text-sm">📦 Product Delivered!</h3>
              <button
                onClick={handleDismiss}
                className="text-gray-400 hover:text-gray-600 text-xl leading-none"
              >
                ×
              </button>
            </div>
            <p className="text-xs text-gray-600 mb-1 font-medium">{currentProduct.productName}</p>
            <p className="text-xs text-gray-500 mb-3">
              How was your experience? Share your rating or review!
            </p>
            {eligibleProducts.length > 1 && (
              <p className="text-xs text-gray-400 mb-2">
                {currentProductIndex + 1} of {eligibleProducts.length} products to review
              </p>
            )}
            <div className="flex gap-2">
              <button
                onClick={handleReviewClick}
                className="flex-1 px-3 py-1.5 bg-black text-white text-xs rounded hover:bg-gray-800 transition-colors"
              >
                ✍️ Write Review
              </button>
              <button
                onClick={handleSkip}
                className="px-3 py-1.5 border border-gray-300 text-xs rounded hover:bg-gray-50 transition-colors"
              >
                Skip
              </button>
            </div>
          </div>
        </div>
      </div>

      <ReviewModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        product={currentProduct}
        orderId={currentProduct.orderId}
        onReviewSubmitted={handleReviewSubmitted}
        backendUrl={backendUrl}
        token={token}
      />
    </>
  );
};

export default ReviewNotification;
