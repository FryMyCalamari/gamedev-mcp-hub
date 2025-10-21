# 🎮 GameDev MCP Hub

> A comprehensive Model Context Protocol (MCP) server hub that aggregates multiple game development tools into a single unified interface for AI assistants like Claude.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20+-green)](https://nodejs.org/)
[![MCP](https://img.shields.io/badge/MCP-1.0-purple)](https://modelcontextprotocol.io)

## 🚀 Features

- **🎯 Unified Interface**: Single MCP hub that connects to 5+ game development MCP servers
- **🔧 Tool Aggregation**: 165+ game development tools across engines, modeling, VCS, and communication
- **🔄 Intelligent Routing**: Automatically routes tool calls to the appropriate downstream server
- **💪 Resilient**: Circuit breakers, automatic reconnection, and comprehensive error handling
- **📊 Observable**: Structured logging, health monitoring, and usage analytics
- **🎨 TypeScript**: Fully typed with strict mode for maximum reliability
- **⚡ Fast**: Efficient connection pooling and non-blocking async operations

## 🎮 Supported Tools

### Game Engines
- **Godot** (22 tools) - Node/script/scene operations via `ee0pdt/Godot-MCP`
- **Unity** (31 tools) - GameObject/Component/Scene management via `@nurture-tech/unity-mcp-runner`

### 3D Modeling
- **Blender** (37 tools) - Object/Mesh/Material/Animation via `ahujasid/blender-mcp`

### Version Control
- **GitHub** (43 tools) - Repository/PR/Issue management via `@modelcontextprotocol/server-github`

### Communication
- **Discord** (32 tools) - Messages/Channels/Roles via `v-3/discordmcp`

## 📦 Installation

### Prerequisites

- Node.js 20+
- pnpm 8+ (recommended) or npm
- Git

### Clone and Install

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/gamedev-mcp-hub.git
cd gamedev-mcp-hub

# Install dependencies
pnpm install  # or: npm install

# Build the project
pnpm build    # or: npm run build
```

## ⚙️ Configuration

### 1. Create Configuration File

Copy the example configuration:

```bash
cp config/mcp-servers.example.json config/mcp-servers.json
```

### 2. Edit Configuration

Edit `config/mcp-servers.json` with your settings:

```json
{
  "servers": {
    "godot": {
      "enabled": true,
      "serverPath": "/path/to/godot-mcp/dist/index.js",
      "category": "game-engine"
    },
    "unity": {
      "enabled": true,
      "serverPackage": "@nurture-tech/unity-mcp-runner",
      "unityProjectPath": "/path/to/your/unity/project",
      "category": "game-engine"
    },
    "github": {
      "enabled": true,
      "serverPackage": "@modelcontextprotocol/server-github",
      "githubToken": "ghp_your_token_here",
      "category": "version-control"
    }
  }
}
```

### 3. Set Environment Variables

Create a `.env` file:

```bash
# GitHub
GITHUB_TOKEN=ghp_your_token_here

# Discord
DISCORD_BOT_TOKEN=your_discord_bot_token

# Unity
UNITY_PROJECT_PATH=/path/to/unity/project
UNITY_EDITOR_PATH=/path/to/Unity/Editor/Unity.exe

# Blender  
BLENDER_EXECUTABLE=blender
BLENDER_PROJECT_PATH=/path/to/project.blend

# Godot
GODOT_PROJECT_PATH=/path/to/godot/project
```

## 🚀 Usage

### Standalone Mode

```bash
# Start the hub
pnpm start   # or: npm start
```

### With Claude Desktop

Add to your Claude Desktop configuration file:

**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`  
**Mac**: `~/Library/Application Support/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "gamedev-hub": {
      "command": "node",
      "args": ["D:\\path\\to\\gamedev-mcp-hub\\dist\\index.js"]
    }
  }
}
```

Restart Claude Desktop and the hub tools will be available!

### With DAS Studio (Future)

```python
from gamedev_mcp_hub import MCPHub

hub = MCPHub()
result = await hub.execute_tool("unity__create-object", {...})
```

## 🛠️ Development

### Project Structure

```
gamedev-mcp-hub/
├── src/
│   ├── servers/        # Adapter implementations
│   │   ├── godot-adapter.ts
│   │   ├── unity-adapter.ts
│   │   ├── blender-adapter.ts
│   │   ├── github-adapter.ts
│   │   └── discord-adapter.ts
│   ├── server/         # Core hub server
│   ├── registry/       # Tool indexing
│   ├── orchestration/  # Token tracking, analytics
│   ├── types/          # TypeScript definitions
│   └── utils/          # Logging, config, errors
├── config/             # Configuration files
├── docs/               # Documentation
└── tests/              # Test suites
```

### Build and Test

```bash
# Build
pnpm build

# Watch mode
pnpm build:watch

# Run tests
pnpm test

# Type check
pnpm type-check

# Lint
pnpm lint

# Format
pnpm format
```

## 📖 Documentation

- [API Documentation](docs/API.md)
- [Configuration Guide](docs/CONFIGURATION.md)
- [Current Status](CURRENT_STATUS.md)
- [Next Actions](NEXT_ACTIONS.md)

## 🗺️ Roadmap

### Phase 1: Tier 1 Adapters ✅ COMPLETE
- [x] All 5 adapters implemented
- [x] Core infrastructure
- [x] TypeScript compilation
- [x] Basic documentation

### Phase 2: Testing & Integration ⏳ CURRENT
- [ ] Real server testing
- [ ] Claude Desktop integration
- [ ] Multi-server orchestration
- [ ] DAS Studio bridge

### Phase 3: Tier 2 & Enhancement 📝 PLANNED
- [ ] Testing/QA MCP adapter
- [ ] Code Quality adapter
- [ ] Security scanner
- [ ] Performance optimizations

### Phase 4: Community & Distribution 🔮 FUTURE
- [ ] npm package
- [ ] Docker container
- [ ] Video tutorials
- [ ] Example projects

## 🤝 Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for details.

## 📜 License

MIT License - see [LICENSE](LICENSE) for details.

## 🙏 Acknowledgments

- [Model Context Protocol](https://modelcontextprotocol.io) by Anthropic
- [Godot MCP](https://github.com/ee0pdt/Godot-MCP) by ee0pdt
- [Unity MCP](https://github.com/nurture-tech/unity-mcp-server) by nurture-tech
- [Blender MCP](https://github.com/ahujasid/blender-mcp) by ahujasid
- [Discord MCP](https://github.com/v-3/discordmcp) by v-3

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/YOUR_USERNAME/gamedev-mcp-hub/issues)
- **Discussions**: [GitHub Discussions](https://github.com/YOUR_USERNAME/gamedev-mcp-hub/discussions)

## 🎯 Use Cases

### Solo Indie Developer
Automate your entire game development workflow with AI assistance:
- Create 3D models in Blender
- Import into Unity/Godot
- Write and attach scripts
- Build and test
- Commit to GitHub
- Share progress on Discord

### Game Studio
Coordinate across team members and tools:
- Multi-project management
- Automated asset pipelines
- CI/CD integration
- Team communication
- Progress tracking

### AI-Assisted Development
Let Claude help with:
- Game design iteration
- Code generation
- Asset creation
- Bug fixing
- Documentation
- Team coordination

---

**Built with ❤️ for the game development community**

**Status**: 🟢 Tier 1 Complete - Ready for testing  
**Version**: 0.1.0  
**Last Updated**: 2025-10-21
