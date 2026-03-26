/** * Common schemas used by Anytype MCP tools */

// Schema for icons.
// Supports three formats per Anytype REST API spec (2025-11-08):
//   emoji  — { format: "emoji", emoji: "📄" }
//   icon   — { format: "icon", name: "flask", color: "orange" }
//   file   — { format: "file", file: "<uploaded-file-id>" }
export const iconSchema = {
  type: 'object',
  properties: {
    format: {
      type: 'string',
      enum: ['emoji', 'icon', 'file'],
      default: 'emoji',
      description: 'Icon format: emoji | icon (built-in named) | file (uploaded)',
    },
    emoji: { type: 'string', description: 'Unicode emoji — format:emoji' },
    name: { type: 'string', description: 'Built-in icon name (flask, globe...) — format:icon' },
    color: {
      type: 'string',
      enum: ['grey','yellow','orange','red','pink','purple','blue','ice','teal','lime'],
      description: 'Icon color — format:icon',
    },
    file: { type: 'string', description: 'File object ID — format:file' },
  },
  description: 'Object icon. Examples: { format:"emoji", emoji:"📄" } | { format:"icon", name:"flask", color:"orange" } | { format:"file", file:"<id>" }',
};

// Schema for pagination
export const paginationSchema = {
  limit: { type: 'number', description: 'Results limit (default: 20)', default: 20 },
  offset: { type: 'number', description: 'Pagination offset (default: 0)', default: 0 },
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
      multi_select: { type: 'array', items: { type: 'string' }, description: 'Array of selected tag IDs' },
      files: { type: 'array', items: { type: 'string' }, description: 'Array of file IDs' },
      objects: { type: 'array', items: { type: 'string' }, description: 'Array of related object IDs' },
    },
    required: ['key'],
  },
};
