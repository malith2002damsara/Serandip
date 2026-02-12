import  { useContext, useEffect, useState, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { ShopContext } from '../context/ShopContext';
import {assets} from '../assets/assets'
import RelatedProducts from '../components/RelatedProducts';
import axios from '../config/axiosConfig';
import { toast } from 'react-toastify';


const Product = () => {

const {productId}=useParams();
//console.log(productId);
const {products,currency,addToCart,backendUrl,token} =useContext(ShopContext);
const [productData,setProductData]=useState(false);
const [image,setImage]=useState('')
const [size,setSize]=useState('');
const [reviews, setReviews] = useState([]);
const [reviewStats, setReviewStats] = useState({ totalReviews: 0, averageRating: 0 });

const fetchProductData = useCallback(async()=>{
    products.map((item)=>{
      if(item._id==productId){
        setProductData(item)
        setImage(item.image[0])
        // console.log(item);
        return null;
      }
    })
}, [products, productId]);

const fetchReviews = useCallback(async () => {
  try {
    const reviewUrl = `${backendUrl}/api/review/product/${productId}`;
    console.log('Fetching reviews for product:', productId);
    console.log('Backend URL:', backendUrl);
    console.log('Full review URL:', reviewUrl);
    
    const response = await axios.get(reviewUrl);
    console.log('Reviews response status:', response.status);
    console.log('Reviews response data:', JSON.stringify(response.data, null, 2));
    
    if (response.data.success) {
      const reviewsData = response.data.reviews || [];
      const totalCount = response.data.totalReviews || 0;
      const avgRating = response.data.averageRating || 0;
      
      console.log('Setting reviews:', reviewsData.length, 'reviews');
      console.log('Setting stats - Total:', totalCount, 'Average:', avgRating);
      
      setReviews(reviewsData);
      setReviewStats({
        totalReviews: totalCount,
        averageRating: avgRating
      });
    } else {
      console.warn('API returned success=false');
      setReviews([]);
      setReviewStats({ totalReviews: 0, averageRating: 0 });
    }
  } catch (error) {
    console.error('Error fetching reviews:', error);
    console.error('Error details:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      url: error.config?.url
    });
    // Set empty state on error
    setReviews([]);
    setReviewStats({ totalReviews: 0, averageRating: 0 });
  }
}, [backendUrl, productId]);

useEffect(()=>{
  fetchProductData();
  if (productId) {
    fetchReviews();
  }
},[fetchProductData, fetchReviews, productId])


  return productData ? (
    <div className='border-t-2 pt-10 transition-opacity ease-in duration-500 opacity-100'>

      {/* ------------------product data ------------------------ */}
      
      <div className="flex gap-12 sm:gap-12 flex-col sm:flex-row">
      
          {/* product --------------------------------     images */}
      
          <div className="flex-1 flex flex-col-reverse gap-3 sm:flex-row px-5 ">
            <div className="flex sm:flex-col overflow-x-auto sm:overflow-y-scroll justify-between sm:justify-normal sm:w-[18.7%] w-full ">
           {
            productData.image.map((item,index)=>(
              <img onClick={()=>setImage(item)} src={item} key={index} alt="" className="w-[24%] sm:w-full sm:mb-3 flex-shrink-0 cursor-pointer" />
            ))
           }

            </div>
            <div className="w-full sm:w-[80%]">
              <img  src={image} alt="" className="w-full h-auto" />
            </div>
          </div>

{/* -------------product info -------------------------- */}

<div className="flex-1 px-5">
  <h1 className="font-medium text-2xl mt-2">
{productData.name}
  </h1>
  <div className="flex items-center gap-1 mt-2">
    {[1, 2, 3, 4, 5].map((star) => (
      <img
        key={star}
        src={star <= Math.round(reviewStats.averageRating) ? assets.star_icon : assets.star_dull_icon}
        alt=""
        className="w-3.5"
      />
    ))}
    <p className="pl-2">({reviewStats.totalReviews})</p>
  </div>
  <p className='mt-5 text-3xl font-medium'>{currency}{productData.price}</p>
  <p className="mt-5 text-gray-500 md:w-4/5">{productData.description}</p>
  <div className="flex flex-col gap-4 my-8">
    <p>Select Size</p>
    <div className="flex gap-2">
      {productData.sizes.map((item,index)=>(

         <button onClick={()=>setSize(item)} className={`border py-2 px-4 bg-gray-100 ${item==size ? 'border-orange-500' : ''}`} key={index}>{item} </button>

      ))}
    </div>
  </div>
  <button onClick={()=>addToCart(productData._id,size)} className='bg-black text-white px-8 py-3 text-sm active:bg-gray-700'>ADD TO CART</button>
  <hr className="mt-8 sm:w-4/5" />
  <div className="text-sm text-gray-500 mt-5 flex flex-col gap-1">
    <p>100% original product.</p>
    <p>cash on delivery is available policy within 7 days.</p>
    <p>Easy return and exchange policy </p>
  </div>
</div>

      </div>
      {/* ---------------Review Section -------------------- */}
        
        <div className="mt-20 px-5">
          <div className="flex">
           <p className="border px-5 py-3 text-sm">Reviews ({reviewStats.totalReviews})</p>
          </div>

          {/* Reviews List */}
          <div className="flex flex-col gap-4 border px-6 py-6 text-sm text-gray-700">
            {reviews.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No reviews yet. Be the first to review this product!</p>
            ) : (
              reviews.map((review) => (
                <div key={review._id} className="border-b pb-4 last:border-b-0">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold">{review.userName}</p>
                      {review.rating && review.rating > 0 && (
                        <div className="flex gap-0.5">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <img
                              key={star}
                              src={star <= review.rating ? assets.star_icon : assets.star_dull_icon}
                              alt=""
                              className="w-3.5"
                            />
                          ))}
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-gray-500">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  {review.comment && (
                    <p className="text-gray-600">{review.comment}</p>
                  )}
                  {!review.comment && review.rating && (
                    <p className="text-gray-400 italic text-xs">Customer gave a rating without written review</p>
                  )}
                  {review.image?.url && (
                    <img
                      src={review.image.url}
                      alt="Review"
                      className="mt-2 w-24 h-24 object-cover rounded"
                    />
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* -------------display related products ---------------- */}

        <RelatedProducts category={productData.category} subCategory={productData.subcategory}/>

    </div>
  ) : <div className="opacity-0"></div>
}

export default Product