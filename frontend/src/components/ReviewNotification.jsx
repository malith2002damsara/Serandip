import { useState, useEffect, useContext } from 'react';
import { ShopContext } from '../context/ShopContext';
import ReviewModal from './ReviewModal';
import axios from 'axios';
import { toast } from 'react-toastify';

const ReviewNotification = () => {
  const { backendUrl, token } = useContext(ShopContext);
  const [eligibleProducts, setEligibleProducts] = useState([]);
  const [showNotification, setShowNotification] = useState(false);
  const [currentProductIndex, setCurrentProductIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchEligibleProducts = async () => {
      if (!token) return;

      try {
        const response = await axios.get(
          `${backendUrl}/api/review/eligible`,
          { headers: { token } }
        );

        if (response.data.success && response.data.products.length > 0) {
          // Check localStorage to see which products we've already shown notification for
          const shownProducts = JSON.parse(localStorage.getItem('reviewNotificationsShown') || '[]');
          const newProducts = response.data.products.filter(
            product => !shownProducts.includes(product.productId)
          );

          if (newProducts.length > 0) {
            setEligibleProducts(newProducts);
            setShowNotification(true);
          }
        }
      } catch (error) {
        console.error('Error fetching eligible products:', error);
      }
    };

    // Check for eligible products every time the component mounts or token changes
    fetchEligibleProducts();

    // Check periodically (every 5 minutes) for new delivered products
    const interval = setInterval(fetchEligibleProducts, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [token, backendUrl]);

  const handleDismiss = () => {
    // Mark current product as shown
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

  const handleReviewClick = () => {
    setIsModalOpen(true);
  };

  const handleReviewSubmitted = () => {
    handleDismiss();
    toast.success('Thank you for your review!');
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
              <h3 className="font-semibold text-sm">Your order was delivered!</h3>
              <button
                onClick={handleDismiss}
                className="text-gray-400 hover:text-gray-600 text-xl leading-none"
              >
                ×
              </button>
            </div>
            <p className="text-xs text-gray-600 mb-2">{currentProduct.productName}</p>
            <p className="text-xs text-gray-500 mb-3">
              How was your experience? Share your review!
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleReviewClick}
                className="px-3 py-1.5 bg-black text-white text-xs rounded hover:bg-gray-800"
              >
                Write Review
              </button>
              <button
                onClick={handleDismiss}
                className="px-3 py-1.5 border border-gray-300 text-xs rounded hover:bg-gray-50"
              >
                Later
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
