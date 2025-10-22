# Rube MCP Server Integration

## Overview
Rube is a hosted Model Context Protocol server by Composio that connects AI tools to **500+ business applications** including Gmail, Slack, Notion, GitHub, Linear, Airtable, Asana, and many more. It enables automation through natural language commands.

## Features
- **500+ App Integrations**: Gmail, Slack, Notion, GitHub, Linear, Airtable, Asana, Trello, Jira, and hundreds more
- **Natural Language Control**: "Send an email", "Create a task", "Post to Slack"
- **Multi-Step Workflows**: Chain actions across different apps
- **Team Collaboration**: Share integrations across your team
- **OAuth 2.1 Security**: Secure authentication and token management
- **SOC 2 Compliant**: Enterprise-grade security
- **Cross-Client Support**: Works with any MCP-compatible client

## Use Cases

### Game Development Workflows
- **Project Management**: Create Linear/Jira tickets from game bugs
- **Team Communication**: Post updates to Slack/Discord channels
- **Documentation**: Update Notion wikis with game design docs
- **Asset Tracking**: Manage asset lists in Airtable
- **Email Automation**: Send builds to playtesters via Gmail
- **Calendar Integration**: Schedule playtesting sessions
- **Version Control**: GitHub operations alongside your code

### Cross-App Automation
- Find QA bugs in Linear → Create GitHub issues → Notify team on Slack
- New player signup in Airtable → Send welcome email → Add to Discord
- Game crash detected → Create Sentry issue → Notify on Slack → Create Jira ticket

## Current Status
**Status**: ✅ Configured - Requires Composio authentication  
**Tool Count**: 500+ apps available  
**Package**: `@composio/rube` (npm)  
**Type**: Hosted service (authentication via web)  
**Last Updated**: 2025-10-21

## Quick Start

### Prerequisites
1. **Composio Account** - Sign up at https://composio.dev (free)
2. **Apps to Connect** - Gmail, Slack, Notion, etc.
3. **MCP-Compatible AI Client** - Claude Desktop, Cursor, LM Studio, etc.

### Installation

The server is already configured! When the hub starts:

1. Rube will prompt for authentication
2. Open the browser link provided
3. Sign in to Composio
4. Authorize the apps you want to use
5. Return to the hub - Rube is now connected!

**No API key needed** - Rube handles authentication via OAuth web flow.

## Available Apps (500+)

### Communication
- Gmail, Outlook, Slack, Discord, Microsoft Teams, Telegram

### Project Management  
- Linear, Jira, Asana, Trello, Monday.com, ClickUp

### Documentation
- Notion, Confluence, Coda, Google Docs

### Development
- GitHub, GitLab, Bitbucket, Vercel, Netlify

### Databases
- Airtable, Google Sheets, PostgreSQL, MySQL

### CRM
- HubSpot, Salesforce, Pipedrive

### Calendar
- Google Calendar, Outlook Calendar, Calendly

### And 400+ More!

## Example Commands

### Email Automation
```
Send a welcome email to the latest signup in Airtable
```

### Project Management
```
Create a Linear ticket titled "Fix player jumping bug" 
and assign it to the gameplay team
```

### Cross-App Workflow
```
Find the last 5 GitHub issues labeled "bug", 
create a summary document in Notion, 
and post it to our Slack #dev channel
```

### Calendar & Communication
```
Schedule a playtesting session for next Monday at 2 PM 
and send calendar invites to all QA team members
```

### Data Migration
```
Export all completed tasks from Trello to Airtable 
with their labels and due dates
```

## How It Works

```
User Command (Natural Language)
        ↓
   Rube MCP Server
        ↓
   Composio Platform (OAuth, routing)
        ↓
   500+ App APIs (Gmail, Slack, etc.)
        ↓
   Results back to user
```

