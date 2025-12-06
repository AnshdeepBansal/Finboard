'use client';

import { useState, useMemo } from 'react';
import { getValueByPath } from '@/lib/extractJsonPaths';

export default function TableRenderer({ data, selectedFields, apiType }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });

  if (!data || data.error) {
    return (
      <div className="p-4 text-center text-red-400">
        {data?.error || 'No data available'}
      </div>
    );
  }

  if (apiType === 'time-series') {
    const timeSeriesData = data.data || [];

    // Filter data based on search and filters
    const filteredData = useMemo(() => {
      let filtered = [...timeSeriesData];

      // Search by date
      if (searchQuery) {
        filtered = filtered.filter((item) =>
          item.date.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }

      // Date range filter
      if (dateRange.start) {
        filtered = filtered.filter((item) => item.date >= dateRange.start);
      }
      if (dateRange.end) {
        filtered = filtered.filter((item) => item.date <= dateRange.end);
      }

      // Price range filter (using close price)
      if (priceRange.min) {
        filtered = filtered.filter((item) => item.close >= parseFloat(priceRange.min));
      }
      if (priceRange.max) {
        filtered = filtered.filter((item) => item.close <= parseFloat(priceRange.max));
      }

      return filtered;
    }, [timeSeriesData, searchQuery, dateRange, priceRange]);

    return (
      <div className="p-4">
        {/* Search and Filters */}
        <div className="mb-4 space-y-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search table..."
            className="w-full rounded-lg bg-gray-700 px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="mb-1 block text-xs text-gray-400">Start Date</label>
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) =>
                  setDateRange({ ...dateRange, start: e.target.value })
                }
                className="w-full rounded-lg bg-gray-700 px-2 py-1 text-sm text-white"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-gray-400">End Date</label>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) =>
                  setDateRange({ ...dateRange, end: e.target.value })
                }
                className="w-full rounded-lg bg-gray-700 px-2 py-1 text-sm text-white"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="mb-1 block text-xs text-gray-400">Min Close Price</label>
              <input
                type="number"
                value={priceRange.min}
                onChange={(e) =>
                  setPriceRange({ ...priceRange, min: e.target.value })
                }
                placeholder="Min"
                className="w-full rounded-lg bg-gray-700 px-2 py-1 text-sm text-white"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-gray-400">Max Close Price</label>
              <input
                type="number"
                value={priceRange.max}
                onChange={(e) =>
                  setPriceRange({ ...priceRange, max: e.target.value })
                }
                placeholder="Max"
                className="w-full rounded-lg bg-gray-700 px-2 py-1 text-sm text-white"
              />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="px-4 py-2 text-gray-400">Date</th>
                <th className="px-4 py-2 text-gray-400">Open</th>
                <th className="px-4 py-2 text-gray-400">High</th>
                <th className="px-4 py-2 text-gray-400">Low</th>
                <th className="px-4 py-2 text-gray-400">Close</th>
                <th className="px-4 py-2 text-gray-400">Volume</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                    No data found
                  </td>
                </tr>
              ) : (
                filteredData.map((item, index) => (
                  <tr
                    key={index}
                    className="border-b border-gray-800 hover:bg-gray-800"
                  >
                    <td className="px-4 py-2 text-white">{item.date}</td>
                    <td className="px-4 py-2 text-gray-300">{item.open.toFixed(4)}</td>
                    <td className="px-4 py-2 text-gray-300">{item.high.toFixed(4)}</td>
                    <td className="px-4 py-2 text-gray-300">{item.low.toFixed(4)}</td>
                    <td className="px-4 py-2 text-gray-300">{item.close.toFixed(4)}</td>
                    <td className="px-4 py-2 text-gray-300">
                      {item.volume.toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="mt-2 text-right text-xs text-gray-400">
          {filteredData.length} of {timeSeriesData.length} items
        </div>
      </div>
    );
  }

  // Generic table renderer for other data types
  return (
    <div className="p-4 text-center text-gray-400">
      Table view not available for this API type
    </div>
  );
}
