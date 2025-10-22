# 🎯 Skills Integration Plan - GameDev MCP Hub

## Vision

Transform the GameDev MCP Hub into a **dual-purpose orchestrator** that provides:
1. **MCP Server Tools** - External integrations (Obsidian, Blender, etc.)
2. **Skills** - Prompt-based capabilities adapted from Anthropic's skills repository

## Why Add Skills?

### Skills vs MCP Tools

| Aspect | MCP Tools | Skills |
|--------|-----------|--------|
| **Purpose** | External integrations | Prompt-based instructions |
| **Complexity** | Requires external process | Self-contained prompts |
| **Token Usage** | Higher (persistent connections) | Lower (cached prompts) |
| **Setup** | Requires server installation | Just load prompt |
| **Examples** | Blender, Obsidian, GitHub | Algorithmic art, document creation |

### Combined Power

By offering **both**, the hub becomes a comprehensive AI agent platform:
- **Tools for integration**: Connect to external systems
- **Skills for intelligence**: Enhanced AI capabilities without external dependencies

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    AI Client (Claude, LLMs)                  │
└───────────────────────┬─────────────────────────────────────┘
                        │
        ┌───────────────▼────────────────┐
        │   GameDev MCP + Skills Hub     │
        │                                 │
        │  ┌──────────┐   ┌───────────┐ │
        │  │   MCP    │   │  Skills   │ │
        │  │  Router  │   │  Engine   │ │
        │  └────┬─────┘   └─────┬─────┘ │
        └───────┼───────────────┼────────┘
                │               │
    ┌───────────┼───────┐      │ (Prompt injection)
    │           │       │       │
┌───▼───┐  ┌───▼───┐  ▼       │
│Obsidian│  │Blender│ ...      │
└────────┘  └───────┘          │
    External Servers      Internal Skills
```

## Phase 1: Modular Documentation System

### Current Problem
- README.md will become massive with many servers
- Documentation updates are manual
- No single source of truth per server

### Solution: Modular Server Docs

```
docs/
├── servers/                    # Per-server documentation
│   ├── obsidian/
│   │   ├── README.md          # Overview
│   │   ├── SETUP.md           # Installation guide
│   │   ├── TOOLS.md           # Tool list (auto-generated)
│   │   ├── EXAMPLES.md        # Usage examples
│   │   └── CHANGELOG.md       # Version history
│   ├── blender/
│   │   ├── README.md
│   │   ├── SETUP.md
│   │   ├── TOOLS.md
│   │   └── ...
│   └── ...
├── skills/                     # Per-skill documentation
│   ├── algorithmic-art/
│   │   ├── SKILL.md           # Anthropic format
│   │   ├── EXAMPLES.md        # Usage examples
│   │   └── TEMPLATES/         # Any templates/resources
│   └── ...
└── ARCHITECTURE_AND_CONNECTIONS.md  # Overall architecture
```

### Implementation
1. Create `docs/servers/` directory structure
2. Create template generator script
3. Auto-generate TOOLS.md from live server connections
4. Update README.md to link to modular docs

**Benefits**:
- Each server is self-contained
- Easy to update individual servers
- Auto-generated tool lists stay current
- README stays clean and focused

## Phase 2: Automated Maintenance System

### 2.1 Update Checking System

Create automated scripts that run weekly:

```typescript
// scripts/maintenance/check-updates.ts

interface MaintenanceTask {
  name: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  execute: () => Promise<MaintenanceReport>;
}

interface MaintenanceReport {
  timestamp: Date;
  findings: Finding[];
  recommendations: Recommendation[];
}

