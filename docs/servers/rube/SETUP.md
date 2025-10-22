# Rube MCP Server Setup Guide

## Overview

Rube is a **hosted MCP server** that connects to 500+ apps through Composio. Unlike other servers, Rube doesn't require API keys in your `.env` file - authentication happens via web OAuth flow.

---

## Prerequisites

1. **Composio Account** (free)
   - Sign up: https://composio.dev
   - Or create during first connection

2. **Internet Connection**
   - Required for OAuth flow
   - Rube runs as hosted service

3. **Apps to Connect**
   - Gmail, Slack, Notion, GitHub, Linear, etc.
   - You'll authenticate each app once

---

## Installation

### Already Done! ✅

The hub configuration is complete. Rube is enabled in `config/mcp-servers.json`.

**No environment variables needed** - Rube handles auth through web browser!

---

## First-Time Setup

### Step 1: Start the Hub

```bash
cd D:\Power\gamedev-mcp-hub
npm run start:sse
```

Hub will start with Rube enabled.

### Step 2: Rube Authentication

When hub connects to Rube, one of these will happen:

**Option A: Browser Opens Automatically**
- Composio authentication page opens
- Sign in or create account
- Authorize apps you want to use
- Return to hub

**Option B: Manual Authentication**
1. Check hub logs for authentication URL
2. Copy URL and open in browser
3. Complete sign-in flow
4. Return to hub

**Option C: Pre-Configure via npx**
```bash
npx @composio/rube setup
```
This wizard walks you through setup.

### Step 3: Connect Your Apps

In the Composio dashboard or during authentication:

**For Game Development**, connect:
- **Gmail** - Email automation
- **Slack** - Team communication
- **Notion** - Documentation
- **Linear** or **Jira** - Task tracking
- **Airtable** - Database/tracking
- **Google Calendar** - Scheduling
- **Discord** - Community

**For Each App**:
1. Click "Connect"
2. Authorize via OAuth
3. Grant requested permissions
4. Repeat for all apps you need

### Step 4: Verify Connection

Check GUI at http://localhost:3100:
- SERVERS tab → Find "rube"
- Should show ✅ Connected
- Tool count: 100+ (depending on apps connected)

---

## Authentication Details

### How OAuth Works with Rube

```
1. Hub starts Rube MCP server
2. Rube redirects to Composio auth page
3. You sign in to Composio
4. You authorize apps (Gmail, Slack, etc.)
5. Composio stores tokens securely
6. Rube can now access your apps
7. No API keys in .env needed!
```

### What Gets Stored Where

**On Composio Servers** (encrypted):
- OAuth tokens for each app
- App connections and permissions
- Your Composio account info

**In Your Hub** (nothing):
- No API keys stored
- No credentials in .env
- Just the npx command to reach Rube

**Security**: Tokens never touch your local machine!

---

## Using Rube

### Example Commands

**Simple Email**:
```
Send an email to john@example.com with subject "Playtesting invite"
```

**Cross-App Workflow**:
```
Find the latest 5 bugs in Linear, create a summary document in Notion, 
and post the summary to our #dev channel in Slack
```

**Data Query**:
```
Show me all upcoming tasks from Asana for this week
```

**Calendar**:
```
Schedule a team meeting for Thursday at 3 PM and send invites 
to everyone in the #gamedev Slack channel
```

**GitHub + Notion**:
```
List my open GitHub pull requests and document them in a Notion page
```

---

## Managing Connections

### Composio Dashboard

Access: https://app.composio.dev

**Features**:
- View all connected apps
- Add/remove app connections
- Manage team access
- View API usage logs
- Revoke permissions
- Monitor rate limits

### Connecting New Apps

**Method 1**: Through AI Command
```
"Connect my Airtable account"
```
Rube will guide you through OAuth flow.

**Method 2**: Through Dashboard
1. Open Composio dashboard
2. Click "Add Integration"
3. Search for app
4. Click "Connect"
5. Authorize via OAuth

### Disconnecting Apps

1. Go to Composio dashboard
2. Find app in integrations list
3. Click "Disconnect" or "Revoke"
4. Confirm removal

**Note**: AI commands using that app will fail after disconnection.

---

## Configuration

### Hub Config (Already Set)

```json
{
  "rube": {
    "enabled": true,
    "command": "npx",
    "args": ["-y", "@composio/rube"],
    "category": "automation",
    "env": {}
  }
}
```

**No .env variables needed!**

### Optional: Pre-Authenticate

Before starting hub:

```bash
# Run Rube setup wizard
npx @composio/rube setup

# Follow prompts to authenticate apps
# Then start hub - already authenticated!
```

---

## Available Apps (Selection)

### Communication
- Gmail, Outlook, Yahoo Mail
- Slack, Discord, Microsoft Teams
- Telegram, WhatsApp Business

