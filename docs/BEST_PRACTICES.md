# 🎯 Best Practices - GameDev MCP Hub

## Ongoing Maintenance

### Weekly Tasks (Automated)

Run the maintenance script every week:
```bash
npm run maintenance:check
```

This will:
- ✅ Check server documentation for updates
- ✅ Discover new MCP servers
- ✅ Scan for security vulnerabilities
- ✅ Check dependency updates
- ✅ Sync with Anthropic skills repository

### Monthly Tasks (Manual)

1. **Review Maintenance Reports**
   - Check `logs/maintenance/` for automated findings
   - Address high-priority issues
   - Update server configurations

2. **Update Documentation**
   - Review `docs/servers/` for accuracy
   - Update tool counts and examples
   - Verify setup instructions

3. **Test All Servers**
   - Start hub and verify all servers connect
   - Test at least one tool per server
   - Document any issues

4. **Backup Configuration**
   - Export `config/mcp-servers.json` (excluding secrets)
   - Document any custom configurations
   - Update setup guides

## Server Management

### Adding a New MCP Server

1. **Research the Server**
   - Repository URL
   - Installation method
   - Required dependencies
   - API keys/tokens needed

2. **Test Locally First**
   ```bash
   # Test the server standalone before adding to hub
   npx @server-package args...
   ```

3. **Add to Configuration**
   ```json
   {
     "servers": {
       "new-server": {
         "enabled": false,  // Start disabled
         "command": "npx",
         "args": ["-y", "@server-package"],
         "category": "appropriate-category",
         "priority": "medium",
         "auto_reconnect": true,
         "retry_attempts": 3,
         "timeout": 30000,
         "description": "Clear description",
         "env": {}
       }
     }
   }
   ```

4. **Enable and Test**
   ```bash
   # Set enabled: true
   npm run build
   npm start
   # Check GUI at http://localhost:3100
   ```

5. **Document**
   - Create `docs/servers/new-server/README.md`
   - Create `docs/servers/new-server/SETUP.md`
   - Generate `docs/servers/new-server/TOOLS.md`
   - Add examples

6. **Update Main Documentation**
   - Add to README.md
   - Update tool count
   - Add to QUICK_START.md if important

### Removing a Server

1. **Disable in config**
   ```json
   "server-name": {
     "enabled": false,
     ...
   }
   ```

2. **Keep documentation** (mark as archived)
   - Move to `docs/servers/_archived/`
   - Add deprecation notice

3. **Update references**
   - Remove from README.md
   - Update tool counts
   - Update QUICK_START.md

## Skills Management

### Adding a New Skill

1. **Source the Skill**
   - From Anthropic repository
   - From community
   - Custom creation

2. **Convert to Hub Format**
   - Use conversion template: `docs/skills/CREATING_SKILLS.md`
   - Adapt tool references
   - Update file paths
   - Test locally

3. **Store the Skill**
   ```
   skills/
   └── skill-name/
       ├── SKILL.md           # Main skill file
       ├── templates/         # Any templates
       ├── assets/            # Any assets
       └── examples/          # Usage examples
   ```

4. **Test Integration**
   ```bash
   npm run build
   npm start
   # Check Skills tab in GUI
   # Test with Claude Desktop
   ```

5. **Document**
   ```
   docs/skills/
   └── skill-name/
       ├── README.md          # Overview
       ├── EXAMPLES.md        # Usage examples
       └── CHANGELOG.md       # Version history
   ```

### Updating an Existing Skill

1. **Check Anthropic Repository**
   - Compare with latest version
   - Note any changes
   - Review breaking changes

2. **Apply Updates**
   - Update `skills/skill-name/SKILL.md`
   - Update any dependencies
   - Test thoroughly

3. **Document Changes**
   - Update `docs/skills/skill-name/CHANGELOG.md`
   - Note breaking changes
   - Update examples if needed

## Security Best Practices

### API Keys and Secrets

**Never commit secrets to git!**

1. **Use Environment Variables**
   ```bash
   # .env file (gitignored)
   OBSIDIAN_API_KEY=your-key-here
   GITHUB_TOKEN=your-token
   ```

