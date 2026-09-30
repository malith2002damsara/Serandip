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
        // Newest order first
        const orders = [...response.data.orders].sort(
          (x, y) => new Date(y.date) - new Date(x.date)
        )

        // Group the same product + same size into ONE row (quantities are summed)
        const grouped = new Map()
        orders.forEach((order) => {
          order.items.forEach((item) => {
            const productKey = item.product?._id || item.product
            const key = `${productKey}-${item.size}`
            const paid = !!order.payment

            if (!grouped.has(key)) {
              grouped.set(key, {
                ...item,
                status: order.status,       // status of the newest order
                payment: paid,
                paymentMethod: order.paymentMethod,
                date: order.date,           // date of the newest order
                orderId: order._id,
                orderCount: 1,
                paidCount: paid ? 1 : 0
              })
            } else {
              const g = grouped.get(key)
              g.quantity += item.quantity
              g.orderCount += 1
              if (paid) g.paidCount += 1
            }
          })
        })

        setOrderData(Array.from(grouped.values()))
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
            key={`${item.orderId}-${item.size}-${index}`}
          >
            <div className="flex items-start gap-6 text-sm">
              <img src={item.image[0]} alt="" className="w-16 sm:w-20" />
              <div>
                <p className="sm:text-base font-medium">{item.name}</p>
                <div className="flex items-center gap-3 mt-1 text-base text-gray-700">
                  <p>{currency} {item.price}</p>
                  <p>Quantity: {item.quantity}</p>
                  <p>Size: {item.size}</p>
                </div>
                <p className='mt-1'>Date: <span className="text-gray-400">{new Date(item.date).toDateString()}</span></p>
                <p className='mt-1'>
                  Payment: <span className="text-gray-400">{item.paymentMethod}</span>
                  {item.paymentMethod === 'Card' && (
                    <span className={`ml-2 text-xs font-medium ${item.paidCount === item.orderCount ? 'text-green-600' : 'text-yellow-600'}`}>
                      {item.paidCount === item.orderCount
                        ? 'Paid'
                        : item.paidCount === 0
                          ? 'Pending'
                          : `Paid ${item.paidCount}/${item.orderCount}`}
                    </span>
                  )}
                  {item.orderCount > 1 && (
                    <span className="ml-2 text-xs text-gray-400">({item.orderCount} orders)</span>
                  )}
                </p>
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