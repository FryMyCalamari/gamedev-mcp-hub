# GameDev MCP Hub - Skills

Skills are specialized workflows and patterns that guide AI in using the hub's tools effectively for specific game development tasks.

---

## What Are Skills?

**Skills are NOT tools**. Tools are individual operations (like "create_file" or "search_github"). Skills are **comprehensive workflows** that combine multiple tools to accomplish complex creative or technical tasks.

Think of it this way:
- **Tools** = Individual LEGO bricks
- **Skills** = Instruction manuals for building complex structures

---

## Available Skills

### 🎨 Algorithmic Art (`algorithmic-art`)
**Purpose**: Create generative art and procedural visuals for games

**Use Cases**:
- Generate backgrounds and textures
- Create loading screen animations
- Design UI patterns and effects
- Prototype procedural generation systems
- Create concept art variations

**How It Works**:
1. Define an "algorithmic philosophy" - the creative concept
2. Express it through p5.js code
3. Generate interactive HTML artifacts with parameter controls
4. Export assets for use in games

**Tools Used**: p5.js (embedded), file operations, optional GitHub integration

**Example Prompt**: "Create a flow field visualization for a sci-fi game menu background with adjustable particle density"

---

### 🛠️ MCP Builder (`mcp-builder`)
**Purpose**: Build new MCP servers to integrate game development tools

**Use Cases**:
- Integrate new game engines (Unreal, Unity custom tools)
- Connect asset libraries (Sketchfab, Unity Asset Store)
- Add backend services (PlayFab, Firebase)
- Create custom tool integrations
- Expand hub capabilities

**How It Works**:
1. Research API/service documentation
2. Plan tool workflows
3. Implement server (Python or TypeScript)
4. Integrate with hub configuration
5. Test and document

**Tools Used**: GitHub tools, file operations, web research

**Example Prompt**: "Help me create an MCP server for the Unreal Engine REST API"

---

## How Skills Work in the Hub

### Current Status (v0.1.0)
Skills are **documentation-based workflows**. When you mention a skill-appropriate task:
1. AI loads the skill markdown file
2. Follows the patterns and guidelines
3. Uses hub tools to accomplish the task
4. Produces results according to skill specifications

### Future (v0.3.0+)
Skills will be **first-class resources** exposed through MCP protocol:
- Listed in hub's resource catalog
- Invokable like tools
- Tracked in analytics
- Discoverable in GUI

---

## Using Skills

### Method 1: Mention by Name
```
"Use the algorithmic-art skill to create a particle system"
```

### Method 2: Describe the Task
```
"Create generative art for my game's background"
→ AI recognizes this matches algorithmic-art skill
```

### Method 3: Explicit Skill Invocation (Future)
```
// Through MCP protocol
{
  "skill": "algorithmic-art",
  "task": "Create flow field background",
  "parameters": {...}
}
```

---

## Skill Structure

Each skill lives in `skills/[name]/` with:

```
skills/algorithmic-art/
├── SKILL.md          # Main skill documentation
├── examples/         # Example outputs (optional)
└── templates/        # Reusable templates (optional)
```

### SKILL.md Format

```markdown
---
name: skill-name
description: Brief description
license: MIT
hub_integration: true
hub_tools: [list, of, used, tools]
---

# Skill Name

[Comprehensive workflow documentation]
```

---

## Creating New Skills

### Process
1. Identify a complex, repeatable gamedev workflow
2. Document the pattern in SKILL.md format
3. Include examples and use cases
4. Test with the hub
5. Add to this README

### Guidelines
- **Focus on workflows**, not single operations
- **Be opinionated** - provide clear patterns
- **Include examples** - show concrete usage
- **Leverage hub tools** - integrate with existing capabilities
- **Consider context** - optimize for AI usage patterns

### Skill Ideas
- **shader-prototyping**: Create and test shader code
- **level-design**: Procedural level generation workflows
- **character-pipeline**: Complete character creation workflow (model → rig → animate → export)
- **game-testing**: Automated testing scenario creation
- **documentation-generation**: Auto-document game systems
- **asset-optimization**: Batch optimize assets for platforms

---

## Skills vs Tools

| Aspect | Tools | Skills |
|--------|-------|--------|
| **What** | Individual operations | Multi-step workflows |
| **Scope** | Single action | Complete task |
| **Complexity** | Simple, focused | Complex, creative |
| **Examples** | `create_file`, `search_code` | `Create generative art`, `Build MCP server` |
| **Invocation** | Direct tool calls | Workflow guidance |
| **Output** | Single result | Multi-artifact deliverables |

---

## Skills Roadmap

**v0.1.0** (Current):
- ✅ 2 skills (algorithmic-art, mcp-builder)
- ✅ Documentation-based workflows
- ✅ Manual skill loading

**v0.2.0**:
- [ ] 5+ skills
- [ ] Skills GUI tab
- [ ] Usage analytics

**v0.3.0**:
- [ ] Skills as MCP resources
- [ ] Skill templates
- [ ] Community skill repository

**v1.0.0**:
- [ ] 15+ skills covering major gamedev workflows
- [ ] Skill versioning
- [ ] Skill marketplace

---

## Contributing Skills

Want to add a skill?

1. Create `skills/your-skill/SKILL.md`
2. Follow the template structure
3. Test with the hub
4. Submit PR with:
   - Skill documentation
   - Usage examples
   - Update to this README

---

## Skill Best Practices

### For AI Using Skills
- Load skill documentation fully
- Follow patterns closely
- Adapt to user's specific context
- Combine multiple skills when appropriate

### For Skill Creators
- Be comprehensive but concise
- Include concrete examples
- Document failure modes
- Link to relevant hub tools
- Test with real game dev scenarios

---

**Skills transform the hub from a tool aggregator into a creative game development assistant.**
