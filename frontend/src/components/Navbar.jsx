import  { useContext, useState } from 'react';
import { assets } from '../assets/assets';
import { Link, NavLink } from 'react-router-dom';
import { ShopContext } from '../context/ShopContext';

const Navbar = () => {
  const [visible, setVisible] = useState(false);

  const { setShowSearch, getCartCount, navigate, token, setToken, setCartItems } = useContext(ShopContext);

  const logout = () => {
    navigate('/login')
    localStorage.removeItem('token')
    localStorage.removeItem('reviewNotificationsShown') // Clear review notifications on logout
    setToken('')
    setCartItems({})
  }




  return (
    <nav className='sticky top-0 z-50 bg-white shadow-md border-b border-gray-200'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='flex items-center justify-between h-16 lg:h-20'>
          {/* Logo */}
          <Link to='/' className='flex-shrink-0'> 
            <img src={assets.logo} className='h-8 lg:h-10 w-auto' alt="Ceylon Logo" /> 
          </Link>

          {/* Navigation Links */}
          <ul className='hidden lg:flex items-center space-x-8'>
            {['Home', 'Collection', 'About', 'Contact'].map((item) => (
              <li key={item}>
                <NavLink
                  to={item === 'Home' ? './' : `/${item.toLowerCase()}`}
                  className={({ isActive }) => 
                    `relative px-3 py-2 text-sm font-medium transition-colors duration-200 ${
                      isActive 
                        ? 'text-black' 
                        : 'text-gray-600 hover:text-black'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      {item}
                      {isActive && (
                        <div className='absolute bottom-0 left-0 right-0 h-0.5 bg-black rounded-full'></div>
                      )}
                    </>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>

          {/* Icons Section */}
          <div className='flex items-center space-x-4'>
            {/* Search Icon */}
            <button 
              onClick={() => setShowSearch(true)} 
              className='p-2 rounded-full hover:bg-gray-100 transition-colors duration-200'
              aria-label="Search"
            >
              <img src={assets.search_icon} className='w-5 h-5' alt="Search" />
            </button>

            {/* Profile Icon with Dropdown */}
            <div className='relative group'>
              <button 
                onClick={() => token ? null : navigate('/login')} 
                className='p-2 rounded-full hover:bg-gray-100 transition-colors duration-200'
                aria-label="Profile"
              >
                <img src={assets.profile_icon} className='w-5 h-5' alt="Profile" />
              </button>
              
              {/* Dropdown Menu */}
              {token && (
                <div className='absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-2xl border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform translate-y-1 group-hover:translate-y-0'>
                  <div className='py-2'>
                    {/* <button className='w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 hover:text-black transition-colors duration-200 flex items-center'>
                      <svg className='w-4 h-4 mr-3' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z'></path>
                      </svg>
                      My Profile
                    </button> */}
                    <button 
                      onClick={() => navigate('/orders')} 
                      className='w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 hover:text-black transition-colors duration-200 flex items-center'
                    >
                      <svg className='w-4 h-4 mr-3' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10'></path>
                      </svg>
                      Orders
                    </button>
                    <button 
                      onClick={logout} 
                      className='w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors duration-200 flex items-center border-t border-gray-100'
                    >
                      <svg className='w-4 h-4 mr-3' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1'></path>
                      </svg>
                      Log Out
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Cart Icon */}
            <Link to='/cart' className='relative p-2 rounded-full hover:bg-gray-100 transition-colors duration-200'>
              <img src={assets.cart_icon} className='w-5 h-5' alt="Cart" />
              {getCartCount() > 0 && (
                <span className='absolute -top-1 -right-1 w-5 h-5 bg-black text-white text-xs rounded-full flex items-center justify-center font-medium'>
                  {getCartCount()}
                </span>
              )}
            </Link>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setVisible(true)}
              className='lg:hidden p-2 rounded-full hover:bg-gray-100 transition-colors duration-200'
              aria-label="Open menu"
            >
              <img src={assets.menu_icon} className='w-5 h-5' alt="Menu" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar Menu */}
      <div className={`fixed inset-0 z-50 lg:hidden ${visible ? '' : 'pointer-events-none'}`}>
        {/* Backdrop */}
        <div 
          className={`fixed inset-0 bg-black transition-opacity duration-300 ${
            visible ? 'opacity-50' : 'opacity-0'
          }`}
          onClick={() => setVisible(false)}
        ></div>
        
        {/* Sidebar */}
        <div className={`fixed top-0 right-0 bottom-0 w-80 max-w-sm bg-white shadow-2xl transform transition-transform duration-300 ${
          visible ? 'translate-x-0' : 'translate-x-full'
        }`}>
          <div className='flex flex-col h-full'>
            {/* Header */}
            <div className='flex items-center justify-between p-6 border-b border-gray-200'>
              <h2 className='text-lg font-semibold text-gray-800'>Menu</h2>
              <button 
                onClick={() => setVisible(false)} 
                className='p-2 rounded-full hover:bg-gray-100 transition-colors duration-200'
                aria-label="Close menu"
              >
                <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M6 18L18 6M6 6l12 12'></path>
                </svg>
              </button>
            </div>
            
            {/* Navigation Links */}
            <nav className='flex-1 py-6'>
              {['Home', 'Collection', 'About', 'Contact'].map((item) => (
                <NavLink
                  key={item}
                  onClick={() => setVisible(false)}
                  to={item === 'Home' ? './' : `/${item.toLowerCase()}`}
                  className={({ isActive }) => 
                    `block px-6 py-4 text-base font-medium transition-colors duration-200 ${
                      isActive 
                        ? 'text-black bg-gray-50 border-r-2 border-black' 
                        : 'text-gray-600 hover:text-black hover:bg-gray-50'
                    }`
                  }
                >
                  {item}
                </NavLink>
              ))}
            </nav>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;