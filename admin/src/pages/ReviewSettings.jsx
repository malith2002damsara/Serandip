import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { backendUrl } from '../constants/config';

const ReviewSettings = ({ token }) => {
  const [count, setCount] = useState(3);
  const [limits, setLimits] = useState({ min: 1, max: 50, envDefault: 3 });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await axios.get(`${backendUrl}/api/settings/reviews`);
        if (data.success) {
          setCount(data.initialCount);
          setLimits({ min: data.min, max: data.max, envDefault: data.envDefault });
        }
      } catch (error) {
        toast.error('Failed to load setting');
      }
    })();
  }, []);

  const save = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const { data } = await axios.post(
        `${backendUrl}/api/settings/reviews`,
        { initialCount: Number(count) },
        { headers: { token } }
      );
      data.success ? toast.success('Saved') : toast.error(data.message);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className='max-w-md'>
      <h2 className='text-xl font-semibold mb-4'>Review Display Settings</h2>
      <form onSubmit={save} className='bg-white border rounded p-5 flex flex-col gap-3'>
        <label className='text-sm font-medium'>Comments shown first on each product page</label>
        <input
          type='number'
          min={limits.min}
          max={limits.max}
          value={count}
          onChange={(e) => setCount(e.target.value)}
          className='border rounded px-3 py-2 w-32'
          required
        />
        <p className='text-xs text-gray-500'>
          Customers see this many comments first, then a "See more" button loads the rest.
          Allowed {limits.min}-{limits.max}. Default from .env: {limits.envDefault}.
        </p>
        <button disabled={saving} className='bg-black text-white px-5 py-2 rounded w-fit disabled:opacity-50'>
          {saving ? 'Saving...' : 'Save'}
        </button>
      </form>
    </div>
  );
};

export default ReviewSettings;
