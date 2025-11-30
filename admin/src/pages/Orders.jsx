import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { backendUrl, currency } from '../constants/config';
import { toast } from 'react-toastify';
import { assets } from '../assets/assets';
import { FiFilter, FiCalendar, FiX } from 'react-icons/fi';
import { useSearchParams } from 'react-router-dom';

const Orders = ({ token }) => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: '',
    paymentMethod: '',
    dateRange: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const orderRefs = useRef({});

  // Auto-apply filters whenever orders or filter values change
  useEffect(() => {
    let result = [...orders];

    if (filters.status) {
      result = result.filter(order => order.status === filters.status);
    }

    if (filters.paymentMethod) {
      result = result.filter(order => order.paymentMethod === filters.paymentMethod);
    }

    if (filters.dateRange) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (filters.dateRange === 'today') {
        result = result.filter(order => {
          const orderDate = new Date(order.date);
          orderDate.setHours(0, 0, 0, 0);
          return orderDate.getTime() === today.getTime();
        });
      } else if (filters.dateRange === 'week') {
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);
        weekAgo.setHours(0, 0, 0, 0);
        result = result.filter(order => {
          const orderDate = new Date(order.date);
          return orderDate >= weekAgo;
        });
      } else if (filters.dateRange === 'month') {
        const monthAgo = new Date(today);
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        monthAgo.setHours(0, 0, 0, 0);
        result = result.filter(order => {
          const orderDate = new Date(order.date);
          return orderDate >= monthAgo;
        });
      }
    }

    setFilteredOrders(result);
  }, [orders, filters]);

  useEffect(() => {
    const fetchAllOrders = async () => {
      if (!token) return null;

      setIsLoading(true);
      try {
        const response = await axios.post(
          backendUrl + '/api/order/list',
          {},
          { headers: { token } }
        );
        if (response.data.success) {
          const reversedOrders = response.data.orders.reverse();
          setOrders(reversedOrders);
          setFilteredOrders(reversedOrders);
        } else {
          toast.error(response.data.message);
        }
      } catch (error) {
        toast.error(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllOrders();
  }, [token]);

  // Handle highlight from notification
  useEffect(() => {
    const highlightOrderId = searchParams.get('highlight');
    if (highlightOrderId && orderRefs.current[highlightOrderId]) {
      // Wait for render and smooth scroll to the order
      setTimeout(() => {
        orderRefs.current[highlightOrderId].scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
        
        // Add highlight animation
        orderRefs.current[highlightOrderId].classList.add('highlight-animation');
        
        // Remove highlight after animation
        setTimeout(() => {
          orderRefs.current[highlightOrderId]?.classList.remove('highlight-animation');
          setSearchParams({}); // Clear the highlight param
        }, 3000);
      }, 300);
    }
  }, [searchParams, filteredOrders, setSearchParams]);

  const statusHandler = async (event, orderId) => {
    try {
      const response = await axios.post(
        backendUrl + '/api/order/status',
        { orderId, status: event.target.value },
        { headers: { token } }
      );
      if (response.data.success) {
        // Update the local state instead of refetching all orders
        setOrders(prevOrders => 
          prevOrders.map(order => 
            order._id === orderId ? { ...order, status: event.target.value } : order
          )
        );
        setFilteredOrders(prevOrders => 
          prevOrders.map(order => 
            order._id === orderId ? { ...order, status: event.target.value } : order
          )
        );
        toast.success(`Order status updated to ${event.target.value}`);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || error.message);
    }
  };

  const applyFilters = () => {
    let result = [...orders];

    if (filters.status) {
      result = result.filter(order => order.status === filters.status);
    }

    if (filters.paymentMethod) {
      result = result.filter(order => order.paymentMethod === filters.paymentMethod);
    }

    if (filters.dateRange) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      switch (filters.dateRange) {
        case 'today':
          result = result.filter(order => {
            const orderDate = new Date(order.date);
            orderDate.setHours(0, 0, 0, 0);
            return orderDate.getTime() === today.getTime();
          });
          break;
        case 'week': {
          const weekAgo = new Date(today);
          weekAgo.setDate(weekAgo.getDate() - 7);
          weekAgo.setHours(0, 0, 0, 0);
          result = result.filter(order => {
            const orderDate = new Date(order.date);
            return orderDate >= weekAgo;
          });
          break;
        }
        case 'month': {
          const monthAgo = new Date(today);
          monthAgo.setMonth(monthAgo.getMonth() - 1);
          monthAgo.setHours(0, 0, 0, 0);
          result = result.filter(order => {
            const orderDate = new Date(order.date);
            return orderDate >= monthAgo;
          });
          break;
        }
        default:
          break;
      }
    }

    setFilteredOrders(result);
    setShowFilters(false);
  };

  const resetFilters = () => {
    setFilters({
      status: '',
      paymentMethod: '',
      dateRange: ''
    });
    setFilteredOrders(orders);
    setShowFilters(false);
  };

  const paymentMethods = [...new Set(orders.map(order => order.paymentMethod))];
  const statusOptions = ['Order Placed', 'Packing', 'Shipped', 'Out for delivery', 'Delivered'];

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Order Management</h1>
          <p className="text-gray-600">Manage and track all customer orders</p>
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
        >
          <FiFilter /> Filters
        </button>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-white p-4 rounded-lg shadow-md mb-6 border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({...filters, status: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="">All Statuses</option>
                {statusOptions.map((status, index) => (
                  <option key={index} value={status}>{status}</option>
                ))}
              </select>
            </div>

            {/* Payment Method Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
              <select
                value={filters.paymentMethod}
                onChange={(e) => setFilters({...filters, paymentMethod: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="">All Methods</option>
                {paymentMethods.map((method, index) => (
                  <option key={index} value={method}>{method}</option>
                ))}
              </select>
            </div>

            {/* Date Range Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
              <select
                value={filters.dateRange}
                onChange={(e) => setFilters({...filters, dateRange: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="">All Dates</option>
                <option value="today">Today</option>
                <option value="week">Last 7 Days</option>
                <option value="month">Last 30 Days</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-4">
            <button
              onClick={resetFilters}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Reset
            </button>
            <button
              onClick={applyFilters}
              className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}

      {/* Active Filters Display */}
      {(filters.status || filters.paymentMethod || filters.dateRange) && (
        <div className="flex flex-wrap gap-2 mb-4">
          {filters.status && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              Status: {filters.status}
              <button 
                onClick={() => setFilters({...filters, status: ''})}
                className="ml-1.5 text-blue-600 hover:text-blue-800"
              >
                <FiX size={14} />
              </button>
            </span>
          )}
          {filters.paymentMethod && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
              Payment: {filters.paymentMethod}
              <button 
                onClick={() => setFilters({...filters, paymentMethod: ''})}
                className="ml-1.5 text-green-600 hover:text-green-800"
              >
                <FiX size={14} />
              </button>
            </span>
          )}
          {filters.dateRange && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
              Date: {filters.dateRange === 'today' ? 'Today' : 
                    filters.dateRange === 'week' ? 'Last 7 Days' : 'Last 30 Days'}
              <button 
                onClick={() => setFilters({...filters, dateRange: ''})}
                className="ml-1.5 text-purple-600 hover:text-purple-800"
              >
                <FiX size={14} />
              </button>
            </span>
          )}
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <img 
            src={assets.parcel_icon} 
            alt="No orders" 
            className="w-20 h-20 mx-auto mb-4 opacity-50"
          />
          <h3 className="text-xl font-medium text-gray-600">
            {orders.length === 0 ? 'No orders found' : 'No orders match your filters'}
          </h3>
          <p className="text-gray-500 mt-2">
            {orders.length === 0 ? 'When orders are placed, they will appear here' : 'Try adjusting your filters'}
          </p>
          {orders.length > 0 && (
            <button
              onClick={resetFilters}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
            >
              Reset Filters
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-500">
              Showing {filteredOrders.length} of {orders.length} orders
            </p>
            {filteredOrders.length !== orders.length && (
              <button
                onClick={resetFilters}
                className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
              >
                <FiX size={16} /> Clear filters
              </button>
            )}
          </div>

          {filteredOrders.map((order, index) => (
            <div 
              key={index}
              ref={(el) => (orderRefs.current[order._id] = el)}
              className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition-all"
            >
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 md:p-6">
                {/* Order Icon */}
                <div className="md:col-span-1 flex items-start justify-center">
                  <img 
                    className="w-12 h-12 object-contain" 
                    src={assets.parcel_icon} 
                    alt="Order icon"
                  />
                </div>

                {/* Order Items and Address */}
                <div className="md:col-span-5 space-y-3">
                  <div className="space-y-1">
                    {order.items.map((item, idx) => (
                      <div 
                        key={idx} 
                        className={`py-2 ${idx !== order.items.length - 1 ? 'border-b border-gray-100' : ''}`}
                      >
                        <p className="mb-1">
                          <span className="font-medium">{item.name}</span> 
                          <span className="text-gray-600 ml-2">x {item.quantity}</span>
                          {item.size && <span className="text-gray-500 text-xs ml-2">({item.size})</span>}
                        </p>
                        {(item.sellername || item.sellerphone) && (
                          <div className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded">
                            <span className="font-medium">Seller:</span>
                            {item.sellername && <span className="ml-1">{item.sellername}</span>}
                            {item.sellerphone && <span className="ml-2">• {item.sellerphone}</span>}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="mt-3 space-y-1">
                    <p className="font-medium text-gray-800">
                      {order.address.firstName} {order.address.lastName}
                    </p>
                    <p className="text-gray-600">{order.address.street},</p>
                    <p className="text-gray-600">
                      {order.address.city}, {order.address.state}, {order.address.country}, {order.address.zipcode}
                    </p>
                    <p className="text-gray-600">Phone: {order.address.phone}</p>
                  </div>
                </div>

                {/* Order Details */}
                <div className="md:col-span-2 space-y-2">
                  <p className="font-medium">Items: {order.items.length}</p>
                  <p>Method: <span className="capitalize">{order.paymentMethod}</span></p>
                  <p>
                    Payment: 
                    <span className={`ml-1 font-medium ${order.payment ? 'text-green-600' : 'text-yellow-600'}`}>
                      {order.payment ? 'Completed' : 'Pending'}
                    </span>
                  </p>
                  <p className="text-gray-500 text-sm">
                    {new Date(order.date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>

                {/* Amount */}
                <div className="md:col-span-2 flex items-center justify-center">
                  <p className="text-lg font-bold text-gray-800">
                    {currency}{" "}{order.amount.toLocaleString()}
                  </p>
                </div>

                {/* Status Selector */}
                <div className="md:col-span-2 flex items-center justify-end">
                  <select
                    onChange={(event) => statusHandler(event, order._id)}
                    value={order.status}
                    className={`p-2 rounded-md border text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      order.status === 'Delivered' 
                        ? 'bg-green-100 text-green-800 border-green-200'
                        : order.status === 'Order Placed'
                        ? 'bg-blue-100 text-blue-800 border-blue-200'
                        : 'bg-yellow-100 text-yellow-800 border-yellow-200'
                    }`}
                  >
                    <option value="Order Placed">Order Placed</option>
                    <option value="Packing">Packing</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Out for delivery">Out for delivery</option>
                    <option value="Delivered">Delivered</option>
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Orders;