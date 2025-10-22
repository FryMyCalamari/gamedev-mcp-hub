# Sentry MCP Server Integration

## Overview
Error monitoring and application performance monitoring (APM) service integration through the Model Context Protocol. Track bugs, monitor performance, and manage issues directly from your hub.

## Features
- **Error Tracking**: Monitor and search errors
- **Issue Management**: Create, update, and resolve issues
- **Project Management**: List and manage Sentry projects
- **Organization**: Handle multiple teams and projects
- **Performance Monitoring**: APM data access
- **Alerts**: Configure and manage alert rules

## Use Cases
- Monitor game client/server errors
- Track crash reports
- Debug production issues
- Performance regression detection
- Player-reported bug tracking
- CI/CD quality gates

## Current Status
**Status**: ✅ Configured - Requires Sentry auth token  
**Tool Count**: ~15+ tools (when connected)  
**Package**: `@modelcontextprotocol/server-sentry`  
**Official**: Yes (Anthropic maintained)  
**Last Updated**: 2025-10-21

## Quick Start

**Prerequisites**: 
- Sentry account (free tier available)
- Sentry auth token with project access
- Organization slug

See [SETUP.md](./SETUP.md) for detailed configuration.

## Available Tools

### Issue Management
- `search_issues` - Search for issues across projects
- `get_issue` - Get detailed issue information
- `update_issue` - Update issue status/assignment
- `resolve_issue` - Mark issue as resolved
- `create_issue` - Manually create new issue

### Project Operations
- `list_projects` - List all accessible projects
- `get_project` - Get project details
- `create_project` - Create new Sentry project
- `update_project` - Modify project settings

### Event Operations
- `list_events` - List error events
- `get_event` - Get event details
- `get_event_trace` - View distributed trace

### Organization
- `list_organizations` - List your organizations
- `get_organization` - Get org details
- `list_teams` - List teams in organization

## Example Workflows

### Daily Error Review
```
1. Use list_projects to see all game projects
2. Use search_issues with filters (today, unresolved)
3. Review critical errors
4. Use update_issue to assign/prioritize
5. Use resolve_issue when fixed
```

### Bug Investigation
```
1. Get issue details with get_issue
2. Use get_event to see stack traces
3. Use get_event_trace for distributed systems
4. Gather context for debugging
5. Update issue with findings
```

### Release Monitoring
```
1. Search issues by release version
2. Compare error rates vs previous release
3. Identify new errors introduced
4. Track resolution progress
5. Create alerts for regression
```

### CI/CD Integration
```
1. After deploy, check for new errors
2. Query recent events
3. Fail build if critical errors spike
4. Alert team of issues
```

## Links
- **Official Site**: https://sentry.io
- **API Docs**: https://docs.sentry.io/api/
- **MCP Server**: npm @modelcontextprotocol/server-sentry
- **Hub Configuration**: `config/mcp-servers.json` → `sentry`

## Troubleshooting

### Server won't connect
**Problem**: Authentication failed  
**Solution**: 
1. Verify token in `.env`: `SENTRY_TOKEN=sntryu_...`
2. Check token has correct scopes in Sentry dashboard
3. Ensure organization slug is correct

### No projects found
**Problem**: list_projects returns empty  
**Solution**: 
- Verify token has project:read scope
- Check organization membership
- Ensure at least one project exists

### Permission denied
**Problem**: Cannot update/create issues  
**Solution**: Token needs write permissions - regenerate with broader scopes

## Security Notes
- Use auth tokens, not legacy API keys
- Limit token scopes to minimum required
- Rotate tokens periodically
- Never expose tokens in client-side code
- Use different tokens per environment

## Configuration

### Sentry Dashboard Setup
1. Go to https://sentry.io/settings/account/api/auth-tokens/
2. Click "Create New Token"
3. Name: "MCP Hub"
4. Scopes: `project:read`, `project:write`, `event:read`, `org:read`
5. Copy token to `.env` file

### Hub Integration
```json
{
  "sentry": {
    "enabled": true,
    "env": {
      "SENTRY_AUTH_TOKEN": "${SENTRY_TOKEN}",
      "SENTRY_ORGANIZATION": "your-org-slug"
    }
  }
}
```

## Best Practices

### For Game Development
- Create separate Sentry projects per platform (PC, Mobile, Console)
- Tag errors with game version and platform
- Set up alerts for crash rate spikes
- Integrate Sentry SDK in game client
- Use breadcrumbs to capture player actions before crash

### Error Prioritization
- P0: Game crashes, save data loss
- P1: Gameplay bugs, progression blockers
- P2: Visual glitches, minor bugs
- P3: Polish, rare edge cases

### Team Workflow
- Assign issues to relevant team members
- Use tags for categorization (graphics, networking, UI)
- Link Sentry issues to GitHub/Jira tickets
- Review unresolved issues daily
- Set SLAs for critical bugs
