import { makeRequest, buildNewObjectData, AnytypeApiError } from '../utils.js';

/**
 * Helper function to validate and process tag assignments
 * @param spaceId - Space ID
 * @param properties - Array of properties with potential tags
 * @returns Promise<any[]> - Validated properties array
 */
async function validateAndProcessTags(spaceId: string, properties: any[]): Promise<any[]> {
  if (!properties || !Array.isArray(properties)) {
    return [];
  }

  const processedProperties = [];

  for (const prop of properties) {
    const processedProp = { ...prop };

    // Handle multi_select properties (tags)
    if (prop.multi_select && Array.isArray(prop.multi_select)) {
      try {
        // Validate that all tag IDs exist
        // Note: We can't easily validate individual tags without knowing the property_id
        // This is a limitation of the current API structure
        console.error(`Processing multi_select property "${prop.key}" with ${prop.multi_select.length} tags`);
        processedProp.multi_select = prop.multi_select;
      } catch (error) {
        console.warn(`Warning: Could not validate tags for property "${prop.key}":`, error);
        // Keep the tags anyway, let the API handle validation
        processedProp.multi_select = prop.multi_select;
      }
    }

    // Handle single select properties
    if (prop.select) {
      try {
        console.error(`Processing select property "${prop.key}" with tag: ${prop.select}`);
        processedProp.select = prop.select;
      } catch (error) {
        console.warn(`Warning: Could not validate tag for property "${prop.key}":`, error);
        processedProp.select = prop.select;
      }
    }

    processedProperties.push(processedProp);
  }

  return processedProperties;
}

/**
 * Searches objects within a specific space.
 *
 * Supports text search (query), type filtering (types), and sorting (sort).
 *
 * FILTER LIMITATION: FilterExpression (property-based filtering) is NOT
 * currently implemented in Anytype API. The official anyproto/anytype-mcp
 * explicitly excludes `filters` from tool schemas with a TODO comment
 * (commit 542d477, Jan 7 2026, "Clarify filter support"):
 *   // TODO: Add support for filters
 *   if (name === "filters") continue;
 * Passing filters to the API has no effect — the field is silently ignored.
 * Source: github.com/anyproto/anytype-mcp/src/openapi/parser.ts
 *
 * SORT: Confirmed working. Uses SortOptions schema from OpenAPI 2025-11-08.
 * Valid property_key values: created_date, last_modified_date,
 * last_opened_date, name. Direction: asc | desc.
 *
 * API endpoint: POST /v1/spaces/{space_id}/search
 *
 * @param args.space_id - Space to search within
 * @param args.query - Text to search in object names and content
 * @param args.types - Array of type keys to filter by
 * @param args.sort - Sort options { property_key, direction }
 * @param args.limit - Results limit (default: 20)
 * @param args.offset - Pagination offset (default: 0)
 */
export async function handleSearchObjects(args: any) {
  const { space_id, query, types, limit = 20, offset = 0, sort } = args;

  let endpoint: string;

  if (space_id) {
    endpoint = `/v1/spaces/${space_id}/search?offset=${offset}&limit=${limit}`;
  } else {
    endpoint = `/v1/search?offset=${offset}&limit=${limit}`;
  }

  // Build request body — filters excluded per API limitations
  const requestBody: any = {
    query: query || '',
  };

  // Add types filter if provided
  if (types && Array.isArray(types) && types.length > 0) {
    requestBody.types = types;
  }

  // Add sort options if provided, otherwise use default
  if (sort && typeof sort === 'object') {
    const validSortKeys = ['created_date', 'last_modified_date', 'last_opened_date', 'name'];
    const sortKey = validSortKeys.includes(sort.property_key) ? sort.property_key : 'last_modified_date';
    const sortDir = sort.direction === 'asc' ? 'asc' : 'desc';
    requestBody.sort = { property_key: sortKey, direction: sortDir };
  } else {
    requestBody.sort = { property_key: 'last_modified_date', direction: 'desc' };
  }

  const response = await makeRequest(endpoint, {
    method: 'POST',
    body: JSON.stringify(requestBody),
  });

  return { content: [{ type: 'text', text: JSON.stringify(response, null, 2) }] };
}

