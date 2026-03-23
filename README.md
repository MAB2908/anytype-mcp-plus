# anytype-mcp-plus

An enhanced MCP (Model Context Protocol) server for [Anytype](https://anytype.io) — the local-first knowledge management app. Provides **34 tools** for full CRUD operations on spaces, objects, types, properties, tags, templates, and collections via the [Anytype REST API](https://developers.anytype.io).

[![npm version](https://img.shields.io/npm/v/anytype-mcp-plus)](https://www.npmjs.com/package/anytype-mcp-plus)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18-green)](https://nodejs.org)

---

## What is this?

This server lets AI assistants (Claude, etc.) interact with your Anytype workspace via natural language:

> "Find all my tasks tagged 'anytype' sorted by creation date"
> "Create a new page with this content and tag it as a project"
> "Add a property 'Priority' to the type 'Task' with tags High, Normal, Low"

It extends the official [anyproto/anytype-mcp](https://github.com/anyproto/anytype-mcp) and builds on [cryptonahue/mcp-anytype](https://github.com/cryptonahue/mcp-anytype) with:
- **5 MCP-level bug fixes** (update_property, update_type, list_tags, delete_object, create_property)
- **4 new capabilities** (type_key change, inline tags, sort in search, global search)
- **Accurate API limitation documentation** — every known limitation is documented with the source

---

## Requirements

- [Node.js](https://nodejs.org) >= 18
- [Anytype](https://anytype.io/downloads) desktop app running locally
- An Anytype API key (Settings → API → Create API Key)
- [Claude Desktop](https://claude.ai/download) or any MCP-compatible client

---

## Installation

### Via npm (recommended)

```bash
npm install -g anytype-mcp-plus
```

### From source

```bash
git clone https://github.com/MAB2908/anytype-mcp-plus.git
cd anytype-mcp-plus
npm install
npm run build
```

---

## Configuration

### Claude Desktop

Add to your `claude_desktop_config.json`:

**Windows (Microsoft Store):**
`%LOCALAPPDATA%\Packages\Claude_pzs8sxrjxfjjc\LocalCache\Roaming\Claude\claude_desktop_config.json`

**Windows (standard):**
`%APPDATA%\Claude\claude_desktop_config.json`

**macOS:**
`~/Library/Application Support/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "anytype": {
      "command": "npx",
      "args": ["anytype-mcp-plus"],
      "env": {
        "ANYTYPE_API_KEY": "your-api-key-here"
      }
    }
  }
}
```

If installed from source, replace `"npx"` + `"anytype-mcp-plus"` with:
```json
"command": "node",
"args": ["C:\\path\\to\\anytype-mcp-plus\\dist\\index.js"]
```

### Getting an API Key

1. Open Anytype desktop app
2. Go to **Settings → API**
3. Click **Create API Key**
4. Copy the key into your config

### Environment Variables

| Variable | Required | Default | Description |
|---|---|---|---|
| `ANYTYPE_API_KEY` | Yes | — | Bearer token for API authentication |
| `ANYTYPE_BASE_URL` | No | `http://localhost:31009` | Anytype API base URL |
| `ANYTYPE_API_URL` | No | `http://localhost:31009` | Legacy alias for ANYTYPE_BASE_URL |

---

## Tools (34 total)

### Spaces (6)
| Tool | Description |
|---|---|
| `anytype_list_spaces` | List all accessible spaces |
| `anytype_get_space` | Get space details by ID |
| `anytype_create_space` | Create a new space |
| `anytype_update_space` | Update space name or description |
| `anytype_list_members` | List space members |
| `anytype_get_member` | Get member details |

### Objects (8)
| Tool | Description |
|---|---|
| `anytype_list_objects` | List objects in a space |
| `anytype_get_object` | Get full object content and properties |
| `anytype_create_object` | Create a new object with body, icon, properties |
| `anytype_update_object` | Update name, properties, type_key (in-place) or body (recreation) |
| `anytype_delete_object` | Archive an object |
| `anytype_search_objects` | Search within a space with type filter and sort |
| `anytype_global_search` | Search across ALL spaces |

### Properties (5)
| Tool | Description |
|---|---|
| `anytype_list_properties` | List all properties in a space |
| `anytype_get_property` | Get property details |
| `anytype_create_property` | Create a property with optional inline tags |
| `anytype_update_property` | Update property name or description |
| `anytype_delete_property` | Delete (archive) a property |

### Types (5)
| Tool | Description |
|---|---|
| `anytype_list_types` | List all object types |
| `anytype_get_type` | Get type details and linked properties |
| `anytype_create_type` | Create a custom type |
| `anytype_update_type` | Update type name or add properties |
| `anytype_delete_type` | Delete (archive) a type |

### Tags (5)
| Tool | Description |
|---|---|
| `anytype_list_tags` | List tags for a property (accepts string key or bafyrei ID) |
| `anytype_get_tag` | Get tag details |
| `anytype_create_tag` | Create a tag |
| `anytype_update_tag` | Update tag name or color |
| `anytype_delete_tag` | Delete a tag |

### Templates (2)
| Tool | Description |
|---|---|
| `anytype_list_templates` | List templates for a type |
| `anytype_get_template` | Get template content as markdown |

### Collections (4)
| Tool | Description |
|---|---|
| `anytype_add_to_collection` | Add an object to a collection |
| `anytype_remove_from_collection` | Remove an object from a collection |
| `anytype_get_list_views` | Get available views for a collection/set |
| `anytype_get_list_objects` | Get objects in a collection view |

---

## Key Features

### Inline tag creation
Create a `multi_select` property and its tags in a single call:
```
Create a Priority property with tags: High (red), Normal (yellow), Low (grey)
```

### Object type change
Change an object's type without losing content or properties:
```
Convert this page to a task
```

### Sorted search
Search with sorting by any date field or name:
```
Find my 10 most recently modified pages about "anytype"
```

### Global search
Search across all spaces at once:
```
Find everything related to "project planning" across all my spaces
```

---

## Known API Limitations

These behaviors are limitations of the Anytype REST API and cannot be fixed in this MCP server:

| Limitation | Details |
|---|---|
| Body update changes object ID | Updating body requires recreation (create new + delete old). Object gets a new ID and creation date resets. |
| Space icons not supported | API silently ignores icon fields for spaces. Icons work for types but not spaces. |
| No delete_space via REST | Spaces can only be deleted in the Anytype app (requires typing space name). The REST API has no DELETE for spaces. |
| No template CRUD | Only GET for templates. Creating/updating/deleting templates is not available via API. |
| No collection view management | Only GET for views. Creating/updating/deleting views is not available via API. |
| No block-level editing | API operates on entire object bodies as markdown. Individual block operations are not available. |
| Property filters not yet supported | FilterExpression in search is marked as TODO in official anyproto/anytype-mcp (commit 542d477, Jan 2026). Use `types` for type filtering, `query` for text search. |
| list_objects filters experimental | Dynamic query param filtering (?key=value) is documented but unreliable. Only simple key=value without operators is safe. |
| update_property requires name | API requires `name` in every PATCH for properties. This server auto-fetches current name if not provided. |

---

## Comparison with Other Implementations

| Feature | anytype-mcp-plus | anyproto/anytype-mcp | cryptonahue/mcp-anytype |
|---|---|---|---|
| Tool count | **34** | ~30 | 33 |
| Global search | Yes | Yes | No |
| Inline tag creation | Yes | No | No |
| Sort in search | Yes | Yes | Yes |
| type_key change | Yes | No | No |
| created_tags in response | Yes | No | No |
| update_property auto-name | Yes | No | No |
| update_type with property IDs | Yes | No | No |
| list_tags with string key | Yes | No | No |
| delete_object feedback | Yes (clear) | Misleading | Misleading |
| API version | 2025-11-08 | 2025-11-08 | 2025-05-20 |

---

## Troubleshooting

### "Tool execution failed" or "Not authenticated"
- Check that Anytype desktop app is running
- Verify your API key is correct
- Default API port is 31009 — ensure nothing else is using it

### "Space not found"
- Use `anytype_list_spaces` to get the correct space ID
- Space IDs are long `bafyrei...` hashes

### Body updates change the object ID
This is a known Anytype API limitation. When you update an object's body:
- The old object is archived
- A new object is created with the updated content
- All properties (tags, description, etc.) are preserved
- The ID and creation date change

---

## Development

See [CONTRIBUTING.md](CONTRIBUTING.md) for setup and contribution guidelines.

---

## License

MIT — see [LICENSE](LICENSE) for details.

This project is a fork of [cryptonahue/mcp-anytype](https://github.com/cryptonahue/mcp-anytype) (MIT).
Research and reference from [anyproto/anytype-mcp](https://github.com/anyproto/anytype-mcp) (MIT).

---

## Related Projects

- [anytype.io](https://anytype.io) — The Anytype app
- [anyproto/anytype-api](https://github.com/anyproto/anytype-api) — Official API spec
- [anyproto/anytype-mcp](https://github.com/anyproto/anytype-mcp) — Official MCP server
- [cryptonahue/mcp-anytype](https://github.com/cryptonahue/mcp-anytype) — Fork this project is based on
