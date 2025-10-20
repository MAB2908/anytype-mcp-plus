/**
 * Tools for Tags management in Anytype
 */

import { paginationSchema } from './schemas.js';

export const tagTools = [
  {
    name: 'anytype_list_tags',
    description: 'Lists all tags for a property',
    inputSchema: {
      type: 'object',
      properties: {
        space_id: { type: 'string', description: 'Space ID' },
        property_key: { type: 'string', description: 'Property key' },
        ...paginationSchema,
      },
      required: ['space_id', 'property_key'],
    },
  },
  {
    name: 'anytype_get_tag',
    description: 'Gets a specific tag',
    inputSchema: {
      type: 'object',
      properties: {
        space_id: { type: 'string', description: 'Space ID' },
        tag_id: { type: 'string', description: 'Tag ID' },
      },
      required: ['space_id', 'tag_id'],
    },
  },
  {
    name: 'anytype_create_tag',
    description: 'Creates a new tag',
    inputSchema: {
      type: 'object',
      properties: {
        space_id: { type: 'string', description: 'Space ID' },
        name: { type: 'string', description: 'Tag name' },
        color: { 
          type: 'string', 
          description: 'Tag color',
          enum: ['grey', 'yellow', 'orange', 'red', 'pink', 'purple', 'blue', 'ice', 'teal', 'lime']
        },
        property_id: { type: 'string', description: 'Property ID (for multi_select properties)' },
      },
      required: ['space_id', 'name', 'property_id'],
    },
  },
  {
    name: 'anytype_update_tag',
    description: 'Updates an existing tag',
    inputSchema: {
      type: 'object',
      properties: {
        space_id: { type: 'string', description: 'Space ID' },
        tag_id: { type: 'string', description: 'Tag ID' },
        name: { type: 'string', description: 'New name' },
        color: { 
          type: 'string', 
          description: 'New color',
          enum: ['grey', 'yellow', 'orange', 'red', 'pink', 'purple', 'blue', 'ice', 'teal', 'lime']
        },
      },
      required: ['space_id', 'tag_id'],
    },
  },
  {
    name: 'anytype_delete_tag',
    description: 'Deletes a tag',
    inputSchema: {
      type: 'object',
      properties: {
        space_id: { type: 'string', description: 'Space ID' },
        tag_id: { type: 'string', description: 'Tag ID' },
      },
      required: ['space_id', 'tag_id'],
    },
  },
];