/**
 * Searches objects across ALL spaces accessible to the authenticated user.
 *
 * Unlike search_objects which searches within one space, this endpoint
 * searches all spaces simultaneously and returns a unified result list.
 *
 * Uses the same SearchRequest schema as search_space:
 * - query: text search in object names and content
 * - types: filter by object type keys
 * - sort: SortOptions with property_key and direction
 * Filters are not yet supported (same limitation as search_objects).
 *
 * API endpoint: POST /v1/search (operationId: search_global)
 * Added in Anytype API 2025-11-08.
 *
 * @param args.query - Text to search
 * @param args.types - Array of type keys to filter by
 * @param args.sort - Sort options { property_key, direction }
 * @param args.limit - Results limit (default: 20)
 * @param args.offset - Pagination offset (default: 0)
 */
export async function handleGlobalSearch(args: any) {
  const { query, types, limit = 20, offset = 0, sort } = args;

  const endpoint = `/v1/search?offset=${offset}&limit=${limit}`;

  const requestBody: any = {
    query: query || '',
  };

  if (types && Array.isArray(types) && types.length > 0) {
    requestBody.types = types;
  }

  if (sort && typeof sort === 'object') {
    const validSortKeys = ['created_date', 'last_modified_date', 'last_opened_date', 'name'];
    const sortKey = validSortKeys.includes(sort.property_key) ? sort.property_key : 'last_modified_date';
    const sortDir = sort.direction === 'asc' ? 'asc' : 'desc';
    requestBody.sort = { property_key: sortKey, direction: sortDir };
  } else {
    requestBody.sort = { property_key: 'last_modified_date', direction: 'desc' };
  }

  const response = await makeRequest(endpoint, {
    method: 'POST',
    body: JSON.stringify(requestBody),
  });

  return { content: [{ type: 'text', text: JSON.stringify(response, null, 2) }] };
}

/**
 * List objects in a space
 * Based on official API documentation: GET /v1/spaces/{space_id}/objects
 *
 * FILTER NOTE: Anytype API documents dynamic filtering via query parameters
 * (?done=false, ?created_date[gte]=2024-01-01) but this feature is
 * experimental and unreliable. The [operator] bracket syntax causes errors
 * in the current API version. Only simple key=value filters are passed.
 *
 * For reliable filtering, use search_objects with the types parameter.
 */
export async function handleListObjects(args: any) {
  const { space_id, limit = 20, offset = 0, filters } = args;

  if (!space_id) {
    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          error: 'Missing required parameter',
          message: 'Field "space_id" is required for listing objects',
          provided_parameters: Object.keys(args)
        }, null, 2)
      }]
    };
  }

  let url = `/v1/spaces/${space_id}/objects?limit=${limit}&offset=${offset}`;

  // Apply simple key=value filters only (no operator syntax)
  // The [operator] bracket syntax (?done[eq]=false) is not reliably supported
  // by the current Anytype API and causes Tool execution failed errors.
  if (filters && typeof filters === 'object' && !Array.isArray(filters)) {
    for (const [key, value] of Object.entries(filters)) {
      if (value === null || value === undefined) continue;

      // Skip object-based filter conditions — bracket syntax not supported
      if (typeof value === 'object') {
        console.error(
          `Warning: filter "${key}" uses operator syntax which is not reliably ` +
          `supported by Anytype API. Only simple key=value filters are applied. ` +
          `Use search_objects for complex filtering.`
        );
        continue;
      }

      // Simple value without operator: ?done=false
      url += `&${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`;
    }
  }

  const response = await makeRequest(url);
  return { content: [{ type: 'text', text: JSON.stringify(response, null, 2) }] };
}

/**
 * Get a specific object
 */
export async function handleGetObject(args: any) {
  const { space_id, object_id } = args;
  const response = await makeRequest(`/v1/spaces/${space_id}/objects/${object_id}`);
  return { content: [{ type: 'text', text: JSON.stringify(response, null, 2) }] };
}

/**
 * Create a new object
 */
export async function handleCreateObject(args: any) {
  const { space_id, properties, ...objectData } = args;
  
  // Handle markdown alias
  if (objectData.markdown && !objectData.body) {
    objectData.body = objectData.markdown;
    delete objectData.markdown;
  }
  
  // Process and validate tags if properties are provided
  let processedProperties = [];
  if (properties && Array.isArray(properties)) {
    processedProperties = await validateAndProcessTags(space_id, properties);
    console.error(`Processed ${processedProperties.length} properties for new object`);
  }
  
  const finalObjectData = {
    ...objectData,
    ...(processedProperties.length > 0 && { properties: processedProperties })
  };
  
  const response = await makeRequest(`/v1/spaces/${space_id}/objects`, {
    method: 'POST',
    body: JSON.stringify(finalObjectData),
  });
  
  return { 
    content: [{ 
      type: 'text', 
      text: JSON.stringify({
        message: 'Object created successfully',
        object: response,
        processed_properties: processedProperties.length,
        tag_assignments: processedProperties.filter(p => p.multi_select || p.select).length
      }, null, 2) 
    }] 
  };
}