2. **Reference in Config**
   ```json
   {
     "env": {
       "OBSIDIAN_API_KEY": "${OBSIDIAN_API_KEY}"
     }
   }
   ```

3. **Document Required Secrets**
   - List in `docs/servers/server-name/SETUP.md`
   - Provide instructions for obtaining
   - Never include actual values

### Regular Security Checks

1. **Run npm audit**
   ```bash
   npm audit
   npm audit fix  # For safe fixes
   ```

2. **Check for exposed secrets**
   ```bash
   npm run security:scan
   ```

3. **Review Dependencies**
   - Keep dependencies updated
   - Remove unused packages
   - Review security advisories

### Network Security

1. **Localhost Only**
   - Hub bound to 127.0.0.1 by default
   - Don't expose to network without authentication

2. **HTTPS for External Servers**
   - Use HTTPS for remote connections
   - Verify SSL certificates
   - Don't disable certificate validation (except local dev)

## Documentation Standards

### Server Documentation

Each server should have:

```
docs/servers/server-name/
├── README.md          # Overview, features, use cases
├── SETUP.md           # Installation, configuration
├── TOOLS.md           # Auto-generated tool list
├── EXAMPLES.md        # Usage examples
└── CHANGELOG.md       # Version history
```

**README.md Template**:
```markdown
# [Server Name] Integration

## Overview
Brief description of what this server does.

## Features
- Feature 1
- Feature 2

## Use Cases
- Use case 1
- Use case 2

## Tool Count
Currently provides: X tools

## Status
✅ Connected | ⚠️ Issues | ❌ Disconnected

## Links
- Repository: [URL]
- Documentation: [URL]
- Version: X.Y.Z
```

**TOOLS.md** (Auto-generated):
```markdown
# [Server Name] Tools

Total: X tools

## Tool List

### `server__tool-name`
**Description**: What this tool does

**Parameters**:
- `param1` (type): Description
- `param2` (type): Description

**Example**:
\`\`\`json
{
  "param1": "value",
  "param2": 123
}
\`\`\`

---
```

### Skills Documentation

Each skill should have:

```
docs/skills/skill-name/
├── README.md          # Overview
├── EXAMPLES.md        # Detailed examples
└── CHANGELOG.md       # Version history
```

## Git Workflow

### Branching Strategy

```
main                   # Production-ready code
├── develop            # Integration branch
├── feature/xyz        # New features
├── fix/abc            # Bug fixes
└── docs/update        # Documentation updates
```

### Commit Messages

Follow conventional commits:
```
feat: Add new MCP server integration
fix: Resolve connection timeout issue
docs: Update Obsidian setup guide
chore: Update dependencies
refactor: Improve skills loading
test: Add integration tests for skills
```

### Before Committing

1. **Run Tests**
   ```bash
   npm test
   npm run type-check
   ```

2. **Check Formatting**
   ```bash
   npm run format:check
   npm run lint
   ```

3. **Build Successfully**
   ```bash
   npm run build
   ```

4. **Update Documentation**
   - Update relevant docs
   - Update CHANGELOG.md
   - Update tool counts if changed

## Testing Best Practices

### Integration Testing

Test each server integration:

```typescript
// tests/integration/servers/obsidian.test.ts
describe('Obsidian Integration', () => {
  it('should connect successfully', async () => {
    const hub = await startHub();
    const status = await hub.getServerStatus('obsidian');
    expect(status).toBe('connected');
  });
  
  it('should list tools', async () => {
    const tools = await hub.getServerTools('obsidian');
    expect(tools.length).toBeGreaterThan(0);
  });
  
  it('should execute a tool', async () => {
    const result = await hub.callTool('obsidian__list-notes', {});
    expect(result).toBeDefined();
  });
});
```

### Skills Testing

Test skill loading and usage:

