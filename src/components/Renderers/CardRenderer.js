'use client';

import { getValueByPath } from '@/lib/extractJsonPaths';

export default function CardRenderer({ data, selectedFields, widgetName, apiType }) {
  if (!data || data.error) {
    return (
      <div className="p-4 text-center text-red-400">
        {data?.error || 'No data available'}
      </div>
    );
  }

  if (apiType === 'crypto-rates') {
    const currency = data.currency || '';
    const rates = data.rates || [];
    const ratesMap = new Map(rates.map((r) => [r.symbol, r.value]));

    return (
      <div className="p-4">
        <div className="mb-4 text-sm text-gray-400">Base: {currency}</div>
        <div className="space-y-2">
          {selectedFields.length > 0
            ? selectedFields.map((fieldPath, index) => {
                // For crypto rates, fieldPath might be like "data.rates.BTC"
                // We need to extract the symbol (last part after 'rates.')
                const parts = fieldPath.split('.');
                const ratesIndex = parts.indexOf('rates');
                const symbol = ratesIndex >= 0 && ratesIndex < parts.length - 1
                  ? parts[ratesIndex + 1]
                  : parts[parts.length - 1];
                
                const value = ratesMap.get(symbol);

                if (value !== undefined) {
                  return (
                    <div
                      key={index}
                      className="flex justify-between rounded-lg bg-gray-700 p-3"
                    >
                      <span className="text-gray-300">{symbol}</span>
                      <span className="font-semibold text-white">{value}</span>
                    </div>
                  );
                }
                return null;
              })
            : rates.slice(0, 10).map((rate, index) => (
                <div
                  key={index}
                  className="flex justify-between rounded-lg bg-gray-700 p-3"
                >
                  <span className="text-gray-300">{rate.symbol}</span>
                  <span className="font-semibold text-white">{rate.value}</span>
                </div>
              ))}
        </div>
      </div>
    );
  }

  // Generic card renderer for other data types
  return (
    <div className="p-4">
      <div className="space-y-2">
        {selectedFields.length > 0
          ? selectedFields.map((fieldPath, index) => {
              const value = getValueByPath(data, fieldPath);
              return (
                <div
                  key={index}
                  className="flex justify-between rounded-lg bg-gray-700 p-3"
                >
                  <span className="text-gray-300">{fieldPath}</span>
                  <span className="font-semibold text-white">
                    {value !== undefined ? String(value) : 'N/A'}
                  </span>
                </div>
              );
            })
          : (
            <div className="text-center text-gray-400">
              No fields selected
            </div>
          )}
      </div>
    </div>
  );
}
