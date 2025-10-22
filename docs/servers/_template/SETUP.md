# [Server Name] Setup Guide

## Prerequisites

- Requirement 1
- Requirement 2
- Requirement 3

## Installation Steps

### 1. Install Dependencies

```bash
# Installation commands
```

### 2. Obtain API Key/Token (if needed)

1. Visit [service website]
2. Create account
3. Navigate to settings
4. Generate API key
5. Copy the key for next step

### 3. Configure Environment Variables

Create or update `.env` file:

```bash
SERVER_API_KEY=your-key-here
SERVER_SETTING=value
```

### 4. Update Hub Configuration

Edit `config/mcp-servers.json`:

```json
{
  "servers": {
    "server-name": {
      "enabled": true,
      "command": "command-here",
      "args": ["arg1", "arg2"],
      "category": "category-name",
      "priority": "high",
      "auto_reconnect": true,
      "retry_attempts": 3,
      "timeout": 30000,
      "description": "Description here",
      "env": {
        "API_KEY": "${SERVER_API_KEY}"
      }
    }
  }
}
```

### 5. Test the Server Standalone (Optional but Recommended)

```bash
# Test command
```

### 6. Start the Hub

```bash
npm run build
npm start
```

### 7. Verify Connection

1. Open http://localhost:3100
2. Go to SERVERS tab
3. Look for "[Server Name]"
4. Should show ✅ Connected with X tools

## Verification Checklist

- [ ] Dependencies installed
- [ ] API key obtained
- [ ] Environment variables configured
- [ ] Hub configuration updated
- [ ] Server tested standalone
- [ ] Hub started successfully
- [ ] Server shows as connected in GUI
- [ ] Tools are available in TOOLS tab

## Troubleshooting

### Server won't connect

**Check logs:**
```bash
tail -f logs/hub.log | grep "server-name"
```

**Common issues:**
1. Missing API key
2. Incorrect command path
3. Missing dependencies
4. Firewall blocking

### Tools not appearing

1. Verify server status is "connected"
2. Check tool count is > 0
3. Refresh GUI (Ctrl+R)
4. Check console for errors (F12)

## Next Steps

- Read [TOOLS.md](./TOOLS.md) for available tools
- See [EXAMPLES.md](./EXAMPLES.md) for usage examples
- Configure Claude Desktop to use the hub
