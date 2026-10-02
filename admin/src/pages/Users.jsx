import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { backendUrl, currency } from '../constants/config';

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '-';

const Users = ({ token }) => {
  const [users, setUsers] = useState([]);
  const [totals, setTotals] = useState({ totalUsers: 0, usersWithOrders: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await axios.get(`${backendUrl}/api/user/admin/users`, { headers: { token } });
        if (data.success) {
          setUsers(data.users);
          setTotals({ totalUsers: data.totalUsers, usersWithOrders: data.usersWithOrders });
        } else {
          toast.error(data.message);
        }
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to load users');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [token]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return users;
    return users.filter((u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
  }, [users, search]);

  return (
    <div>
      <h2 className='text-2xl font-semibold text-gray-800 mb-6'>Users</h2>

      {/* Counts */}
      <div className='grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6'>
        <div className='bg-white border rounded-lg p-4 shadow-sm'>
          <p className='text-sm text-gray-500'>Total Users</p>
          <p className='text-3xl font-bold text-gray-800'>{totals.totalUsers}</p>
        </div>
        <div className='bg-white border rounded-lg p-4 shadow-sm'>
          <p className='text-sm text-gray-500'>Users With Orders</p>
          <p className='text-3xl font-bold text-green-600'>{totals.usersWithOrders}</p>
        </div>
        <div className='bg-white border rounded-lg p-4 shadow-sm'>
          <p className='text-sm text-gray-500'>Users Without Orders</p>
          <p className='text-3xl font-bold text-orange-500'>{totals.totalUsers - totals.usersWithOrders}</p>
        </div>
      </div>

      <input
        type='text'
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder='Search by name or email...'
        className='w-full sm:w-80 border rounded px-3 py-2 mb-4 bg-white'
      />

      <div className='bg-white border rounded-lg shadow-sm overflow-x-auto'>
        <table className='w-full text-sm text-left'>
          <thead className='bg-gray-100 text-gray-700'>
            <tr>
              <th className='px-4 py-3'>#</th>
              <th className='px-4 py-3'>Name</th>
              <th className='px-4 py-3'>Email</th>
              <th className='px-4 py-3'>Joined</th>
              <th className='px-4 py-3 text-center'>Orders</th>
              <th className='px-4 py-3 text-right'>Total Spent</th>
              <th className='px-4 py-3'>Last Order</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className='px-4 py-8 text-center text-gray-500'>Loading...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={7} className='px-4 py-8 text-center text-gray-500'>No users found</td></tr>
            ) : (
              filtered.map((u, i) => (
                <tr
                  key={u._id}
                  onClick={() => navigate(`/users/${u._id}`)}
                  className='border-t cursor-pointer hover:bg-blue-50 transition-colors'
                >
                  <td className='px-4 py-3 text-gray-400'>{i + 1}</td>
                  <td className='px-4 py-3 font-medium text-gray-800'>{u.name}</td>
                  <td className='px-4 py-3'>{u.email}</td>
                  <td className='px-4 py-3'>{fmtDate(u.joinedAt)}</td>
                  <td className='px-4 py-3 text-center'>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${u.orderCount ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {u.orderCount}
                    </span>
                  </td>
                  <td className='px-4 py-3 text-right font-medium'>{currency} {u.totalSpent.toLocaleString()}</td>
                  <td className='px-4 py-3'>{fmtDate(u.lastOrderDate)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <p className='text-xs text-gray-400 mt-2'>Click a user to see all of their orders and prices.</p>
    </div>
  );
};

export default Users;