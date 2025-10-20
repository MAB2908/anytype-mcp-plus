import { McpError, ErrorCode } from '@modelcontextprotocol/sdk/types.js';
import fetch from 'node-fetch';

// API configuration
export const API_BASE_URL = process.env.ANYTYPE_API_URL || 'http://localhost:31009';
export const API_VERSION = '2025-05-20';

// System properties that cannot be set directly via API
export const SYSTEM_PROPERTIES = ['backlinks', 'links', 'last_modified_date', 'last_modified_by', 'created_date', 'creator', 'last_opened_date'];

/**
 * Filters out system properties that cannot be set directly
 * @param properties - Array of property objects
 * @returns Filtered array without system properties
 */
export function filterSystemProperties(properties: any[]): any[] {
  return properties.filter((prop: any) => !SYSTEM_PROPERTIES.includes(prop.key));
}

/**
 * Custom error class for Anytype API errors
 */
export class AnytypeApiError extends Error {
  constructor(message: string, public statusCode?: number, public originalError?: any) {
    super(message);
    this.name = 'AnytypeApiError';
  }
}

/**
 * Builds new object data for replacement strategy
 * @param updateData - Data to update
 * @param currentObject - Current object from API
 * @param contentField - New content (body/markdown)
 * @returns Prepared object data
 */
export function buildNewObjectData(updateData: any, currentObject: any, contentField: string): any {
  const newObjectData: any = {
    name: updateData.name || currentObject.object.name,
    type_key: currentObject.object.type?.key || 'page',
    body: contentField
  };

  // Only add icon if it exists and is not empty
  if (updateData.icon || (currentObject.object.icon && currentObject.object.icon !== null)) {
    newObjectData.icon = updateData.icon || currentObject.object.icon;
  }

  // Handle properties with improved tag support
  if (updateData.properties) {
    // Use new properties from updateData (already processed by validateAndProcessTags)
    newObjectData.properties = updateData.properties;
    console.log(`Using updated properties: ${updateData.properties.length} properties`);
  } else if (currentObject.object.properties) {
    // Use existing properties, filtered to remove system properties
    const filteredProperties = filterSystemProperties(currentObject.object.properties);
    if (filteredProperties.length > 0) {
      newObjectData.properties = filteredProperties;
      console.log(`Using existing properties: ${filteredProperties.length} properties`);
    }
  }

  return newObjectData;
}

/**
 * Helper function for API requests
 * @param endpoint - API endpoint
 * @param options - Request options
 * @returns API response
 */
export async function makeRequest(endpoint: string, options: any = {}): Promise<any> {
  const apiKey = process.env.ANYTYPE_API_KEY;
  if (!apiKey) {
    throw new McpError(
      ErrorCode.InvalidRequest,
      'API key not configured. Set ANYTYPE_API_KEY environment variable.'
    );
  }

  const url = `${API_BASE_URL}${endpoint}`;
  console.error('Request URL:', url);
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      'Anytype-Version': API_VERSION,
      ...options.headers,
    },
  });

  console.error('Response status:', response.status);
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('API Error:', errorText);
    throw new McpError(
      ErrorCode.InternalError,
      `API request failed: ${response.status} ${response.statusText} - ${errorText}`
    );
  }

  return await response.json();
}