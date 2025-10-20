# Anytype MCP Server

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.0+-646CFF)](https://vitejs.dev/)
[![pnpm](https://img.shields.io/badge/pnpm-8.0+-F69220)](https://pnpm.io/)

A comprehensive Model Context Protocol (MCP) server for seamless integration with the Anytype knowledge management platform. This server provides a complete set of tools for managing spaces, objects, properties, types, tags, and templates through the Anytype API.

## 🚀 Features

- **Complete API Coverage**: Full support for all Anytype API endpoints
- **Space Management**: Create, update, and manage Anytype spaces
- **Object Operations**: CRUD operations for objects with advanced search capabilities
- **Property Management**: Dynamic property creation and management
- **Type System**: Custom object types with full lifecycle management
- **Tag Management**: Organize content with tags and multi-select properties
- **Template Support**: Access and utilize Anytype templates
- **Collection & List Operations**: Manage collections and lists with proper view handling
- **Modern Development**: Built with Vite for fast development and optimized builds
- **Package Management**: Uses pnpm for efficient dependency management
- **TypeScript Support**: Fully typed for enhanced developer experience
- **Modular Architecture**: Clean, maintainable code structure

## 📋 Prerequisites

- Node.js 18.0.0 or higher
- pnpm 8.0.0 or higher (recommended) or npm
- Anytype application running locally
- Valid Anytype API key

## 🛠️ Installation

### Option 1: Local Installation (Recommended - pnpm)

1. **Install pnpm globally** (if not already installed)
   ```bash
   npm install -g pnpm
   ```

2. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd my-mcp-anytype
   ```

3. **Install dependencies**
   ```bash
   pnpm install
   ```

4. **Configure environment variables**
   ```bash
   # Copy the example file
   cp .env.example .env
   
   # Edit .env with your actual values
   # ANYTYPE_API_KEY=your-actual-api-key
   # ANYTYPE_BASE_URL=http://localhost:31009
   ```

5. **Build the project**
   ```bash
   pnpm build
   ```

6. **Start the server**
   ```bash
   pnpm start
   ```

### Option 2: Local Installation (npm)

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd my-mcp-anytype
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   # Copy the example file
   cp .env.example .env
   
   # Edit .env with your actual values
   # ANYTYPE_API_KEY=your-actual-api-key
   # ANYTYPE_BASE_URL=http://localhost:31009
   ```

4. **Build the project**
   ```bash
   npm run build
   ```

5. **Start the server**
   ```bash
   npm start
   ```

### Option 3: Docker Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd my-mcp-anytype
   ```

2. **Configure environment variables**
   ```bash
   # Copy and edit the environment file
   cp .env.example .env
   # Edit .env with your actual Anytype API key
   ```

3. **Run with Docker Compose**
   ```bash
   # Build and start the container
   docker-compose up -d
   
   # View logs
   docker-compose logs -f
   
   # Stop the container
   docker-compose down
   ```

4. **Or run with Docker directly**
   ```bash
   # Build the image
   docker build -t anytype-mcp .
   
   # Run the container
   docker run -d \
     --name anytype-mcp-server \
     --network host \
     --env-file .env \
     anytype-mcp
   ```

## ⚙️ Configuration

### Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `ANYTYPE_API_KEY` | Your Anytype API key | - | ✅ |
| `ANYTYPE_BASE_URL` | Anytype API base URL | `http://localhost:31009` | ❌ |
| `MCP_PORT` | Port for MCP server | `3000` | ❌ |
| `LOG_LEVEL` | Logging level | `info` | ❌ |
| `REQUEST_TIMEOUT` | API request timeout (ms) | `30000` | ❌ |

### Getting Your API Key

1. Open Anytype application
2. Navigate to Settings → Developer
3. Generate or copy your API key
4. Add it to your `.env` file

## 🔧 Vite & Modern Development Tools

This project uses modern development tools for optimal developer experience:

### Vite Benefits
- **⚡ Lightning Fast**: Instant server start and HMR
- **📦 Optimized Builds**: Efficient bundling with Rollup
- **🔧 Zero Config**: Works out of the box with sensible defaults
- **🎯 TypeScript Native**: First-class TypeScript support

### Available Scripts

```bash
# Development
pnpm dev          # Start development server with hot reload
pnpm build        # Build for production using Vite
pnpm preview      # Preview production build locally
pnpm start        # Start the built MCP server

# Utilities
pnpm clean        # Clean build artifacts
pnpm type-check   # Run TypeScript type checking
pnpm prepare      # Pre-publish preparation

# Docker
docker-compose up --build  # Build and run with Docker
```

### pnpm Advantages
- **💾 Disk Efficient**: Saves up to 50% disk space
- **⚡ Faster Installs**: Up to 2x faster than npm
- **🔒 Strict**: Better dependency resolution
- **🌐 Monorepo Ready**: Built-in workspace support

## 🏷️ Tags Management

### Enhanced Tag Support

The MCP now includes **enhanced tag management** with automatic validation and processing:

- ✅ **Automatic Tag Validation**: Tags are validated when creating/updating objects
- ✅ **Improved Error Handling**: Clear error messages for invalid tag assignments
- ✅ **Better Documentation**: Comprehensive examples and usage patterns
- ✅ **Consistent API**: Standardized property_id usage across all tag operations

### Quick Tag Workflow

1. **Create tags** for a multi_select property:
   ```bash
   anytype_create_tag --space_id="space123" --name="Urgent" --color="red" --property_id="prop456"
   ```

2. **Create object** with tags:
   ```bash
   anytype_create_object \
     --space_id="space123" \
     --name="My Task" \
     --properties='[{"key":"labels","multi_select":["tag_id_1","tag_id_2"]}]'
   ```

3. **Update object** with new tags:
   ```bash
   anytype_update_object \
     --space_id="space123" \
     --object_id="obj789" \
     --properties='[{"key":"status","select":"completed_tag_id"}]'
   ```

For complete tag usage examples, see [TAGS_USAGE.md](./TAGS_USAGE.md).

## 🔄 Special Object Update Method

### Important: Object Recreation Pattern

Due to Anytype API behavior, **updating object content requires a special approach**:

#### The Challenge
When updating objects in Anytype, simply patching properties may not reflect changes immediately in the UI due to caching and synchronization mechanisms.

#### The Solution: Recreation Pattern

```typescript
// Instead of simple update:
// PATCH /v1/spaces/{spaceId}/objects/{objectId}

// Use this pattern:
1. Get current object data
2. Delete the existing object
3. Create new object with updated content
4. Return new object ID
```

#### Implementation Example

```typescript
async function updateObjectContent(spaceId: string, objectId: string, updates: any) {
  // 1. Get current object
  const currentObject = await getObject(spaceId, objectId);
  
  // 2. Merge updates with current data
  const updatedData = {
    ...currentObject,
    ...updates,
    // Preserve important metadata
    type: currentObject.type,
    createdDate: currentObject.createdDate
  };
  
  // 3. Delete current object
  await deleteObject(spaceId, objectId);
  
  // 4. Create new object with updated content
  const newObject = await createObject(spaceId, updatedData);
  
  return newObject;
}
```

#### When to Use This Pattern
- ✅ **Content Updates**: When changing object text, descriptions, or main content
- ✅ **Property Changes**: When modifying custom properties
- ✅ **Type Changes**: When changing object type
- ❌ **Simple Metadata**: For basic metadata updates, regular PATCH may suffice

#### Important Considerations
- **ID Changes**: The object will get a new ID after recreation
- **References**: Update any references to the old object ID
- **Permissions**: Ensure proper permissions for delete/create operations
- **Backup**: Consider backing up important objects before updates

### Space Management

| Tool | Description |
|------|-------------|
| `anytype_list_spaces` | List all available spaces |
| `anytype_get_space` | Get specific space details |
| `anytype_create_space` | Create a new space |
| `anytype_update_space` | Update existing space |
| `anytype_list_members` | List space members |
| `anytype_get_member` | Get specific member details |

### Object Operations

| Tool | Description |
|------|-------------|
| `anytype_search_objects` | Search objects with advanced filters |
| `anytype_list_objects` | List objects in a space |
| `anytype_get_object` | Get specific object details |
| `anytype_create_object` | Create new object |
| `anytype_update_object` | Update existing object |
| `anytype_delete_object` | Delete (archive) object |

### Property Management

| Tool | Description |
|------|-------------|
| `anytype_list_properties` | List all properties in a space |
| `anytype_get_property` | Get specific property details |
| `anytype_create_property` | Create new property |
| `anytype_update_property` | Update existing property |
| `anytype_delete_property` | Delete property |

### Type Management

| Tool | Description |
|------|-------------|
| `anytype_list_types` | List all object types |
| `anytype_get_type` | Get specific type details |
| `anytype_create_type` | Create new object type |
| `anytype_update_type` | Update existing type |
| `anytype_delete_type` | Delete object type |

### Tag Management

| Tool | Description |
|------|-------------|
| `anytype_list_tags` | List tags for a property |
| `anytype_get_tag` | Get specific tag details |
| `anytype_create_tag` | Create new tag |
| `anytype_update_tag` | Update existing tag |
| `anytype_delete_tag` | Delete tag |

### Template Operations

| Tool | Description |
|------|-------------|
| `anytype_list_templates` | List templates for a type |
| `anytype_get_template` | Get specific template details |

### Collection & List Operations

| Tool | Description |
|------|-------------|
| `anytype_add_to_collection` | Add object to collection |
| `anytype_remove_from_collection` | Remove object from collection |
| `anytype_get_list_views` | Get available views for a list |
| `anytype_get_list_objects` | Get objects from a list view |

## 🏗️ Project Structure

```
src/
├── index.ts                 # Main server entry point
├── startup-info.ts          # Server startup information
├── utils.ts                 # Utility functions and API helpers
├── handlers/                # Request handlers
│   ├── spaces.ts           # Space and member operations
│   ├── objects.ts          # Object CRUD operations
│   ├── properties.ts       # Property management
│   └── types-tags.ts       # Types, tags, and templates
└── tools/                   # MCP tool definitions
    ├── spaces.ts           # Space tool schemas
    ├── objects.ts          # Object tool schemas
    ├── properties.ts       # Property tool schemas
    ├── types.ts            # Type tool schemas
    ├── tags.ts             # Tag tool schemas
    ├── templates.ts        # Template tool schemas
    ├── lists.ts            # List tool schemas
    └── schemas.ts          # Common schemas
```

## 🔌 API Endpoints

This MCP server interfaces with the following Anytype API endpoints:

### Spaces
- `GET /v1/spaces` - List spaces
- `GET /v1/spaces/{id}` - Get space
- `POST /v1/spaces` - Create space
- `PATCH /v1/spaces/{id}` - Update space
- `GET /v1/spaces/{id}/members` - List members

### Objects
- `POST /v1/search` - Global search
- `POST /v1/spaces/{id}/search` - Space search
- `GET /v1/spaces/{id}/objects` - List objects
- `GET /v1/spaces/{id}/objects/{objectId}` - Get object
- `POST /v1/spaces/{id}/objects` - Create object
- `PATCH /v1/spaces/{id}/objects/{objectId}` - Update object
- `DELETE /v1/spaces/{id}/objects/{objectId}` - Delete object

### Properties
- `GET /v1/spaces/{id}/properties` - List properties
- `POST /v1/spaces/{id}/properties` - Create property
- `PATCH /v1/spaces/{id}/properties/{propertyId}` - Update property
- `DELETE /v1/spaces/{id}/properties/{propertyId}` - Delete property

### Types
- `GET /v1/spaces/{id}/types` - List types
- `POST /v1/spaces/{id}/types` - Create type
- `PATCH /v1/spaces/{id}/types/{typeId}` - Update type
- `DELETE /v1/spaces/{id}/types/{typeId}` - Delete type

### Templates
- `GET /v1/spaces/{id}/types/{typeId}/templates` - List templates
- `GET /v1/spaces/{id}/types/{typeId}/templates/{templateId}` - Get template

## 🐳 Docker Support

### Why Docker?

- **Consistent Environment**: Ensures the same runtime across different systems
- **Easy Deployment**: Simple containerized deployment
- **Isolation**: Runs in an isolated environment
- **Scalability**: Easy to scale and manage

### Docker Configuration

The project includes:
- `Dockerfile`: Multi-stage build with security best practices
- `docker-compose.yml`: Complete orchestration setup
- `.dockerignore`: Optimized build context
- Health checks and resource limits

### Network Considerations

**Host Network Mode** (Recommended):
```yaml
network_mode: host
```
This allows the container to access Anytype running on the host machine.

**Bridge Network Mode** (Alternative):
If Anytype is also containerized, use a custom network:
```yaml
networks:
  - anytype-network
```

### Environment Variables in Docker

The container uses the same environment variables as the local installation:
- `ANYTYPE_API_KEY`: Your API key
- `ANYTYPE_BASE_URL`: Defaults to `http://host.docker.internal:31009` in Docker

## 🚀 Development

### Available Scripts

```bash
npm run build    # Compile TypeScript to JavaScript
npm start        # Start the MCP server
npm run dev      # Development mode with tsx
npm run prepare  # Pre-publish build step
```

### Docker Development

```bash
# Development with Docker
docker-compose -f docker-compose.yml up --build

# View logs in real-time
docker-compose logs -f anytype-mcp

# Execute commands in container
docker-compose exec anytype-mcp sh
```

### Adding New Features

1. **Define tool schema** in the appropriate `tools/*.ts` file
2. **Implement handler** in the corresponding `handlers/*.ts` file
3. **Register tool** in `src/index.ts`
4. **Update documentation** as needed

### Code Style

- TypeScript with strict type checking
- Modular architecture with separation of concerns
- Consistent error handling with MCP error types
- Comprehensive input validation

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues or have questions:

1. Check the [Issues](../../issues) page for existing solutions
2. Create a new issue with detailed information
3. Include your environment details and error messages

## 🙏 Acknowledgments

- [Anytype](https://anytype.io/) for the amazing knowledge management platform
- [Model Context Protocol](https://modelcontextprotocol.io/) for the integration framework
- The open-source community for continuous inspiration

---

**Made with ❤️ for the Anytype community**