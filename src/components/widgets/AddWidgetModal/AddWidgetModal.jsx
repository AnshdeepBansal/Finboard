'use client';

import { useCallback, useEffect } from 'react';
import useWidgetStore from '@/store/widgetStore';

// Hooks
import { useApiTester } from './api/useApiTester';
import { useHeaders } from './hooks/useHeaders';
import { useFieldFilter } from './hooks/useFieldFilter';
import { useWidgetForm } from './hooks/useWidgetForm';

// Helpers
import { validateWidget } from './helpers/widgetValidator';
import {
  buildFieldsForSubmit,
  buildWidgetData,
  filterValidHeaders,
} from './helpers/widgetSubmitBuilder';
import { isArrayField } from './helpers/arrayFieldUtils';

// UI Components
import ModalWrapper from './ui/ModalWrapper';
import Section from './ui/Section';
import InputField from './ui/InputField';
import FieldSelector from './ui/FieldSelector';
import FieldList from './ui/FieldList';
import StatusBanner from './ui/StatusBanner';
import InfoBanner from './ui/InfoBanner';
import ButtonGroup from './ui/ButtonGroup';
import HeaderInput from './ui/HeaderInput';

/**
 * AddWidgetModal - Main component orchestrator
 * Composes all hooks, helpers, and UI components
 * Follows single responsibility principle
 */