**Key Points**:
- Rube is a **hosted service** (runs on Composio's servers)
- Authentication via **web OAuth flow** (one-time per app)
- **No API keys to manage** (Composio handles it)
- **Secure token storage** (end-to-end encrypted)
- **Team sharing** (optional shared integrations)

## Security

### Authentication
- **OAuth 2.1**: Modern, secure authentication
- **Web-Based Flow**: Browser authentication for each app
- **Token Isolation**: Tokens never exposed to AI client
- **End-to-End Encryption**: All credentials encrypted

### Permissions
- **Granular Scopes**: Only request needed permissions
- **User Control**: You approve each app connection
- **Revocable**: Disconnect apps anytime from Composio dashboard
- **Team Management**: Control shared vs personal connections

### Compliance
- **SOC 2 Compliant**: Enterprise security standards
- **GDPR Ready**: Privacy-first design
- **Audit Logs**: Track all API calls
- **No Data Storage**: Composio doesn't store your data

## Configuration

### In Hub Config
```json
{
  "rube": {
    "enabled": true,
    "command": "npx",
    "args": ["-y", "@composio/rube"],
    "category": "automation",
    "description": "500+ app integrations via Composio"
  }
}
```

**Note**: No environment variables needed - auth happens via web flow!

### First Run

1. **Start hub**: Rube server will initialize
2. **Authentication prompt**: Browser will open
3. **Sign in to Composio**: Create account or log in
4. **Connect apps**: Authorize Gmail, Slack, etc.
5. **Done**: All apps available to AI!

## Links
- **Official Site**: https://rube.app
- **Composio Platform**: https://composio.dev
- **GitHub Repo**: https://github.com/ComposioHQ/Rube
- **npm Package**: `@composio/rube`
- **Documentation**: https://docs.composio.dev
- **Hub Configuration**: `config/mcp-servers.json` → `rube`

## Troubleshooting

### Authentication fails
**Problem**: Can't sign in to Composio  
**Solution**: 
- Check internet connection
- Try different browser
- Clear cookies and try again
- Contact support@composio.dev

### App not available
**Problem**: Need an app that's not in the list  
**Solution**: 
- Search Composio marketplace
- Request integration from Composio
- Check if app has API

### Commands not working
**Problem**: Rube doesn't understand command  
**Solution**: 
- Be more specific about which app to use
- Check app is authenticated
- Verify app connection in Composio dashboard

### Rate limiting
**Problem**: Too many requests  
**Solution**: 
- Each app has its own rate limits
- Spread out requests
- Check app's API limits
- Consider app's paid plan

## Best Practices

### For Game Development

**Project Management**:
- Use Linear/Jira for bug tracking
- Notion for game design docs
- Airtable for asset tracking

**Team Communication**:
- Slack for dev team updates
- Discord for community management
- Email for external communications

**Automation Workflows**:
```
Bug reported → Create Linear issue → Assign to developer → 
Notify on Slack → Update Notion tracker
```

**Release Pipeline**:
```
Build complete → Upload to file storage → Send email to testers → 
Post announcement to Discord → Update calendar
```

**Feedback Loop**:
```
Player feedback from Discord → Create Airtable entry → 
Analyze sentiment → Create GitHub issue if bug → 
Notify product team
```

## Pricing

**Current**: Free during beta  
**Future**: Paid plans with generous limits  
**Cost**: Per-action pricing (TBD)  
**Free Tier**: Expected to remain available

## Comparison

### Rube vs Individual App Integrations

**Individual**:
- Need API key for each app
- Write custom code for each
- Maintain authentication logic
- Handle rate limiting manually
- Complex multi-app workflows

**Rube**:
- One-time OAuth for all apps
- Natural language commands
- Composio handles auth
- Built-in rate limit handling
- Simple cross-app automation

### When to Use Rube

**Use Rube for**:
- Quick automation across many apps
- Team collaboration workflows
- Non-technical team members
- Rapid prototyping
- Standard SaaS integrations

**Use Direct Integration for**:
- Single-app focus
- Custom app/API
- Performance-critical operations
- Offline/air-gapped environments
- Full control over API calls

## Advanced Features

### Team Sharing
- Share app connections with teammates
- Control access per connection
- Manage from Composio dashboard

### Custom Workflows
- Chain multiple apps in sequence
- Conditional logic support
- Data transformation between apps

### Monitoring
- View all API calls in dashboard
- Track usage per app
- Monitor rate limits
- Audit logs for security

## Getting Help

- **Documentation**: https://docs.composio.dev
- **Support Email**: support@composio.dev
- **Community**: Composio Discord/Slack
- **GitHub Issues**: https://github.com/ComposioHQ/Rube/issues

## Summary

Rube transforms your hub into a **universal automation platform** with access to 500+ business apps through simple natural language commands. Perfect for game development teams who need to coordinate across multiple tools and services.

**Think of it as**: Zapier + IFTTT + Make.com, but controlled by AI through natural language!
