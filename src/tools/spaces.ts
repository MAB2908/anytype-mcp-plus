/**
 * Tools for Spaces management in Anytype
 */

import { paginationSchema } from './schemas.js';

export const spaceTools = [
  {
    name: 'anytype_list_spaces',
    description: 'Lists all available spaces',
    inputSchema: { type: 'object', properties: {} },
  },
  {
    name: 'anytype_get_space',
    description: 'Gets a specific space by its ID',
    inputSchema: {
      type: 'object',
      properties: {
        space_id: { type: 'string', description: 'Space ID' }
      },
      required: ['space_id'],
    },
  },
  {
    name: 'anytype_create_space',
    description: 'Creates a new space. ' +
      'NOTE: Icon cannot be set for spaces — this is an Anytype API limitation. ' +
      'The API accepts the icon field but silently ignores it.',
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Space name' },
        description: { type: 'string', description: 'Space description' },
      },
      required: ['name'],
    },
  },
  {
    name: 'anytype_update_space',
    description: 'Updates an existing space. ' +
      'NOTE: Icon cannot be set for spaces — this is an Anytype API limitation. ' +
      'The API accepts the icon field but silently ignores it.',
    inputSchema: {
      type: 'object',
      properties: {
        space_id: { type: 'string', description: 'Space ID' },
        name: { type: 'string', description: 'New space name' },
        description: { type: 'string', description: 'New space description' },
      },
      required: ['space_id'],
    },
  },
  {
    name: 'anytype_list_members',
    description: 'Lists all members of a space',
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
    name: 'anytype_get_member',
    description: 'Gets a specific member',
    inputSchema: {
      type: 'object',
      properties: {
        space_id: { type: 'string', description: 'Space ID' },
        member_id: { type: 'string', description: 'Member ID' },
      },
      required: ['space_id', 'member_id'],
    },
  },
];