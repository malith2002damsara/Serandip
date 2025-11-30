import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import { backendUrl } from '../constants/config';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const NotificationDropdown = ({ token }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Fetch unread count
  const fetchUnreadCount = useCallback(async () => {
    if (!token) return;
    
    try {
      const response = await axios.get(
        backendUrl + '/api/order/unviewed-count',
        { headers: { token } }
      );
      if (response.data.success) {
        setUnreadCount(response.data.count);
      }
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  }, [token]);

  // Fetch all orders (including viewed ones)
  const fetchNotifications = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(
        backendUrl + '/api/order/unviewed',
        { headers: { token } }
      );
      if (response.data.success) {
        setNotifications(response.data.orders);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast.error('Failed to load notifications');
    } finally {
      setIsLoading(false);
    }
  };

  // Mark notifications as viewed
  const markAsViewed = async (orderIds) => {
    try {
      await axios.post(
        backendUrl + '/api/order/mark-viewed',
        { orderIds },
        { headers: { token } }
      );
      // Update local state to reflect viewed status
      setNotifications(prevNotifications =>
        prevNotifications.map(notif =>
          orderIds.includes(notif._id) ? { ...notif, viewed: true } : notif
        )
      );
      await fetchUnreadCount();
    } catch (error) {
      console.error('Error marking as viewed:', error);
    }
  };

  // Toggle dropdown
  const toggleDropdown = () => {
    if (!isOpen) {
      fetchNotifications();
    }
    setIsOpen(!isOpen);
  };

  // Handle notification click
  const handleNotificationClick = async (orderId) => {
    await markAsViewed([orderId]);
    setIsOpen(false);
    navigate(`/orders?highlight=${orderId}`);
  };

  // Mark all as read
  const handleMarkAllAsRead = async () => {
    const unreadOrderIds = notifications.filter(n => !n.viewed).map(n => n._id);
    if (unreadOrderIds.length === 0) {
      toast.info('No unread notifications');
      return;
    }
    await markAsViewed(unreadOrderIds);
    setIsOpen(false);
    toast.success('All notifications marked as read');
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch count on mount and set interval
  useEffect(() => {
    if (!token) return;
    
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000); // Every 30 seconds
    return () => clearInterval(interval);
  }, [token, fetchUnreadCount]);

  // Format time ago
  const getTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Notification Bell */}
      <button
        onClick={toggleDropdown}
        className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-300"
      >
        <svg
          className="w-6 h-6 text-gray-700"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        
        {/* Red badge with count */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-[500px] overflow-hidden">
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-200 flex justify-between items-center bg-gray-50">
            <h3 className="text-lg font-semibold text-gray-800">Notifications</h3>
            {notifications.filter(n => !n.viewed).length > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-xs text-blue-600 hover:text-blue-800 font-medium"
              >
                Mark all as read
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className="overflow-y-auto max-h-[400px]">
            {isLoading ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-8 px-4">
                <svg
                  className="w-12 h-12 text-gray-400 mx-auto mb-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                  />
                </svg>
                <p className="text-gray-500 font-medium">No new notifications</p>
                <p className="text-gray-400 text-sm mt-1">All caught up!</p>
              </div>
            ) : (
              notifications.map((order) => (
                <div
                  key={order._id}
                  onClick={() => handleNotificationClick(order._id)}
                  className={`px-4 py-3 cursor-pointer border-b border-gray-100 transition-colors ${
                    order.viewed 
                      ? 'hover:bg-gray-50 bg-white' 
                      : 'hover:bg-blue-50 bg-blue-50/30'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        order.viewed ? 'bg-gray-100' : 'bg-blue-100'
                      }`}>
                        <svg
                          className={`w-5 h-5 ${order.viewed ? 'text-gray-600' : 'text-blue-600'}`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                          />
                        </svg>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className={`text-sm font-semibold ${
                          order.viewed ? 'text-gray-700' : 'text-gray-900'
                        }`}>
                          {order.viewed ? 'Order' : 'New Order Placed'}
                        </p>
                        {!order.viewed && (
                          <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                        )}
                      </div>
                      <p className="text-xs text-gray-600 mb-1">
                        {order.address.firstName} {order.address.lastName} ordered {order.items.length} item(s)
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-green-600">
                          LKR {order.amount.toLocaleString()}
                        </span>
                        <span className="text-xs text-gray-500">
                          {getTimeAgo(order.date)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="px-4 py-2 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => {
                  setIsOpen(false);
                  navigate('/orders');
                }}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium w-full text-center"
              >
                View all orders
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
