/**
 * Tools for Lists management in Anytype
 * Las listas en Anytype reemplazan el concepto de colecciones
 */

export const listTools = [
  {
    name: 'anytype_get_list_views',
    description: 'Obtiene las vistas disponibles para una lista',
    inputSchema: {
      type: 'object',
      properties: {
        space_id: { type: 'string', description: 'ID del espacio' },
        list_id: { type: 'string', description: 'ID de la lista' },
      },
      required: ['space_id', 'list_id'],
    },
  },
  {
    name: 'anytype_get_list_objects',
    description: 'Obtiene objetos de una lista usando una vista específica',
    inputSchema: {
      type: 'object',
      properties: {
        space_id: { type: 'string', description: 'ID del espacio' },
        list_id: { type: 'string', description: 'ID de la lista' },
        view_id: { type: 'string', description: 'ID de la vista' },
        limit: { type: 'number', description: 'Límite de resultados' },
        offset: { type: 'number', description: 'Offset para paginación' },
      },
      required: ['space_id', 'list_id', 'view_id'],
    },
  },
];