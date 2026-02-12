import  { useEffect, useState, useContext } from 'react';
import { ShopContext } from '../context/ShopContext';
import Title from './Title';
import ProductItem from './ProductItem';
import axios from '../config/axiosConfig';

const BestSeller = () => {
  const { products, backendUrl } = useContext(ShopContext);
  const [bestSeller, setBestSeller] = useState([]);
  const [reviewsData, setReviewsData] = useState({});

  useEffect(() => {
   // Check if products is defined and has items
      const bestProduct = products.filter((item) => item.bestSeller);
      setBestSeller(bestProduct) // Show all bestseller products instead of limiting to 5
      
      // Fetch reviews for bestseller products
      if (bestProduct.length > 0) {
        fetchReviewsForProducts(bestProduct);
      }
  }, [products]) // Add products as a dependency

  const fetchReviewsForProducts = async (productsList) => {
    try {
      const reviewPromises = productsList.map(async (product) => {
        try {
          const response = await axios.get(`${backendUrl}/api/review/product/${product._id}`);
          if (response.data.success) {
            return {
              productId: product._id,
              averageRating: response.data.averageRating || 0,
              totalReviews: response.data.totalReviews || 0
            };
          }
        } catch (error) {
          console.error(`Error fetching reviews for product ${product._id}:`, error);
        }
        return {
          productId: product._id,
          averageRating: 0,
          totalReviews: 0
        };
      });

      const reviewResults = await Promise.all(reviewPromises);
      const reviewsMap = {};
      reviewResults.forEach(result => {
        reviewsMap[result.productId] = {
          averageRating: result.averageRating,
          totalReviews: result.totalReviews
        };
      });
      
      setReviewsData(reviewsMap);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  return (
    <div className='my-8 sm:my-12 lg:my-16'>
      <div className='text-center py-6 sm:py-8'>
        <Title text1='BEST' text2='SELLERS' />
        <p className='w-11/12 sm:w-3/4 lg:w-2/3 mx-auto text-sm sm:text-base text-gray-600 mt-4 leading-relaxed'>
          Discover our top-selling products hand-picked for you. These customer favorites 
          represent the best in quality, style, and value.
        </p>
      </div>

      <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 
                      gap-3 sm:gap-4 lg:gap-6 gap-y-6 sm:gap-y-8 px-2 sm:px-4'>
        {bestSeller.length > 0 ? (
          bestSeller.map((item,index)=> {
            const productReviews = reviewsData[item._id] || { averageRating: 0, totalReviews: 0 };
            return (
              <ProductItem 
                key={index} 
                id={item._id} 
                image={item.image} 
                name={item.name} 
                price={item.price}
                averageRating={productReviews.averageRating}
                totalReviews={productReviews.totalReviews}
              />
            );
          })
        ) : (
          <div className='col-span-full text-center text-gray-500 py-8 sm:py-12'>
            <div className='max-w-md mx-auto'>
              <p className='text-lg sm:text-xl font-medium mb-2'>No bestseller products available</p>
              <p className='text-sm sm:text-base'>Check back later for our top-selling items!</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BestSeller;
