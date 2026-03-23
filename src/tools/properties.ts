/**
 * Tools for Properties management in Anytype
 */

import { paginationSchema } from './schemas.js';

export const propertyTools = [
  {
    name: 'anytype_list_properties',
    description: 'Lists all properties of a space',
    inputSchema: {
      type: 'object',
      properties: {
        space_id: { type: 'string', description: 'Space ID' },
        ...paginationSchema,
      },
      required: ['space_id'],
    },
  },
  {
    name: 'anytype_get_property',
    description: 'Gets a specific property',
    inputSchema: {
      type: 'object',
      properties: {
        space_id: { type: 'string', description: 'Space ID' },
        property_id: { type: 'string', description: 'Property ID' },
      },
      required: ['space_id', 'property_id'],
    },
  },
  {
    name: 'anytype_create_property',
    description: 'Creates a new property in a space. For select/multi_select properties, supports ' +
      'inline tag creation via the tags parameter (API 2025-11-08+).',
    inputSchema: {
      type: 'object',
      properties: {
        space_id: { type: 'string', description: 'Space ID' },
        key: { type: 'string', description: 'Unique property key' },
        name: { type: 'string', description: 'Property name' },
        type: { type: 'string', description: 'Property type' },
        description: { type: 'string', description: 'Description' },
        format: { type: 'string', description: 'Specific format' },
        source_object: { type: 'string', description: 'Source object ID' },
        read_only_value: { type: 'boolean', description: 'Read only' },
        tags: {
          type: 'array',
          description: 'Initial tags to create inline with the property. ' +
                       'Only supported for select and multi_select property types. ' +
                       'Each tag is an object with name (required) and color (optional). ' +
                       'Example: [{"name": "Active", "color": "green"}, {"name": "Done", "color": "grey"}]. ' +
                       'Requires Anytype API 2025-11-08+ (inline tag creation feature).',
          items: {
            type: 'object',
            properties: {
              name: { type: 'string', description: 'Tag name' },
              color: { type: 'string', description: 'Tag color (grey, yellow, orange, red, pink, purple, blue, ice, teal, lime)' }
            },
            required: ['name'] as any
          }
        },
      },
      required: ['space_id', 'name', 'type'],
    },
  },
  {
    name: 'anytype_update_property',
    description: 'Updates an existing property',
    inputSchema: {
      type: 'object',
      properties: {
        space_id: { type: 'string', description: 'Space ID' },
        property_id: { type: 'string', description: 'Property ID' },
        name: { type: 'string', description: 'New name' },
        description: { type: 'string', description: 'New description' },
        format: { type: 'string', description: 'New format' },
        source_object: { type: 'string', description: 'New source object' },
        read_only_value: { type: 'boolean', description: 'Read only' },
      },
      required: ['space_id', 'property_id'],
    },
  },
  {
    name: 'anytype_delete_property',
    description: 'Deletes a property',
    inputSchema: {
      type: 'object',
      properties: {
        space_id: { type: 'string', description: 'Space ID' },
        property_id: { type: 'string', description: 'Property ID' },
      },
      required: ['space_id', 'property_id'],
    },
  },
];