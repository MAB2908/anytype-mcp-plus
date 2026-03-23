import { makeRequest } from '../utils.js';

/**
 * List properties in a space
 * Based on official API documentation: GET /v1/spaces/{space_id}/properties
 */
export async function handleListProperties(args: any) {
  const { space_id, limit = 20, offset = 0 } = args;
  
  if (!space_id) {
    return { 
      content: [{ 
        type: 'text', 
        text: JSON.stringify({
          error: 'Missing required parameter',
          message: 'Field "space_id" is required for listing properties',
          provided_parameters: Object.keys(args)
        }, null, 2) 
      }] 
    };
  }
  
  const response = await makeRequest(`/v1/spaces/${space_id}/properties?limit=${limit}&offset=${offset}`);
  return { content: [{ type: 'text', text: JSON.stringify(response, null, 2) }] };
}

/**
 * Get a specific property
 * Based on official API documentation: GET /v1/spaces/{space_id}/properties/{property_id}
 */
export async function handleGetProperty(args: any) {
  const { space_id, property_id } = args;
  
  if (!space_id || !property_id) {
    return { 
      content: [{ 
        type: 'text', 
        text: JSON.stringify({
          error: 'Missing required parameters',
          message: 'Fields "space_id" and "property_id" are required for getting a property',
          provided_parameters: Object.keys(args)
        }, null, 2) 
      }] 
    };
  }
  
  const response = await makeRequest(`/v1/spaces/${space_id}/properties/${property_id}`);
  return { content: [{ type: 'text', text: JSON.stringify(response, null, 2) }] };
}

/**
 * Creates a new property in a space.
 *
 * Supports inline tag creation for select/multi_select properties via the
 * `tags` parameter. This uses the CreatePropertyRequest.tags field introduced
 * in Anytype API 2025-11-08.
 *
 * IMPORTANT: The API response for property creation does NOT include the
 * created tags. This handler auto-fetches tags via GET after creation and
 * includes them in the response as `created_tags`. This provides immediate
 * confirmation of successful tag creation.
 *
 * API NOTE: The Anytype API requires `format` field (not `type`).
 * This handler accepts both — `type` is treated as an alias for `format`
 * for backward compatibility.
 *
 * API NOTE: CreateTagRequest requires both `name` and `color` fields.
 * If color is not provided, defaults to "grey".
 *
 * @param args.space_id - Space to create the property in
 * @param args.name - Property name (required)
 * @param args.type - Property format alias (use "text", "number",
 *   "select", "multi_select", "date", "checkbox", "url", "email",
 *   "phone", "objects", "files")
 * @param args.format - Property format (same values as type)
 * @param args.tags - Initial tags for select/multi_select properties.
 *   Each tag: { name: string, color?: string }
 *   Colors: grey, yellow, orange, red, pink, purple, blue, ice, teal, lime
 */
export async function handleCreateProperty(args: any) {
  // Extract tags separately BEFORE spreading into propertyData
  // This is critical — tags must not be spread into requestBody via ...propertyData
  const {
    space_id,
    name,
    type,
    format,
    description,
    source_object,
    read_only_value = false,
    key,
    tags,           // ← extracted explicitly, NOT included in ...propertyData
    ...propertyData
  } = args;

  if (!space_id) {
    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          error: 'Missing required parameter',
          message: 'Field "space_id" is required for creating a property',
          provided_parameters: Object.keys(args)
        }, null, 2)
      }]
    };
  }

  if (!name || (!type && !format)) {
    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          error: 'Missing required fields',
          message: 'Fields "name" and "type" (or "format") are required for creating a property',
          required_fields: ['name', 'type'],
          provided_fields: Object.keys(args)
        }, null, 2)
      }]
    };
  }

  // API requires "format" field. "type" is a convenience alias.
  const resolvedFormat = format || type;

  const requestBody: any = {
    name,
    format: resolvedFormat,
    description,
    source_object,
    read_only_value,
    key,
    ...propertyData
  };

  // Include inline tags if provided and format supports them
  // API spec: CreateTagRequest requires { name: string, color: string }
  if (tags && Array.isArray(tags) && tags.length > 0) {
    const tagFormat = resolvedFormat;
    if (tagFormat === 'select' || tagFormat === 'multi_select') {
      // Ensure each tag has required color field (API requires it)
      requestBody.tags = tags.map((t: any) => ({
        name: t.name,
        color: t.color || 'grey',  // default color if not provided
        ...(t.key ? { key: t.key } : {})
      }));
    } else {
      console.error(
        `Warning: tags are only supported for select/multi_select properties, ` +
        `got format: "${tagFormat}". Tags will be ignored.`
      );
    }
  }

  const response = await makeRequest(`/v1/spaces/${space_id}/properties`, {
    method: 'POST',
    body: JSON.stringify(requestBody),
  });

  // API creates tags successfully but does NOT include them in the response.
  // Auto-fetch tags to confirm creation and provide complete information.
  // Use both possible response shapes: { property: { id } } or { id } directly
  const propertyId = response?.property?.id || response?.id;

  if (tags && Array.isArray(tags) && tags.length > 0 && propertyId) {
    try {
      const tagsResponse = await makeRequest(
        `/v1/spaces/${space_id}/properties/${propertyId}/tags?limit=100`
      );
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            ...response,
            created_tags: tagsResponse?.data || [],
            tags_note: `${tagsResponse?.data?.length || 0} tag(s) created inline with the property.`
          }, null, 2)
        }]
      };
    } catch (e) {
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            ...response,
            tags_note: 'Inline tags were submitted. Use list_tags to verify creation.'
          }, null, 2)
        }]
      };
    }
  }

  return { content: [{ type: 'text', text: JSON.stringify(response, null, 2) }] };
}

