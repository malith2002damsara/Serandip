import { useContext, useState, useEffect, useCallback } from 'react'
import { ShopContext } from '../context/ShopContext'
import Title from '../components/Title'
import axios from 'axios'
import { assets } from '../assets/assets'

const Orders = () => {
  const { backendUrl, token, currency } = useContext(ShopContext)
  const [orderData, setOrderData] = useState([])
  const [openReview, setOpenReview] = useState(null) // { orderId, productId }
  const [review, setReview] = useState({
    rating: 0,
    comment: '',
    image: null,
    preview: null
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [hoverRating, setHoverRating] = useState(0)

  const loadOrderData = useCallback(async () => {
    try {
      if (!token) return
      const response = await axios.post(
        backendUrl + '/api/order/userOrders',
        {},
        { headers: { token } }
      )

      if (response.data.success) {
        let allOrdersItem = []
        response.data.orders.forEach((order) => {
          order.items.forEach((item) => {
            item['status'] = order.status
            item['payment'] = order.payment
            item['paymentMethod'] = order.paymentMethod
            item['date'] = order.date
            item['orderId'] = order._id
            item['productId'] = item.product
            item['canReview'] = order.status === 'Delivered' && !item.reviewed
            allOrdersItem.push(item)
          })
        })
        setOrderData(allOrdersItem.reverse())
      }
    } catch (error) {
      console.error('Error loading orders:', error)
      if (error.response) {
        console.error('Response error:', error.response.data)
      } else if (error.request) {
        console.error('Network error - no response received')
      }
    }
  }, [token, backendUrl])

  useEffect(() => {
    loadOrderData()
  }, [token, loadOrderData])

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setReview({
        ...review,
        image: file,
        preview: URL.createObjectURL(file)
      })
    }
  }

  const handleReviewSubmit = async (productId, orderId) => {
    if (!review.rating) {
      alert('Please select a rating')
      return
    }

    setIsSubmitting(true)
    try {
      const formData = new FormData()
      formData.append('productId', productId)
      formData.append('orderId', orderId)
      formData.append('rating', review.rating)
      formData.append('comment', review.comment || '')
      if (review.image) {
        formData.append('image', review.image)
      }

      const response = await axios.post(
        backendUrl + '/api/review/add',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            token
          }
        }
      )

      if (response.data.success) {
        alert('Review submitted successfully!')
        setOpenReview(null)
        setReview({
          rating: 0,
          comment: '',
          image: null,
          preview: null
        })
        loadOrderData() // Refresh orders to show review was submitted
      }
    } catch (error) {
      console.error('Error submitting review:', error)
      alert(error.response?.data?.message || 'Failed to submit review')
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderStars = (rating, isInteractive = false, onRate = null) => {
    return [1, 2, 3, 4, 5].map((star) => (
      <img
        key={star}
        src={star <= rating ? assets.star_icon : assets.star_dull_icon}
        alt="star"
        className="w-4 h-4 cursor-pointer"
        onClick={isInteractive ? () => onRate(star) : null}
        onMouseEnter={isInteractive ? () => setHoverRating(star) : null}
        onMouseLeave={isInteractive ? () => setHoverRating(0) : null}
      />
    ))
  }

  return (
    <div className='border-t pt-16 px-5'>
      <div className="text-2xl">
        <Title text1={'My'} text2={'Orders'} />
      </div>

      <div>
        {orderData.map((item, index) => (
          <div 
            className="py-4 border-t text-gray-700 flex flex-col md:flex-row md:items-center md:justify-between gap-4" 
            key={index}
          >
            <div className="flex items-start gap-6 text-sm">
              <img src={item.image[0]} alt="" className="w-16 sm:w-20" />
              <div>
                <p className="sm:text-base font-medium">{item.name}</p>
                <div className="flex items-center gap-3 mt-1 text-base text-gray-700">
                  <p>{currency}{item.price}</p>
                  <p>Quantity: {item.quantity}</p>
                  <p>Size: {item.size}</p>
                </div>
                <p className='mt-1'>Date: <span className="text-gray-400">{new Date(item.date).toDateString()}</span></p>
                <p className='mt-1'>Payment: <span className="text-gray-400">{item.paymentMethod}</span></p>
              </div>
            </div>
            <div className="md:w-1/4 flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <p className={`min-w-2 h-2 rounded-full ${
                  item.status === 'Delivered' ? 'bg-green-500' : 
                  item.status === 'Shipped' ? 'bg-yellow-500' : 
                  'bg-gray-500'
                }`}></p>
                <p className="text-sm md:text-base">{item.status}</p>
              </div>
              
              {item.status === 'Delivered' && item.canReview && !openReview && (
                <button 
                  onClick={() => setOpenReview({
                    orderId: item.orderId,
                    productId: item.productId
                  })}
                  className="border px-2 py-1.5 text-xs font-medium rounded bg-black text-white w-full sm:w-[200px]"
                >
                  Add Review
                </button>
              )}
              
              {item.status !== 'Delivered' && (
                    <button onClick={loadOrderData} className="border px-2 py-1.5 text-xs font-medium rounded text-black w-full sm:w-[200px]">Track Order</button>
              )}

              {/* Review Form */}
              {openReview?.productId === item.productId && openReview?.orderId === item.orderId && (
                <div className="w-full sm:w-[300px] mt-2 p-2 bg-gray-50 rounded">
                  <p className="text-xs font-medium mb-1">Rate:</p>
                  <div className="flex items-center gap-0.5 mb-2">
                    {renderStars(
                      hoverRating || review.rating, 
                      true, 
                      (rating) => setReview({...review, rating})
                    )}
                  </div>
                  <textarea
                    value={review.comment}
                    onChange={(e) => setReview({...review, comment: e.target.value})}
                    placeholder="Write review..."
                    className="w-full p-1.5 border rounded mb-2 text-xs"
                    rows="2"
                  />
                  <div className="mb-2">
                    <label className="text-xs text-gray-600 cursor-pointer block">
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                      <span className="text-xs underline">Add image (optional)</span>
                    </label>
                    {review.preview && (
                      <div className="relative mt-1 inline-block">
                        <img 
                          src={review.preview} 
                          alt="Preview" 
                          className="w-12 h-12 object-cover rounded"
                        />
                        <button
                          onClick={() => setReview({...review, image: null, preview: null})}
                          className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 text-xs flex items-center justify-center"
                        >
                          ×
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleReviewSubmit(item.productId, item.orderId)}
                      disabled={isSubmitting}
                      className="px-2 py-1 bg-black text-white text-xs rounded disabled:bg-gray-400 flex-1"
                    >
                      {isSubmitting ? 'Sending...' : 'Submit'}
                    </button>
                    <button
                      onClick={() => {
                        setOpenReview(null)
                        setReview({
                          rating: 0,
                          comment: '',
                          image: null,
                          preview: null
                        })
                      }}
                      className="px-2 py-1 border text-xs rounded hover:bg-gray-100 flex-1"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Orders