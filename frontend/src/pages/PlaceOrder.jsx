import { useContext, useState } from 'react'
import Select from 'react-select'
import { Country } from 'country-state-city'
import CartTotal from '../components/CartTotal'
import Title from '../components/Title'
import { ShopContext } from '../context/ShopContext'
import axios from '../config/axiosConfig'
import { toast } from 'react-toastify'

// Built once (module level) so it isn't recalculated on every render
const countryOptions = Country.getAllCountries().map((c) => ({
  value: c.isoCode,
  label: c.name,
}))

// Make react-select look like the other inputs in the form
const selectStyles = {
  control: (base, state) => ({
    ...base,
    minHeight: '38px',
    borderRadius: '0.25rem',
    borderColor: state.isFocused ? '#9ca3af' : '#d1d5db',
    boxShadow: 'none',
    '&:hover': { borderColor: '#9ca3af' },
  }),
  valueContainer: (base) => ({ ...base, padding: '0 14px' }),
  placeholder: (base) => ({ ...base, color: '#6b7280' }),
  option: (base, state) => ({
    ...base,
    fontSize: '0.875rem',
    backgroundColor: state.isSelected ? '#000' : state.isFocused ? '#f3f4f6' : '#fff',
    color: state.isSelected ? '#fff' : '#111827',
  }),
  menu: (base) => ({ ...base, zIndex: 20 }),
}

// Sends the customer to the PayHere hosted payment page (card details are typed on PayHere, not on our site)
const submitToPayHere = ({ action, params }) => {
  const form = document.createElement('form')
  form.method = 'POST'
  form.action = action

  Object.entries(params).forEach(([name, value]) => {
    const input = document.createElement('input')
    input.type = 'hidden'
    input.name = name
    input.value = value
    form.appendChild(input)
  })

  document.body.appendChild(form)
  form.submit()
}

