---
name: mcp-builder
description: Expert guide for creating high-quality MCP (Model Context Protocol) servers for GameDev MCP Hub. Use when building new MCP server integrations for game engines, 3D tools, asset libraries, or game development services.
license: MIT - Adapted for GameDev MCP Hub
hub_integration: true
hub_tools: [github]
---

# MCP Builder Skill - GameDev MCP Hub

Build production-quality MCP servers to integrate game development tools and services into the GameDev MCP Hub.

---

## OVERVIEW

This skill guides you through creating MCP servers that integrate external game development services into the hub. An MCP server provides tools that allow AI to interact with game engines, 3D software, asset libraries, version control, and other gamedev services.

**Quality is measured by**: How well the server enables AI to accomplish real game development tasks.

---

## GAMEDEV MCP HUB CONTEXT

### What is the Hub?

The GameDev MCP Hub is a centralized gateway that:
- Aggregates multiple MCP servers (Blender, Obsidian, GitHub, Godot, etc.)
- Provides a unified interface for AI clients
- Manages server lifecycle and connections
- Routes tool calls to appropriate servers

### Current Hub Architecture

**Existing servers**:
- **Obsidian** (18 tools) - Knowledge management
- **Blender** (17 tools) - 3D modeling and rendering
- **GitHub** (43 tools) - Version control
- **Godot** (~22 tools) - Game engine operations
- **Thingiverse** (~10 tools) - 3D model library

**Your new server will**:
- Join this ecosystem
- Be configured in `config/mcp-servers.json`
- Run as a separate process managed by the hub
- Expose tools through the MCP protocol

---

## PHASE 1: RESEARCH & PLANNING

### 1.1 Understand Agent-Centric Design

**Build for Workflows, Not Just API Endpoints:**
- Don't wrap APIs 1:1 - create workflow tools
- Consolidate operations (e.g., `create_scene_with_character` not just `create_scene`)
- Focus on complete tasks AI actually needs

**Optimize for Limited Context:**
- Return high-signal information only
- Provide "concise" vs "detailed" modes
- Use names over IDs (e.g., "PlayerCharacter" not "uuid-1234")

**Actionable Error Messages:**
- Guide AI toward correct usage
- Suggest specific next steps
- Make errors educational

### 1.2 Study MCP Protocol

**Fetch latest documentation**:
```
WebFetch: https://modelcontextprotocol.io/llms-full.txt
```

### 1.3 Study Framework Documentation

**Python (FastMCP)**:
```
WebFetch: https://raw.githubusercontent.com/modelcontextprotocol/python-sdk/main/README.md
```

**TypeScript (MCP SDK)**:
```
WebFetch: https://raw.githubusercontent.com/modelcontextprotocol/typescript-sdk/main/README.md
```

### 1.4 Research Target API/Service

For game development services, thoroughly study:
- Official API documentation
- Authentication requirements
- Game engine SDKs or CLI tools
- File formats and protocols
- Rate limits and quotas

**Example services**:
- **Game Engines**: Unreal, Unity, Godot REST APIs
- **Asset Libraries**: Sketchfab, Unity Asset Store, Itch.io
- **Animation Tools**: Spine, DragonBones
- **Audio**: FMOD, Wwise APIs
- **Backend**: PlayFab, Firebase, Custom game servers

### 1.5 Create Implementation Plan

**Tool Selection**:
- List most valuable operations
- Prioritize common gamedev workflows
- Consider multi-tool workflows

**Input/Output Design**:
- Use Pydantic (Python) or Zod (TypeScript)
- Support JSON and Markdown responses
- Plan for large datasets (character limits)
- Consider game asset paths and formats

**Hub Integration**:
- How will this connect to existing tools?
- What environment variables needed?
- What dependencies required?
- How to configure in `mcp-servers.json`?

---

## PHASE 2: IMPLEMENTATION

### 2.1 Choose Your Stack

**Python (Recommended for):**
- File system operations
- Image/audio processing
- Machine learning integrations
- Local tool wrappers (Blender Python API)

**TypeScript (Recommended for):**
- REST API wrappers
- Real-time services (WebSocket)
- npm-based tools
- Cloud service integrations

### 2.2 Project Structure

**Python Example**:
```
my-gamedev-server/
├── server.py              # Main MCP server
├── requirements.txt       # Dependencies
├── README.md              # Documentation
└── .env.example           # Environment variables
```

