# Configuration Guide

## Overview

The GameDev MCP Hub uses three main configuration files:
1. `mcp-servers.json` - Downstream server configurations
2. `hub-config.json` - Hub settings
3. `categories.json` - Tool categorization

## Server Configuration

### File: `config/mcp-servers.json`

Copy from the example file:
```bash
cp config/mcp-servers.example.json config/mcp-servers.json
```

### Server Entry Format

```json
{
  "servers": {
    "server-name": {
      "enabled": true,
      "command": "node",
      "args": ["path/to/server.js"],
      "category": "game-engine",
      "priority": "high",
      "auto_reconnect": true,
      "retry_attempts": 3,
      "timeout": 30000,
      "description": "Server description",
      "env": {
        "API_KEY": "your-key-here"
      }
    }
  }
}
```

### Field Descriptions

- `enabled` - Whether to start this server
- `command` - Command to run (node, python, npx, docker, etc.)
- `args` - Array of command arguments
- `category` - Tool category (matches categories.json)
- `priority` - `low`, `medium`, or `high`
- `auto_reconnect` - Automatically reconnect on failure
- `retry_attempts` - Number of retry attempts before giving up
- `timeout` - Connection timeout in milliseconds
- `description` - Human-readable description
- `env` - Environment variables for the server process

## Hub Configuration

### File: `config/hub-config.json`

### Section: Hub

```json
{
  "hub": {
    "name": "gamedev-mcp-hub",
    "version": "0.1.0",
    "description": "Game Development MCP Server Hub",
    "transport": "stdio",
    "port": 3000,
    "host": "localhost",
    "log_level": "info"
  }
}
```

- `transport` - `stdio`, `http`, or `websocket` (stdio recommended for Claude Desktop)
- `log_level` - `debug`, `info`, `warn`, or `error`

### Section: Token Management

```json
{
  "token_management": {
    "enabled": true,
    "warning_threshold": 100000,
    "hard_limit": 180000,
    "auto_switch": true,
    "auto_switch_threshold": 150000,
    "preferred_models": ["claude-sonnet-4", "claude-opus-4"],
    "track_per_server": true,
    "track_per_tool": true
  }
}
```

### Section: Health Check

```json
{
  "health_check": {
    "enabled": true,
    "interval": 30000,
    "timeout": 5000,
    "max_failures": 3,
    "log_failures": true,
    "notify_on_failure": false
  }
}
```

## Server Examples

### PixelLab Configuration

```json
{
  "pixellab": {
    "enabled": true,
    "command": "npx",
    "args": ["-y", "pixellab-mcp"],
    "category": "art-generation",
    "priority": "high",
    "auto_reconnect": true,
    "retry_attempts": 3,
    "timeout": 60000,
    "description": "Pixel art character, animation, and tileset generation",
    "env": {
      "PIXELLAB_API_KEY": "your-pixellab-api-key"
    }
  }
}
```

### Godot Configuration

```json
{
  "godot": {
    "enabled": true,
    "command": "python",
    "args": ["C:/path/to/godot-mcp/server.py"],
    "category": "game-engine",
    "priority": "high",
    "auto_reconnect": true,
    "retry_attempts": 3,
    "timeout": 30000,
    "description": "Godot Engine integration",
    "env": {}
  }
}
```

### GitHub Configuration (Docker)

```json
{
  "github": {
    "enabled": true,
    "command": "docker",
    "args": ["run", "-i", "--rm", "ghcr.io/github/github-mcp-server"],
    "category": "development",
    "priority": "high",
    "auto_reconnect": true,
    "retry_attempts": 3,
    "timeout": 30000,
    "description": "GitHub repository management",
    "env": {
      "GITHUB_TOKEN": "ghp_your_token_here"
    }
  }
}
```

## Environment Variables

The hub supports environment variables for sensitive data:

```bash
# .env file
PIXELLAB_API_KEY=your-key
GITHUB_TOKEN=ghp_xxx
DISCORD_BOT_TOKEN=xxx
```

Load with:
```bash
export $(cat .env | xargs)
```

## Claude Desktop Configuration

Add to Claude Desktop config (`%APPDATA%\Claude\claude_desktop_config.json` on Windows):

```json
{
  "mcpServers": {
    "gamedev-hub": {
      "command": "node",
      "args": ["D:/Power/gamedev-mcp-hub/dist/index.js"],
      "env": {
        "NODE_ENV": "production",
        "LOG_LEVEL": "info"
      }
    }
  }
}
```

## Troubleshooting

### Server Won't Connect

1. Check the command and args are correct
2. Verify environment variables are set
3. Check logs in `logs/hub.log`
4. Test the server command manually
5. Increase timeout if needed

### High Token Usage

1. Check `hub__check_tokens` for breakdown
2. Adjust `warning_threshold` and `hard_limit`
3. Enable `auto_switch` to get recommendations
4. Review per-tool usage with `hub__get_analytics`

### Circuit Breaker Opens

Circuit breakers protect against failing servers:
- Threshold: 5 failures (configurable)
- Timeout: 60 seconds (configurable)
- Auto-reset after timeout expires

Check server logs and health to resolve issues.
