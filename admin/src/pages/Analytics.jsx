import React, { useState, useEffect } from 'react';
import axiosInstance from '../utils/axios';
import { toast } from 'react-toastify';

const Analytics = ({ token }) => {
  const [analyticsData, setAnalyticsData] = useState({
    salesByCategory: [],
    salesBySubCategory: [],
    sellerPerformance: [],
    monthlyTrends: [],
    orderStatusDistribution: [],
    revenueByPaymentMethod: []
  });
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30'); // days

  const filterOrdersByDateRange = (orders, days) => {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    return orders.filter(order => new Date(order.date) >= cutoffDate);
  };

  const calculateMonthlyTrends = React.useCallback((orders) => {
    const months = {};
    const now = new Date();
    
    // Initialize last 6 months
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      months[key] = { revenue: 0, orders: 0 };
    }

    // Process all orders and group by month
    orders.forEach(order => {
      const orderDate = new Date(order.date);
      const key = orderDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      
      // Add to the month if it exists in our 6-month window
      if (key in months) {
        months[key].revenue += order.amount || 0;
        months[key].orders += 1;
      }
    });

    return Object.entries(months).map(([month, data]) => ({ 
      month, 
      revenue: data.revenue,
      orders: data.orders 
    }));
  }, []);

  const calculateDetailedAnalytics = React.useCallback((products, filteredOrders, allOrders) => {
    // Sales by Category
    const categoryStats = {};
    const subCategoryStats = {};
    const sellerStats = {};
    const orderStatusStats = {};
    const paymentMethodStats = {};

    // Initialize stats from products
    products.forEach(product => {
      if (!categoryStats[product.category]) {
        categoryStats[product.category] = { revenue: 0, quantity: 0 };
      }
      if (!subCategoryStats[product.subcategory]) {
        subCategoryStats[product.subcategory] = { revenue: 0, quantity: 0 };
      }
      if (!sellerStats[product.sellername]) {
        sellerStats[product.sellername] = {
          name: product.sellername,
          phone: product.sellerphone,
          revenue: 0,
          orders: 0,
          products: 1
        };
      } else {
        sellerStats[product.sellername].products++;
      }
    });

    // Calculate from filtered orders (based on selected date range)
    filteredOrders.forEach(order => {
      // Order status distribution
      orderStatusStats[order.status] = (orderStatusStats[order.status] || 0) + 1;
      
      // Payment method distribution
      paymentMethodStats[order.paymentMethod] = {
        count: (paymentMethodStats[order.paymentMethod]?.count || 0) + 1,
        revenue: (paymentMethodStats[order.paymentMethod]?.revenue || 0) + order.amount
      };

      // Process order items
      if (order.items && Array.isArray(order.items)) {
        order.items.forEach(item => {
          const product = products.find(p => 
            p._id === (item.product || item._id) || p.name === item.name
          );
          
          if (product) {
            const itemRevenue = (item.price || 0) * (item.quantity || 0);
            
            // Category stats
            if (categoryStats[product.category]) {
              categoryStats[product.category].revenue += itemRevenue;
              categoryStats[product.category].quantity += item.quantity || 0;
            }
            
            // Subcategory stats
            if (subCategoryStats[product.subcategory]) {
              subCategoryStats[product.subcategory].revenue += itemRevenue;
              subCategoryStats[product.subcategory].quantity += item.quantity || 0;
            }
            
            // Seller stats
            if (sellerStats[product.sellername]) {
              sellerStats[product.sellername].revenue += itemRevenue;
              sellerStats[product.sellername].orders++;
            }
          }
        });
      }
    });

    // Monthly trends - use all orders for last 6 months (not filtered by date range selector)
    const monthlyTrends = calculateMonthlyTrends(allOrders);

    return {
      salesByCategory: Object.entries(categoryStats).map(([category, stats]) => ({
        category,
        ...stats
      })).sort((a, b) => b.revenue - a.revenue),
      
      salesBySubCategory: Object.entries(subCategoryStats).map(([subcategory, stats]) => ({
        subcategory,
        ...stats
      })).sort((a, b) => b.revenue - a.revenue),
      
      sellerPerformance: Object.values(sellerStats).sort((a, b) => b.revenue - a.revenue),
      
      monthlyTrends,
      
      orderStatusDistribution: Object.entries(orderStatusStats).map(([status, count]) => ({
        status,
        count
      })),
      
      revenueByPaymentMethod: Object.entries(paymentMethodStats).map(([method, data]) => ({
        method,
        ...data
      }))
    };
  }, [calculateMonthlyTrends]);

  const fetchAnalyticsData = React.useCallback(async () => {
    try {
      setLoading(true);
      
      // Fetch products
      const productsRes = await axiosInstance.get('/api/product/list');
      
      // Fetch orders
      const ordersRes = await axiosInstance.post(
        '/api/order/list',
        {},
        { headers: { token } }
      );

      if (productsRes.data.success && ordersRes.data.success) {
        const products = productsRes.data.products || [];
        const orders = ordersRes.data.orders || [];
        
        // Filter orders by date range for most analytics
        const filteredOrders = filterOrdersByDateRange(orders, parseInt(dateRange));
        
        // Pass both filtered and all orders to analytics calculation
        const analytics = calculateDetailedAnalytics(products, filteredOrders, orders);
        setAnalyticsData(analytics);
      } else {
        toast.error('Failed to load analytics data');
        // Set empty data structure instead of mock data
        setAnalyticsData({
          salesByCategory: [],
          salesBySubCategory: [],
          sellerPerformance: [],
          monthlyTrends: [],
          orderStatusDistribution: [],
          revenueByPaymentMethod: []
        });
      }
    } catch (error) {
      console.error('Error fetching analytics data:', error);
      toast.error('Failed to load analytics data');
      
      // Set empty data structure on error
      setAnalyticsData({
        salesByCategory: [],
        salesBySubCategory: [],
        sellerPerformance: [],
        monthlyTrends: [],
        orderStatusDistribution: [],
        revenueByPaymentMethod: []
      });
    } finally {
      setLoading(false);
    }
  }, [dateRange, token, calculateDetailedAnalytics]);

  useEffect(() => {
    fetchAnalyticsData();
  }, [fetchAnalyticsData]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="text-gray-600">Loading analytics...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-800 mb-2">Advanced Analytics</h1>
            <p className="text-gray-600">Detailed insights into your business performance</p>
          </div>
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="1">Today</option>
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
            <option value="365">Last year</option>
          </select>
        </div>

        {/* Monthly Trends */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Monthly Trends</h3>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            {analyticsData.monthlyTrends.map((item, index) => (
              <div key={index} className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium text-gray-600">{item.month}</p>
                <p className="text-xl font-bold text-gray-800">LKR {item.revenue.toLocaleString()}</p>
                <p className="text-sm text-gray-500">{item.orders} orders</p>
              </div>
            ))}
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Sales by Category */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Sales by Category</h3>
            <div className="space-y-4">
              {analyticsData.salesByCategory.map((item, index) => {
                const maxRevenue = Math.max(...analyticsData.salesByCategory.map(c => c.revenue));
                const percentage = maxRevenue > 0 ? (item.revenue / maxRevenue) * 100 : 0;
                const colors = ['bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-red-500'];
                return (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">{item.category}</span>
                      <div className="text-right">
                        <span className="text-sm font-semibold text-gray-800">LKR {item.revenue.toLocaleString()}</span>
                        <span className="text-xs text-gray-500 block">{item.quantity} sold</span>
                      </div>
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

          {/* Order Status Distribution */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Order Status Distribution</h3>
            <div className="space-y-4">
              {analyticsData.orderStatusDistribution.map((item, index) => {
                const totalOrders = analyticsData.orderStatusDistribution.reduce((sum, s) => sum + s.count, 0);
                const percentage = totalOrders > 0 ? (item.count / totalOrders) * 100 : 0;
                const colors = ['bg-blue-500', 'bg-yellow-500', 'bg-green-500', 'bg-purple-500', 'bg-red-500'];
                return (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={`w-4 h-4 rounded-full ${colors[index % colors.length]} mr-3`}></div>
                      <span className="text-sm font-medium text-gray-700">{item.status}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-semibold text-gray-800">{item.count}</span>
                      <span className="text-xs text-gray-500 block">{percentage.toFixed(1)}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Tables Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Seller Performance */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Seller Performance</h3>
            <div className="space-y-4">
              {analyticsData.sellerPerformance.slice(0, 10).map((seller, index) => (
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
                    <p className="text-sm text-gray-600">{seller.orders} orders • {seller.products} products</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Method Analysis */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Payment Method Analysis</h3>
            <div className="space-y-4">
              {analyticsData.revenueByPaymentMethod.map((item, index) => {
                const maxRevenue = Math.max(...analyticsData.revenueByPaymentMethod.map(p => p.revenue));
                const percentage = maxRevenue > 0 ? (item.revenue / maxRevenue) * 100 : 0;
                return (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700 capitalize">{item.method}</span>
                      <div className="text-right">
                        <span className="text-sm font-semibold text-gray-800">LKR {item.revenue.toLocaleString()}</span>
                        <span className="text-xs text-gray-500 block">{item.count} transactions</span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-purple-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