const tasks: MaintenanceTask[] = [
  {
    name: 'Check Server Documentation',
    frequency: 'weekly',
    execute: checkServerDocs
  },
  {
    name: 'Discover New MCP Servers',
    frequency: 'weekly',
    execute: discoverNewServers
  },
  {
    name: 'Security Vulnerability Scan',
    frequency: 'daily',
    execute: checkSecurityVulnerabilities
  },
  {
    name: 'Dependency Updates',
    frequency: 'weekly',
    execute: checkDependencyUpdates
  },
  {
    name: 'Skills Repository Sync',
    frequency: 'weekly',
    execute: syncAnthropicSkills
  }
];
```

### 2.2 Server Documentation Checker

```typescript
async function checkServerDocs(): Promise<MaintenanceReport> {
  const servers = loadServerConfig();
  const findings: Finding[] = [];
  
  for (const server of servers) {
    // Check if README exists and is current
    const readme = await fetchServerReadme(server.repository);
    const local = await readLocalDocs(`docs/servers/${server.name}/README.md`);
    
    if (readme.version !== local.version) {
      findings.push({
        severity: 'medium',
        server: server.name,
        message: `Documentation outdated. Remote: ${readme.version}, Local: ${local.version}`,
        action: `Update docs/servers/${server.name}/`
      });
    }
    
    // Check tool count
    const remoteLive = await fetchServerTools(server);
    const localDocs = parseToolsFromDocs(local);
    
    if (remoteLive.length !== localDocs.length) {
      findings.push({
        severity: 'high',
        server: server.name,
        message: `Tool count mismatch. Live: ${remoteLive.length}, Docs: ${localDocs.length}`,
        action: `Regenerate docs/servers/${server.name}/TOOLS.md`
      });
    }
  }
  
  return { timestamp: new Date(), findings, recommendations: [] };
}
```

### 2.3 New Server Discovery

```typescript
async function discoverNewServers(): Promise<MaintenanceReport> {
  const sources = [
    'https://github.com/topics/mcp-server',
    'https://github.com/topics/model-context-protocol',
    'https://modelcontextprotocol.io/servers',
    'https://github.com/punkpeye/awesome-mcp-servers'
  ];
  
  const findings: Finding[] = [];
  const knownServers = loadKnownServers();
  
  for (const source of sources) {
    const discovered = await scrapeServersFromSource(source);
    const newServers = discovered.filter(s => !knownServers.includes(s.name));
    
    for (const server of newServers) {
      if (isGameDevRelated(server)) {
        findings.push({
          severity: 'info',
          server: 'discovery',
          message: `New gamedev MCP server found: ${server.name}`,
          action: `Review for integration: ${server.repository}`,
          metadata: server
        });
      }
    }
  }
  
  return { timestamp: new Date(), findings, recommendations: [] };
}
```

### 2.4 Security Vulnerability Scanner

```typescript
async function checkSecurityVulnerabilities(): Promise<MaintenanceReport> {
  const findings: Finding[] = [];
  
  // 1. npm audit
  const npmAudit = await exec('npm audit --json');
  const vulnerabilities = JSON.parse(npmAudit.stdout);
  
  for (const vuln of vulnerabilities.vulnerabilities) {
    if (vuln.severity === 'high' || vuln.severity === 'critical') {
      findings.push({
        severity: vuln.severity,
        server: 'dependencies',
        message: `${vuln.name}: ${vuln.title}`,
        action: `npm audit fix or manual update`
      });
    }
  }
  
  // 2. Snyk scan (if configured)
  if (process.env.SNYK_TOKEN) {
    const snykResults = await runSnykScan();
    findings.push(...parseSnykResults(snykResults));
  }
  
  // 3. Check server configs for exposed secrets
  const configs = await loadAllConfigs();
  const secretPatterns = [
    /api[_-]?key/i,
    /token/i,
    /password/i,
    /secret/i
  ];
  
  for (const config of configs) {
    for (const [key, value] of Object.entries(config)) {
      if (secretPatterns.some(p => p.test(key)) && value !== 'your-key-here') {
        findings.push({
          severity: 'high',
          server: 'configuration',
          message: `Potential exposed secret: ${key} in ${config.file}`,
          action: 'Move to environment variable or secure vault'
        });
      }
    }
  }
  
  return { timestamp: new Date(), findings, recommendations: [] };
}
```

### 2.5 Automated Execution

**GitHub Actions (Recommended)**:
```yaml
# .github/workflows/maintenance.yml
name: Weekly Maintenance Check