**TypeScript Example**:
```
my-gamedev-server/
├── src/
│   ├── index.ts           # Main server
│   └── tools/             # Tool implementations
├── package.json
├── tsconfig.json
├── README.md
└── .env.example
```

### 2.3 Implement Core Infrastructure

**Create shared utilities first**:
```python
# Python example
from typing import Literal
from pydantic import BaseModel, Field

# Constants
CHARACTER_LIMIT = 25000
API_BASE_URL = "https://api.example.com"

# Response format helper
class ResponseFormat(BaseModel):
    format: Literal["json", "markdown"] = Field(
        default="markdown",
        description="Response format"
    )

# Error handling
def format_error(error: Exception) -> str:
    """Format error message for LLM"""
    return f"Error: {str(error)}. Try checking [specific fix]."
```

### 2.4 Implement Tools

**Tool Registration (Python/FastMCP)**:
```python
from mcp import FastMCP

mcp = FastMCP("My GameDev Server")

@mcp.tool()
async def create_game_asset(
    asset_type: Annotated[str, Field(description="Type: 'model', 'texture', 'audio'")],
    name: Annotated[str, Field(description="Asset name")],
    format: Annotated[str, Field(description="concise or detailed")] = "concise"
) -> str:
    """
    Create a new game asset in the project.
    
    Returns asset details in specified format.
    """
    # Implementation here
    pass
```

**Tool Registration (TypeScript)**:
```typescript
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { z } from "zod";

const CreateAssetSchema = z.object({
  assetType: z.enum(["model", "texture", "audio"]),
  name: z.string().min(1),
  format: z.enum(["concise", "detailed"]).default("concise")
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name === "create_game_asset") {
    const args = CreateAssetSchema.parse(request.params.arguments);
    // Implementation here
  }
});
```

### 2.5 Add Tool Annotations

```python
@mcp.tool(
    annotations={
        "readOnlyHint": True,  # For read operations
        "destructiveHint": False,  # For non-destructive ops
        "idempotentHint": True,  # If repeatable
        "openWorldHint": True  # If external system
    }
)
```

---

## PHASE 3: HUB INTEGRATION

### 3.1 Configuration File

Add your server to `config/mcp-servers.json`:

```json
{
  "servers": {
    "my-gamedev-server": {
      "enabled": true,
      "command": "python",
      "args": ["path/to/server.py"],
      "category": "game-engine",
      "priority": "high",
      "auto_reconnect": true,
      "retry_attempts": 3,
      "timeout": 30000,
      "description": "Your server description",
      "env": {
        "API_KEY": "${API_KEY}",
        "PROJECT_PATH": "${PROJECT_PATH}"
      }
    }
  }
}
```

**Or for npm packages**:
```json
{
  "command": "npx",
  "args": ["-y", "your-mcp-server-package"]
}
```

### 3.2 Environment Variables

Create `.env.example`:
```bash
# My GameDev Server Configuration
API_KEY=your_api_key_here
PROJECT_PATH=C:\Path\To\GameProject
SERVER_URL=http://localhost:8080
```

### 3.3 Documentation

Create documentation in `docs/servers/your-server/`:
```
docs/servers/your-server/
├── README.md    # Overview and features
├── SETUP.md     # Installation and configuration
└── EXAMPLES.md  # Usage examples
```

### 3.4 Test in Hub

```bash
# Build the hub
npm run build

# Start with your server enabled
npm start

# Check GUI at http://localhost:3100
```

---

## PHASE 4: QUALITY ASSURANCE

### 4.1 Code Quality Checklist

- [ ] No duplicated code between tools
- [ ] Shared logic in reusable functions
- [ ] Consistent response formats
- [ ] All external calls have error handling
- [ ] Full type coverage
- [ ] Comprehensive docstrings
- [ ] Character limits respected (25k)
- [ ] Pagination for large datasets

### 4.2 Hub Integration Checklist

- [ ] Server starts without errors
- [ ] Connects to hub successfully
- [ ] Tools appear in GUI
- [ ] Environment variables work
- [ ] Reconnection logic works
- [ ] Graceful shutdown
- [ ] Logs are clear and helpful

### 4.3 Documentation Checklist