/**
 * Updates an existing object using one of two strategies:
 *
 * STRATEGY 1 — In-place PATCH (when no body/markdown provided):
 *   Updates name, properties, icon, type_key directly via PATCH.
 *   Object ID and created_date are preserved.
 *   Supports type_key change (e.g. page → task).
 *
 * STRATEGY 2 — Recreation (when body/markdown provided):
 *   Creates a new object with the updated content, then deletes the old one.
 *   WARNING: Object ID changes. created_date resets to current time.
 *   Tags and other properties are copied to the new object.
 *
 * WHY RECREATION? Anytype API v2025-11-08 declares body patching in
 * UpdateObjectRequest but the feature silently ignores the body field —
 * the object content is not updated. Verified by testing: API returns HTTP 200
 * but markdown content remains unchanged. Recreation is the only working
 * method for body updates.
 *
 * @param args.space_id - Space containing the object
 * @param args.object_id - ID of the object to update
 * @param args.body / args.markdown - New markdown content (triggers recreation)
 * @param args.name - New object name (in-place)
 * @param args.type_key - New type key, e.g. "task" (in-place only)
 * @param args.properties - Array of property key-value pairs (in-place)
 * @param args.icon - New icon (in-place)
 */
export async function handleUpdateObject(args: any) {
  const { space_id, object_id, body, markdown, properties, type_key, ...updateData } = args;
  
  // Handle markdown alias
  const contentField = markdown || body;
  
  // Process and validate tags if properties are provided
  let processedProperties = [];
  if (properties && Array.isArray(properties)) {
    processedProperties = await validateAndProcessTags(space_id, properties);
    console.error(`Processed ${processedProperties.length} properties for object update`);
  }
  
  // Prepare final update data
  const finalUpdateData: any = {
    ...updateData,
    ...(processedProperties.length > 0 && { properties: processedProperties })
  };
  if (type_key !== undefined) finalUpdateData.type_key = type_key;
  
  // If there's content to update, use replacement strategy
  if (contentField) {
    try {
      // Get current object
      const currentObject = await makeRequest(`/v1/spaces/${space_id}/objects/${object_id}`);
      
      // Build new object data with processed properties
      const newObjectData = buildNewObjectData(finalUpdateData, currentObject, contentField);
      
      // Create new object
      const newObjectResponse = await makeRequest(`/v1/spaces/${space_id}/objects`, {
        method: 'POST',
        body: JSON.stringify(newObjectData),
      });
      
      // Delete old object
      await makeRequest(`/v1/spaces/${space_id}/objects/${object_id}`, {
        method: 'DELETE',
      });
      
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            message: 'Object updated successfully using replacement strategy',
            old_object_id: object_id,
            new_object: newObjectResponse,
            strategy: 'replacement',
            processed_properties: processedProperties.length,
            tag_assignments: processedProperties.filter(p => p.multi_select || p.select).length
          }, null, 2)
        }]
      };
    } catch (replacementError) {
      console.error('Replacement strategy failed, trying traditional update:', replacementError);
      
      // Fallback to traditional PATCH method
      try {
        const patchData = {
          body: contentField,
          ...finalUpdateData
        };
        
        const response = await makeRequest(`/v1/spaces/${space_id}/objects/${object_id}`, {
          method: 'PATCH',
          body: JSON.stringify(patchData),
        });
        
        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              message: 'Object updated using traditional method (replacement failed)',
              object: response,
              strategy: 'traditional',
              processed_properties: processedProperties.length,
              tag_assignments: processedProperties.filter(p => p.multi_select || p.select).length,
              replacement_error: replacementError instanceof Error ? replacementError.message : 'Unknown error'
            }, null, 2)
          }]
        };
      } catch (traditionalError) {
        throw new AnytypeApiError(
          `Both replacement and traditional update methods failed. Replacement error: ${replacementError instanceof Error ? replacementError.message : 'Unknown'}. Traditional error: ${traditionalError instanceof Error ? traditionalError.message : 'Unknown'}`,
          500,
          { replacementError, traditionalError }
        );
      }
    }
  } else {
    // No content update, use traditional PATCH
    const response = await makeRequest(`/v1/spaces/${space_id}/objects/${object_id}`, {
      method: 'PATCH',
      body: JSON.stringify(finalUpdateData),
    });
    
    return { 
      content: [{ 
        type: 'text', 
        text: JSON.stringify({
          message: 'Object updated successfully',
          object: response,
          processed_properties: processedProperties.length,
          tag_assignments: processedProperties.filter(p => p.multi_select || p.select).length
        }, null, 2) 
      }] 
    };
  }
}

