import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useParams, useNavigate } from 'react-router-dom';
import { backendUrl, currency } from '../constants/config';

const fmtDateTime = (d) =>
  d
    ? new Date(d).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    : '-';

const statusColor = {
  'Order Placed': 'bg-blue-100 text-blue-700',
  Processing: 'bg-yellow-100 text-yellow-700',
  Shipped: 'bg-purple-100 text-purple-700',
  Delivered: 'bg-green-100 text-green-700',
  Cancelled: 'bg-red-100 text-red-700'
};

const UserOrders = ({ token }) => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await axios.get(`${backendUrl}/api/user/admin/users/${userId}/orders`, { headers: { token } });
        if (res.data.success) setData(res.data);
        else toast.error(res.data.message);
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to load user orders');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [userId, token]);

  if (loading) return <p className='text-gray-500'>Loading...</p>;
  if (!data) {
    return (
      <div>
        <button onClick={() => navigate('/users')} className='text-blue-600 underline mb-4'>&larr; Back to users</button>
        <p className='text-gray-500'>User not found.</p>
      </div>
    );
  }

  const { user, summary, orders } = data;

  return (
    <div>
      <button onClick={() => navigate('/users')} className='text-blue-600 hover:underline mb-4'>
        &larr; Back to users
      </button>

      {/* User details */}
      <div className='bg-white border rounded-lg shadow-sm p-5 mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4'>
        <div>
          <h2 className='text-2xl font-semibold text-gray-800'>{user.name}</h2>
          <p className='text-gray-600'>{user.email}</p>
          <p className='text-xs text-gray-400 mt-1'>Joined {fmtDateTime(user.joinedAt)}</p>
        </div>
        <div className='flex gap-6 text-center'>
          <div>
            <p className='text-xs text-gray-500'>Orders</p>
            <p className='text-2xl font-bold'>{summary.totalOrders}</p>
          </div>
          <div>
            <p className='text-xs text-gray-500'>Total Spent</p>
            <p className='text-2xl font-bold text-green-600'>{currency} {summary.totalSpent.toLocaleString()}</p>
          </div>
        </div>
      </div>
      <p className='text-xs text-gray-400 -mt-4 mb-6'>
        Total spent counts paid card orders and COD orders, and excludes cancelled and unpaid card orders.
      </p>

      {orders.length === 0 ? (
        <p className='text-gray-500'>This user has not placed any orders yet.</p>
      ) : (
        <div className='space-y-5'>
          {orders.map((order) => (
            <div key={order._id} className='bg-white border rounded-lg shadow-sm overflow-hidden'>
              {/* Order header */}
              <div className='flex flex-wrap items-center justify-between gap-2 px-4 py-3 bg-gray-50 border-b'>
                <div>
                  <p className='text-xs text-gray-400'>Order ID</p>
                  <p className='text-sm font-mono text-gray-700'>{order._id}</p>
                </div>
                <div className='text-sm text-gray-600'>{fmtDateTime(order.date)}</div>
                <div className='flex items-center gap-2'>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${statusColor[order.status] || 'bg-gray-100 text-gray-600'}`}>
                    {order.status}
                  </span>
                  <span className='text-xs text-gray-600'>{order.paymentMethod}</span>
                  <span className={`text-xs font-semibold ${order.paid ? 'text-green-600' : 'text-yellow-600'}`}>
                    {order.paid ? 'Paid' : 'Pending'}
                  </span>
                </div>
              </div>

              {/* Items */}
              <div className='divide-y'>
                {order.items.map((item, idx) => (
                  <div key={idx} className='flex items-center gap-4 px-4 py-3'>
                    <img
                      src={Array.isArray(item.image) ? item.image[0] : item.image}
                      alt={item.name}
                      className='w-14 h-14 object-cover rounded border'
                    />
                    <div className='flex-1 min-w-0'>
                      <p className='font-medium text-gray-800 truncate'>{item.name}</p>
                      <p className='text-xs text-gray-500'>Size: {item.size}</p>
                    </div>
                    <div className='text-sm text-gray-600 text-right whitespace-nowrap'>
                      {currency} {item.price.toLocaleString()} &times; {item.quantity}
                    </div>
                    <div className='w-28 text-right font-semibold whitespace-nowrap'>
                      {currency} {item.lineTotal.toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>

              {/* Totals + address */}
              <div className='flex flex-col md:flex-row md:justify-between gap-4 px-4 py-3 bg-gray-50 border-t text-sm'>
                <div className='text-gray-600'>
                  <p className='font-medium text-gray-700 mb-1'>Delivery address</p>
                  <p>
                    {[order.address?.firstName, order.address?.lastName].filter(Boolean).join(' ')}
                    {order.address?.phone ? ` · ${order.address.phone}` : ''}
                  </p>
                  <p>
                    {[order.address?.street, order.address?.city, order.address?.state, order.address?.zipcode, order.address?.country]
                      .filter(Boolean)
                      .join(', ')}
                  </p>
                </div>
                <div className='md:w-60 space-y-1'>
                  <div className='flex justify-between'><span>Items total</span><span>{currency} {order.itemsTotal.toLocaleString()}</span></div>
                  <div className='flex justify-between'><span>Delivery fee</span><span>{currency} {order.deliveryFee.toLocaleString()}</span></div>
                  <div className='flex justify-between font-bold text-gray-800 border-t pt-1'>
                    <span>Order total</span><span>{currency} {order.amount.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserOrders;