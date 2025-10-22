# GitHub MCP Server Integration

## Overview
Official GitHub integration providing comprehensive repository management, file operations, pull requests, issues, and advanced search capabilities through the Model Context Protocol.

## Features
- **Repository Management**: Create, fork, clone repositories
- **File Operations**: Read, create, update, delete files with automatic branch creation
- **Pull Requests**: Create, review, merge PRs
- **Issues**: Create, update, comment on issues
- **Search**: Advanced code, repository, issue, and user search
- **Git History**: Proper Git history preservation
- **Batch Operations**: Multi-file operations support

## Use Cases
- Automated code reviews and updates
- Issue management and triaging
- Repository setup and configuration
- Code search and analysis
- Documentation generation and updates
- CI/CD workflow automation

## Current Status
**Status**: ⚠️ Configured - Requires GitHub token  
**Tool Count**: ~43 tools (when connected)  
**Package**: `@modelcontextprotocol/server-github`  
**Version**: Latest via npx  
**Last Updated**: 2025-10-21

## Quick Start

**Prerequisites**: GitHub Personal Access Token

See [SETUP.md](./SETUP.md) for detailed installation instructions.

## Available Tools

See [TOOLS.md](./TOOLS.md) for complete tool list (generated after first connection).

## Examples

See [EXAMPLES.md](./EXAMPLES.md) for usage examples.

## Links
- **NPM Package**: https://www.npmjs.com/package/@modelcontextprotocol/server-github
- **Source Code**: https://github.com/modelcontextprotocol/servers/tree/main/src/github
- **Official Documentation**: https://modelcontextprotocol.io
- **Hub Configuration**: `config/mcp-servers.json` → `github`

## Troubleshooting

### Server won't connect
**Problem**: Authentication failed  
**Solution**: Verify GitHub token has required permissions (repo, workflow, etc.)

### Tools not working
**Problem**: Permission denied errors  
**Solution**: Ensure token has appropriate scopes for the operation

## Security Notes
- Store GitHub token in environment variables only
- Never commit tokens to git
- Use fine-grained personal access tokens for better security
- Regularly rotate tokens