const PlaceOrder = () => {

  const [method, setMethod] = useState('cod');
  const [loading, setLoading] = useState(false);
  const { navigate, backendUrl, token, cartItems, setCartItems, getCartAmount, delivery_fee, products } = useContext(ShopContext);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    street: '',
    zipCode: '',
    country: '',
    phone: ''
  })

  const [selectedCountry, setSelectedCountry] = useState(null)

  const handleCountryChange = (option) => {
    setSelectedCountry(option)
    setFormData((data) => ({ ...data, country: option.label }))
  }

  const onChangeHandler = (event) => {
    const name = event.target.name
    const value = event.target.value

    setFormData(data => ({ ...data, [name]: value }))
  }

  const onSubmitHandler = async (event) => {
    event.preventDefault()

    // react-select doesn't work with the native "required" attribute, so validate manually
    if (!formData.country) {
      toast.error('Please select your country')
      return
    }

    setLoading(true)

    try {
      let orderItems = []

      for (const items in cartItems) {
        for (const item in cartItems[items]) {
          if (cartItems[items][item] > 0) {
            const itemInfo = structuredClone(products.find(product => product._id === items))
            if (itemInfo) {
              orderItems.push({
                product: itemInfo._id,
                name: itemInfo.name,
                image: itemInfo.image,
                price: itemInfo.price,
                size: item,
                quantity: cartItems[items][item],
                reviewed: false
              });
            }
          }
        }
      }

      let orderData = {
        address: formData,
        items: orderItems,
        amount: getCartAmount() + delivery_fee,
      }

      switch (method) {
        //api calls for COD
        case 'cod': {
          const response = await axios.post(backendUrl + '/api/order/place', orderData, { headers: { token } })
          if (response.data.success) {
            setCartItems({})
            navigate('/orders')
          } else {
            toast.error(response.data.message)
          }
          break;
        }

        //Card payment (Visa / Mastercard) through PayHere
        case 'card': {
          const responseCard = await axios.post(backendUrl + '/api/order/payhere', orderData, { headers: { token } })
          if (responseCard.data.success) {
            submitToPayHere(responseCard.data.payhere)
          } else {
            toast.error(responseCard.data.message)
          }
          break;
        }

        default:
          break;
      }

    } catch (error) {
      console.log('PlaceOrder error:', error)

      if (error.response) {
        // Server responded with error
        console.error('Server error:', error.response.data)
        toast.error(error.response.data.message || 'Server error occurred')
      } else if (error.request) {
        // Request made but no response
        console.error('Network error:', error.request)
        toast.error('Network error: Could not connect to server')
      } else {
        // Other errors
        console.error('Error:', error.message)
        toast.error(error.message || 'An error occurred')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={onSubmitHandler} className='flex flex-col sm:flex-row justify-between gap-4 pt-5 sm:pt-14 min-h-[80vh] border-t'>

      {/* -------------------------------------------------Left Side ---------------------------------------------- */}

      <div className="flex flex-col gap-4 w-full sm:max-w-[480px] px-10">
        <div className="text-xl sm:text-2xl my-3">
          <Title text1={'Delivery'} text2={'Information'} />
        </div>

        <div className="flex gap-3">
          <input required onChange={onChangeHandler} name='firstName' value={formData.firstName} type="text" placeholder='First name' className="border border-gray-300 rounded py-1.5 px-3.5 w-full" />
          <input required onChange={onChangeHandler} name='lastName' value={formData.lastName} type="text" placeholder='Last name' className="border border-gray-300 rounded py-1.5 px-3.5 w-full" />
        </div>

        <input required onChange={onChangeHandler} name='email' value={formData.email} type="email" placeholder='Email' className="border border-gray-300 rounded py-1.5 px-3.5 w-full" />
        <input required onChange={onChangeHandler} name='phone' value={formData.phone} type="text" placeholder='Phone' className="border border-gray-300 rounded py-1.5 px-3.5 w-full" />
        <input required onChange={onChangeHandler} name='street' value={formData.street} type="text" placeholder='Address' className="border border-gray-300 rounded py-1.5 px-3.5 w-full" />

        {/* Country (searchable) */}
        <Select
          options={countryOptions}
          value={selectedCountry}
          onChange={handleCountryChange}
          placeholder='Select country'
          noOptionsMessage={() => 'No country found'}
          styles={selectStyles}
          menuPlacement='auto'
        />

        <input required onChange={onChangeHandler} name='zipCode' value={formData.zipCode} type="text" placeholder='Zip Code' className="border border-gray-300 rounded py-1.5 px-3.5 w-full" />

      </div>

      {/* -------------------------------------------------Right Side ---------------------------------------------- */}

      <div className="mt-8 px-10">
        <div className="mt-8 min-w-80">
          <CartTotal />
        </div>

        <div className="mt-12">
          <Title text1={'PAYMENT'} text2={'METHOD'} />

          {/* ------------------------Payment Section--------------------------------- */}
          <div className="flex gap-3 flex-col lg:flex-row">
            <div onClick={() => setMethod('card')} className="flex items-center gap-3 border p-2 px-3 cursor-pointer">
              <p className={`min-w-3.5 h-3.5 border rounded-full ${method === 'card' ? 'bg-green-400' : ''}`}></p>
              <p className="text-gray-500 text-sm font-medium mx-4">CARD (VISA / MASTERCARD)</p>
            </div>

            <div onClick={() => setMethod('cod')} className="flex items-center gap-3 border p-2 px-3 cursor-pointer">
              <p className={`min-w-3.5 h-3.5 border rounded-full ${method === 'cod' ? 'bg-green-400' : ''}`}></p>
              <p className="text-gray-500 text-sm font-medium mx-4">CASH ON DELIVERY</p>
            </div>
          </div>

          {method === 'card' && (
            <p className="text-xs text-gray-500 mt-3">
              You will be redirected to the secure PayHere page to enter your card details.
            </p>
          )}

          <div className="w-full text-end mt-8">
            <button
              type='submit'
              disabled={loading}
              className='bg-black text-white px-16 py-3 text-sm disabled:opacity-60 disabled:cursor-not-allowed'
            >
              {loading ? 'PLEASE WAIT...' : method === 'card' ? 'PAY NOW' : 'PLACE ORDER'}
            </button>
          </div>

        </div>

      </div>

    </form>
  )
}

export default PlaceOrder