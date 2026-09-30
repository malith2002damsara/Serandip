import { useContext, useEffect, useState } from 'react'
import { ShopContext } from '../context/ShopContext'
import Title from '../components/Title';
import { assets } from '../assets/assets';
import CartTotal from '../components/CartTotal';


const Cart = () => {

  const { 
    products, 
    currency, 
    cartItems, 
    updateQuantity, 
    removeFromCart, 
    clearCart, 
    navigate 
  } = useContext(ShopContext);
  
  const [cartData, setCartData] = useState([]);
  const [isDeleting, setIsDeleting] = useState(null); // Track which item is being deleted

  useEffect(() => {
    if(products.length > 0){
       const tempData = [];
    
      for (const items of Object.entries(cartItems)) {
        const [itemId, itemDetails] = items; // Destructure key and value
    
        if (typeof itemDetails === 'object') {
          for (const [size, quantity] of Object.entries(itemDetails)) {
            if (typeof quantity === 'number' && quantity > 0) {
              tempData.push({
                _id: itemId,
                size: size,
                quantity: quantity,
              });
            }
          }
        } else if (typeof itemDetails === 'number' && itemDetails > 0) {
          // Handle case if cartItems[itemId] is a direct number
          tempData.push({
            _id: itemId,
            size: 'default', // Default size if no size property exists
            quantity: itemDetails,
          });
        }
      }
    
      setCartData(tempData);
    }
  }, [cartItems, products]);

  // Handle item deletion with confirmation
  const handleDeleteItem = async (itemId, size) => {
    if (window.confirm('Are you sure you want to remove this item from your cart?')) {
      setIsDeleting(`${itemId}-${size}`);
      try {
        await removeFromCart(itemId, size);
      } catch (error) {
        console.error('Error deleting item:', error);
      } finally {
        setIsDeleting(null);
      }
    }
  };

  // Handle clearing entire cart
  const handleClearCart = async () => {
    if (cartData.length === 0) return;
    
    if (window.confirm('Are you sure you want to clear your entire cart?')) {
      try {
        await clearCart();
      } catch (error) {
        console.error('Error clearing cart:', error);
      }
    }
  };

  // Handle quantity update
  const handleQuantityChange = (itemId, size, newQuantity) => {
    if (newQuantity === '' || newQuantity === '0') {
      handleDeleteItem(itemId, size);
    } else {
      updateQuantity(itemId, size, Number(newQuantity));
    }
  };

  if (cartData.length === 0) {
    return (
      <div className='border-t pt-8 sm:pt-12 md:pt-14 
                      px-3 xs:px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 
                      min-h-screen max-w-7xl mx-auto'>
        <div className="text-xl xs:text-2xl sm:text-3xl mb-6 sm:mb-8">
          <Title text1={'Your'} text2={'Cart'}/>
        </div>
        
        {/* Empty Cart State */}
        <div className="flex flex-col items-center justify-center 
                        py-12 sm:py-16 md:py-20 lg:py-24 
                        text-center max-w-md mx-auto">
          <div className="w-20 xs:w-24 sm:w-28 md:w-32 h-20 xs:h-24 sm:h-28 md:h-32 
                          mb-4 sm:mb-6 md:mb-8 opacity-50 flex items-center justify-center">
            <img src={assets.cart_icon} alt="Empty Cart" className="w-full h-full object-contain" />
          </div>
          
          <h3 className="text-lg xs:text-xl sm:text-2xl font-bold text-gray-700 
                         mb-2 sm:mb-3 md:mb-4">Your cart is empty</h3>
          
          <p className="text-sm xs:text-base text-gray-500 
                        mb-6 sm:mb-8 md:mb-10 leading-relaxed px-4">
            Looks like you haven&apos;t added anything to your cart yet. 
            Start shopping to fill it up!
          </p>
          
          <button 
            onClick={() => navigate('/collection')} 
            className="bg-black text-white 
                       px-6 xs:px-8 sm:px-10 md:px-12 
                       py-3 xs:py-4 sm:py-4 
                       text-sm xs:text-base font-medium
                       hover:bg-gray-800 active:bg-gray-900 
                       transition-all duration-300 
                       transform hover:scale-105 active:scale-95
                       rounded-lg shadow-lg hover:shadow-xl
                       uppercase tracking-wider"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className='border-t pt-8 sm:pt-12 md:pt-14 
                    px-3 xs:px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 
                    max-w-7xl mx-auto pb-8 sm:pb-12'>
      
      {/* Cart Header */}
      <div className="flex flex-col xs:flex-row xs:justify-between xs:items-center 
                      gap-4 xs:gap-0 mb-6 sm:mb-8 md:mb-10">
        <div className="text-xl xs:text-2xl sm:text-3xl">
          <Title text1={'Your'} text2={'Cart'}/>
        </div>
        <div className="flex flex-col xs:flex-row xs:items-center gap-2 xs:gap-4">
          <span className="text-sm sm:text-base text-gray-600 font-medium">
            {cartData.length} item{cartData.length !== 1 ? 's' : ''}
          </span>
          <button 
            onClick={handleClearCart}
            className="text-sm sm:text-base text-red-600 hover:text-red-800 
                       underline transition-colors duration-300 
                       self-start xs:self-auto font-medium"
          >
            Clear Cart
          </button>
        </div>
      </div>

      {/* Cart Items */}
      <div className="space-y-4 sm:space-y-6 mb-8 sm:mb-12 md:mb-16">
        {cartData.map((item, index) => {
          const productData = products.find((product) => product._id === item._id);
          const isCurrentlyDeleting = isDeleting === `${item._id}-${item.size}`;
          
          if (!productData) return null;

          return (
            <div 
              key={index} 
              className={`py-4 sm:py-6 border-b border-gray-200 
                         transition-all duration-300 ${
                           isCurrentlyDeleting ? 'opacity-50 pointer-events-none' : 'opacity-100'
                         }`}
            >
              {/* Mobile Layout (< sm) */}
              <div className="sm:hidden space-y-4">
                {/* Product Info */}
                <div className="flex gap-3 xs:gap-4">
                  <div className="w-16 xs:w-20 h-16 xs:h-20 flex-shrink-0">
                    <img 
                      src={productData.image[0]} 
                      alt={productData.name}
                      className="w-full h-full object-cover rounded-lg" 
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm xs:text-base font-semibold text-gray-800 
                                   line-clamp-2 mb-1 xs:mb-2">
                      {productData.name}
                    </h3>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-sm xs:text-base font-bold text-gray-900">
                        {currency}{productData.price.toLocaleString()}
                      </span>
                      <span className="px-2 py-1 bg-gray-100 border rounded text-xs font-medium">
                        {item.size}
                      </span>
                    </div>
                  </div>
                  {/* Delete Button - Mobile */}
                  <button
                    onClick={() => handleDeleteItem(item._id, item.size)}
                    disabled={isCurrentlyDeleting}
                    className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 
                               rounded-full transition-colors duration-300 
                               disabled:opacity-50 flex-shrink-0"
                    title="Remove item"
                  >
                    {isCurrentlyDeleting ? (
                      <div className="w-4 h-4 border-2 border-red-500 border-t-transparent 
                                      rounded-full animate-spin"></div>
                    ) : (
                      <img src={assets.bin_icon} alt="Delete" className="w-4 h-4" />
                    )}
                  </button>
                </div>

                {/* Quantity and Total - Mobile */}
                <div className="flex items-center justify-between">
                  {/* Quantity Controls */}
                  <div className="flex items-center gap-2 xs:gap-3">
                    <button 
                      onClick={() => handleQuantityChange(item._id, item.size, item.quantity - 1)}
                      className="w-8 xs:w-9 h-8 xs:h-9 border border-gray-300 rounded-full 
                                 flex items-center justify-center hover:bg-gray-100 
                                 transition-colors duration-300 text-lg font-medium"
                      disabled={isCurrentlyDeleting}
                    >
                      −
                    </button>
                    <input 
                      onChange={(e) => handleQuantityChange(item._id, item.size, e.target.value)}
                      type="number" 
                      min={1} 
                      value={item.quantity} 
                      className="border border-gray-300 w-12 xs:w-14 text-center 
                                 py-2 rounded-lg text-sm font-medium"
                      disabled={isCurrentlyDeleting}
                    />
                    <button 
                      onClick={() => handleQuantityChange(item._id, item.size, item.quantity + 1)}
                      className="w-8 xs:w-9 h-8 xs:h-9 border border-gray-300 rounded-full 
                                 flex items-center justify-center hover:bg-gray-100 
                                 transition-colors duration-300 text-lg font-medium"
                      disabled={isCurrentlyDeleting}
                    >
                      +
                    </button>
                  </div>

                  {/* Total Price */}
                  <div className="text-right">
                    <span className="text-base xs:text-lg font-bold text-gray-900">
                      {currency}{(productData.price * item.quantity).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Desktop Layout (>= sm) */}
              <div className="hidden sm:grid sm:grid-cols-12 items-center gap-4 md:gap-6">
                {/* Product Info - Columns 1-6 */}
                <div className="col-span-6 flex items-center gap-4 md:gap-6">
                  <div className="w-16 sm:w-20 md:w-24 h-16 sm:h-20 md:h-24 flex-shrink-0">
                    <img 
                      src={productData.image[0]} 
                      alt={productData.name}
                      className="w-full h-full object-cover rounded-lg" 
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm sm:text-base md:text-lg font-semibold text-gray-800 
                                   line-clamp-2 mb-2">
                      {productData.name}
                    </h3>
                    <div className="flex items-center gap-4">
                      <span className="text-sm sm:text-base md:text-lg font-bold text-gray-900">
                        {currency}{productData.price.toLocaleString()}
                      </span>
                      <span className="px-3 py-1 bg-gray-100 border rounded-md 
                                       text-sm font-medium">
                        {item.size}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Quantity Controls - Columns 7-9 */}
                <div className="col-span-3 flex items-center justify-center gap-2 md:gap-3">
                  <button 
                    onClick={() => handleQuantityChange(item._id, item.size, item.quantity - 1)}
                    className="w-9 md:w-10 h-9 md:h-10 border border-gray-300 rounded-full 
                               flex items-center justify-center hover:bg-gray-100 
                               transition-colors duration-300 text-lg font-medium"
                    disabled={isCurrentlyDeleting}
                  >
                    −
                  </button>
                  <input 
                    onChange={(e) => handleQuantityChange(item._id, item.size, e.target.value)}
                    type="number" 
                    min={1} 
                    value={item.quantity} 
                    className="border border-gray-300 w-14 md:w-16 text-center 
                               py-2 rounded-lg text-sm md:text-base font-medium"
                    disabled={isCurrentlyDeleting}
                  />
                  <button 
                    onClick={() => handleQuantityChange(item._id, item.size, item.quantity + 1)}
                    className="w-9 md:w-10 h-9 md:h-10 border border-gray-300 rounded-full 
                               flex items-center justify-center hover:bg-gray-100 
                               transition-colors duration-300 text-lg font-medium"
                    disabled={isCurrentlyDeleting}
                  >
                    +
                  </button>
                </div>

                {/* Total Price - Column 10-11 */}
                <div className="col-span-2 text-right">
                  <span className="text-base md:text-lg font-bold text-gray-900">
                    {currency}{(productData.price * item.quantity).toLocaleString()}
                  </span>
                </div>

                {/* Delete Button - Column 12 */}
                <div className="col-span-1 flex justify-end">
                  <button
                    onClick={() => handleDeleteItem(item._id, item.size)}
                    disabled={isCurrentlyDeleting}
                    className="p-2 md:p-3 text-red-500 hover:text-red-700 hover:bg-red-50 
                               rounded-full transition-colors duration-300 
                               disabled:opacity-50"
                    title="Remove item"
                  >
                    {isCurrentlyDeleting ? (
                      <div className="w-4 md:w-5 h-4 md:h-5 border-2 border-red-500 border-t-transparent 
                                      rounded-full animate-spin"></div>
                    ) : (
                      <img src={assets.bin_icon} alt="Delete" className="w-4 md:w-5 h-4 md:h-5" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Cart Total and Checkout */}
      <div className="flex justify-end">
        <div className="w-full sm:w-96 md:w-[450px] lg:w-[500px]">
          <CartTotal/>
          <div className="w-full text-center sm:text-right mt-6 sm:mt-8">
            <button 
              onClick={() => navigate('/place-order')} 
              className='bg-black text-white font-medium
                         w-full sm:w-auto
                         px-8 md:px-12 py-3 md:py-4 
                         text-sm md:text-base
                         hover:bg-gray-800 active:bg-gray-900 
                         transition-all duration-300 
                         transform hover:scale-105 active:scale-95
                         rounded-lg shadow-lg hover:shadow-xl
                         uppercase tracking-wider'
            >
              Proceed to Checkout
            </button>
          </div>
        </div>
      </div>
    </div>
  ) 
}

export default Cart
