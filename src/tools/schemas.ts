/**
 * Common schemas used by Anytype MCP tools
 */

// Schema for icons
export const iconSchema = {
  type: 'object',
  properties: {
    emoji: { type: 'string' },
    format: { type: 'string', default: 'emoji' },
  },
  description: 'Icono',
};

// Schema for pagination
export const paginationSchema = {
  limit: {
    type: 'number',
    description: 'Límite de resultados (default: 20)',
    default: 20,
  },
  offset: {
    type: 'number',
    description: 'Offset para paginación (default: 0)',
    default: 0,
  },
};

// Schema for object properties - comprehensive property types based on API
export const objectPropertiesSchema = {
  type: 'array',
  description: 'Propiedades del objeto',
  items: {
    type: 'object',
    properties: {
      key: { type: 'string', description: 'Clave de la propiedad' },
      // Text property
      text: { type: 'string', description: 'Valor de texto' },
      // Number property
      number: { type: 'number', description: 'Valor numérico' },
      // Checkbox property
      checkbox: { type: 'boolean', description: 'Valor booleano' },
      // URL property
      url: { type: 'string', description: 'URL' },
      // Email property
      email: { type: 'string', description: 'Dirección de email' },
      // Phone property
      phone: { type: 'string', description: 'Número de teléfono' },
      // Date property
      date: { type: 'string', description: 'Fecha en formato ISO 8601' },
      // Select property (single tag)
      select: { type: 'string', description: 'ID del tag seleccionado' },
      // Multi-select property (multiple tags)
      multi_select: { 
        type: 'array', 
        items: { type: 'string' },
        description: 'Array de IDs de tags seleccionados' 
      },
      // Files property
      files: { 
        type: 'array', 
        items: { type: 'string' },
        description: 'Array de IDs de archivos' 
      },
      // Objects property (relations)
      objects: { 
        type: 'array', 
        items: { type: 'string' },
        description: 'Array de IDs de objetos relacionados' 
      },
    },
    required: ['key'],
    additionalProperties: false,
  },
};