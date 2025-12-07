'use client';

import { useState, useMemo, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

// Available fields for time series with their colors
const TIME_SERIES_FIELDS = [
  { key: 'open', label: 'Open', color: '#3B82F6' }, // Blue
  { key: 'high', label: 'High', color: '#10B981' }, // Green
  { key: 'low', label: 'Low', color: '#EF4444' }, // Red
  { key: 'close', label: 'Close', color: '#F59E0B' }, // Amber
  { key: 'volume', label: 'Volume', color: '#8B5CF6' }, // Purple
];

export default function ChartRenderer({ data, selectedFields, apiType }) {
  const [activeFields, setActiveFields] = useState(['close']); // Default to close
  // Prepare timeSeriesData & availableFields as hooks called unconditionally
  const timeSeriesData = (data && data.data) || [];

  const availableFields = useMemo(() => {
    // If not time-series, return default TIME_SERIES_FIELDS shape
    if (apiType !== 'time-series') return TIME_SERIES_FIELDS;
    if (timeSeriesData.length === 0) return TIME_SERIES_FIELDS;
    const firstItem = timeSeriesData[0];
    return TIME_SERIES_FIELDS.filter(
      (field) => firstItem && firstItem[field.key] !== undefined
    );
  }, [timeSeriesData, apiType]);

  // Initialize activeFields with selectedFields prop (if provided) or default
  useEffect(() => {
    // Only run initialization logic for time-series data
    if (apiType !== 'time-series') return (
    <div className="p-4 text-center text-gray-400">
      Chart view not available for this API type
    </div>
  );;

    if (selectedFields && selectedFields.length > 0) {
      const valid = selectedFields.filter((k) =>
        availableFields.some((f) => f.key === k)
      );
      if (valid.length > 0) {
        setActiveFields(valid);
        return;
      }
    }

    if ((!selectedFields || selectedFields.length === 0) && availableFields.length > 0) {
      // Prefer 'close' when available
      const preferClose = availableFields.some((f) => f.key === 'close') ? ['close'] : [availableFields[0].key];
      setActiveFields((prev) => (prev && prev.length > 0 ? prev : preferClose));
    }
  }, [availableFields, selectedFields, apiType]);

  if (!data || data.error) {
    return (
      <div className="p-4 text-center text-red-400">
        {data?.error || 'No data available'}
      </div>
    );
  }

    // Toggle field selection
    const toggleField = (fieldKey) => {
      setActiveFields((prev) => {
        if (prev.includes(fieldKey)) {
          // If it's the last field, don't remove it
          if (prev.length === 1) return prev;
          return prev.filter((f) => f !== fieldKey);
        } else {
          return [...prev, fieldKey];
        }
      });
    };

    // Prepare chart data with all available fields
    const chartData = timeSeriesData.map((item) => {
      const chartItem = { date: item.date };
      availableFields.forEach((field) => {
        chartItem[field.label] = item[field.key];
      });
      return chartItem;
    });

    return (
      <div className="p-4">
        {/* Field Selection Controls */}
        <div className="mb-4 flex flex-wrap gap-2">
          <span className="text-sm text-gray-400 self-center mr-2">Plot:</span>
          {availableFields.map((field) => {
            const isActive = activeFields.includes(field.key);
            return (
              <button
                key={field.key}
                onClick={() => toggleField(field.key)}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-gray-700 text-white border-2'
                    : 'bg-gray-800 text-gray-400 border-2 border-transparent hover:border-gray-600'
                }`}
                style={isActive ? { borderColor: field.color } : {}}
              >
                <span
                  className="inline-block w-2 h-2 rounded-full mr-2"
                  style={{ backgroundColor: field.color }}
                />
                {field.label}
              </button>
            );
          })}
        </div>

        {/* Chart */}
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis
              dataKey="date"
              stroke="#9CA3AF"
              tick={{ fill: '#9CA3AF', fontSize: 12 }}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis stroke="#9CA3AF" tick={{ fill: '#9CA3AF' }} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1F2937',
                border: '1px solid #374151',
                color: '#F3F4F6',
                borderRadius: '8px',
              }}
            />
            <Legend 
              wrapperStyle={{ color: '#9CA3AF', paddingTop: '10px' }}
              iconType="line"
            />
            {availableFields
              .filter((field) => activeFields.includes(field.key))
              .map((field) => (
                <Line
                  key={field.key}
                  type="monotone"
                  dataKey={field.label}
                  stroke={field.color}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
              ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
}