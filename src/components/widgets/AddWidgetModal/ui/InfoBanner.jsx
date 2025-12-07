/**
 * InfoBanner - Display informational messages about current mode
 */
export default function InfoBanner({ displayMode, selectedFields, apiType }) {
  if (displayMode === 'chart' && apiType === 'time-series') {
    return (
      <div className="mb-4 rounded-lg bg-blue-900 p-3 text-blue-200 text-sm">
        <div className="flex items-center gap-2">
          <svg
            className="h-5 w-5 shrink-0"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2z"
              clipRule="evenodd"
            />
          </svg>
          <span>
            Chart will automatically display all available time-series fields
            (Open, High, Low, Close, Volume)
          </span>
        </div>
      </div>
    );
  }

  if (displayMode === 'chart' && apiType != 'time-series') {
    return (
      <div className="mb-4 rounded-lg bg-blue-900 p-3 text-blue-200 text-sm">
        <div className="flex items-center gap-2">
          <svg
            className="h-5 w-5 shrink-0"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2z"
              clipRule="evenodd"
            />
          </svg>
          <span>
            Chart is only available for time-series APIs. Please select another
            display mode.
          </span>
        </div>
      </div>
    );
  }



  if (displayMode === 'table') {
    return (
      <div className="mb-4 rounded-lg bg-blue-900 p-3 text-blue-200 text-sm">
        <div className="flex items-center gap-2">
          <svg
            className="h-5 w-5 shrink-0"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
          <span>
            {selectedFields.length > 0
              ? 'Table will display data from the selected array. Columns will be generated automatically from the array items.'
              : 'Please select an array field from the API response. The table will automatically generate columns from the array items.'}
          </span>
        </div>
      </div>
    );
  }

  if (displayMode === 'card') {
    return (
      <div className="mb-4 rounded-lg bg-blue-900 p-3 text-blue-200 text-sm">
        <div className="flex items-center gap-2">
          <svg
            className="h-5 w-5 shrink-0"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
          <span>
            Cards support any API structure. Select fields to display and they
            will be mapped one-to-one from the API response.
          </span>
        </div>
      </div>
    );
  }

  return null;
}