/**
 * Delete (archive) an object
 * Based on official API documentation: DELETE /v1/spaces/{space_id}/objects/{object_id}
 *
 * API NOTE: Anytype API archives objects rather than permanently deleting them.
 * The DELETE response returns the object snapshot taken BEFORE archiving,
 * so the "archived" field in the response always shows false even when archiving succeeded.
 * This is a known API behavior (not a bug in this server).
 * Fix: enrich the response with explicit deleted: true and a note.
 */
export async function handleDeleteObject(args: any) {
  const { space_id, object_id } = args;

  if (!space_id || !object_id) {
    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          error: 'Missing required parameters',
          message: 'Fields "space_id" and "object_id" are required for deleting an object',
          provided_parameters: Object.keys(args)
        }, null, 2)
      }]
    };
  }

  const response = await makeRequest(`/v1/spaces/${space_id}/objects/${object_id}`, {
    method: 'DELETE',
  });

  // API returns object snapshot BEFORE archiving — archived field is always false.
  // Enrich response to avoid confusion.
  return {
    content: [{
      type: 'text',
      text: JSON.stringify({
        ...response,
        deleted: true,
        api_note: 'Object has been archived successfully. ' +
                  'The "archived: false" field in the object data is a known Anytype API behavior — ' +
                  'the response contains a snapshot taken before archiving. ' +
                  'The object is now in the Anytype bin and no longer appears in listings.'
      }, null, 2)
    }]
  };
}

/**
 * Add object to collection (list)
 * Endpoint: POST /v1/spaces/{space_id}/lists/{list_id}/objects
 */
export async function handleAddToCollection(args: any) {
  const { space_id, collection_id, object_id } = args;

  await makeRequest(`/v1/spaces/${space_id}/lists/${collection_id}/objects`, {
    method: 'POST',
    body: JSON.stringify({ objects: [object_id] }),
  });

  return {
    content: [{
      type: 'text',
      text: JSON.stringify({
        message: 'Object added to collection successfully',
        collection_id,
        object_id
      }, null, 2)
    }]
  };
}

/**
 * Remove object from collection (list)
 * Endpoint: DELETE /v1/spaces/{space_id}/lists/{list_id}/objects/{object_id}
 */
export async function handleRemoveFromCollection(args: any) {
  const { space_id, collection_id, object_id } = args;

  await makeRequest(`/v1/spaces/${space_id}/lists/${collection_id}/objects/${object_id}`, {
    method: 'DELETE',
  });

  return {
    content: [{
      type: 'text',
      text: JSON.stringify({
        message: 'Object removed from collection successfully',
        collection_id,
        object_id
      }, null, 2)
    }]
  };
}

/**
 * Get list views
 */
export async function handleGetListViews(args: any) {
  const { space_id, list_id } = args;
  const response = await makeRequest(`/v1/spaces/${space_id}/lists/${list_id}/views`);
  return { content: [{ type: 'text', text: JSON.stringify(response, null, 2) }] };
}

/**
 * Get list objects
 */
export async function handleGetListObjects(args: any) {
  const { space_id, list_id, view_id, limit, offset } = args;
  let endpoint = `/v1/spaces/${space_id}/lists/${list_id}/views/${view_id}/objects`;
  const params = new URLSearchParams();
  if (limit) params.append('limit', limit.toString());
  if (offset) params.append('offset', offset.toString());
  if (params.toString()) endpoint += `?${params.toString()}`;
  
  const response = await makeRequest(endpoint);
  return { content: [{ type: 'text', text: JSON.stringify(response, null, 2) }] };
}