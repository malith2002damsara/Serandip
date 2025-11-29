import React, { useState, useEffect } from 'react';
import axiosInstance, { backendUrl } from '../utils/axios';
import { toast } from 'react-toastify';

// Helper functions moved outside component to avoid dependency issues
const calculateMonthlyRevenue = (orders) => {
  const months = {};
  const now = new Date();
  
  // Initialize last 6 months
  for (let i = 5; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    months[key] = 0;
  }

  orders.forEach(order => {
    const orderDate = new Date(order.date);
    const key = orderDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    if (Object.prototype.hasOwnProperty.call(months, key)) {
      months[key] += order.amount;
    }
  });

  return Object.entries(months).map(([month, revenue]) => ({ month, revenue }));
};

const calculateWeeklyStats = (orders) => {
  const weeks = {};
  const now = new Date();
  
  // Initialize last 4 weeks
  for (let i = 3; i >= 0; i--) {
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - (i * 7) - now.getDay());
    const key = `Week ${4 - i}`;
    weeks[key] = 0;
  }

  orders.forEach(order => {
    const orderDate = new Date(order.date);
    const daysDiff = Math.floor((now - orderDate) / (1000 * 60 * 60 * 24));
    const weekIndex = Math.floor(daysDiff / 7);
    
    if (weekIndex < 4) {
      const key = `Week ${4 - weekIndex}`;
      if (weeks[key] !== undefined) {
        weeks[key] += order.amount;
      }
    }
  });

  return Object.entries(weeks).map(([week, revenue]) => ({ week, revenue }));
};

const calculateYearlyStats = (orders) => {
  const years = {};
  const currentYear = new Date().getFullYear();
  
  // Initialize last 2 years
  years[currentYear - 1] = 0;
  years[currentYear] = 0;

  orders.forEach(order => {
    const orderYear = new Date(order.date).getFullYear();
    if (Object.prototype.hasOwnProperty.call(years, orderYear)) {
      years[orderYear] += order.amount;
    }
  });

  return Object.entries(years).map(([year, revenue]) => ({ year, revenue }));
};

const calculateCategoryStats = (products) => {
  const categories = {};
  products.forEach(product => {
    categories[product.category] = (categories[product.category] || 0) + 1;
  });
  return Object.entries(categories).map(([category, count]) => ({ category, count }));
};

// Mock data for development/fallback
const mockData = {
  totalProducts: 25,
  totalOrders: 156,
  totalRevenue: 450000,
  totalSellers: 8,
  recentOrders: [
    {
      date: new Date(),
      amount: 15000,
      items: [{ name: 'Sample Product' }],
      status: 'Order Placed'
    },
    {
      date: new Date(Date.now() - 86400000),
      amount: 22000,
      items: [{ name: 'Sample Product' }, { name: 'Another Product' }],
      status: 'Delivered'
    }
  ],
  topSellers: [
    {
      name: 'John Doe',
      phone: '0771234567',
      products: 12,
      revenue: 85000
    },
    {
      name: 'Jane Smith',
      phone: '0779876543',
      products: 8,
      revenue: 65000
    }
  ],
  monthlyRevenue: [
    { month: 'Jan 2025', revenue: 75000 },
    { month: 'Feb 2025', revenue: 85000 },
    { month: 'Mar 2025', revenue: 95000 },
    { month: 'Apr 2025', revenue: 110000 },
    { month: 'May 2025', revenue: 125000 },
    { month: 'Jun 2025', revenue: 135000 }
  ],
  categoryStats: [
    { category: 'Men', count: 15 },
    { category: 'Women', count: 10 },
    { category: 'Kids', count: 5 }
  ],
  weeklyStats: [
    { week: 'Week 1', revenue: 25000 },
    { week: 'Week 2', revenue: 30000 },
    { week: 'Week 3', revenue: 35000 },
    { week: 'Week 4', revenue: 40000 }
  ],
  yearlyStats: [
    { year: 2024, revenue: 850000 },
    { year: 2025, revenue: 450000 }
  ]
};