on:
  schedule:
    - cron: '0 0 * * 0'  # Every Sunday at midnight
  workflow_dispatch:      # Manual trigger

jobs:
  maintenance:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run maintenance checks
        run: npm run maintenance:check
      
      - name: Generate report
        run: npm run maintenance:report
      
      - name: Create issue if findings
        uses: actions/github-script@v6
        with:
          script: |
            const report = require('./maintenance-report.json');
            if (report.findings.length > 0) {
              await github.rest.issues.create({
                owner: context.repo.owner,
                repo: context.repo.repo,
                title: `Maintenance Report: ${report.timestamp}`,
                body: formatReport(report),
                labels: ['maintenance', 'automated']
              });
            }
```

**Local Cron (Alternative)**:
```bash
# Add to crontab: crontab -e
0 0 * * 0 cd /path/to/gamedev-mcp-hub && npm run maintenance:check
```

## Phase 3: Skills Integration Architecture

### 3.1 Skills Storage Structure

```
src/
├── skills/
│   ├── engine/
│   │   ├── skills-manager.ts      # Core skills management
│   │   ├── skills-loader.ts       # Load SKILL.md files
│   │   ├── skills-cache.ts        # Prompt caching
│   │   └── skills-converter.ts    # Convert Anthropic → Hub format
│   └── registry/
│       ├── skill-registry.ts      # Track installed skills
│       └── skill-types.ts         # TypeScript types
└── types/
    └── skills-types.ts            # Skill interfaces

skills/                            # Skill definitions (gitignored secrets)
├── algorithmic-art/
│   ├── SKILL.md                   # Adapted for hub
│   ├── templates/
│   │   └── viewer.html
│   └── examples/
├── brand-guidelines/
│   ├── SKILL.md
│   └── assets/
└── ...

docs/
└── skills/
    ├── README.md                  # Skills system overview
    ├── CREATING_SKILLS.md         # How to create/adapt skills
    └── algorithmic-art/
        └── EXAMPLES.md            # Public examples
```

### 3.2 Skills Engine Implementation

```typescript
// src/skills/engine/skills-manager.ts

export interface Skill {
  name: string;
  description: string;
  license?: string;
  allowedTools?: string[];
  metadata?: Record<string, string>;
  prompt: string;                    // The full SKILL.md content
  resources?: Map<string, string>;   // Additional files
  category: SkillCategory;
}

export enum SkillCategory {
  Creative = 'creative',
  Development = 'development',
  Enterprise = 'enterprise',
  Document = 'document',
  Meta = 'meta'
}

export class SkillsManager {
  private skills: Map<string, Skill> = new Map();
  private cache: SkillsCache;
  
  constructor() {
    this.cache = new SkillsCache();
  }
  
  /**
   * Load all skills from the skills directory
   */
  async loadSkills(): Promise<void> {
    const skillDirs = await fs.readdir('skills');
    
    for (const dir of skillDirs) {
      const skillPath = path.join('skills', dir);
      const skill = await this.loadSkill(skillPath);
      
      if (skill) {
        this.skills.set(skill.name, skill);
        logger.info(`Loaded skill: ${skill.name}`);
      }
    }
  }
  
  /**
   * Load a single skill from a directory
   */
  private async loadSkill(skillPath: string): Promise<Skill | null> {
    const skillFile = path.join(skillPath, 'SKILL.md');
    
    if (!await fs.pathExists(skillFile)) {
      logger.warn(`No SKILL.md found in ${skillPath}`);
      return null;
    }
    
    const content = await fs.readFile(skillFile, 'utf-8');
    const parsed = parseSkillMarkdown(content);
    
    // Load any additional resources
    const resources = await this.loadSkillResources(skillPath);
    
    return {
      ...parsed.frontmatter,
      prompt: parsed.body,
      resources,
      category: this.categorizeSkill(parsed.frontmatter.name)
    };
  }
  
  /**
   * Get a skill by name (with caching)
   */
  getSkill(name: string): Skill | undefined {
    return this.skills.get(name);
  }
  
