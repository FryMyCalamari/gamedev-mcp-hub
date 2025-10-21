# API Reference

## GameDev MCP Hub API

This document describes all available tools and resources in the GameDev MCP Hub.

## Hub Management Tools

### `hub__search_tools`

Search for available tools by name, description, or category.

**Parameters:**
- `query` (string, required): Search query
- `category` (string, optional): Filter by category

**Example:**
```json
{
  "query": "animation",
  "category": "art-generation"
}
```

### `hub__list_servers`

List all connected MCP servers and their status.

**Parameters:** None

**Returns:**
```json
[
  {
    "name": "godot",
    "status": "connected",
    "toolCount": 15
  }
]
```

### `hub__get_analytics`

Get usage analytics for tools and servers.

**Parameters:**
- `timeframe` (enum, optional): One of `hour`, `day`, `week`, `month`, `all`

**Example:**
```json
{
  "timeframe": "day"
}
```

### `hub__check_tokens`

Check current token usage and get recommendations.

**Parameters:** None

**Returns:**
```json
{
  "totalTokens": 50000,
  "warningThreshold": 100000,
  "hardLimit": 180000,
  "percentUsed": 27.8,
  "shouldSwitch": false,
  "byServer": {
    "godot": 20000,
    "unity": 30000
  }
}
```

## Server-Specific Tools

Tools from downstream servers are prefixed with the server name:
- `godot__*` - Godot Engine tools
- `unity__*` - Unity Engine tools
- `blender__*` - Blender 3D tools
- `pixellab__*` - PixelLab art generation tools
- `github__*` - GitHub management tools
- `discord__*` - Discord community tools

For documentation on server-specific tools, refer to each server's documentation.

## Resources

### `hub://config`

Get the current hub configuration.

**Type:** `application/json`

### `hub://servers`

Get list of connected servers with details.

**Type:** `application/json`

### `hub://analytics`

Get usage analytics data.

**Type:** `application/json`

## Error Codes

- `SERVER_CONNECTION_ERROR` - Failed to connect to a downstream server
- `TOOL_EXECUTION_ERROR` - Tool execution failed
- `CONFIGURATION_ERROR` - Configuration error
- `CIRCUIT_BREAKER_OPEN` - Circuit breaker is open for the server

## Rate Limiting

Rate limiting is configured per installation. Check your `hub-config.json` for current limits.

## Authentication

Authentication is optional and configured in `hub-config.json`. When enabled, you'll need to provide API keys.
