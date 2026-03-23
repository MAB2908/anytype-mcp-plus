import { makeRequest } from '../utils.js';

// Types
/**
 * List types in a space
 */
export async function handleListTypes(args: any) {
  const { space_id } = args;
  const response = await makeRequest(`/v1/spaces/${space_id}/types`);
  return { content: [{ type: 'text', text: JSON.stringify(response, null, 2) }] };
}

/**
 * Get a specific type
 */
export async function handleGetType(args: any) {
  const { space_id, type_id } = args;
  const response = await makeRequest(`/v1/spaces/${space_id}/types/${type_id}`);
  return { content: [{ type: 'text', text: JSON.stringify(response, null, 2) }] };
}

/**
 * Create a new type
 * Fixed based on Context7 documentation - including all required fields including plural_name
 */
export async function handleCreateType(args: any) {
  const { space_id, name, plural_name, description, icon, key, layout, properties, ...typeData } = args;
  
  // Validate required fields based on API testing and best practices
  if (!name) {
    return { 
      content: [{ 
        type: 'text', 
        text: JSON.stringify({
          error: 'Missing required field',
          message: 'Field "name" is required for creating a type',
          required_fields: ['name', 'plural_name'],
          provided_fields: Object.keys(args)
        }, null, 2) 
      }] 
    };
  }
  
  // Auto-generate plural_name if not provided
  const finalPluralName = plural_name || (name.endsWith('s') ? name : name + 's');
  
  // Build request body according to API specification with required plural_name and key
  const requestBody = {
    name,
    plural_name: finalPluralName, // Required field (not documented but mandatory)
    description,
    icon,
    key: key || name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, ''), // Generate slug from name if not provided
    layout: layout || 'basic', // Default to basic layout (required field)
    properties: properties || [], // Array of property IDs
    ...typeData
  };
  
  const response = await makeRequest(`/v1/spaces/${space_id}/types`, {
    method: 'POST',
    body: JSON.stringify(requestBody),
  });
  return { content: [{ type: 'text', text: JSON.stringify(response, null, 2) }] };
}

/**
 * Update a type
 * Based on official API documentation: PATCH /v1/spaces/{space_id}/types/{type_id}
 *
 * API LIMITATION: UpdateTypeRequest.properties expects array of PropertyLink objects
 * with required fields {format, key, name}, not just IDs.
 * Fix: if properties array of IDs is provided, resolve each ID to a PropertyLink via GET.
 *
 * API LIMITATION: Adding properties to an existing type via PATCH is supported since
 * API version 2025-11-08 but requires the full PropertyLink structure.
 */
export async function handleUpdateType(args: any) {
  const { space_id, type_id, name, properties, icon, layout, plural_name, description, ...rest } = args;

  // Build request body with only provided fields
  const requestBody: any = {};
  if (name !== undefined) requestBody.name = name;
  if (icon !== undefined) requestBody.icon = icon;
  if (layout !== undefined) requestBody.layout = layout;
  if (plural_name !== undefined) requestBody.plural_name = plural_name;
  if (description !== undefined) requestBody.description = description;

  // Handle properties: API requires PropertyLink objects {format, key, name}, not just IDs.
  // If caller passed an array of ID strings, resolve each to a PropertyLink via GET.
  if (properties && Array.isArray(properties) && properties.length > 0) {
    try {
      const propertyLinks = await Promise.all(
        properties.map(async (propIdOrObj: any) => {
          // If already a PropertyLink object with required fields, use as-is
          if (typeof propIdOrObj === 'object' && propIdOrObj.key && propIdOrObj.name && propIdOrObj.format) {
            return propIdOrObj;
          }
          // Otherwise treat as property ID and fetch full data
          const propId = typeof propIdOrObj === 'string' ? propIdOrObj : propIdOrObj.id;
          const propResponse = await makeRequest(`/v1/spaces/${space_id}/properties/${propId}`);
          const p = propResponse?.property;
          if (!p) {
            throw new Error(`Property "${propId}" not found in space "${space_id}"`);
          }
          // Return PropertyLink with all required fields
          return {
            key: p.key,
            name: p.name,
            format: p.format
          };
        })
      );
      requestBody.properties = propertyLinks;
    } catch (resolveError: any) {
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            error: 'Failed to resolve property IDs to PropertyLink objects',
            message: resolveError?.message || String(resolveError),
            hint: 'Provide valid property IDs that exist in this space. ' +
                  'Use list_properties to find available property IDs.',
            api_requirement: 'Anytype API UpdateTypeRequest.properties requires ' +
                             'PropertyLink objects with {format, key, name} fields.'
          }, null, 2)
        }]
      };
    }
  }

  const response = await makeRequest(`/v1/spaces/${space_id}/types/${type_id}`, {
    method: 'PATCH',
    body: JSON.stringify(requestBody),
  });

  return { content: [{ type: 'text', text: JSON.stringify(response, null, 2) }] };
}

