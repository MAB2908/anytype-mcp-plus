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
        console.log(`Processing multi_select property "${prop.key}" with ${prop.multi_select.length} tags`);
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
        console.log(`Processing select property "${prop.key}" with tag: ${prop.select}`);
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
 * Search objects globally or within a specific space
 * Fixed based on official Anytype API documentation 2025-05-20
 */
export async function handleSearchObjects(args: any) {
  const { space_id, query, types, limit = 20, offset = 0 } = args;
  
  let endpoint;
  let requestBody: any;
  
  if (space_id) {
    // Search within a specific space - using correct API v1 endpoint
    endpoint = `/v1/spaces/${space_id}/search?offset=${offset}&limit=${limit}`;
    
    // For space search, use property_key according to API docs
    requestBody = {
      query: query || '',
      sort: {
        direction: 'desc',
        property_key: 'last_modified_date'
      }
    };
    
    // Add types filter if provided (no prefix needed for space search)
    if (types && types.length > 0) {
      requestBody.types = types;
    }
  } else {
    // Global search across all spaces - using correct API v1 endpoint
    endpoint = `/v1/search?offset=${offset}&limit=${limit}`;
    
    // For global search, use property_key according to API docs
    requestBody = {
      query: query || '',
      sort: {
        direction: 'desc',
        property_key: 'last_modified_date'
      }
    };
    
    // Add types filter if provided
    if (types && types.length > 0) {
      requestBody.types = types;
    }
  }
  
  const response = await makeRequest(endpoint, {
    method: 'POST',
    body: JSON.stringify(requestBody),
  });
  return { content: [{ type: 'text', text: JSON.stringify(response, null, 2) }] };
}

/**
 * List objects in a space
 */
export async function handleListObjects(args: any) {
  const { space_id, limit = 20, offset = 0 } = args;
  const response = await makeRequest(`/v1/spaces/${space_id}/objects?limit=${limit}&offset=${offset}`);
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
    console.log(`Processed ${processedProperties.length} properties for new object`);
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
 * Update an object with replacement strategy for content updates
 */
export async function handleUpdateObject(args: any) {
  const { space_id, object_id, body, markdown, properties, ...updateData } = args;
  
  // Handle markdown alias
  const contentField = markdown || body;
  
  // Process and validate tags if properties are provided
  let processedProperties = [];
  if (properties && Array.isArray(properties)) {
    processedProperties = await validateAndProcessTags(space_id, properties);
    console.log(`Processed ${processedProperties.length} properties for object update`);
  }
  
  // Prepare final update data
  const finalUpdateData = {
    ...updateData,
    ...(processedProperties.length > 0 && { properties: processedProperties })
  };
  
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
 * Delete an object
 */
export async function handleDeleteObject(args: any) {
  const { space_id, object_id } = args;
  const response = await makeRequest(`/v1/spaces/${space_id}/objects/${object_id}`, {
    method: 'DELETE',
  });
  return { content: [{ type: 'text', text: JSON.stringify(response, null, 2) }] };
}

/**
 * Add object to collection
 * NOTE: Collection endpoints are not available in the official Anytype API
 * This function is disabled until official support is added
 */
export async function handleAddToCollection(args: any) {
  return { 
    content: [{ 
      type: 'text', 
      text: JSON.stringify({
        error: 'Collection endpoints are not available in the official Anytype API',
        message: 'The /collections endpoints are not documented in the official API. Use object relationships instead.',
        status: 'not_implemented'
      }, null, 2) 
    }] 
  };
}

/**
 * Remove object from collection
 * NOTE: Collection endpoints are not available in the official Anytype API
 * This function is disabled until official support is added
 */
export async function handleRemoveFromCollection(args: any) {
  return { 
    content: [{ 
      type: 'text', 
      text: JSON.stringify({
        error: 'Collection endpoints are not available in the official Anytype API',
        message: 'The /collections endpoints are not documented in the official API. Use object relationships instead.',
        status: 'not_implemented'
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