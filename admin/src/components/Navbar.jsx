import React from 'react'
import {assets} from '../assets/assets'
import NotificationDropdown from './NotificationDropdown'

const Navbar = ({token}) => {
  return (
    <div className='flex items-center py-4 px-6 justify-between bg-white shadow-md border-b border-gray-200 sticky top-0 z-50'>
      <div className='flex items-center space-x-3'>
        <img className='w-[max(5%,60px)] h-auto object-contain' src={assets.logo} alt="Ceylon Admin" />
        <div className='hidden sm:block'>
          <h1 className='text-xl font-bold text-gray-800'>Ceylon Admin</h1>
          <p className='text-sm text-gray-500'>Admin Dashboard</p>
        </div>
      </div>
      
      <div className='flex items-center space-x-4'>
        <NotificationDropdown token={token} />
      </div>
    </div>
  )
}

export default Navbar