const calculateAnalytics = (products, orders) => {
  // Ensure we have arrays to work with
  const safeProducts = Array.isArray(products) ? products : [];
  const safeOrders = Array.isArray(orders) ? orders : [];
  
  // Basic stats
  const totalProducts = safeProducts.length;
  const totalOrders = safeOrders.length;
  const totalRevenue = safeOrders.reduce((sum, order) => {
    return sum + (order.amount || 0);
  }, 0);
  
  // Get unique sellers
  const sellers = {};
  safeProducts.forEach(product => {
    if (product.sellername) {
      if (!sellers[product.sellername]) {
        sellers[product.sellername] = {
          name: product.sellername,
          phone: product.sellerphone || '',
          products: 0,
          revenue: 0
        };
      }
      sellers[product.sellername].products++;
    }
  });

  // Calculate seller revenue from orders
  safeOrders.forEach(order => {
    if (order.items && Array.isArray(order.items)) {
      order.items.forEach(item => {
        const product = safeProducts.find(p => 
          p._id === (item.product || item._id) || p.name === item.name
        );
        if (product && product.sellername && sellers[product.sellername]) {
          const itemRevenue = (item.price || 0) * (item.quantity || 0);
          sellers[product.sellername].revenue += itemRevenue;
        }
      });
    }
  });

  const topSellers = Object.values(sellers)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  // Monthly revenue (last 6 months)
  const monthlyRevenue = calculateMonthlyRevenue(safeOrders);
  
  // Weekly revenue (last 4 weeks)
  const weeklyStats = calculateWeeklyStats(safeOrders);
  
  // Yearly revenue (last 2 years)
  const yearlyStats = calculateYearlyStats(safeOrders);

  // Category stats
  const categoryStats = calculateCategoryStats(safeProducts);

  // Recent orders (last 5)
  const recentOrders = safeOrders
    .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0))
    .slice(0, 5);

  return {
    totalProducts,
    totalOrders,
    totalRevenue,
    totalSellers: Object.keys(sellers).length,
    recentOrders,
    topSellers,
    monthlyRevenue,
    categoryStats,
    weeklyStats,
    yearlyStats
  };
};

