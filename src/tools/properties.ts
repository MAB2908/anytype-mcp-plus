/**
 * Tools for Properties management in Anytype
 */

import { paginationSchema } from './schemas.js';

export const propertyTools = [
  {
    name: 'anytype_list_properties',
    description: 'Lista todas las propiedades de un espacio',
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
    name: 'anytype_get_property',
    description: 'Obtiene una propiedad específica',
    inputSchema: {
      type: 'object',
      properties: {
        space_id: { type: 'string', description: 'ID del espacio' },
        property_id: { type: 'string', description: 'ID de la propiedad' },
      },
      required: ['space_id', 'property_id'],
    },
  },
  {
    name: 'anytype_create_property',
    description: 'Crea una nueva propiedad',
    inputSchema: {
      type: 'object',
      properties: {
        space_id: { type: 'string', description: 'ID del espacio' },
        key: { type: 'string', description: 'Clave única de la propiedad' },
        name: { type: 'string', description: 'Nombre de la propiedad' },
        type: { type: 'string', description: 'Tipo de propiedad' },
        description: { type: 'string', description: 'Descripción' },
        format: { type: 'string', description: 'Formato específico' },
        source_object: { type: 'string', description: 'ID del objeto fuente' },
        read_only_value: { type: 'boolean', description: 'Solo lectura' },
      },
      required: ['space_id', 'name', 'type'],
    },
  },
  {
    name: 'anytype_update_property',
    description: 'Actualiza una propiedad existente',
    inputSchema: {
      type: 'object',
      properties: {
        space_id: { type: 'string', description: 'ID del espacio' },
        property_id: { type: 'string', description: 'ID de la propiedad' },
        name: { type: 'string', description: 'Nuevo nombre' },
        description: { type: 'string', description: 'Nueva descripción' },
        format: { type: 'string', description: 'Nuevo formato' },
        source_object: { type: 'string', description: 'Nuevo objeto fuente' },
        read_only_value: { type: 'boolean', description: 'Solo lectura' },
      },
      required: ['space_id', 'property_id'],
    },
  },
  {
    name: 'anytype_delete_property',
    description: 'Elimina una propiedad',
    inputSchema: {
      type: 'object',
      properties: {
        space_id: { type: 'string', description: 'ID del espacio' },
        property_id: { type: 'string', description: 'ID de la propiedad' },
      },
      required: ['space_id', 'property_id'],
    },
  },
];