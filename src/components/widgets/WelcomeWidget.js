'use client';

import { useState } from 'react';
import useWidgetStore from '@/store/widgetStore';

const SAMPLE_DASHBOARD = {
  "widgets": [
    {
      "widgetName": "Sample 1",
      "apiUrl": "https://api.coinbase.com/v2/exchange-rates?currency=BTC",
      "refreshInterval": 30,
      "displayMode": "card",
      "selectedFields": [
        "data.currency",
        "data.rates.INR",
        "data.rates.PKR",
        "data.rates.USD"
      ],
      "widgetType": "crypto-rates",
      "id": "widget-1765012111102"
    },
    {
      "widgetName": "Sample 2",
      "apiUrl": "https://www.alphavantage.co/query?function=TIME_SERIES_MONTHLY&symbol=MSFT&apikey=SLJ82MPLG5O6P1Q7",
      "refreshInterval": 30002,
      "displayMode": "chart",
      "selectedFields": [
        "open",
        "high",
        "low",
        "close",
        "volume"
      ],
      "widgetType": "time-series",
      "id": "widget-1765013313861"
    },
    {
      "widgetName": "Sample 3",
      "apiUrl": "https://stock.indianapi.in/trending",
      "refreshInterval": 3000,
      "displayMode": "table",
      "selectedFields": [
        "trending_stocks.top_gainers"
      ],
      "widgetType": "generic-array",
      "headers": [
        {
          "key": "X-Api-Key",
          "value": "sk-live-r2kbLkDiS4dEpUPDgI9IPSnTu9FxVdlUMQzWkpSp"
        }
      ],
      "id": "widget-1765091339763"
    }
  ],
  "layout": [
    {
      "w": 4,
      "h": 5,
      "x": 0,
      "y": 5,
      "i": "widget-1765012111102",
      "minW": 3,
      "minH": 3,
      "moved": false,
      "static": false
    },
    {
      "w": 12,
      "h": 5,
      "x": 0,
      "y": 0,
      "i": "widget-1765013313861",
      "minW": 3,
      "minH": 3,
      "moved": false,
      "static": false
    },
    {
      "w": 8,
      "h": 5,
      "x": 4,
      "y": 5,
      "i": "widget-1765091339763",
      "moved": false,
      "static": false
    }
  ]
};

