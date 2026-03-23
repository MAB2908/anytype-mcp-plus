/**
 * Common schemas used by Anytype MCP tools
 */

// Schema for icons
export const iconSchema = {
  type: 'object',
  properties: {
    emoji: { type: 'string' },
    format: { type: 'string', default: 'emoji' },
  },
  description: 'Icon',
};

// Schema for pagination
export const paginationSchema = {
  limit: {
    type: 'number',
    description: 'Results limit (default: 20)',
    default: 20,
  },
  offset: {
    type: 'number',
    description: 'Pagination offset (default: 0)',
    default: 0,
  },
};

// Schema for object properties - comprehensive property types based on API
export const objectPropertiesSchema = {
  type: 'array',
  description: 'Object properties',
  items: {
    type: 'object',
    properties: {
      key: { type: 'string', description: 'Property key' },
      text: { type: 'string', description: 'Text value' },
      number: { type: 'number', description: 'Number value' },
      checkbox: { type: 'boolean', description: 'Boolean value' },
      url: { type: 'string', description: 'URL' },
      email: { type: 'string', description: 'Email address' },
      phone: { type: 'string', description: 'Phone number' },
      date: { type: 'string', description: 'Date in ISO 8601 format' },
      select: { type: 'string', description: 'Selected tag ID' },
      multi_select: {
        type: 'array',
        items: { type: 'string' },
        description: 'Array of selected tag IDs'
      },
      files: {
        type: 'array',
        items: { type: 'string' },
        description: 'Array of file IDs'
      },
      objects: {
        type: 'array',
        items: { type: 'string' },
        description: 'Array of related object IDs'
      },
    },
    required: ['key'],
  },
};