/**
 * Delete a type
 */
export async function handleDeleteType(args: any) {
  const { space_id, type_id } = args;
  const response = await makeRequest(`/v1/spaces/${space_id}/types/${type_id}`, {
    method: 'DELETE',
  });
  return { content: [{ type: 'text', text: JSON.stringify(response, null, 2) }] };
}

// Tags
/**
 * Lists tags for a property.
 *
 * IMPORTANT: The Anytype API URL path requires a property ID (bafyrei... hash),
 * NOT the string key. This handler auto-resolves string keys to IDs:
 * - If property_key looks like a bafyrei... hash → used directly as property_id
 * - If property_key is a string key (e.g. "tag") → resolved via list_properties
 *
 * This resolution was necessary because the parameter naming in the MCP schema
 * ("property_key") was misleading — the API actually needs the property ID.
 * Discovered during testing: passing "tag" caused Tool execution failed.
 *
 * API endpoint: GET /v1/spaces/{space_id}/properties/{property_id}/tags
 *
 * @param args.space_id - Space containing the property
 * @param args.property_key - Property ID (bafyrei...) or string key to resolve
 * @param args.property_id - Alternative parameter name for property_key
 * @param args.limit - Results limit (default: 20)
 * @param args.offset - Pagination offset (default: 0)
 */
export async function handleListTags(args: any) {
  const { space_id, property_key, property_id, limit = 20, offset = 0 } = args;

  // Support both property_key (legacy) and property_id parameter names
  let rawIdentifier = property_id || property_key;

  if (!rawIdentifier) {
    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          error: 'Missing required parameter',
          message: 'Field "property_key" is required for listing tags. ' +
                   'Provide the property ID (bafyrei... format) or the property key string (e.g. "tag").',
          provided_parameters: Object.keys(args)
        }, null, 2)
      }]
    };
  }

  // If a string key was provided instead of a bafyrei... ID, resolve it
  let propertyId = rawIdentifier;
  if (!rawIdentifier.startsWith('bafyrei')) {
    try {
      const propsResponse = await makeRequest(`/v1/spaces/${space_id}/properties?limit=100`);
      const props = propsResponse?.data || [];
      const found = props.find((p: any) => p.key === rawIdentifier || p.name === rawIdentifier);
      if (!found) {
        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              error: `Property with key or name "${rawIdentifier}" not found`,
              message: 'Anytype API requires the property ID (bafyrei... format) in the URL path, ' +
                       'not the string key. Auto-resolution failed because no property matched.',
              hint: 'Use list_properties to find the correct property ID for your tag property.',
              api_note: 'Endpoint: GET /v1/spaces/{space_id}/properties/{property_id}/tags — ' +
                        'property_id is a bafyrei... hash, not a string key.'
            }, null, 2)
          }]
        };
      }
      propertyId = found.id;
    } catch (e: any) {
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            error: 'Failed to resolve property key to ID',
            message: e?.message || String(e),
            hint: 'Provide the property ID directly (bafyrei... format from list_properties).'
          }, null, 2)
        }]
      };
    }
  }

  const response = await makeRequest(
    `/v1/spaces/${space_id}/properties/${propertyId}/tags?limit=${limit}&offset=${offset}`
  );

  return { content: [{ type: 'text', text: JSON.stringify(response, null, 2) }] };
}

