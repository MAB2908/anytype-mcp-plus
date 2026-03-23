# API Reference

Complete reference for all 33 tools provided by anytype-mcp-plus.

All tools require `space_id` unless noted otherwise. Get your space IDs by calling `anytype_list_spaces` first.

---

## Spaces

### anytype_list_spaces

Lists all spaces available to the authenticated user.

**Parameters:** none

**Returns:** array of space objects with `id`, `name`, `gateway_url` and member count.

> Note: the response includes a `gateway_url` field (e.g. `http://127.0.0.1:47800`). This is the Anytype media server for images and attachments — it is not the REST API. Do not use this value as `ANYTYPE_BASE_URL`.

---

### anytype_get_space

Gets a single space by ID.

**Parameters:**

| Name | Type | Required | Description |
|---|---|---|---|
| `space_id` | string | Yes | Space ID |

---

### anytype_create_space

Creates a new space.

**Parameters:**

| Name | Type | Required | Description |
|---|---|---|---|
| `name` | string | Yes | Space name |

---

### anytype_update_space

Updates a space.

**Parameters:**

| Name | Type | Required | Description |
|---|---|---|---|
| `space_id` | string | Yes | Space ID |
| `name` | string | No | New space name |

---

### anytype_list_members

Lists all members of a space.

**Parameters:**

| Name | Type | Required | Description |
|---|---|---|---|
| `space_id` | string | Yes | Space ID |

---

### anytype_get_member

Gets a single member by ID.

**Parameters:**

| Name | Type | Required | Description |
|---|---|---|---|
| `space_id` | string | Yes | Space ID |
| `member_id` | string | Yes | Member ID |

---

## Objects

### anytype_search_objects

Searches objects in a space by text query.

**Parameters:**

| Name | Type | Required | Description |
|---|---|---|---|
| `space_id` | string | Yes | Space ID |
| `query` | string | Yes | Search query |
| `limit` | number | No | Max results (default: 20) |
| `offset` | number | No | Pagination offset (default: 0) |

---

### anytype_list_objects

Lists all objects in a space.

**Parameters:**

| Name | Type | Required | Description |
|---|---|---|---|
| `space_id` | string | Yes | Space ID |
| `limit` | number | No | Max results (default: 20) |
| `offset` | number | No | Pagination offset (default: 0) |

---

### anytype_get_object

Gets a single object by ID, including all properties and markdown body.

**Parameters:**

| Name | Type | Required | Description |
|---|---|---|---|
| `space_id` | string | Yes | Space ID |
| `object_id` | string | Yes | Object ID |

---

### anytype_create_object

Creates a new object in a space.

**Parameters:**

