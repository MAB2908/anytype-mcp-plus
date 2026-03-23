/**
 * Tools for Objects management in Anytype
 */

import { iconSchema, paginationSchema, objectPropertiesSchema } from './schemas.js';

export const objectTools = [
  {
    name: 'anytype_global_search',
    description: 'Searches objects across ALL spaces accessible to the user. ' +
      'Unlike search_objects (which searches within one space), this returns ' +
      'results from every space. Supports text search (query), ' +
      'type filtering (types), and sorting (sort). ' +
      'Endpoint: POST /v1/search (Anytype API 2025-11-08).',
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Text to search in object names and content'
        },
        types: {
          type: 'array',
          items: { type: 'string' },
          description: 'Object types to filter (e.g. ["page", "task", "bookmark"])'
        },
        sort: {
          type: 'object',
          description: 'Sort options. property_key: "created_date" | "last_modified_date" | ' +
                       '"last_opened_date" | "name" (default: "last_modified_date"). ' +
                       'direction: "asc" | "desc" (default: "desc").',
          properties: {
            property_key: {
              type: 'string',
              enum: ['created_date', 'last_modified_date', 'last_opened_date', 'name']
            },
            direction: {
              type: 'string',
              enum: ['asc', 'desc']
            }
          }
        },
        limit: {
          type: 'number',
          description: 'Results limit (default: 20)',
          default: 20
        },
        offset: {
          type: 'number',
          description: 'Pagination offset (default: 0)',
          default: 0
        }
      }
    },
  },
  {
    name: 'anytype_search_objects',
    description: 'Searches objects within a SPECIFIC space. ' +
      'Requires space_id. For searching across ALL spaces, use global_search. ' +
      'Supports text search (query), type filtering (types), and sorting (sort). ' +
      'NOTE: Property-based filtering (filters) is not yet supported ' +
      'by Anytype API — marked as TODO in official anyproto/anytype-mcp (Jan 2026). ' +
      'Endpoint: POST /v1/spaces/{space_id}/search.',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Text to search' },
        space_id: { type: 'string', description: 'Space ID to search within' },
        types: { type: 'array', items: { type: 'string' }, description: 'Object types to filter' },
        limit: { type: 'number', description: 'Results limit', default: 20 },
        sort: {
          type: 'object',
          description: 'Sort options for search results. ' +
                       'property_key: "created_date" | "last_modified_date" | "last_opened_date" | "name" ' +
                       '(default: "last_modified_date"). ' +
                       'direction: "asc" | "desc" (default: "desc"). ' +
                       'Example: {"property_key": "created_date", "direction": "asc"}. ' +
                       'This is a working API feature confirmed in Anytype API 2025-11-08.',
          properties: {
            property_key: {
              type: 'string',
              enum: ['created_date', 'last_modified_date', 'last_opened_date', 'name'],
              description: 'Property to sort by'
            },
            direction: {
              type: 'string',
              enum: ['asc', 'desc'],
              description: 'Sort direction'
            }
          }
        },
        filters: {
          type: 'object',
          description: 'NOT YET SUPPORTED by Anytype API. ' +
                       'Property-based filtering is marked as TODO in official anyproto/anytype-mcp ' +
                       '(commit 542d477, Jan 2026). Passing this parameter has no effect. ' +
                       'Use types parameter for type filtering, or query for text search.'
        },
      },
    },
  },
  {
    name: 'anytype_list_objects',
    description: 'Lists objects in a specific space. Supports simple key=value filtering.',
    inputSchema: {
      type: 'object',
      properties: {
        space_id: { type: 'string', description: 'Space ID' },
        ...paginationSchema,
        filters: {
          type: 'object',
          description: 'Simple key=value filters applied as URL query parameters. ' +
                       'Only simple values are supported (boolean, string, number). ' +
                       'Example: {"done": false} → ?done=false. ' +
                       'NOTE: Operator syntax {"done": {"eq": false}} is NOT reliably supported ' +
                       'by Anytype API and causes errors. ' +
                       'For complex filtering, use search_objects with types parameter.'
        },
      },
      required: ['space_id'],
    },
  },
  {
    name: 'anytype_get_object',
    description: 'Gets a specific object by its ID',
    inputSchema: {
      type: 'object',
      properties: {
        space_id: { type: 'string', description: 'Space ID' },
        object_id: { type: 'string', description: 'Object ID' },
      },
      required: ['space_id', 'object_id'],
    },
  },
  {
    name: 'anytype_create_object',
    description: 'Creates a new object in a space',
    inputSchema: {
      type: 'object',
      properties: {
        space_id: { type: 'string', description: 'Space ID' },
        name: { type: 'string', description: 'Object name' },
        type_key: { type: 'string', description: 'Object type', default: 'page' },
        body: { type: 'string', description: 'Object content (Markdown)' },
        markdown: { type: 'string', description: 'Object content (Markdown) - alias for body' },
        icon: iconSchema,
        properties: objectPropertiesSchema,
        template_id: { type: 'string', description: 'Template ID' },
      },
      required: ['space_id', 'name'],
    },
  },
  {
    name: 'anytype_update_object',
    description: 'Updates an existing object. Supports in-place update (name, properties, type_key) ' +
      'and body replacement (markdown). NOTE: body update changes object ID and resets created_date ' +
      'due to Anytype API recreation strategy.',
    inputSchema: {
      type: 'object',
      properties: {
        space_id: { type: 'string', description: 'Space ID' },
        object_id: { type: 'string', description: 'Object ID' },
        name: { type: 'string', description: 'New object name' },
        body: { type: 'string', description: 'New content (Markdown) - Will use replacement strategy' },
        markdown: { type: 'string', description: 'New content (Markdown) - alias for body - Will use replacement strategy' },
        icon: iconSchema,
        properties: objectPropertiesSchema,
        type_key: {
          type: 'string',
          description: 'Change the object type by providing the new type key. ' +
                       'Built-in types: "page", "note", "task", "project", "bookmark", ' +
                       '"collection", "set" (query), "audio", "video", "image", "file". ' +
                       'Use list_types to find custom type keys. ' +
                       'When changing type, new type\'s properties are added automatically; ' +
                       'existing properties and content are preserved. ' +
                       'ID and created_date are preserved (in-place update). ' +
                       'Only works without body/markdown parameter. ' +
                       'Requires Anytype API 2025-11-08+.'
        },
      },
      required: ['space_id', 'object_id'],
    },
  },
  {
    name: 'anytype_delete_object',
    description: 'Deletes (archives) an object',
    inputSchema: {
      type: 'object',
      properties: {
        space_id: { type: 'string', description: 'Space ID' },
        object_id: { type: 'string', description: 'Object ID' },
      },
      required: ['space_id', 'object_id'],
    },
  },
];