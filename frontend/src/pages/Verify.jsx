import { useContext, useCallback, useEffect, useRef } from 'react'
import { ShopContext } from '../context/ShopContext'
import { useSearchParams } from 'react-router-dom'
import axios from '../config/axiosConfig'
import { toast } from 'react-toastify'

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

const Verify = () => {

  const { navigate, token, setCartItems, backendUrl } = useContext(ShopContext)
  const [searchParams] = useSearchParams()

  const success = searchParams.get('success')
  const orderId = searchParams.get('orderId')

  // stops the check from running twice (React StrictMode runs effects twice in development)
  const hasRun = useRef(false)

  const verifyPayment = useCallback(async () => {
    if (!token || !orderId || hasRun.current) return
    hasRun.current = true

    try {
      // PayHere confirms the payment to our server a few seconds after the customer comes back,
      // so we check a few times before giving up.
      for (let attempt = 0; attempt < 8; attempt++) {
        const response = await axios.post(
          backendUrl + '/api/order/verifyPayHere',
          { success, orderId },
          { headers: { token } }
        )

        if (!response.data.success) {
          // cancelled / failed
          toast.error(response.data.message)
          navigate('/cart')
          return
        }

        if (response.data.paid) {
          setCartItems({})
          toast.success('Payment successful')
          navigate('/orders')
          return
        }

        await wait(2000)
      }

      // Paid on PayHere but confirmation is still on its way
      setCartItems({})
      toast.info('Payment received. Your order will show as paid in a moment.')
      navigate('/orders')

    } catch (error) {
      console.log(error)
      toast.error(error.response?.data?.message || error.message)
      navigate('/orders')
    }
  }, [token, backendUrl, success, orderId, navigate, setCartItems])

  useEffect(() => {
    verifyPayment()
  }, [verifyPayment])

  return (
    <div className='min-h-[60vh] flex items-center justify-center border-t'>
      <p className='text-gray-500 text-sm'>Confirming your payment, please wait...</p>
    </div>
  )
}

export default Verify