/**
 * Update a property
 * Based on official API documentation: PATCH /v1/spaces/{space_id}/properties/{property_id}
 *
 * API LIMITATION: Anytype API 2025-11-08 requires "name" field in every PATCH request
 * even when only updating other fields (description, format, etc.).
 * This is documented in UpdatePropertyRequest schema: required: [name].
 * Fix: if name is not provided, we auto-fetch the current name via GET before PATCH.
 */
export async function handleUpdateProperty(args: any) {
  const { space_id, property_id, name, description, format, source_object, read_only_value, ...updateData } = args;

  if (!space_id || !property_id) {
    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          error: 'Missing required parameters',
          message: 'Fields "space_id" and "property_id" are required for updating a property',
          provided_parameters: Object.keys(args)
        }, null, 2)
      }]
    };
  }

  // API LIMITATION: Anytype API requires "name" in every PATCH request.
  // If name is not provided, fetch current name first to include it automatically.
  let resolvedName = name;
  if (!resolvedName) {
    try {
      const current = await makeRequest(`/v1/spaces/${space_id}/properties/${property_id}`);
      resolvedName = current?.property?.name;
    } catch (e) {
      // If GET fails, continue without name — API will return a validation error
    }
    if (!resolvedName) {
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            error: 'Cannot update property without name',
            message: 'Anytype API requires "name" in every PATCH request for properties. ' +
                     'Attempted to auto-fetch current name but failed. ' +
                     'Please provide "name" explicitly.',
            api_limitation: 'UpdatePropertyRequest schema has required: [name] in Anytype API 2025-11-08'
          }, null, 2)
        }]
      };
    }
  }

  // Build update payload — always include name (API requirement)
  const requestBody: any = { name: resolvedName };
  if (description !== undefined) requestBody.description = description;
  if (format !== undefined) requestBody.format = format;
  if (source_object !== undefined) requestBody.source_object = source_object;
  if (read_only_value !== undefined) requestBody.read_only_value = read_only_value;
  Object.assign(requestBody, updateData);

  const response = await makeRequest(`/v1/spaces/${space_id}/properties/${property_id}`, {
    method: 'PATCH',
    body: JSON.stringify(requestBody),
  });

  return { content: [{ type: 'text', text: JSON.stringify(response, null, 2) }] };
}

/**
 * Delete a property
 * Based on official API documentation: DELETE /v1/spaces/{space_id}/properties/{property_id}
 */
export async function handleDeleteProperty(args: any) {
  const { space_id, property_id } = args;
  
  if (!space_id || !property_id) {
    return { 
      content: [{ 
        type: 'text', 
        text: JSON.stringify({
          error: 'Missing required parameters',
          message: 'Fields "space_id" and "property_id" are required for deleting a property',
          provided_parameters: Object.keys(args)
        }, null, 2) 
      }] 
    };
  }
  
  const response = await makeRequest(`/v1/spaces/${space_id}/properties/${property_id}`, {
    method: 'DELETE',
  });
  return { content: [{ type: 'text', text: JSON.stringify(response, null, 2) }] };
}