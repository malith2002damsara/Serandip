import { NavLink } from 'react-router-dom';


const Sidebar = ({ setToken }) => {
  return (
    <div className='w-16 lg:w-[18%] min-h-screen border-r-2 bg-white shadow-sm flex flex-col'>
      <div className='flex flex-col gap-4 pt-6 pl-2 lg:pl-[20%] text-[15px] flex-1'>
        <NavLink
          className={({ isActive }) =>
            `flex items-center gap-3 border border-gray-300 border-r-0 px-2 lg:px-3 py-2 rounded-l hover:bg-blue-50 transition-colors ${isActive ? 'bg-blue-100 border-blue-300' : ''
            }`
          }
          to='/dashboard'
        >
          <svg className='w-5 h-5 text-blue-600 flex-shrink-0' fill="currentColor" viewBox="0 0 20 20">
            <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
          </svg>
          <p className='hidden lg:block'>Dashboard</p>
        </NavLink>

        <NavLink
          className={({ isActive }) =>
            `flex items-center gap-3 border border-gray-300 border-r-0 px-3 py-2 rounded-l hover:bg-teal-50 transition-colors ${isActive ? 'bg-teal-100 border-teal-300' : ''
            }`
          }
          to='/analytics'
        >
          <svg className='w-5 h-5 text-teal-600' fill="currentColor" viewBox="0 0 20 20">
            <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
          </svg>
          <p className='hidden lg:block'>Analytics</p>
        </NavLink>

        <NavLink
          className={({ isActive }) =>
            `flex items-center gap-3 border border-gray-300 border-r-0 px-3 py-2 rounded-l hover:bg-indigo-50 transition-colors ${isActive ? 'bg-indigo-100 border-indigo-300' : ''
            }`
          }
          to='/sellers'
        >
          <svg className='w-5 h-5 text-indigo-600' fill="currentColor" viewBox="0 0 20 20">
            <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
          </svg>
          <p className='hidden lg:block'>Sellers</p>
        </NavLink>

        <NavLink
          className={({ isActive }) =>
            `flex items-center gap-3 border border-gray-300 border-r-0 px-3 py-2 rounded-l hover:bg-green-50 transition-colors ${isActive ? 'bg-green-100 border-green-300' : ''
            }`
          }
          to='/add'
        >
          <svg className="w-5 h-5 text-blue-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" />
          </svg>

          <p className='hidden lg:block'>Add Items</p>
        </NavLink>

        <NavLink
          className={({ isActive }) =>
            `flex items-center gap-3 border border-gray-300 border-r-0 px-3 py-2 rounded-l hover:bg-purple-50 transition-colors ${isActive ? 'bg-purple-100 border-purple-300' : ''
            }`
          }
          to='/list'
        >
          <svg className="w-5 h-5 text-blue-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path d="M4 6h12M4 10h12M4 14h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>

          <p className='hidden lg:block'>List Items</p>
        </NavLink>

        <NavLink
          className={({ isActive }) =>
            `flex items-center gap-3 border border-gray-300 border-r-0 px-3 py-2 rounded-l hover:bg-orange-50 transition-colors ${isActive ? 'bg-orange-100 border-orange-300' : ''
            }`
          }
          to='/orders'
        >
          <svg className="w-5 h-5 text-blue-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path d="M16 11H6l-1-5h13l-2 8H6m0 0a2 2 0 100 4 2 2 0 000-4zm10 0a2 2 0 100 4 2 2 0 000-4z" />
          </svg>

          <p className='hidden lg:block'>Orders</p>
        </NavLink>

        <button
          onClick={() => setToken('')}
          className='flex items-center gap-3 border border-red-300 border-r-0 px-3 py-2 rounded-l hover:bg-red-50 transition-colors w-full text-left'
        >
          <svg className='w-5 h-5 text-red-600 flex-shrink-0' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1'></path>
          </svg>
          <p className='hidden lg:block text-red-600 font-medium'>Logout</p>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;