/**
 * Get a specific tag
 * Fixed based on official API documentation - tags are nested under properties
 */
export async function handleGetTag(args: any) {
  const { space_id, property_id, tag_id } = args;
  
  if (!property_id) {
    return { 
      content: [{ 
        type: 'text', 
        text: JSON.stringify({
          error: 'Missing required parameter',
          message: 'Field "property_id" is required for getting a tag',
          provided_parameters: Object.keys(args)
        }, null, 2) 
      }] 
    };
  }
  
  const response = await makeRequest(`/v1/spaces/${space_id}/properties/${property_id}/tags/${tag_id}`);
  return { content: [{ type: 'text', text: JSON.stringify(response, null, 2) }] };
}



/**
 * Create a new tag
 * Fixed based on official API documentation - using property_id and proper validation
 */
export async function handleCreateTag(args: any) {
  const { space_id, property_key, property_id, name, color = 'yellow', ...tagData } = args;
  
  // Use property_id if provided, otherwise fall back to property_key for backwards compatibility
  const propertyIdentifier = property_id || property_key;
  
  // Validate required fields based on official API docs
  if (!propertyIdentifier) {
    return { 
      content: [{ 
        type: 'text', 
        text: JSON.stringify({
          error: 'Missing required parameter',
          message: 'Field "property_id" is required for creating a tag',
          provided_parameters: Object.keys(args)
        }, null, 2) 
      }] 
    };
  }
  
  if (!name) {
    return { 
      content: [{ 
        type: 'text', 
        text: JSON.stringify({
          error: 'Missing required field',
          message: 'Field "name" is required for creating a tag',
          provided_fields: Object.keys(args)
        }, null, 2) 
      }] 
    };
  }
  
  // Validate color if provided
  const validColors = ['grey', 'yellow', 'orange', 'red', 'pink', 'purple', 'blue', 'ice', 'teal', 'lime'];
  if (color && !validColors.includes(color)) {
    return { 
      content: [{ 
        type: 'text', 
        text: JSON.stringify({
          error: 'Invalid color',
          message: `Color "${color}" is not valid. Valid colors are: ${validColors.join(', ')}`,
          provided_color: color,
          valid_colors: validColors
        }, null, 2) 
      }] 
    };
  }
  
  // According to official API docs, color and name are required
  const requestBody = {
    name,
    color,
    ...tagData
  };
  
  const response = await makeRequest(`/v1/spaces/${space_id}/properties/${propertyIdentifier}/tags`, {
    method: 'POST',
    body: JSON.stringify(requestBody),
  });
  return { content: [{ type: 'text', text: JSON.stringify(response, null, 2) }] };
}

/**
 * Update a tag
 * Fixed based on official API documentation - tags are nested under properties
 */
export async function handleUpdateTag(args: any) {
  const { space_id, property_id, tag_id, ...updateData } = args;
  
  if (!property_id) {
    return { 
      content: [{ 
        type: 'text', 
        text: JSON.stringify({
          error: 'Missing required parameter',
          message: 'Field "property_id" is required for updating a tag',
          provided_parameters: Object.keys(args)
        }, null, 2) 
      }] 
    };
  }
  
  const response = await makeRequest(`/v1/spaces/${space_id}/properties/${property_id}/tags/${tag_id}`, {
    method: 'PATCH',
    body: JSON.stringify(updateData),
  });
  return { content: [{ type: 'text', text: JSON.stringify(response, null, 2) }] };
}

