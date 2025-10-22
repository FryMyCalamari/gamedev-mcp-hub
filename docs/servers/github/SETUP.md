# GitHub MCP Server Setup Guide

## Prerequisites

- Node.js 18+ and npm
- GitHub account
- GitHub Personal Access Token

## Step 1: Generate GitHub Personal Access Token

1. Go to https://github.com/settings/tokens
2. Click "Generate new token" → "Generate new token (classic)"
3. Name: `gamedev-mcp-hub` or your preference
4. Select scopes:
   - ✅ `repo` (Full control of private repositories)
   - ✅ `workflow` (Update GitHub Action workflows)
   - ✅ `read:org` (Read organization data - if using orgs)
   - ✅ `user` (Update user data)
5. Click "Generate token"
6. **IMPORTANT**: Copy the token immediately - you won't see it again!

## Step 2: Configure Environment Variables

Edit or create `.env` file in the hub root:

```bash
GITHUB_PERSONAL_ACCESS_TOKEN=ghp_your_token_here_1234567890abcdefgh
```

**Security**: Make sure `.env` is in `.gitignore`!

## Step 3: Update Hub Configuration

The hub configuration is already set up. Verify in `config/mcp-servers.json`:

```json
{
  "servers": {
    "github": {
      "enabled": true,
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "category": "version-control",
      "priority": "high",
      "auto_reconnect": true,
      "retry_attempts": 3,
      "timeout": 30000,
      "description": "GitHub repository and project management",
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "${GITHUB_PERSONAL_ACCESS_TOKEN}"
      }
    }
  }
}
```

**Note**: The `${GITHUB_PERSONAL_ACCESS_TOKEN}` will be read from your `.env` file.

## Step 4: Test the Server Standalone (Optional)

```bash
# Set the token temporarily
$env:GITHUB_PERSONAL_ACCESS_TOKEN="your-token-here"

# Test the server
npx -y @modelcontextprotocol/server-github
```

If it starts without errors, it's working!

## Step 5: Enable in Hub

Edit `config/mcp-servers.json` and ensure:
```json
"github": {
  "enabled": true,
  ...
}
```

## Step 6: Start the Hub

```bash
npm run build
npm start
```

Or use the GUI launcher:
```bash
start-gui-with-browser.bat
```

## Step 7: Verify Connection

1. Open http://localhost:3100
2. Go to **SERVERS** tab
3. Look for "**github**"
4. Should show: ✅ **Connected** with **~43 tools**

If you see ❌ Disconnected:
- Check logs: `logs/hub.log`
- Verify token is set correctly
- Ensure token has required permissions

## Verification Checklist

- [ ] GitHub token generated with correct scopes
- [ ] `.env` file created with token
- [ ] Hub configuration updated (enabled: true)
- [ ] Hub built successfully (`npm run build`)
- [ ] Hub started (`npm start`)
- [ ] Server shows as connected in GUI
- [ ] Tools are available in TOOLS tab

## Next Steps

- Generate `TOOLS.md`: `npm run tools:generate github` (after connecting)
- Read [EXAMPLES.md](./EXAMPLES.md) for usage patterns
- Configure Claude Desktop to use the hub
- Start automating GitHub workflows!

## Troubleshooting

### Token validation failed

**Check token scopes**:
```bash
curl -H "Authorization: token YOUR_TOKEN" https://api.github.com/user
```

Should return your GitHub user info.

### Server disconnects immediately

Check logs for specific error:
```bash
tail -f logs/hub.log | grep github
```

Common issues:
- Invalid token format
- Expired token
- Insufficient permissions
- Network connectivity

### Rate limiting

GitHub has API rate limits:
- Authenticated: 5,000 requests/hour
- Unauthenticated: 60 requests/hour

**Solution**: Ensure token is being used (check logs)
