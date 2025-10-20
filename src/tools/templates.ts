/**
 * Tools for Templates and Collections management in Anytype
 */

import { paginationSchema } from './schemas.js';

export const templateTools = [
  {
    name: 'anytype_list_templates',
    description: 'Lists all available templates for a specific type',
    inputSchema: {
      type: 'object',
      properties: {
        space_id: { type: 'string', description: 'Space ID' },
        type_id: { type: 'string', description: 'Type ID (required - templates are associated with types)' },
        ...paginationSchema,
      },
      required: ['space_id', 'type_id'],
    },
  },
  {
    name: 'anytype_get_template',
    description: 'Gets a specific template',
    inputSchema: {
      type: 'object',
      properties: {
        space_id: { type: 'string', description: 'Space ID' },
        type_id: { type: 'string', description: 'Type ID (required - templates are associated with types)' },
        template_id: { type: 'string', description: 'Template ID' },
      },
      required: ['space_id', 'type_id', 'template_id'],
    },
  },
  {
    name: 'anytype_add_to_collection',
    description: 'Adds an object to a collection',
    inputSchema: {
      type: 'object',
      properties: {
        space_id: { type: 'string', description: 'Space ID' },
        collection_id: { type: 'string', description: 'Collection ID' },
        object_id: { type: 'string', description: 'Object ID' },
      },
      required: ['space_id', 'collection_id', 'object_id'],
    },
  },
  {
    name: 'anytype_remove_from_collection',
    description: 'Removes an object from a collection',
    inputSchema: {
      type: 'object',
      properties: {
        space_id: { type: 'string', description: 'Space ID' },
        collection_id: { type: 'string', description: 'Collection ID' },
        object_id: { type: 'string', description: 'Object ID' },
      },
      required: ['space_id', 'collection_id', 'object_id'],
    },
  },
];