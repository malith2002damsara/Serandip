import { useContext } from 'react';
import { ShopContext } from '../context/ShopContext';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { assets } from '../assets/assets';

const ProductItem = ({ id, image, name, price, averageRating, totalReviews }) => {
  const { currency } = useContext(ShopContext);
  
  return (
    <Link 
      className='text-gray-700 cursor-pointer group block' 
      to={`/product/${id}`}
    >
      <div className='relative overflow-hidden rounded-lg sm:rounded-xl shadow-sm hover:shadow-lg transition-all duration-300'>
        <img 
          className='w-full h-40 sm:h-48 md:h-56 lg:h-64 object-cover 
                     group-hover:scale-110 transition-transform duration-500 ease-out' 
          src={image[0]} 
          alt={name} 
        />
        <div className='absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 
                        transition-all duration-300'></div>
      </div>
      
      <div className='pt-3 sm:pt-4 space-y-1 sm:space-y-2'>
        <p className='text-xs sm:text-sm lg:text-base font-medium text-gray-800 
                      line-clamp-2 group-hover:text-black transition-colors duration-300'>
          {name}
        </p>
        
        {/* Rating Display */}
        {totalReviews > 0 && (
          <div className='flex items-center gap-1'>
            {[1, 2, 3, 4, 5].map((star) => (
              <img
                key={star}
                src={star <= Math.round(averageRating) ? assets.star_icon : assets.star_dull_icon}
                alt=""
                className='w-2.5 sm:w-3'
              />
            ))}
            <span className='text-xs text-gray-600 ml-1'>({totalReviews})</span>
          </div>
        )}
        
        <p className='text-sm sm:text-base lg:text-lg font-bold text-gray-900'>
          {currency}{price.toLocaleString()}
        </p>
      </div>
    </Link>
  );
};

ProductItem.propTypes = {
  id: PropTypes.string.isRequired,
  image: PropTypes.arrayOf(PropTypes.string).isRequired,
  name: PropTypes.string.isRequired,
  price: PropTypes.number.isRequired,
  averageRating: PropTypes.number,
  totalReviews: PropTypes.number
};

export default ProductItem;