- [ ] README.md with features
- [ ] SETUP.md with instructions
- [ ] EXAMPLES.md with use cases
- [ ] `.env.example` provided
- [ ] Hub configuration documented

---

## PHASE 5: TESTING & EVALUATION

### 5.1 Manual Testing

Test through the hub GUI:
1. Server connects successfully
2. Tools are listed
3. Tool calls work correctly
4. Errors are handled gracefully
5. Large responses are truncated

### 5.2 Integration Testing

Test with other hub tools:
- Can save outputs to files?
- Can integrate with GitHub?
- Can reference project paths?
- Works with Obsidian for documentation?

### 5.3 Create Evaluation Questions

Create 10 realistic questions that test:
- Single tool usage
- Multi-tool workflows
- Error handling
- Complex queries
- Edge cases

**Example**:
```xml
<evaluation>
  <qa_pair>
    <question>Create a new 3D character model named "PlayerHero" with default rigging, then export it as FBX format to the project assets folder</question>
    <answer>Successfully created and exported PlayerHero.fbx</answer>
  </qa_pair>
</evaluation>
```

---

## GAMEDEV-SPECIFIC PATTERNS

### Pattern 1: Asset Management
```python
@mcp.tool()
async def import_game_asset(
    asset_path: str,
    import_options: dict = None
) -> str:
    """Import asset into game project with validation"""
    # Validate file exists
    # Check format compatibility
    # Import with options
    # Return import status
```

### Pattern 2: Scene Operations
```python
@mcp.tool()
async def modify_game_scene(
    scene_name: str,
    operations: List[dict]
) -> str:
    """Batch modify scene objects"""
    # Load scene
    # Apply operations atomically
    # Save and return results
```

### Pattern 3: Build & Export
```python
@mcp.tool()
async def build_game_project(
    platform: Literal["windows", "macos", "linux", "android", "ios"],
    build_config: str = "release"
) -> str:
    """Build game for target platform"""
    # Validate platform support
    # Run build process
    # Return build artifacts location
```

---

## EXAMPLE: UNITY MCP SERVER

```python
from mcp import FastMCP
from pydantic import Field
from typing import Annotated, Literal

mcp = FastMCP("Unity MCP Server")

@mcp.tool()
async def create_unity_gameobject(
    name: Annotated[str, Field(description="GameObject name")],
    parent: Annotated[str, Field(description="Parent object path")] = "",
    components: Annotated[list[str], Field(description="Components to add")] = []
) -> str:
    """
    Create a new GameObject in the Unity scene.
    
    Args:
        name: Name for the new GameObject
        parent: Optional parent object path (e.g., "Environment/Trees")
        components: List of component names to add (e.g., ["Rigidbody", "BoxCollider"])
    
    Returns:
        JSON with GameObject details including path and components
    """
    # Connect to Unity API
    # Create GameObject
    # Add components
    # Return details
    return {"status": "created", "path": f"{parent}/{name}"}

if __name__ == "__main__":
    mcp.run()
```

---

## HUB TOOLS AVAILABLE

Your MCP server can leverage existing hub tools:

**GitHub Tools** (~43 tools):
- Save code to repositories
- Create issues/PRs
- Search code

**Obsidian Tools** (18 tools):
- Document your server
- Create knowledge base entries

**Blender Tools** (17 tools):
- Export 3D models
- Render previews

**File System Tools**:
- Read/write project files
- Manage assets

---

## PUBLISHING YOUR SERVER

### 1. Open Source (Recommended)
- Publish to GitHub
- Add to npm (TypeScript) or PyPI (Python)
- Submit to MCP servers registry

### 2. Hub Documentation
- Create pull request to hub
- Add server to `config/mcp-servers.json.example`
- Include docs in `docs/servers/[name]/`

### 3. Community Sharing
- Share on Discord/forums
- Write blog post/tutorial
- Create video demo

---

## EXAMPLE GAMEDEV SERVERS

**Ideas for new servers**:
- Unreal Engine integration
- Unity Asset Store search
- Sketchfab model download
- Itch.io game publishing
- Steam Workshop integration
- Texture generation (Substance)
- Audio middleware (FMOD/Wwise)
- Multiplayer backend (PlayFab)
- Analytics (GameAnalytics)
- Localization services

---

**Use this skill to build production-quality MCP servers that empower AI-assisted game development!**
