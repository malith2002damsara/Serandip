import { useContext, useState, useEffect, useCallback } from 'react'
import { ShopContext } from '../context/ShopContext'
import Title from '../components/Title'
import axios from '../config/axiosConfig'

const Orders = () => {
  const { backendUrl, token, currency } = useContext(ShopContext)
  const [orderData, setOrderData] = useState([])

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
              
              <button 
                onClick={loadOrderData} 
                className="border px-4 py-2 text-sm font-medium rounded hover:bg-gray-50 transition-colors"
              >
                Track Order
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Orders