export default function AddWidgetModal({ isOpen, onClose, editingWidget = null }) {
  const { addWidget, updateWidget } = useWidgetStore();

  // Form state
  const form = useWidgetForm(editingWidget);

  // API testing
  const api = useApiTester();

  // Headers management
  const headers = useHeaders(editingWidget?.headers || []);

  // Field filtering
  const fieldFilter = useFieldFilter(api.availableFields, form.formData.displayMode);

  // Handle field selection
  const handleAddField = useCallback(
    (fieldPath) => {
      if (form.formData.displayMode === 'table') {
        // For tables, only allow a single array field
        const field = api.availableFields.find((f) => f.path === fieldPath);
        if (field && isArrayField(field)) {
          form.updateField('selectedFields', [fieldPath]);
        } else {
          alert('Please select a valid array field for table view.');
        }
      } else {
        // For other modes, allow multiple
        if (!form.formData.selectedFields.includes(fieldPath)) {
          form.updateField('selectedFields', [
            ...form.formData.selectedFields,
            fieldPath,
          ]);
        }
      }
    },
    [form, api.availableFields]
  );

  const handleRemoveField = useCallback(
    (fieldPath) => {
      form.updateField(
        'selectedFields',
        form.formData.selectedFields.filter((f) => f !== fieldPath)
      );
    },
    [form]
  );

  // Handle display mode change
  // Filtering is handled by the hook based on `displayMode`

  // Initialize when editing
  useEffect(() => {
    if (editingWidget && isOpen) {
      api.testApi(editingWidget.apiUrl, editingWidget.headers || []);
    }
  }, [editingWidget, isOpen]);

  // Handle modal close
  const handleClose = useCallback(() => {
    form.reset();
    api.reset();
    headers.reset();
    fieldFilter.reset();
    onClose();
  }, [form, api, headers, fieldFilter, onClose]);

  // Handle form submission
  const handleSubmit = useCallback(() => {
    // Validate
    const error = validateWidget(
      form.formData,
      api.availableFields,
      api.testStatus
    );

    if (error) {
      alert(error);
      return;
    }

    // Check for duplicates
    if (form.isDuplicate) {
      alert('This API URL is already in use by another widget');
      return;
    }

    // Build fields and data
    const fieldsToUse = buildFieldsForSubmit(
      form.formData.selectedFields,
      form.formData.displayMode,
      api.apiType,
      api.availableFields
    );

    const validHeaders = filterValidHeaders(headers.headers);

    const widgetData = buildWidgetData(form.formData, fieldsToUse, validHeaders);

    // Update or add widget
    if (form.isEditing) {
      updateWidget(editingWidget.id, widgetData);
    } else {
      addWidget(widgetData);
    }

    handleClose();
  }, [
    form,
    api,
    headers,
    editingWidget,
    updateWidget,
    addWidget,
    handleClose,
  ]);

  // Determine submit button state with mode-specific rules
  const hasArrayFields = api.availableFields.some((f) => f.type === 'array');

  const submitDisabled =
    !form.formData.widgetName.trim() ||
    !form.formData.apiUrl.trim() ||
    !api.testStatus?.success ||
    (form.formData.displayMode === 'chart' && api.apiType !== 'time-series') ||
    (form.formData.displayMode === 'table' && !hasArrayFields);

  const submitDisabledReason = !form.formData.widgetName.trim()
    ? 'Widget name is required'
    : !form.formData.apiUrl.trim()
      ? 'API URL is required'
      : !api.testStatus?.success
        ? 'Please test the API connection first'
        : form.formData.displayMode === 'chart' && api.apiType !== 'time-series'
          ? 'Chart view is allowed only for Time Series APIs'
          : form.formData.displayMode === 'table' && !hasArrayFields
            ? 'Table view requires an array in the API response'
            : '';

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={handleClose}
      title="Add New Widget"
      isEditing={form.isEditing}
    >
      {/* Filtering is handled by the hook based on displayMode */}
      <Section>
        <InputField
          label="Widget Name"
          value={form.formData.widgetName}
          onChange={(e) => form.updateField('widgetName', e.target.value)}
          placeholder="Enter widget name"
        />
      </Section>

      {/* API URL */}
      <Section>
        <label className="mb-2 block text-sm font-medium">API URL</label>
        <div className="flex flex-col sm:flex-row gap-2">
          <InputField
            value={form.formData.apiUrl}
            onChange={(e) => form.updateField('apiUrl', e.target.value)}
            placeholder="https://api.example.com/data"
            className="flex-1 text-sm sm:text-base"
          />
          <button
            onClick={() => api.testApi(form.formData.apiUrl, headers.headers)}
            disabled={api.isLoading}
            className="flex items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700 disabled:opacity-50 whitespace-nowrap text-sm sm:text-base"
          >
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
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            Test
          </button>
        </div>  
        {api.testStatus && (
          <div className="mt-3">
            <StatusBanner
              status={api.testStatus.success ? 'success' : 'error'}
              message={api.testStatus.message}
              errorType={api.testStatus.errorType}
            />
          </div>
        )}
        <div className="m-2 flex items-center justify-between">
          <label className="block text-sm font-medium">
            Request Headers (Optional)
          </label>
          <button
            type="button"
            onClick={headers.addHeader}
            className="text-sm text-green-400 hover:text-green-300"
          >
            + Add Header
          </button>
        </div>
        {headers.isEmpty ? (
          <div className="rounded-lg border border-dashed border-gray-600 p-4 text-center">
            <p className="text-sm text-gray-400 mb-2">No headers added</p>
            <button
              type="button"
              onClick={headers.addHeader}
              className="text-sm text-green-400 hover:text-green-300"
            >
              Click to add a header
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {headers.headers.map((header, index) => (
              <HeaderInput
                key={index}
                header={header}
                index={index}
                onKeyChange={(idx, value) =>
                  headers.updateHeader(idx, 'key', value)
                }
                onValueChange={(idx, value) =>
                  headers.updateHeader(idx, 'value', value)
                }
                onRemove={() => headers.removeHeader(index)}
              />
            ))}
          </div>
        )}
        <p className="mt-2 text-xs text-gray-400">
          Add custom headers for API authentication or other requirements (e.g.,
          Authorization, X-API-Key)
        </p>
      </Section>

      {/* Refresh Interval */}
      <Section>
        <InputField
          label="Refresh Interval (seconds)"
          type="number"
          value={form.formData.refreshInterval}
          onChange={(e) => form.updateField('refreshInterval', e.target.value)}
          min="1"
        />
      </Section>

      {/* Display Mode */}
      <Section>
        <FieldSelector
          label="Display Mode"
          value={form.formData.displayMode}
          onChange={(mode) => {
            form.updateField('displayMode', mode);
          }}
        />
      </Section>

      {/* Field Selection */}
      {api.testStatus?.success && form.formData.displayMode !== 'chart' && (
        <Section>
          <div className="mb-2 flex items-center justify-between">
            <label className="block text-sm font-medium">
              {form.formData.displayMode === 'table'
                ? 'Select Array Field for Table'
                : 'Select Fields to Display'}
            </label>
            {/* Table mode always shows array fields; no checkbox needed */}
          </div>
          <InputField
            value={fieldFilter.searchQuery}
            onChange={(e) => fieldFilter.setSearchQuery(e.target.value)}
            placeholder="Search for fields..."
            className="mb-4"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Available Fields */}
            <div>
              <label className="mb-2 block text-sm font-medium">
                {form.formData.displayMode === 'table'
                  ? 'Available Array Fields'
                  : 'Available Fields'}
              </label>
              <div className="h-48 sm:h-64 overflow-y-auto rounded-lg border border-gray-700 bg-gray-900 p-2">
                <FieldList
                  fields={fieldFilter.filteredFields}
                  selectedFields={form.formData.selectedFields}
                  onAddField={handleAddField}
                  displayMode={form.formData.displayMode}
                  isEmpty={fieldFilter.filteredFields.length === 0}
                  emptyMessage={form.formData.displayMode === 'table'
                    ? 'No array fields found'
                    : 'No fields found'}
                />
              </div>
            </div>

            {/* Selected Fields */}
            <div>
              <label className="mb-2 block text-sm font-medium">
                {form.formData.displayMode === 'table'
                  ? 'Selected Array Field'
                  : 'Selected Fields'}
              </label>
              <div className="h-48 sm:h-64 overflow-y-auto rounded-lg border border-gray-700 bg-gray-900 p-2">
                {form.formData.selectedFields.length === 0 ? (
                  <div className="p-4 text-center text-gray-400">
                    {form.formData.displayMode === 'table'
                      ? 'No array field selected'
                      : 'No fields selected'}
                  </div>
                ) : (
                  <FieldList
                    fields={api.availableFields.filter((f) =>
                      form.formData.selectedFields.includes(f.path)
                    )}
                    selectedFields={form.formData.selectedFields}
                    onRemoveField={handleRemoveField}
                    displayMode={form.formData.displayMode}
                    isEmpty={false}
                  />
                )}
              </div>
            </div>
          </div>
        </Section>
      )}

      {/* Info Banners */}
      {api.testStatus?.success && (
        <InfoBanner
          displayMode={form.formData.displayMode}
          selectedFields={form.formData.selectedFields}
          apiType={api.apiType}
        />
      )}

      {/* Actions */}
      <ButtonGroup
        onCancel={handleClose}
        onSubmit={handleSubmit}
        isSubmitDisabled={submitDisabled}
        isEditing={form.isEditing}
        disabledReason={submitDisabledReason}
      />
    </ModalWrapper>
  );
}