```typescript
// tests/integration/skills/algorithmic-art.test.ts
describe('Algorithmic Art Skill', () => {
  it('should load skill', () => {
    const skill = skillsManager.getSkill('algorithmic-art');
    expect(skill).toBeDefined();
    expect(skill.name).toBe('algorithmic-art');
  });
  
  it('should provide prompt', () => {
    const prompt = skillsManager.getSkillPrompt('algorithmic-art');
    expect(prompt).toContain('Algorithmic philosophies');
  });
});
```

## Performance Optimization

### Connection Pooling

Reuse connections where possible:
- MCP clients stay connected
- WebSocket connections are persistent
- Skills are loaded once at startup

### Caching

```typescript
// Cache skill prompts
class SkillsCache {
  private cache = new Map<string, string>();
  
  get(name: string): string | undefined {
    return this.cache.get(name);
  }
  
  set(name: string, prompt: string): void {
    this.cache.set(name, prompt);
  }
}
```

### Monitoring

Watch for performance issues:
- Check logs for slow operations
- Monitor memory usage
- Track connection counts
- Profile hot paths

## Troubleshooting Guide

### Server Won't Connect

1. **Check logs**: `logs/hub.log`
2. **Verify command**: Run standalone
3. **Check dependencies**: Install missing packages
4. **Test environment variables**: Echo values
5. **Review config**: Validate JSON syntax

### Tools Not Appearing

1. **Check server status**: Visit GUI
2. **Verify connection**: Check logs
3. **Regenerate docs**: Run tool list script
4. **Restart hub**: Fresh start

### Skill Not Loading

1. **Check SKILL.md**: Validate frontmatter
2. **Check file location**: Must be in `skills/`
3. **Check syntax**: YAML frontmatter correct
4. **Restart hub**: Reload skills

### GUI Not Accessible

1. **Check port**: 3100 in use?
2. **Check build**: `npm run build`
3. **Check config**: `rest_api: true`
4. **Check logs**: Look for GUI errors

## Monitoring and Logging

### Log Levels

```typescript
logger.error('Critical issues');   // Always logged
logger.warn('Important notices');  // Production+
logger.info('General info');       // Development+
logger.debug('Detailed info');     // Debug only
```

### Log Files

- `logs/hub.log` - Main application log
- `logs/error.log` - Errors only
- `logs/maintenance/` - Automated check reports

### Monitoring Dashboard

Check the GUI regularly:
- **Servers tab**: Connection status
- **Tools tab**: Available tools
- **Skills tab**: Loaded skills
- **Settings**: Configuration

## Backup and Recovery

### What to Backup

```
config/
├── mcp-servers.json    # Server configs (no secrets!)
└── hub-config.json     # Hub settings

skills/                 # Custom skills
└── custom-skill/

docs/                   # Custom documentation
└── servers/
    └── custom-server/
```

### Backup Script

```bash
#!/bin/bash
# backup.sh

DATE=$(date +%Y-%m-%d)
BACKUP_DIR="backups/$DATE"

mkdir -p "$BACKUP_DIR"

# Backup configs (excluding secrets)
cp config/mcp-servers.json "$BACKUP_DIR/"
cp config/hub-config.json "$BACKUP_DIR/"

# Backup custom skills
cp -r skills "$BACKUP_DIR/"

# Backup custom docs
cp -r docs/servers "$BACKUP_DIR/"

echo "Backup complete: $BACKUP_DIR"
```

### Recovery

1. **Fresh install**: `npm install`
2. **Restore configs**: Copy from backup
3. **Re-add secrets**: Update env variables
4. **Rebuild**: `npm run build`
5. **Test**: `npm start`

## Community Contributions

### Accepting New Servers

1. **Verify licensing**: Compatible with MIT
2. **Test thoroughly**: Multiple use cases
3. **Document completely**: All setup steps
4. **Review code quality**: Well-maintained
5. **Add to hub**: Follow integration guide

### Sharing Skills

1. **Create clean example**: Remove sensitive data
2. **Document clearly**: Easy to understand
3. **Test with others**: Verify portability
4. **License appropriately**: MIT or Apache 2.0
5. **Share on GitHub**: Fork and PR

---

**Following these best practices ensures a maintainable, secure, and high-quality hub that serves as the foundation for AI-powered game development workflows.**
