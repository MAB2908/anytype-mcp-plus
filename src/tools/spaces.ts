/**
 * Tools for Spaces management in Anytype
 */

import { iconSchema, paginationSchema } from './schemas.js';

export const spaceTools = [
  {
    name: 'anytype_list_spaces',
    description: 'Lista todos los espacios disponibles',
    inputSchema: { type: 'object', properties: {} },
  },
  {
    name: 'anytype_get_space',
    description: 'Obtiene un espacio específico por su ID',
    inputSchema: {
      type: 'object',
      properties: { 
        space_id: { type: 'string', description: 'ID del espacio' } 
      },
      required: ['space_id'],
    },
  },
  {
    name: 'anytype_create_space',
    description: 'Crea un nuevo espacio',
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Nombre del espacio' },
        description: { type: 'string', description: 'Descripción del espacio' },
        icon: iconSchema,
      },
      required: ['name'],
    },
  },
  {
    name: 'anytype_update_space',
    description: 'Actualiza un espacio existente',
    inputSchema: {
      type: 'object',
      properties: {
        space_id: { type: 'string', description: 'ID del espacio' },
        name: { type: 'string', description: 'Nuevo nombre del espacio' },
        description: { type: 'string', description: 'Nueva descripción del espacio' },
        icon: iconSchema,
      },
      required: ['space_id'],
    },
  },
  {
    name: 'anytype_list_members',
    description: 'Lista todos los miembros de un espacio',
    inputSchema: {
      type: 'object',
      properties: {
        space_id: { type: 'string', description: 'ID del espacio' },
        ...paginationSchema,
      },
      required: ['space_id'],
    },
  },
  {
    name: 'anytype_get_member',
    description: 'Obtiene un miembro específico',
    inputSchema: {
      type: 'object',
      properties: {
        space_id: { type: 'string', description: 'ID del espacio' },
        member_id: { type: 'string', description: 'ID del miembro' },
      },
      required: ['space_id', 'member_id'],
    },
  },
];