### Project Management
- Linear, Jira, Asana, Trello
- Monday.com, ClickUp, Wrike
- Basecamp, Teamwork

### Documentation
- Notion, Confluence, Coda
- Google Docs, Dropbox Paper
- GitBook, ReadMe

### Development
- GitHub, GitLab, Bitbucket
- Vercel, Netlify, Heroku
- CircleCI, Travis CI

### Spreadsheets & Databases
- Airtable, Google Sheets
- Excel, Notion Databases
- PostgreSQL, MySQL (via Composio)

### CRM & Sales
- HubSpot, Salesforce, Pipedrive
- Zendesk, Intercom, Freshdesk

### Design & Assets
- Figma, Canva
- Dropbox, Google Drive, OneDrive
- AWS S3, Cloudinary

### Analytics
- Google Analytics, Mixpanel
- Amplitude, Segment

**+ 400 more apps!**

---

## Troubleshooting

### "Authentication required" error

**Solution**:
1. Check logs for auth URL
2. Open URL in browser
3. Complete OAuth flow
4. Restart hub if needed

### App not responding

**Check**:
1. App is connected (Composio dashboard)
2. OAuth token hasn't expired
3. App's API is online
4. Rate limits not exceeded

### Wrong app accessed

**Problem**: Rube uses wrong account  
**Solution**: 
- Disconnect and reconnect app
- Ensure correct account in OAuth flow
- Check multiple accounts in Composio

### Rate limiting

**Problem**: "Too many requests"  
**Solution**: 
- Each app has its own limits
- Check app's rate limit policy
- Spread requests over time
- Use app's paid plan if available

---

## Best Practices

### Initial Setup
1. **Start with core apps**: Gmail, Slack, Notion
2. **Test each app**: Send test email, post test message
3. **Add apps gradually**: Don't connect everything at once
4. **Document your connections**: Know which apps are available

### Security
1. **Use minimal permissions**: Only authorize scopes you need
2. **Review regularly**: Audit connected apps quarterly
3. **Revoke unused**: Disconnect apps you're not using
4. **Team access**: Be careful with shared connections
5. **Monitor usage**: Check Composio dashboard for unusual activity

### Workflow Design
1. **Single-app commands first**: Test each app individually
2. **Then chain**: Combine apps once basics work
3. **Error handling**: Have fallbacks for failed steps
4. **Test thoroughly**: Verify workflows before relying on them

---

## Comparison

### Rube vs Direct API Integration

| Feature | Rube | Direct API |
|---------|------|-----------|
| Setup Time | 5 minutes | Hours per app |
| API Keys | Zero (OAuth) | One per app |
| Code Required | None | Extensive |
| Maintenance | Composio handles | You handle |
| Multi-App | Easy | Complex |
| Rate Limiting | Built-in | Manual |
| Team Sharing | Built-in | DIY |
| Security | SOC 2 | Your responsibility |
| Cost | Free (beta) | Free (usually) |

**Use Rube for**: Quick automation, multi-app workflows, team collaboration  
**Use Direct API for**: Single-app focus, offline use, custom requirements

---

## Pricing (Current)

**Beta**: Free  
**Future**: Paid plans with generous free tier  
**Enterprise**: Custom pricing for large teams

**Monitor**: Check https://composio.dev/pricing for updates

---

## Advanced

### Custom Integrations

Need an app Rube doesn't support?

1. **Request it**: Email support@composio.dev
2. **Build it**: Use Composio SDK to create connector
3. **Alternative**: Use dedicated MCP server for that app

### API Rate Limits

Each app has its own limits:
- **Gmail**: 250 emails/day (free), more with paid
- **Slack**: ~1 request/second
- **GitHub**: 5000 requests/hour (authenticated)
- **Notion**: 3 requests/second
- **Linear**: 1000 requests/hour

**Rube handles rate limiting automatically** but be aware of limits.

### Webhooks

Some apps support webhooks through Composio:
- Real-time notifications
- Event-driven automation
- Reduce polling

Check Composio docs for webhook-capable apps.

---

## Support

**Issues**: https://github.com/ComposioHQ/Rube/issues  
**Email**: support@composio.dev  
**Discord**: https://discord.gg/composio  
**Docs**: https://docs.composio.dev

---

## Summary

Rube is the **easiest way** to connect your AI to hundreds of apps:
- **No API keys to manage** - OAuth handles it
- **Natural language control** - Just describe what you want
- **500+ apps** - One server, unlimited integrations
- **Secure & compliant** - Enterprise-grade security
- **Free during beta** - Start automating today!

**Perfect for game dev teams** who need to coordinate across Slack, GitHub, Linear, Notion, and more! 🚀
