import { useContext, useEffect, useState } from 'react'
import { ShopContext } from '../context/ShopContext'
import Title from './Title';
import ProductItem from './ProductItem';
import PropTypes from 'prop-types';
import axios from '../config/axiosConfig';

const RelatedProducts = ({category,subCategory}) => {

 
  const {products, backendUrl} = useContext(ShopContext);
  const [related,setRelated]=useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewsData, setReviewsData] = useState({});

  useEffect(()=>{
    
    if(products.length > 0){
       setLoading(true);

       let productsCopy = products.slice();

       // First priority: Same category and subcategory
       let sameSubCategory = productsCopy.filter((item)=> 
         category === item.category && subCategory === item.subcategory
       );

       // Second priority: Same category but different subcategory
       let sameCategory = productsCopy.filter((item)=> 
         category === item.category && subCategory !== item.subcategory
       );

       // Third priority: Different category but similar items (bestsellers)
       let bestsellers = productsCopy.filter((item)=> 
         category !== item.category && item.bestseller
       );

       // Fourth priority: All other products if we still need more
       let otherProducts = productsCopy.filter((item)=> 
         category !== item.category && !item.bestseller
       );

       // Combine results with priorities and remove duplicates
       let combinedResults = [...sameSubCategory, ...sameCategory, ...bestsellers, ...otherProducts];
       
       // Remove duplicates based on product ID
       const uniqueProducts = combinedResults.filter((product, index, self) =>
         index === self.findIndex((p) => p._id === product._id)
       );

       const slicedProducts = uniqueProducts.slice(0, 8);
       setRelated(slicedProducts); // Show up to 8 related products
       
       // Fetch reviews for all related products
       fetchReviewsForProducts(slicedProducts);
       setLoading(false);
    }

  },[products, category, subCategory])

  const fetchReviewsForProducts = async (productsList) => {
    try {
      // Fetch reviews for all products in parallel
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
      
      // Convert array to object for easy lookup
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

  const scrollToTop = () => {
    const scrollDuration = 1; // Duration in ms
    const scrollStep = -window.scrollY / (scrollDuration / 15);
  
    const scrollInterval = setInterval(() => {
      if (window.scrollY !== 0) {
        window.scrollBy(0, scrollStep);
      } else {
        clearInterval(scrollInterval);
      }
    }, 15);
  };
  

  return (
    <div className='my-24 px-5'>
      <div className="text-center text-3xl py-2">
        <Title text1={'RELATED'} text2={'PRODUCTS'} />
      </div>
  
      {loading ? (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-500"></div>
        </div>
      ) : related.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 gap-y-6">
          {related.map((item, index) => {
            const productReviews = reviewsData[item._id] || { averageRating: 0, totalReviews: 0 };
            return (
              <div key={index} onClick={scrollToTop}>
                <ProductItem 
                  id={item._id} 
                  name={item.name} 
                  price={item.price} 
                  image={item.image}
                  averageRating={productReviews.averageRating}
                  totalReviews={productReviews.totalReviews}
                />
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-500">No related products found</p>
        </div>
      )}
    </div>
  );
  
}
RelatedProducts.propTypes = {
  category: PropTypes.string.isRequired,
  subCategory: PropTypes.string.isRequired
};

export default RelatedProducts