const Dashboard = ({ token }) => {
  console.log('Dashboard component rendered with token:', token ? 'present' : 'missing');
  console.log('Backend URL:', backendUrl);
  
  const [dashboardData, setDashboardData] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    totalSellers: 0,
    recentOrders: [],
    topSellers: [],
    monthlyRevenue: [],
    categoryStats: [],
    weeklyStats: [],
    yearlyStats: []
  });
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState('monthly');
  const [connectionError, setConnectionError] = useState(false);

  const fetchDashboardData = React.useCallback(async () => {
    try {
      setLoading(true);
      setConnectionError(false);
      
      console.log('Fetching dashboard data...');
      console.log('Backend URL:', backendUrl);
      console.log('Token available:', !!token);
      
      // Test backend connection first
      const healthCheck = await axiosInstance.get('/');
      console.log('Backend health check:', healthCheck.data);
      
      // Fetch products
      console.log('Fetching products...');
      const productsRes = await axiosInstance.get('/api/product/list');
      console.log('Products response:', productsRes.data);
      
      // Fetch orders
      console.log('Fetching orders...');
      const ordersRes = await axiosInstance.post(
        '/api/order/list',
        {},
        { 
          headers: { token }
        }
      );
      console.log('Orders response:', ordersRes.data);

      if (productsRes.data.success && ordersRes.data.success) {
        const products = productsRes.data.products || [];
        const orders = ordersRes.data.orders || [];

        console.log('Data received:', { 
          productsCount: products.length, 
          ordersCount: orders.length 
        });

        // Calculate analytics
        const analytics = calculateAnalytics(products, orders);
        setDashboardData(analytics);
        toast.success('Dashboard data loaded successfully');
      } else {
        console.error('API Error:', { 
          products: productsRes.data, 
          orders: ordersRes.data 
        });
        toast.error('Failed to load dashboard data: API returned error');
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        config: {
          url: error.config?.url,
          method: error.config?.method
        }
      });
      
      setConnectionError(true);
      
      // Use mock data as fallback for development
      console.log('Using mock data as fallback...');
      setDashboardData(mockData);
      
      if (error.code === 'ECONNREFUSED' || error.code === 'ECONNABORTED') {
        toast.error('Backend server not available. Showing demo data.');
      } else if (error.response) {
        if (error.response.status === 401) {
          toast.error('Unauthorized: Please login again');
        } else {
          toast.error(`Server Error (${error.response.status}): ${error.response.data?.message || 'Unknown error'}`);
        }
      } else if (error.request) {
        toast.error('Network Error: Cannot reach the server. Showing demo data.');
      } else {
        toast.error('Error: ' + error.message + '. Showing demo data.');
      }
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const getTimeFilteredData = () => {
    switch (timeFilter) {
      case 'weekly':
        return {
          labels: dashboardData.weeklyStats.map(item => item.week),
          data: dashboardData.weeklyStats.map(item => item.revenue)
        };
      case 'yearly':
        return {
          labels: dashboardData.yearlyStats.map(item => item.year),
          data: dashboardData.yearlyStats.map(item => item.revenue)
        };
      default:
        return {
          labels: dashboardData.monthlyRevenue.map(item => item.month),
          data: dashboardData.monthlyRevenue.map(item => item.revenue)
        };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="text-gray-600">Loading dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Connection Warning Banner */}
        {connectionError && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-yellow-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
              </svg>
              <div className="flex-1">
                <p className="text-sm font-medium text-yellow-800">Backend Connection Issue</p>
                <p className="text-sm text-yellow-700">Cannot connect to backend server. Showing demo data. Start backend: <code className="bg-yellow-100 px-1 rounded">cd backend && npm start</code></p>
              </div>
              <button
                onClick={fetchDashboardData}
                className="ml-4 px-3 py-1 bg-yellow-600 text-white text-sm rounded-md hover:bg-yellow-700"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-800 mb-2">Dashboard</h1>
            <p className="text-gray-600">Overview of your business performance</p>
          </div>
          <button
            onClick={fetchDashboardData}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
            </svg>
            {loading ? 'Refreshing...' : 'Refresh Data'}
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Products</p>
                <p className="text-3xl font-bold text-gray-800">{dashboardData.totalProducts}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                <p className="text-3xl font-bold text-gray-800">{dashboardData.totalOrders}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-3xl font-bold text-gray-800">LKR {dashboardData.totalRevenue.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Sellers</p>
                <p className="text-3xl font-bold text-gray-800">{dashboardData.totalSellers}</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Analytics Section - Visual Data Representation */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Revenue Trends */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Revenue Trends</h3>
              <select
                value={timeFilter}
                onChange={(e) => setTimeFilter(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
              >
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>
            <div className="space-y-3">
              {getTimeFilteredData().labels.map((label, index) => {
                const data = getTimeFilteredData().data;
                const maxValue = Math.max(...data);
                const percentage = maxValue > 0 ? (data[index] / maxValue) * 100 : 0;
                return (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600 w-16">{label}</span>
                    <div className="flex-1 mx-3">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                    <span className="text-sm font-semibold text-gray-800 w-20 text-right">
                      LKR {data[index].toLocaleString()}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Category Distribution */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Products by Category</h3>
            <div className="space-y-4">
              {dashboardData.categoryStats.map((item, index) => {
                const maxCount = Math.max(...dashboardData.categoryStats.map(s => s.count));
                const percentage = maxCount > 0 ? (item.count / maxCount) * 100 : 0;
                const colors = ['bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-red-500'];
                return (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">{item.category}</span>
                      <span className="text-sm font-semibold text-gray-800">{item.count} products</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className={`h-3 rounded-full transition-all duration-500 ${colors[index % colors.length]}`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Tables Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Top Sellers */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Top Sellers</h3>
            <div className="space-y-4">
              {dashboardData.topSellers.map((seller, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                      <span className="text-blue-600 font-semibold">{index + 1}</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">{seller.name}</p>
                      <p className="text-sm text-gray-600">{seller.phone}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-800">LKR {seller.revenue.toLocaleString()}</p>
                    <p className="text-sm text-gray-600">{seller.products} products</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Orders */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Orders</h3>
            <div className="space-y-4">
              {dashboardData.recentOrders.map((order, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-800">Order #{index + 1}</p>
                    <p className="text-sm text-gray-600">
                      {new Date(order.date).toLocaleDateString()} • {order.items.length} items
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-800">LKR {order.amount.toLocaleString()}</p>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      order.status === 'Delivered' 
                        ? 'bg-green-100 text-green-800'
                        : order.status === 'Order Placed'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
