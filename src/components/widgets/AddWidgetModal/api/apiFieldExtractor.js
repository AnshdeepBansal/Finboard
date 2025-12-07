import { detectApiType } from '@/lib/detectApiType';
import { extractJsonPaths } from '@/lib/extractJsonPaths';

/**
 * Unified API field extraction and detection
 * Combines detectApiType and extractJsonPaths for cleaner API
 */
export function extractApiFields(data) {
  if (!data) {
    return {
      type: 'unsupported',
      fields: [],
      hasArrays: false,
    };
  }

  const type = detectApiType(data);
  const fields = extractJsonPaths(data);
  const hasArrays = fields.some((f) => f.type === 'array');

  return {
    type,
    fields,
    hasArrays,
  };
}

/**
 * Get array count from fields
 */
export function getArrayFieldCount(fields) {
  return fields.filter((f) => f.type === 'array').length;
}

/**
 * Build API test success message
 */
export function buildApiTestMessage(fields, hasArrays) {
  const arrayCount = getArrayFieldCount(fields);
  const message = `API connection successful! ${fields.length} fields found `
  return message;
}
