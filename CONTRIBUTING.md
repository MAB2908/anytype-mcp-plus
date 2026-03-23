# Contributing to anytype-mcp-plus

## Prerequisites
- Node.js >= 18
- Anytype desktop app running locally
- An Anytype API key (Settings → API → Create API Key)

## Setup
```bash
git clone https://github.com/MAB2908/anytype-mcp-plus.git
cd anytype-mcp-plus
npm install
cp .env.example .env
# Edit .env with your API key
```

## Project Structure
```
src/
├── index.ts          # MCP server entry point, tool registration, routing
├── utils.ts          # HTTP client (makeRequest), data transformers
├── startup-info.ts   # Connection check on server start
├── handlers/
│   ├── spaces.ts     # Space and member handlers
│   ├── objects.ts    # Object CRUD + search + collections
│   ├── properties.ts # Property CRUD with inline tag support
│   └── types-tags.ts # Type CRUD + tag CRUD + templates
└── tools/
    ├── schemas.ts    # Shared schema fragments (icon, pagination)
    ├── spaces.ts     # Space tool definitions
    ├── objects.ts    # Object tool definitions
    ├── properties.ts # Property tool definitions
    ├── types.ts      # Type tool definitions
    ├── tags.ts       # Tag tool definitions
    ├── templates.ts  # Template tool definitions
    └── lists.ts      # Collection tool definitions
```

## Development
```bash
npm run dev          # Run with tsx (no build step)
npm run build        # Compile TypeScript
npm run type-check   # Type check without compiling
```

## Adding a New Tool
1. Add handler function in the appropriate `src/handlers/*.ts` file
2. Add tool schema in the corresponding `src/tools/*.ts` file
3. Register the tool in `src/index.ts` (import handler + add case to switch)
4. Build and test: `npm run build`

## API Reference
- [Anytype REST API](https://developers.anytype.io/docs/reference/2025-11-08/)
- [OpenAPI Spec](https://github.com/anyproto/anytype-api)

## Known API Limitations
See `README.md#known-api-limitations` for the full list of Anytype API
limitations that affect this MCP server.

## Pull Requests
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit with clear messages
4. Push and open a PR against `main`