export default function WelcomeWidget({ onClose }) {
  const { importConfig } = useWidgetStore();
  const [isLoading, setIsLoading] = useState(false);

  const handleLoadSampleDashboard = async () => {
    setIsLoading(true);
    try {
      // Add a small delay for UX feedback
      await new Promise((resolve) => setTimeout(resolve, 500));
      importConfig(SAMPLE_DASHBOARD);
      onClose();
    } catch (error) {
      console.error('Failed to load sample dashboard:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-gray-700">
        {/* Header */}
        <div className="bg-linear-to-r from-green-600 to-green-700 p-4 sm:p-6 md:p-8">
          <div className="flex items-center gap-3 sm:gap-4 mb-2">
            <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-white bg-opacity-20 shrink-0">
              <svg
                className="h-5 w-5 sm:h-6 sm:w-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">Welcome to Finboard</h1>
          </div>
          <p className="text-green-100 text-xs sm:text-sm md:text-base">
            Create custom financial dashboards from any API
          </p>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 md:p-8 space-y-6 sm:space-y-8">
          {/* Introduction */}
          <div>
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-3 sm:mb-4">Get Started</h2>
            <p className="text-gray-300 text-xs sm:text-sm md:text-base leading-relaxed">
              Finboard is a powerful dashboard builder that lets you visualize financial data from any API.
              Create widgets to display charts, tables, and cards with real-time data updates.
            </p>
          </div>

          {/* Features */}
          <div>
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-3 sm:mb-4">Key Features</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="bg-gray-800 rounded-lg p-3 sm:p-4 border border-gray-700">
                <div className="flex items-start gap-2 sm:gap-3">
                  <div className="flex h-6 w-6 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-green-600 shrink-0 mt-0.5">
                    <svg
                      className="h-3 w-3 sm:h-4 sm:w-4 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-white mb-1 text-xs sm:text-sm">Add Widgets</h3>
                    <p className="text-xs text-gray-400">
                      Connect to any financial API and add custom widgets to your dashboard
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-800 rounded-lg p-3 sm:p-4 border border-gray-700">
                <div className="flex items-start gap-2 sm:gap-3">
                  <div className="flex h-6 w-6 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-green-600 shrink-0 mt-0.5">
                    <svg
                      className="h-3 w-3 sm:h-4 sm:w-4 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-white mb-1 text-xs sm:text-sm">Multiple Views</h3>
                    <p className="text-xs text-gray-400">
                      Display data as charts, tables, or cards based on your needs
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-800 rounded-lg p-3 sm:p-4 border border-gray-700">
                <div className="flex items-start gap-2 sm:gap-3">
                  <div className="flex h-6 w-6 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-green-600 shrink-0 mt-0.5">
                    <svg
                      className="h-3 w-3 sm:h-4 sm:w-4 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-white mb-1 text-xs sm:text-sm">Auto Field Detection</h3>
                    <p className="text-xs text-gray-400">
                      Fields are automatically detected and pre-configured based on API data type
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-800 rounded-lg p-3 sm:p-4 border border-gray-700">
                <div className="flex items-start gap-2 sm:gap-3">
                  <div className="flex h-6 w-6 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-green-600 shrink-0 mt-0.5">
                    <svg
                      className="h-3 w-3 sm:h-4 sm:w-4 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-white mb-1 text-xs sm:text-sm">Responsive Layout</h3>
                    <p className="text-xs text-gray-400">
                      Drag and drop widgets to customize your dashboard layout
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* How to Use */}
          <div>
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-3 sm:mb-4">How to Use</h2>
            <ol className="space-y-2 sm:space-y-3 text-xs sm:text-sm md:text-base text-gray-300">
              <li className="flex gap-2 sm:gap-3">
                <span className="flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center rounded-full bg-green-600 text-white shrink-0 text-xs sm:text-xs font-semibold">
                  1
                </span>
                <span>
                  Click <strong>"Add Widget"</strong> to create a new widget
                </span>
              </li>
              <li className="flex gap-2 sm:gap-3">
                <span className="flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center rounded-full bg-green-600 text-white shrink-0 text-xs sm:text-xs font-semibold">
                  2
                </span>
                <span>
                  Enter your API URL and click <strong>"Test"</strong> to verify the connection
                </span>
              </li>
              <li className="flex gap-2 sm:gap-3">
                <span className="flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center rounded-full bg-green-600 text-white shrink-0 text-xs sm:text-xs font-semibold">
                  3
                </span>
                <span>
                  Choose a display mode: <strong>Chart</strong>, <strong>Table</strong>, or <strong>Card</strong>
                </span>
              </li>
              <li className="flex gap-2 sm:gap-3">
                <span className="flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center rounded-full bg-green-600 text-white shrink-0 text-xs sm:text-xs font-semibold">
                  4
                </span>
                <span>
                  Fields are auto-selected based on the API type - just customize as needed
                </span>
              </li>
              <li className="flex gap-2 sm:gap-3">
                <span className="flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center rounded-full bg-green-600 text-white shrink-0 text-xs sm:text-xs font-semibold">
                  5
                </span>
                <span>
                  Drag and drop widgets to arrange your dashboard layout
                </span>
              </li>
            </ol>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-gray-800 border-t border-gray-700 p-4 sm:p-6 md:p-8 space-y-3 flex flex-col gap-3">
          <button
            onClick={handleLoadSampleDashboard}
            disabled={isLoading}
            className="w-full px-4 py-2 sm:py-3 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white transition-colors text-xs sm:text-sm md:text-base font-medium flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <svg
                  className="animate-spin h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Loading...
              </>
            ) : (
              <>
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Load Sample Dashboard
              </>
            )}
          </button>
          <button
            onClick={onClose}
            className="w-full px-4 py-2 sm:py-3 rounded-lg bg-green-600 hover:bg-green-700 text-white transition-colors text-xs sm:text-sm md:text-base font-medium"
          >
            Start Fresh
          </button>
        </div>
      </div>
    </div>
  );
}
