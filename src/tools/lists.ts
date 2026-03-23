/**
 * Tools for Lists management in Anytype
 * Lists in Anytype replace the concept of collections
 */

export const listTools: any[] = [
  {
    name: 'anytype_add_to_collection',
    description: 'Add an object to a collection (list). The collection must already exist.',
    inputSchema: {
      type: 'object',
      properties: {
        space_id: { type: 'string', description: 'Space ID' },
        collection_id: { type: 'string', description: 'Collection (list) ID' },
        object_id: { type: 'string', description: 'Object ID to add' },
      },
      required: ['space_id', 'collection_id', 'object_id'],
    },
  },
  {
    name: 'anytype_remove_from_collection',
    description: 'Remove an object from a collection (list).',
    inputSchema: {
      type: 'object',
      properties: {
        space_id: { type: 'string', description: 'Space ID' },
        collection_id: { type: 'string', description: 'Collection (list) ID' },
        object_id: { type: 'string', description: 'Object ID to remove' },
      },
      required: ['space_id', 'collection_id', 'object_id'],
    },
  },
  {
    name: 'anytype_get_list_views',
    description: 'Gets available views for a list',
    inputSchema: {
      type: 'object',
      properties: {
        space_id: { type: 'string', description: 'Space ID' },
        list_id: { type: 'string', description: 'List ID' },
      },
      required: ['space_id', 'list_id'],
    },
  },
  {
    name: 'anytype_get_list_objects',
    description: 'Gets objects from a list using a specific view',
    inputSchema: {
      type: 'object',
      properties: {
        space_id: { type: 'string', description: 'Space ID' },
        list_id: { type: 'string', description: 'List ID' },
        view_id: { type: 'string', description: 'View ID' },
        limit: { type: 'number', description: 'Results limit' },
        offset: { type: 'number', description: 'Pagination offset' },
      },
      required: ['space_id', 'list_id', 'view_id'],
    },
  },
];