/**
 * Tools for Types management in Anytype
 */

import { iconSchema } from './schemas.js';

export const typeTools = [
  {
    name: 'anytype_list_types',
    description: 'Lists all object types',
    inputSchema: {
      type: 'object',
      properties: {
        space_id: { type: 'string', description: 'Space ID' },
      },
      required: ['space_id'],
    },
  },
  {
    name: 'anytype_get_type',
    description: 'Gets a specific type',
    inputSchema: {
      type: 'object',
      properties: {
        space_id: { type: 'string', description: 'Space ID' },
        type_id: { type: 'string', description: 'Type ID' },
      },
      required: ['space_id', 'type_id'],
    },
  },
  {
    name: 'anytype_create_type',
    description: 'Creates a new object type',
    inputSchema: {
      type: 'object',
      properties: {
        space_id: { type: 'string', description: 'Space ID' },
        key: { type: 'string', description: 'Unique type key' },
        name: { type: 'string', description: 'Type name' },
        plural_name: { type: 'string', description: 'Plural type name (auto-generated if not provided)' },
        description: { type: 'string', description: 'Type description' },
        icon: iconSchema,
        layout: { type: 'string', description: 'Type layout (default: basic)' },
        properties: { type: 'array', items: { type: 'string' }, description: 'Property IDs' },
      },
      required: ['space_id', 'name'],
    },
  },
  {
    name: 'anytype_update_type',
    description: 'Updates an existing type',
    inputSchema: {
      type: 'object',
      properties: {
        space_id: { type: 'string', description: 'Space ID' },
        type_id: { type: 'string', description: 'Type ID' },
        name: { type: 'string', description: 'New name' },
        description: { type: 'string', description: 'New description' },
        icon: iconSchema,
        layout: { type: 'string', description: 'New layout' },
        properties: { type: 'array', items: { type: 'string' }, description: 'New property IDs' },
      },
      required: ['space_id', 'type_id'],
    },
  },
  {
    name: 'anytype_delete_type',
    description: 'Deletes an object type',
    inputSchema: {
      type: 'object',
      properties: {
        space_id: { type: 'string', description: 'Space ID' },
        type_id: { type: 'string', description: 'Type ID' },
      },
      required: ['space_id', 'type_id'],
    },
  },
];