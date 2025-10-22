# Smart Tool Router - Architecture Specification

**Version**: 1.0  
**Status**: Planning  
**Author**: Droid + User  
**Date**: 2025-10-22

---

## Executive Summary

### Problem Statement

Current hub exposes 75+ tools directly to MCP clients, causing:
- **Context overflow** (284%+ in LM Studio)
- **Poor scalability** (can't add more tools without worsening the problem)
- **Cognitive overhead** (LLM must choose from 75 options)
- **Performance issues** (large tool lists slow down MCP protocol)

### Solution

**Intelligent Tool Router**: A single `smart_route` tool that:
1. Accepts natural language task descriptions
2. Automatically selects the best tool(s) from the registry
3. Executes tool(s) and returns results
4. Handles multi-tool workflows
5. Scales to 1000+ tools without context issues

### Benefits

✅ **Scalable**: 1 tool exposed vs 75+ (99% context reduction)  
✅ **Intelligent**: Automatic tool selection, no manual picking  
✅ **Fast**: No context overflow, faster responses  
✅ **User-friendly**: Natural language input, no tool names needed  
✅ **Extendable**: Add unlimited tools without affecting clients  

---

## Architecture Overview

### Current Architecture (Broken)

```
┌─────────────────┐
│   LM Studio     │
│   (Client)      │
└────────┬────────┘
         │ MCP: listTools()
         ↓
┌─────────────────────────────┐
│   GameDev Hub               │
│   Returns: 75 tools         │ ← Context Overflow!
│   - obsidian__search_notes  │
│   - blender__create_cube    │
│   - github__list_repos      │
│   ... (72 more)             │
└────────┬────────────────────┘
         │ User picks tool manually
         ↓
      Tool Execution
```

**Problems**:
- 75 tools × ~120 chars = 9,000+ chars in context
- LLM overwhelmed with choices
- Doesn't scale beyond ~100 tools

### New Architecture (Smart Router)

```
┌─────────────────┐
│   LM Studio     │
│   (Client)      │
└────────┬────────┘
         │ MCP: listTools()
         ↓
┌─────────────────────────────┐
│   GameDev Hub               │
│   Returns: 1 tool           │ ← Minimal Context!
│   - smart_route             │
└────────┬────────────────────┘
         │ User: "Search my notes for AI"
         ↓
┌─────────────────────────────┐
│   Smart Router              │
│   1. Parse intent           │
│   2. Search tool registry   │
│   3. Select best tool       │
│   4. Execute tool           │
│   5. Return result          │
└────────┬────────────────────┘
         │ Executed: obsidian__search_notes
         ↓
      Result to User
```

**Benefits**:
- 1 tool × ~150 chars = 150 chars in context (94% reduction!)
- Router handles complexity
- Scales to 1000+ tools

---

## Component Design

### 1. Smart Router Tool Interface

**Tool Name**: `smart_route`

**Description**: "Intelligently route your request to the best available tool(s). Just describe what you want to do in natural language."

**Input Schema**:
```json
{
  "type": "object",
  "properties": {
    "task": {
      "type": "string",
      "description": "Natural language description of what you want to do"
    },
    "context": {
      "type": "object",
      "description": "Optional context (previous results, preferences, etc.)",
      "properties": {
        "previousResult": { "type": "string" },
        "serverPreference": { "type": "string" },
        "multiStepMode": { "type": "boolean" }
      }
    },
    "options": {
      "type": "object",
      "description": "Routing options",
      "properties": {
        "returnCandidates": { 
          "type": "boolean",
          "description": "Return candidate tools instead of auto-executing"
        },
        "maxResults": {
          "type": "number",
          "description": "Max number of results to return"
        },
        "allowMultiTool": {
          "type": "boolean",
          "description": "Allow chaining multiple tools"
        }
      }
    }
  },
  "required": ["task"]
}
```

**Output Schema**:
```json
{
  "type": "object",
  "properties": {
    "result": {
      "type": "object",
      "description": "Result from executed tool(s)"
    },
    "executedTools": {
      "type": "array",
      "description": "List of tools that were executed"
    },
    "confidence": {
      "type": "number",
      "description": "Confidence score (0-1) for the routing decision"
    },
    "alternatives": {
      "type": "array",
      "description": "Alternative tools that could have been used"
    },
    "needsClarification": {
      "type": "boolean",
      "description": "Whether user clarification is needed"
    },
    "clarificationQuestion": {
      "type": "string",
      "description": "Question to ask user for clarification"
    }
  }
}
```

### 2. Enhanced Tool Metadata

Every tool needs rich metadata for intelligent routing:

```typescript
interface EnhancedToolMetadata {
  name: string;
  description: string; // Keep short for context efficiency
  longDescription?: string; // Full description for router only
  
  // Search optimization
  tags: string[]; // ["search", "notes", "obsidian"]
  keywords: string[]; // ["find", "query", "lookup"]
  category: string; // "knowledge-management"
  
  // Routing hints
  useCases: string[]; // ["Find information in notes", "Search vault"]
  examples: string[]; // ["Search for AI notes", "Find todos"]
  
  // Semantic search (optional)
  embedding?: number[]; // Vector embedding for semantic search
  
  // Constraints
  requiredParams: string[];
  optionalParams: string[];
  
  // Performance
  estimatedLatency: number; // milliseconds
  rateLimit?: { calls: number; period: number };
  
  // Chaining
  canChainWith?: string[]; // Other tools this pairs well with
  typicalWorkflows?: string[]; // Common multi-tool patterns
}
```

### 3. Routing Engine

**Core Algorithm**:

```typescript
class RoutingEngine {
  private toolRegistry: EnhancedToolRegistry;
  private intentParser: IntentParser;
  private candidateRanker: CandidateRanker;
  private workflowPlanner: WorkflowPlanner;
  
  async route(task: string, options?: RouteOptions): Promise<RouteResult> {
    // Step 1: Parse intent
    const intent = await this.intentParser.parse(task);
    
    // Step 2: Find candidate tools
    const candidates = await this.findCandidates(intent);
    
    // Step 3: Rank candidates
    const rankedTools = await this.candidateRanker.rank(candidates, intent);
    
    // Step 4: Check if multi-tool workflow needed
    const workflow = await this.workflowPlanner.plan(intent, rankedTools);
    
    // Step 5: Execute or request clarification
    if (rankedTools[0].confidence < 0.7) {
      return this.requestClarification(rankedTools);
    }
    
    if (workflow.steps.length > 1) {
      return this.executeWorkflow(workflow);
    }
    
    return this.executeSingleTool(rankedTools[0]);
  }
  
  private async findCandidates(intent: Intent): Promise<Tool[]> {
    const candidates = [];
    
    // Strategy 1: Category match
    candidates.push(...this.searchByCategory(intent.category));
    
    // Strategy 2: Keyword match
    candidates.push(...this.searchByKeywords(intent.keywords));
    
    // Strategy 3: Use case match
    candidates.push(...this.searchByUseCase(intent.useCase));
    
    // Strategy 4: Semantic search (if available)
    if (this.hasEmbeddings) {
      candidates.push(...this.semanticSearch(intent.embedding));
    }
    
    return this.deduplicateAndFilter(candidates);
  }
}
```

### 4. Intent Parser

```typescript
interface Intent {
  action: string; // "search", "create", "update", "delete", "list"
  target: string; // "notes", "files", "repos", "objects"
  category: string; // "knowledge-management", "version-control", etc.
  keywords: string[];
  useCase: string;
  embedding?: number[]; // For semantic search
  confidence: number;
}

class IntentParser {
  parse(task: string): Intent {
    // Extract action verbs
    const action = this.extractAction(task);
    
    // Extract target nouns
    const target = this.extractTarget(task);
    
    // Infer category
    const category = this.inferCategory(action, target);
    
    // Extract keywords
    const keywords = this.extractKeywords(task);
    
    // Generate use case description
    const useCase = this.generateUseCase(action, target);
    
    // Calculate confidence
    const confidence = this.calculateConfidence(action, target, category);
    
    return { action, target, category, keywords, useCase, confidence };
  }
  
  private extractAction(task: string): string {
    // Pattern matching for common verbs
    const actionPatterns = {
      search: /\b(search|find|look|query|locate)\b/i,
      create: /\b(create|make|new|add|generate)\b/i,
      update: /\b(update|modify|edit|change|set)\b/i,
      delete: /\b(delete|remove|destroy|clear)\b/i,
      list: /\b(list|show|get|display|view)\b/i,
      execute: /\b(run|execute|perform|do)\b/i,
    };
    
    for (const [action, pattern] of Object.entries(actionPatterns)) {
      if (pattern.test(task)) return action;
    }
    
    return 'unknown';
  }
}
```

### 5. Candidate Ranker

```typescript
interface RankedCandidate {
  tool: Tool;
  score: number;
  confidence: number;
  matchReasons: string[];
}

class CandidateRanker {
  rank(candidates: Tool[], intent: Intent): RankedCandidate[] {
    const scored = candidates.map(tool => ({
      tool,
      score: this.calculateScore(tool, intent),
      confidence: this.calculateConfidence(tool, intent),
      matchReasons: this.getMatchReasons(tool, intent),
    }));
    
    return scored.sort((a, b) => b.score - a.score);
  }
  
  private calculateScore(tool: Tool, intent: Intent): number {
    let score = 0;
    
    // Category match (40%)
    if (tool.category === intent.category) score += 0.4;
    
    // Keyword match (30%)
    const keywordMatches = tool.keywords.filter(k => 
      intent.keywords.includes(k)
    ).length;
    score += (keywordMatches / intent.keywords.length) * 0.3;
    
    // Use case match (20%)
    const useCaseMatch = tool.useCases.some(uc => 
      this.similarity(uc, intent.useCase) > 0.8
    );
    if (useCaseMatch) score += 0.2;
    
    // Server availability (10%)
    if (tool.serverStatus === 'connected') score += 0.1;
    
    return score;
  }
}
```

### 6. Workflow Planner

```typescript
interface Workflow {
  steps: WorkflowStep[];
  dependencies: Map<number, number[]>; // step index -> depends on steps
  estimatedDuration: number;
}

interface WorkflowStep {
  tool: Tool;
  input: Record<string, unknown>;
  outputName: string; // Name to reference in subsequent steps
}

class WorkflowPlanner {
  plan(intent: Intent, rankedTools: RankedCandidate[]): Workflow {
    // Check if multi-step workflow is needed
    if (!this.isMultiStep(intent)) {
      return {
        steps: [{ 
          tool: rankedTools[0].tool, 
          input: this.prepareInput(intent, rankedTools[0].tool),
          outputName: 'result'
        }],
        dependencies: new Map(),
        estimatedDuration: rankedTools[0].tool.estimatedLatency,
      };
    }
    
    // Plan multi-step workflow
    return this.buildWorkflow(intent, rankedTools);
  }
  
  private isMultiStep(intent: Intent): boolean {
    // Check for chaining indicators
    const chainIndicators = [
      /\b(then|after|and then)\b/i,
      /\b(search .* and (update|modify|change))\b/i,
      /\b(create .* and (add|attach))\b/i,
    ];
    
    return chainIndicators.some(pattern => pattern.test(intent.useCase));
  }
}
```

---

## Implementation Plan

### Phase 1: Core Router (Week 1)

**Goal**: Basic routing with single-tool execution

**Tasks**:
1. Create `SmartRouter` class
2. Implement `IntentParser` with pattern matching
3. Implement basic `CandidateRanker` (category + keyword match)
4. Create `smart_route` tool interface
5. Unit tests for core routing logic

**Deliverables**:
- `src/routing/smart-router.ts`
- `src/routing/intent-parser.ts`
- `src/routing/candidate-ranker.ts`
- Unit tests: 80% coverage

### Phase 2: Enhanced Metadata (Week 2)

**Goal**: Rich tool metadata for better routing

**Tasks**:
1. Define `EnhancedToolMetadata` schema
2. Update all 75 tools with metadata
3. Create metadata validation
4. Add metadata to tool registry

**Deliverables**:
- `src/types/enhanced-tool-metadata.ts`
- Updated tool definitions in adapters
- Validation script: `scripts/validate-metadata.ts`

### Phase 3: Multi-Tool Workflows (Week 3)

**Goal**: Chain multiple tools intelligently

**Tasks**:
1. Implement `WorkflowPlanner`
2. Add workflow execution engine
3. Handle dependencies between steps
4. Add workflow templates for common patterns

**Deliverables**:
- `src/routing/workflow-planner.ts`
- `src/routing/workflow-executor.ts`
- Workflow templates in `config/workflows/`

### Phase 4: Clarification & Feedback (Week 4)

**Goal**: Handle ambiguous requests gracefully

**Tasks**:
1. Add confidence thresholds
2. Generate clarification questions
3. Return alternative suggestions
4. Add user feedback loop

**Deliverables**:
- `src/routing/clarification-generator.ts`
- Confidence threshold config
- Feedback mechanism

### Phase 5: Optimization (Week 5)

**Goal**: Performance and scalability

**Tasks**:
1. Add caching for frequent routes
2. Optimize intent parsing
3. Add semantic search (optional)
4. Performance benchmarks

**Deliverables**:
- Route caching system
- Benchmark results
- Semantic search integration (if needed)

---

## Unit Test Plan

### Test Suite Structure

```
tests/routing/
├── smart-router.test.ts
├── intent-parser.test.ts
├── candidate-ranker.test.ts
├── workflow-planner.test.ts
├── clarification-generator.test.ts
└── integration/
    ├── end-to-end.test.ts
    ├── performance.test.ts
    └── edge-cases.test.ts
```

### 1. Intent Parser Tests

```typescript
describe('IntentParser', () => {
  describe('extractAction', () => {
    it('should identify search action', () => {
      const intent = parser.parse('Find notes about AI');
      expect(intent.action).toBe('search');
    });
    
    it('should identify create action', () => {
      const intent = parser.parse('Create a new scene in Blender');
      expect(intent.action).toBe('create');
    });
    
    it('should identify update action', () => {
      const intent = parser.parse('Modify the lighting in my scene');
      expect(intent.action).toBe('update');
    });
  });
  
  describe('extractTarget', () => {
    it('should identify notes target', () => {
      const intent = parser.parse('Search my notes for AI');
      expect(intent.target).toBe('notes');
    });
    
    it('should identify repository target', () => {
      const intent = parser.parse('List my GitHub repositories');
      expect(intent.target).toBe('repositories');
    });
  });
  
  describe('inferCategory', () => {
    it('should infer knowledge-management for notes', () => {
      const intent = parser.parse('Search notes');
      expect(intent.category).toBe('knowledge-management');
    });
    
    it('should infer version-control for git operations', () => {
      const intent = parser.parse('Create GitHub issue');
      expect(intent.category).toBe('version-control');
    });
  });
  
  describe('confidence', () => {
    it('should have high confidence for clear intents', () => {
      const intent = parser.parse('Search Obsidian notes for AI');
      expect(intent.confidence).toBeGreaterThan(0.9);
    });
    
    it('should have low confidence for vague intents', () => {
      const intent = parser.parse('Do something');
      expect(intent.confidence).toBeLessThan(0.5);
    });
  });
});
```

### 2. Candidate Ranker Tests

```typescript
describe('CandidateRanker', () => {
  const mockTools = [
    {
      name: 'obsidian__search_notes',
      category: 'knowledge-management',
      keywords: ['search', 'find', 'notes'],
      useCases: ['Find information in notes'],
      serverStatus: 'connected',
    },
    {
      name: 'github__search_code',
      category: 'version-control',
      keywords: ['search', 'find', 'code'],
      useCases: ['Find code in repositories'],
      serverStatus: 'connected',
    },
  ];
  
  describe('rank', () => {
    it('should rank exact category match highest', () => {
      const intent = {
        action: 'search',
        target: 'notes',
        category: 'knowledge-management',
        keywords: ['search', 'notes'],
      };
      
      const ranked = ranker.rank(mockTools, intent);
      expect(ranked[0].tool.name).toBe('obsidian__search_notes');
    });
    
    it('should consider keyword matches', () => {
      const intent = {
        action: 'search',
        target: 'code',
        category: 'version-control',
        keywords: ['search', 'code', 'repository'],
      };
      
      const ranked = ranker.rank(mockTools, intent);
      expect(ranked[0].tool.name).toBe('github__search_code');
    });
  });
  
  describe('calculateScore', () => {
    it('should give higher score for connected servers', () => {
      const connectedTool = { ...mockTools[0], serverStatus: 'connected' };
      const disconnectedTool = { ...mockTools[0], serverStatus: 'disconnected' };
      
      const scoreConnected = ranker.calculateScore(connectedTool, intent);
      const scoreDisconnected = ranker.calculateScore(disconnectedTool, intent);
      
      expect(scoreConnected).toBeGreaterThan(scoreDisconnected);
    });
  });
});
```

### 3. Smart Router Integration Tests

```typescript
describe('SmartRouter (Integration)', () => {
  let router: SmartRouter;
  let hubServer: HubServer;
  
  beforeEach(async () => {
    hubServer = await createTestHubServer();
    router = new SmartRouter(hubServer);
  });
  
  describe('single tool routing', () => {
    it('should route "search notes" to obsidian__search_notes', async () => {
      const result = await router.route({
        task: 'Search my notes for AI',
      });
      
      expect(result.executedTools).toContain('obsidian__search_notes');
      expect(result.confidence).toBeGreaterThan(0.8);
      expect(result.needsClarification).toBe(false);
    });
    
    it('should route "list repos" to github__list_repos', async () => {
      const result = await router.route({
        task: 'Show me my GitHub repositories',
      });
      
      expect(result.executedTools).toContain('github__list_repos');
    });
  });
  
  describe('multi-tool workflows', () => {
    it('should chain search and update operations', async () => {
      const result = await router.route({
        task: 'Find note about AI and add tag #important',
        options: { allowMultiTool: true },
      });
      
      expect(result.executedTools).toHaveLength(2);
      expect(result.executedTools[0]).toBe('obsidian__search_notes');
      expect(result.executedTools[1]).toBe('obsidian__update_note');
    });
  });
  
  describe('clarification handling', () => {
    it('should request clarification for ambiguous tasks', async () => {
      const result = await router.route({
        task: 'Search for something',
      });
      
      expect(result.needsClarification).toBe(true);
      expect(result.clarificationQuestion).toBeDefined();
      expect(result.alternatives.length).toBeGreaterThan(1);
    });
  });
  
  describe('error handling', () => {
    it('should handle tool execution failures gracefully', async () => {
      const result = await router.route({
        task: 'Search disconnected server',
      });
      
      expect(result.error).toBeDefined();
      expect(result.alternatives).toBeDefined();
    });
  });
});
```

### 4. Performance Tests

```typescript
describe('Performance', () => {
  it('should route requests in under 100ms', async () => {
    const start = Date.now();
    await router.route({ task: 'Search notes for AI' });
    const duration = Date.now() - start;
    
    expect(duration).toBeLessThan(100);
  });
  
  it('should handle 1000+ tools efficiently', async () => {
    // Create 1000 mock tools
    const manyTools = createMockTools(1000);
    const router = new SmartRouter(hubServerWithManyTools);
    
    const start = Date.now();
    await router.route({ task: 'Search notes' });
    const duration = Date.now() - start;
    
    expect(duration).toBeLessThan(200); // Still fast with 1000 tools
  });
  
  it('should cache frequent routes', async () => {
    // First call
    const start1 = Date.now();
    await router.route({ task: 'Search notes for AI' });
    const duration1 = Date.now() - start1;
    
    // Second call (cached)
    const start2 = Date.now();
    await router.route({ task: 'Search notes for AI' });
    const duration2 = Date.now() - start2;
    
    expect(duration2).toBeLessThan(duration1 * 0.5); // At least 50% faster
  });
});
```

### 5. Edge Case Tests

```typescript
describe('Edge Cases', () => {
  it('should handle empty task string', async () => {
    const result = await router.route({ task: '' });
    expect(result.needsClarification).toBe(true);
  });
  
  it('should handle very long task descriptions', async () => {
    const longTask = 'Search for ' + 'AI '.repeat(1000);
    const result = await router.route({ task: longTask });
    expect(result).toBeDefined();
  });
  
  it('should handle special characters', async () => {
    const result = await router.route({ 
      task: 'Search for "AI" & ML (2024) #important' 
    });
    expect(result).toBeDefined();
  });
  
  it('should handle non-English input gracefully', async () => {
    const result = await router.route({ task: 'Buscar notas sobre IA' });
    // Should either handle or request clarification
    expect(result.needsClarification || result.executedTools).toBeDefined();
  });
});
```

---

## Configuration

### Router Configuration

```json
{
  "routing": {
    "confidenceThreshold": 0.7,
    "maxCandidates": 5,
    "enableMultiTool": true,
    "enableCaching": true,
    "cacheSize": 1000,
    "cacheTTL": 3600,
    "semanticSearch": {
      "enabled": false,
      "model": "all-MiniLM-L6-v2",
      "similarityThreshold": 0.75
    },
    "clarification": {
      "enabled": true,
      "showAlternatives": 3,
      "explainReasoning": true
    },
    "performance": {
      "maxRoutingTime": 100,
      "timeoutMs": 5000,
      "enableMetrics": true
    }
  }
}
```

---

## Success Metrics

### Performance

- **Routing Latency**: < 100ms (p95)
- **Accuracy**: > 90% correct tool selection
- **Context Usage**: < 200 chars (vs 9000+ currently)
- **Scalability**: Support 1000+ tools without degradation

### User Experience

- **Clarification Rate**: < 20% of requests
- **User Satisfaction**: > 4.5/5 stars
- **Task Success Rate**: > 95%

### Technical

- **Test Coverage**: > 85%
- **Uptime**: > 99.9%
- **Cache Hit Rate**: > 60%

---

## Example Usage

### Simple Task

**Input**:
```json
{
  "task": "Search my notes for AI"
}
```

**Output**:
```json
{
  "result": {
    "notes": [
      { "path": "AI/ChatGPT.md", "excerpt": "..." },
      { "path": "AI/LocalLLMs.md", "excerpt": "..." }
    ]
  },
  "executedTools": ["obsidian__search_notes"],
  "confidence": 0.95,
  "alternatives": []
}
```

### Multi-Step Task

**Input**:
```json
{
  "task": "Find my latest commit and create a GitHub issue about it",
  "options": { "allowMultiTool": true }
}
```

**Output**:
```json
{
  "result": {
    "commit": { "sha": "abc123", "message": "..." },
    "issue": { "number": 42, "url": "..." }
  },
  "executedTools": ["github__get_recent_commits", "github__create_issue"],
  "confidence": 0.88,
  "workflowSteps": 2
}
```

### Ambiguous Task (Clarification)

**Input**:
```json
{
  "task": "Find something"
}
```

**Output**:
```json
{
  "needsClarification": true,
  "clarificationQuestion": "What would you like to find?",
  "alternatives": [
    { "tool": "obsidian__search_notes", "description": "Search your notes" },
    { "tool": "github__search_code", "description": "Search GitHub repositories" },
    { "tool": "blender__list_objects", "description": "Find Blender objects" }
  ],
  "confidence": 0.3
}
```

---

## Risks & Mitigations

### Risk 1: Low Routing Accuracy

**Risk**: Router selects wrong tool frequently

**Mitigation**:
- Comprehensive tool metadata
- User feedback loop
- A/B testing different ranking algorithms
- Fallback to clarification when confidence low

### Risk 2: Performance Degradation

**Risk**: Routing becomes slow with many tools

**Mitigation**:
- Aggressive caching
- Indexed tool registry
- Parallel candidate search
- Semantic search offloaded to dedicated service (optional)

### Risk 3: Complex Workflow Failures

**Risk**: Multi-tool workflows fail mid-execution

**Mitigation**:
- Atomic rollback on failure
- Checkpointing for long workflows
- Clear error messages with recovery suggestions
- Retry logic with exponential backoff

### Risk 4: User Confusion

**Risk**: Users don't understand natural language interface

**Mitigation**:
- Clear documentation with examples
- Helpful clarification questions
- Show what was executed (transparency)
- Provide direct tool access as fallback

---

## Future Enhancements

### Phase 6: Learning & Adaptation
- Learn from user feedback
- Personalized routing based on user patterns
- Auto-tune confidence thresholds

### Phase 7: Advanced Features
- Voice input support
- Image/diagram input for visual tasks
- Scheduling and automation
- Collaborative workflows

### Phase 8: Scale
- Distributed routing for massive tool counts
- Plugin architecture for custom routers
- Multi-hub routing (route across multiple hubs)

---

## Appendix

### A. Tool Metadata Migration Script

```typescript
// Script to help migrate existing tools to enhanced metadata
async function migrateToolMetadata(toolName: string) {
  const tool = await loadTool(toolName);
  
  const enhanced: EnhancedToolMetadata = {
    ...tool,
    tags: inferTags(tool.description),
    keywords: inferKeywords(tool.name, tool.description),
    useCases: generateUseCases(tool.description),
    examples: generateExamples(tool.inputSchema),
    estimatedLatency: 1000, // Default 1s, measure actual later
  };
  
  await saveTool(toolName, enhanced);
}
```

### B. Semantic Search Setup (Optional)

If semantic search is needed for very large tool counts (500+):

```bash
# Install sentence-transformers
pip install sentence-transformers

# Generate embeddings for all tools
node scripts/generate-embeddings.js

# Store in vector database (optional)
# Options: Chroma, Pinecone, Weaviate, or simple in-memory
```

### C. Monitoring Dashboard

Track router performance:
- Requests per minute
- Average routing time
- Accuracy (correct tool selected)
- Clarification rate
- Cache hit rate
- Top tools used
- Failed requests

---

**END OF SPECIFICATION**

