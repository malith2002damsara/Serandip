import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { backendUrl } from '../constants/config';
import { toast } from 'react-toastify';
import EditSeller from '../components/EditSeller';
import { FiEdit2, FiTrash2, FiSearch, FiUsers } from 'react-icons/fi';

const Sellers = ({ token }) => {
  const [sellers, setSellers] = useState([]);
  const [filteredSellers, setFilteredSellers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSeller, setSelectedSeller] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const fetchSellers = React.useCallback(async () => {
    try {
      setIsLoading(true);
      // Fetch sellers
      const sellersResponse = await axios.get(`${backendUrl}/api/seller/list`);
      
      // Fetch all orders to calculate revenue
      const ordersResponse = await axios.post(
        `${backendUrl}/api/order/list`,
        {},
        { headers: { token } }
      );
      
      if (sellersResponse.data.success) {
        const sellersData = sellersResponse.data.sellers;
        const orders = ordersResponse.data.success ? ordersResponse.data.orders : [];
        
        // Calculate revenue for each seller
        const sellersWithRevenue = sellersData.map(seller => {
          let totalRevenue = 0;
          
          // Calculate revenue from orders
          orders.forEach(order => {
            if (order.items && Array.isArray(order.items)) {
              order.items.forEach(item => {
                if (item.sellername === seller.name) {
                  totalRevenue += (item.price || 0) * (item.quantity || 0);
                }
              });
            }
          });
          
          return {
            ...seller,
            totalRevenue
          };
        });
        
        setSellers(sellersWithRevenue);
        setFilteredSellers(sellersWithRevenue);
      } else {
        toast.error('Failed to fetch sellers');
      }
    } catch (error) {
      console.error('Error fetching sellers:', error);
      toast.error('Error fetching sellers: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  const handleSearch = (term) => {
    setSearchTerm(term);
    if (!term.trim()) {
      setFilteredSellers(sellers);
    } else {
      const filtered = sellers.filter(seller =>
        seller.name.toLowerCase().includes(term.toLowerCase()) ||
        seller.phone.includes(term)
      );
      setFilteredSellers(filtered);
    }
  };

  const handleEditSeller = (seller) => {
    setSelectedSeller(seller);
    setIsEditModalOpen(true);
  };

  const handleDeleteSeller = async (sellerName) => {
    if (!window.confirm(`Are you sure you want to delete seller "${sellerName}"? This will also delete all products by this seller.`)) {
      return;
    }

    try {
      const response = await axios.post(
        `${backendUrl}/api/seller/delete`,
        { sellerName },
        { headers: { token } }
      );

      if (response.data.success) {
        toast.success(response.data.message);
        fetchSellers(); // Refresh the sellers list
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error('Error deleting seller:', error);
      toast.error('Error deleting seller: ' + error.message);
    }
  };

  useEffect(() => {
    if (token) {
      fetchSellers();
    }
  }, [token, fetchSellers]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="text-gray-600">Loading sellers...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-800 mb-2">Seller Management</h1>
            <p className="text-gray-600">Manage your sellers and their information</p>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="relative max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search sellers by name or phone..."
              className="pl-10 w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Sellers</p>
                <p className="text-3xl font-bold text-gray-800">{sellers.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <FiUsers className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Sellers</p>
                <p className="text-3xl font-bold text-gray-800">
                  {sellers.filter(s => s.productCount > 0).length}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Products</p>
                <p className="text-3xl font-bold text-gray-800">
                  {sellers.reduce((sum, seller) => sum + seller.productCount, 0)}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Sellers Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800">
              Sellers ({filteredSellers.length})
            </h3>
          </div>

          {filteredSellers.length === 0 ? (
            <div className="py-8 text-center text-gray-500">
              {sellers.length === 0 ? 'No sellers found' : 'No sellers match your search'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Seller Information
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Products
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Revenue
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredSellers.map((seller, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {seller.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            📞 {seller.phone}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {seller.productCount} products
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          LKR {seller.totalRevenue.toLocaleString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEditSeller(seller)}
                            className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                            title="Edit seller"
                          >
                            <FiEdit2 size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteSeller(seller.name)}
                            className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                            title="Delete seller"
                          >
                            <FiTrash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Edit Seller Modal */}
        {isEditModalOpen && selectedSeller && (
          <EditSeller
            seller={selectedSeller}
            onClose={() => {
              setIsEditModalOpen(false);
              setSelectedSeller(null);
            }}
            onUpdate={() => {
              fetchSellers();
              setIsEditModalOpen(false);
              setSelectedSeller(null);
            }}
            token={token}
          />
        )}
      </div>
    </div>
  );
};

export default Sellers;