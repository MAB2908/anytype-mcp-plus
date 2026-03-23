# Changelog

All notable changes to anytype-mcp-plus are documented here.

## [1.1.0] — 2026-03-23

### Summary
Release v1.1.0: 34 tools, all working. Public release on GitHub and npm.

### Added
- `anytype_global_search` — new tool for searching across ALL spaces (POST /v1/search)
- `sort` parameter in `anytype_search_objects` — sort by created_date, last_modified_date, last_opened_date, name (asc/desc)
- `tags` parameter in `anytype_create_property` — inline tag creation for select/multi_select properties in a single API call
- `type_key` parameter in `anytype_update_object` — change object type without losing content or properties (e.g. page → task)

### Fixed
- **`create_property` inline tags not shown in response** — tags were extracted via `...propertyData` spread instead of explicit destructuring, causing them to be lost before the auto-fetch block. Fixed by extracting `tags` explicitly. API also requires `color` as mandatory in `CreateTagRequest` — added default "grey" when not provided.
- **`update_property` without `name` — Tool execution failed** — Anytype API 2025-11-08 requires `name` in every PATCH for properties. Server now auto-fetches current name via GET when not provided by caller.
- **`update_type` with property IDs — Tool execution failed** — API requires `PropertyLink` objects `{format, key, name}`, not just IDs. Server now resolves each ID via GET before sending PATCH.
- **`list_tags` with string key — Tool execution failed** — API URL path requires property ID (bafyrei... hash), not string key. Server now auto-resolves string keys via list_properties.
- **`delete_object` returned `archived: false`** — API returns object snapshot taken BEFORE archiving. Server now adds `deleted: true` and `api_note` explaining the behavior.
- **`icon` in create_space/update_space** — API silently ignores icon for spaces. Removed from tool schemas, added explanatory note.
- **env var mismatch** — Config examples used `ANYTYPE_BASE_URL` but code read `ANYTYPE_API_URL`. Both names are now accepted for backward compatibility.

### Research findings documented
- **FilterExpression in search not implemented** — Official anyproto/anytype-mcp explicitly excludes `filters` from tool schemas with `// TODO: Add support for filters` (commit 542d477, Jan 7 2026). Anytype REST API accepts the field but silently ignores it.
- **Body patching via PATCH does not work** — Despite Anytype API 2025-11-08 changelog claiming "Markdown body patching: Update an object's markdown body via UpdateObjectRequest", testing confirms the `body` field is silently ignored in PATCH. Recreation strategy is the only working method.
- **`[operator]` syntax in list_objects filters** — URL query params with bracket syntax (`?done[eq]=false`) are not reliably supported. Only simple `?key=value` works.

### Known API Limitations (confirmed and documented)
- Recreation changes object ID and resets created_date
- Space icons not supported by API
- No delete_space endpoint in REST API
- No CRUD for templates via API (GET only)
- No CRUD for collection views via API (GET only)
- No block-level editing (whole body only as markdown)
- FilterExpression TODO in official Anytype implementation

---

## [1.0.2] — 2026-03-23

### Fixed
1. `update_property` without `name` — auto-fetches current name via GET
2. `update_type` with `properties` — resolves IDs to PropertyLink via GET
3. `list_tags` with string key — resolves key to ID via list_properties
4. `delete_object` returns `archived: false` — enriched with `deleted: true`
5. Removed false `icon` parameter from space tools

---

## [1.0.0] — 2026-03-22

### First independent release as anytype-mcp-plus

Fork of [cryptonahue/mcp-anytype](https://github.com/cryptonahue/mcp-anytype) with 6 patches applied:
1. stdout pollution fix — all logs redirected to stderr
2. multi_select normalization — handles both tag ID strings and tag objects
3. property_id in tag schemas — fixed required fields for tag operations
4. Working collection handlers — replaced stubs with real API calls
5. Removed template duplicates
6. Removed additionalProperties:false from schemas

API version: 2025-11-08
Tool count: 33