  /**
   * List all available skills
   */
  listSkills(category?: SkillCategory): Skill[] {
    const allSkills = Array.from(this.skills.values());
    
    if (category) {
      return allSkills.filter(s => s.category === category);
    }
    
    return allSkills;
  }
  
  /**
   * Get skill prompt for injection into AI context
   */
  getSkillPrompt(name: string): string | undefined {
    const skill = this.skills.get(name);
    return skill?.prompt;
  }
}
```

### 3.3 Skills Conversion Template

Create a systematic way to adapt Anthropic skills for the hub:

```markdown
# Skills Conversion Template

## Original Skill Analysis

**Skill Name**: [e.g., algorithmic-art]
**Source**: [GitHub URL]
**Version**: [commit hash]
**Date Adapted**: [YYYY-MM-DD]

## Changes Required

### 1. Hub-Specific Adaptations
- [ ] Update tool references (if using MCP tools from hub)
- [ ] Adjust file paths for hub structure
- [ ] Add hub-specific metadata
- [ ] Update examples to reference hub capabilities

### 2. Integration Points
List any hub tools this skill should reference:
- Tool: `obsidian__create-note` → For saving generated content
- Tool: `blender__create-object` → For 3D art generation
- etc.

### 3. Resource Dependencies
List files needed beyond SKILL.md:
- templates/viewer.html
- assets/brand-colors.json
- etc.

## Conversion Checklist

- [ ] Copy original SKILL.md
- [ ] Update frontmatter (add hub metadata)
- [ ] Adapt instructions for hub context
- [ ] Add hub tool integrations
- [ ] Copy required resources
- [ ] Test with Claude Desktop via hub
- [ ] Document in docs/skills/[skill-name]/
- [ ] Add to skills registry

## Testing Notes

Document how to test this skill:
1. Load skill in hub
2. Connect Claude Desktop
3. Test prompt: "..."
4. Expected behavior: ...

## Maintenance Notes

- Original repo: [URL]
- Check for updates: [frequency]
- Last checked: [date]
```

## Phase 4: GUI Skills Integration

### 4.1 New "Skills" Tab

Update the GUI to include a Skills tab alongside Servers, Tools, and Docs:

```
┌─────────────────────────────────────────────────────────┐
│  SERVERS  │  TOOLS  │  SKILLS  │  DOCS  │  SETTINGS   │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  SKILLS TAB:                                             │
│                                                          │
│  [Filter by category: All ▼]  [Search skills...]       │
│                                                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │ Creative & Design                  (4 skills)    │  │
│  ├──────────────────────────────────────────────────┤  │
│  │ 🎨 algorithmic-art                              │  │
│  │    Create generative art using p5.js            │  │
│  │    Status: ✅ Loaded                             │  │
│  │    [View Details] [Examples] [Docs]             │  │
│  ├──────────────────────────────────────────────────┤  │
│  │ 🖼️ canvas-design                                 │  │
│  │    Design visual art in PNG/PDF formats         │  │
│  │    Status: ✅ Loaded                             │  │
│  └──────────────────────────────────────────────────┘  │
│                                                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │ Development & Technical            (3 skills)    │  │
│  └──────────────────────────────────────────────────┘  │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

### 4.2 Skills API Endpoints

```typescript
// src/gui/api-routes.ts additions

// GET /api/skills - List all skills
router.get('/skills', async (req, res) => {
  const category = req.query.category as SkillCategory | undefined;
  const skills = skillsManager.listSkills(category);
  
  res.json({
    skills: skills.map(s => ({
      name: s.name,
      description: s.description,
      category: s.category,
      loaded: true
    }))
  });
});

// GET /api/skills/:name - Get skill details
router.get('/skills/:name', async (req, res) => {
  const skill = skillsManager.getSkill(req.params.name);
  
  if (!skill) {
    return res.status(404).json({ error: 'Skill not found' });
  }
  
  res.json({
    ...skill,
    prompt: undefined // Don't expose full prompt in API
  });
});

// GET /api/skills/:name/prompt - Get skill prompt (for AI clients)
router.get('/skills/:name/prompt', async (req, res) => {
  const prompt = skillsManager.getSkillPrompt(req.params.name);
  
  if (!prompt) {
    return res.status(404).json({ error: 'Skill not found' });
  }
  
  res.text(prompt);
});
```