| Name | Type | Required | Description |
|---|---|---|---|
| `space_id` | string | Yes | Space ID |
| `name` | string | Yes | Object name |
| `type_key` | string | No | Object type key (default: `page`). Examples: `page`, `task`, `bookmark`, `collection` |
| `body` | string | No | Body content in Markdown |
| `markdown` | string | No | Alias for `body` |
| `icon` | object | No | Object icon: `{emoji: "📝", format: "emoji"}` |
| `template_id` | string | No | Template ID to use |
| `properties` | array | No | Properties to set (see [Property format](#property-format)) |

**Returns:** `{message, object, processed_properties, tag_assignments}`

---

### anytype_update_object

Updates an existing object. Supports two strategies depending on parameters:

**In-place update** (when only `name` or `properties` are provided): updates the object directly. The object ID does not change.

**Recreation** (when `body` or `markdown` is provided): the server reads all properties of the original, creates a new object with the updated body, copies all properties, then deletes the original. **The object ID changes.** The new ID is returned in `new_object.object.id`.

> Do not use `body` updates on system objects or registry documents. The original ID becomes permanently invalid after recreation.

**Parameters:**

| Name | Type | Required | Description |
|---|---|---|---|
| `space_id` | string | Yes | Space ID |
| `object_id` | string | Yes | Object ID to update |
| `name` | string | No | New name (in-place) |
| `body` | string | No | New body in Markdown (triggers recreation) |
| `markdown` | string | No | Alias for `body` |
| `icon` | object | No | New icon |
| `properties` | array | No | Properties to update (see [Property format](#property-format)) |

---

### anytype_delete_object

Deletes (archives) an object. Anytype archives objects rather than permanently deleting them.

**Parameters:**

| Name | Type | Required | Description |
|---|---|---|---|
| `space_id` | string | Yes | Space ID |
| `object_id` | string | Yes | Object ID |

---

## Properties

### anytype_list_properties

Lists all properties defined in a space.

**Parameters:**

| Name | Type | Required | Description |
|---|---|---|---|
| `space_id` | string | Yes | Space ID |
| `limit` | number | No | Max results (default: 20) |
| `offset` | number | No | Pagination offset |

---

### anytype_get_property

Gets a single property by ID.

**Parameters:**

| Name | Type | Required | Description |
|---|---|---|---|
| `space_id` | string | Yes | Space ID |
| `property_id` | string | Yes | Property ID |

---

### anytype_create_property

Creates a new property in a space.

**Parameters:**

| Name | Type | Required | Description |
|---|---|---|---|
| `space_id` | string | Yes | Space ID |
| `name` | string | Yes | Property name |
| `format` | string | Yes | Property format: `text`, `number`, `checkbox`, `date`, `url`, `email`, `phone`, `select`, `multi_select`, `objects`, `files` |

> Note: property creation uses an experimental API endpoint. Test before relying on it in production.

---

### anytype_update_property

Updates an existing property.

**Parameters:**

| Name | Type | Required | Description |
|---|---|---|---|
| `space_id` | string | Yes | Space ID |
| `property_id` | string | Yes | Property ID |
| `name` | string | Yes | Property name — must always be provided even if unchanged |

> Note: the Anytype API requires `name` on every update request, even if you are not changing it.

---

### anytype_delete_property

Deletes a property.

**Parameters:**

| Name | Type | Required | Description |
|---|---|---|---|
| `space_id` | string | Yes | Space ID |
| `property_id` | string | Yes | Property ID |

---

## Types

### anytype_list_types

Lists all object types in a space.

**Parameters:**

| Name | Type | Required | Description |
|---|---|---|---|
| `space_id` | string | Yes | Space ID |

---

### anytype_get_type

Gets a single type by ID, including its properties.

**Parameters:**

| Name | Type | Required | Description |
|---|---|---|---|
| `space_id` | string | Yes | Space ID |
| `type_id` | string | Yes | Type ID |

---

### anytype_create_type

Creates a new object type.

**Parameters:**

| Name | Type | Required | Description |
|---|---|---|---|
| `space_id` | string | Yes | Space ID |
| `name` | string | Yes | Type name |
| `plural_name` | string | No | Plural form of the name |
| `layout` | string | No | Layout: `basic`, `todo`, `profile`, `bookmark` (default: `basic`) |

The `key` is auto-generated as a slug from `name` (e.g. `"My Type"` → `"my_type"`).

---

### anytype_update_type

Updates an existing type.

**Parameters:**

| Name | Type | Required | Description |
|---|---|---|---|
| `space_id` | string | Yes | Space ID |
| `type_id` | string | Yes | Type ID |
| `name` | string | No | New name |
| `plural_name` | string | No | New plural name |

---

### anytype_delete_type

Deletes a type.

**Parameters:**

| Name | Type | Required | Description |
|---|---|---|---|
| `space_id` | string | Yes | Space ID |
| `type_id` | string | Yes | Type ID |

---

## Tags

Tag tools operate on a specific property, not on the space directly. You need the `property_id` of the `multi_select` property you want to manage. Get it from `anytype_list_properties`.

> Note: `anytype_list_tags` requires `property_key` (the string key like `bafyrei...`), not `property_id`. Use `anytype_list_properties` to find the correct key.

---

### anytype_list_tags

Lists all tags for a property.

**Parameters:**

| Name | Type | Required | Description |
|---|---|---|---|
| `space_id` | string | Yes | Space ID |
| `property_key` | string | Yes | Property key (e.g. `bafyreifuv...`) |

---

### anytype_get_tag

Gets a single tag by ID.

**Parameters:**

| Name | Type | Required | Description |
|---|---|---|---|
| `space_id` | string | Yes | Space ID |
| `property_id` | string | Yes | Property ID |
| `tag_id` | string | Yes | Tag ID |

---

### anytype_create_tag

Creates a new tag for a property.

**Parameters:**

| Name | Type | Required | Description |
|---|---|---|---|
| `space_id` | string | Yes | Space ID |
| `property_id` | string | Yes | Property ID |
| `name` | string | Yes | Tag name |
| `color` | string | No | Tag color |

---

### anytype_update_tag

Updates a tag.

**Parameters:**

| Name | Type | Required | Description |
|---|---|---|---|
| `space_id` | string | Yes | Space ID |
| `property_id` | string | Yes | Property ID |
| `tag_id` | string | Yes | Tag ID |
| `name` | string | No | New tag name |
| `color` | string | No | New tag color |

---

### anytype_delete_tag

Deletes a tag.

**Parameters:**

| Name | Type | Required | Description |
|---|---|---|---|
| `space_id` | string | Yes | Space ID |
| `property_id` | string | Yes | Property ID |
| `tag_id` | string | Yes | Tag ID |

---

## Templates

### anytype_list_templates

Lists all templates for a given type.

**Parameters:**

| Name | Type | Required | Description |
|---|---|---|---|
| `space_id` | string | Yes | Space ID |
| `type_id` | string | Yes | Type ID |

---

### anytype_get_template

Gets a single template by ID.

**Parameters:**

| Name | Type | Required | Description |
|---|---|---|---|
| `space_id` | string | Yes | Space ID |
| `type_id` | string | Yes | Type ID |
| `template_id` | string | Yes | Template ID |

---

## Collections

Collections in Anytype are objects of type `collection`. These tools work only with `collection` type objects, not with `set`.

---

### anytype_add_to_collection

Adds an object to a collection.

**Parameters:**

| Name | Type | Required | Description |
|---|---|---|---|
| `space_id` | string | Yes | Space ID |
| `collection_id` | string | Yes | Collection object ID |
| `object_id` | string | Yes | ID of the object to add |

**Endpoint:** `POST /v1/spaces/{space_id}/lists/{collection_id}/objects`

---

### anytype_remove_from_collection

Removes an object from a collection.

**Parameters:**

| Name | Type | Required | Description |
|---|---|---|---|
| `space_id` | string | Yes | Space ID |
| `collection_id` | string | Yes | Collection object ID |
| `object_id` | string | Yes | ID of the object to remove |

**Endpoint:** `DELETE /v1/spaces/{space_id}/lists/{collection_id}/objects/{object_id}`

---

### anytype_get_list_views

Gets all views defined for a list or collection.

**Parameters:**

| Name | Type | Required | Description |
|---|---|---|---|
| `space_id` | string | Yes | Space ID |
| `list_id` | string | Yes | List or collection ID |

Call this before `anytype_get_list_objects` — you need a `view_id` from the response.

---

### anytype_get_list_objects

Gets objects from a specific view of a list or collection.

**Parameters:**

| Name | Type | Required | Description |
|---|---|---|---|
| `space_id` | string | Yes | Space ID |
| `list_id` | string | Yes | List or collection ID |
| `view_id` | string | Yes | View ID (from `anytype_get_list_views`) |
| `limit` | number | No | Max results |
| `offset` | number | No | Pagination offset |

---

## Property format

The `properties` parameter in `anytype_create_object` and `anytype_update_object` accepts an array of property objects. Each object must include `key` and one value field matching the property format.

```json
[
  { "key": "description", "text": "Some text value" },
  { "key": "priority", "number": 1 },
  { "key": "done", "checkbox": true },
  { "key": "due_date", "date": "2026-04-01T00:00:00Z" },
  { "key": "website", "url": "https://example.com" },
  { "key": "contact", "email": "user@example.com" },
  { "key": "phone", "phone": "+1234567890" },
  { "key": "status", "select": "tag-id-string" },
  { "key": "tag", "multi_select": ["tag-id-1", "tag-id-2"] },
  { "key": "related", "objects": ["object-id-1", "object-id-2"] }
]
```

For `multi_select`, pass an array of tag ID strings (e.g. `bafyrei...`), not tag name strings and not tag objects. Use `anytype_list_tags` to get the IDs.

---

## Known limitations

These are limitations of the Anytype REST API, not of this MCP server:

- `anytype_list_tags` requires `property_key`, not `property_id` — the two are different values for the same property
- `anytype_update_property` always requires `name` even if you are only updating other fields
- `anytype_get_list_objects` requires `view_id` — always call `anytype_get_list_views` first
- `anytype_add_to_collection` and `anytype_remove_from_collection` work only with `collection` type objects, not `set`
- There is no direct way to set `backlinks` — add the object to a collection instead
- `anytype_update_object` with `body` returns a new ID — the original ID becomes invalid. Do not store the original ID after a body update.
- There is no `export_object` tool — this is planned for a future release
- Structured filtering with AND/OR conditions is not yet implemented — use `anytype_search_objects` for text search