/**
 * Delete a tag
 * Fixed based on official API documentation - tags are nested under properties
 */
export async function handleDeleteTag(args: any) {
  const { space_id, property_id, tag_id } = args;
  
  if (!property_id) {
    return { 
      content: [{ 
        type: 'text', 
        text: JSON.stringify({
          error: 'Missing required parameter',
          message: 'Field "property_id" is required for deleting a tag',
          provided_parameters: Object.keys(args)
        }, null, 2) 
      }] 
    };
  }
  
  const response = await makeRequest(`/v1/spaces/${space_id}/properties/${property_id}/tags/${tag_id}`, {
    method: 'DELETE',
  });
  return { content: [{ type: 'text', text: JSON.stringify(response, null, 2) }] };
}

// Templates
/**
 * List templates for a specific type in a space
 * Updated according to official Anytype API 2025-05-20 documentation
 * Requires type_id as templates are associated with types
 */
export async function handleListTemplates(args: any) {
  const { space_id, type_id, limit = 100, offset = 0 } = args;
  
  // type_id is required according to official API docs
  if (!type_id) {
    return { 
      content: [{ 
        type: 'text', 
        text: JSON.stringify({
          error: 'Missing required parameter',
          message: 'Field "type_id" is required for listing templates',
          provided_parameters: Object.keys(args),
          note: 'Templates are associated with specific types in Anytype API 2025-05-20'
        }, null, 2) 
      }] 
    };
  }
  
  // Build query parameters according to official API docs
  const queryParams = new URLSearchParams({ 
    limit: limit.toString(), 
    offset: offset.toString() 
  });
  
  // Use the correct endpoint according to official API documentation
  try {
    const response = await makeRequest(`/v1/spaces/${space_id}/types/${type_id}/templates?${queryParams}`);
    return { content: [{ type: 'text', text: JSON.stringify(response, null, 2) }] };
  } catch (error: any) {
    return { 
      content: [{ 
        type: 'text', 
        text: JSON.stringify({
          error: 'Templates endpoint error',
          message: 'Failed to list templates using official API endpoint',
          endpoint: `/v1/spaces/${space_id}/types/${type_id}/templates`,
          error_details: error?.message || String(error),
          suggestions: [
            'Verify that the type_id exists in this space',
            'Check if templates are available for this type',
            'Ensure API permissions for template access',
            'Verify both space_id and type_id are correct'
          ]
        }, null, 2) 
      }] 
    };
  }
}

/**
 * Get a specific template
 * Updated according to official Anytype API 2025-05-20 documentation
 * Requires both type_id and template_id as templates are associated with types
 */
export async function handleGetTemplate(args: any) {
  const { space_id, type_id, template_id } = args;
  
  // type_id is required according to official API docs
  if (!type_id) {
    return { 
      content: [{ 
        type: 'text', 
        text: JSON.stringify({
          error: 'Missing required parameter',
          message: 'Field "type_id" is required for getting a template',
          provided_parameters: Object.keys(args),
          note: 'Templates are associated with specific types in Anytype API 2025-05-20'
        }, null, 2) 
      }] 
    };
  }
  
  try {
    const response = await makeRequest(`/v1/spaces/${space_id}/types/${type_id}/templates/${template_id}`);
    return { content: [{ type: 'text', text: JSON.stringify(response, null, 2) }] };
  } catch (error: any) {
    return { 
      content: [{ 
        type: 'text', 
        text: JSON.stringify({
          error: 'Template retrieval error',
          message: 'Failed to get template using official API endpoint',
          endpoint: `/v1/spaces/${space_id}/types/${type_id}/templates/${template_id}`,
          error_details: error?.message || String(error),
          suggestions: [
            'Verify that the type_id exists in this space',
            'Verify that the template_id exists for this type',
            'Check API permissions for template access',
            'Ensure space_id, type_id, and template_id are all correct'
          ]
        }, null, 2) 
      }] 
    };
  }
}