## Phase 5: AI Client Integration

### 5.1 Skills in MCP Protocol

Skills are exposed to AI clients as **resources** in MCP protocol:

```typescript
// src/server/hub-server.ts

server.setRequestHandler(ListResourcesRequestSchema, async () => {
  const skillsResources = Array.from(skillsManager.listSkills()).map(skill => ({
    uri: `skill://${skill.name}`,
    name: skill.name,
    description: skill.description,
    mimeType: 'text/markdown'
  }));
  
  return {
    resources: [
      ...existingResources,
      ...skillsResources
    ]
  };
});

server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const uri = request.params.uri;
  
  if (uri.startsWith('skill://')) {
    const skillName = uri.replace('skill://', '');
    const prompt = skillsManager.getSkillPrompt(skillName);
    
    if (!prompt) {
      throw new Error(`Skill not found: ${skillName}`);
    }
    
    return {
      contents: [{
        uri,
        mimeType: 'text/markdown',
        text: prompt
      }]
    };
  }
  
  // ... handle other resource types
});
```

### 5.2 Usage in Claude Desktop

Once integrated, AI clients can use skills like this:

```
User: "Use the algorithmic-art skill to create a flow field visualization"

Claude: [Loads skill://algorithmic-art resource]
        [Reads skill prompt]
        [Follows instructions to create art]
        [Returns HTML artifact with p5.js visualization]
```

## Implementation Roadmap

### Sprint 1: Modular Documentation (Week 1-2)
- [ ] Create docs/servers/ structure
- [ ] Write documentation template generator
- [ ] Auto-generate TOOLS.md for existing servers
- [ ] Update README.md to link modular docs
- [ ] Create docs/skills/ structure

### Sprint 2: Maintenance Automation (Week 3-4)
- [ ] Implement check-updates.ts script
- [ ] Implement security scanner
- [ ] Implement server discovery
- [ ] Set up GitHub Actions workflow
- [ ] Create maintenance report format

### Sprint 3: Skills Engine (Week 5-6)
- [ ] Implement SkillsManager class
- [ ] Implement skills loader and parser
- [ ] Create skills conversion template
- [ ] Convert first skill: algorithmic-art
- [ ] Test skill loading

### Sprint 4: GUI Integration (Week 7-8)
- [ ] Create Skills tab in GUI
- [ ] Implement /api/skills endpoints
- [ ] Add skill detail views
- [ ] Add skill search/filter

### Sprint 5: MCP Protocol Integration (Week 9-10)
- [ ] Expose skills as MCP resources
- [ ] Test with Claude Desktop
- [ ] Document usage patterns
- [ ] Create example workflows

### Sprint 6: Batch Skill Conversion (Week 11-12)
- [ ] Convert all Anthropic creative skills
- [ ] Convert all development skills
- [ ] Convert document skills (if licensing allows)
- [ ] Create hub-specific skills

## Success Metrics

### Quantitative
- **Skills Availability**: 15+ skills integrated by end of Sprint 6
- **Documentation Coverage**: 100% of servers have modular docs
- **Update Frequency**: Weekly automated checks running
- **Security**: Zero high/critical vulnerabilities

### Qualitative
- AI clients can discover and use skills seamlessly
- Hub is the "one-stop-shop" for gamedev AI capabilities
- Maintenance is mostly automated
- New skill integration takes < 1 hour

## Next Steps

1. **Review and approve this plan**
2. **Start Sprint 1**: Create modular documentation system
3. **Begin converting algorithmic-art skill** as proof-of-concept
4. **Set up automation infrastructure** (GitHub Actions)

---

**This plan transforms the hub into a comprehensive AI agent platform combining external tools (MCP) with intelligent capabilities (Skills).**
