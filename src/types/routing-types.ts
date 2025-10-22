/**
 * Routing Types - Core interfaces for Smart Router
 */

// Spec-Kit Integration
export interface Specification {
  title: string;
  motivation: string;
  requirements: {
    functional: string[];
    nonFunctional: string[];
  };
  constraints: {
    technical: string[];
    performance: string[];
    budget: string[];
  };
  acceptanceCriteria: string[];
  successMetrics: string[];
  workflow: WorkflowStep[];
  guardrails: Guardrail[];
}

export interface WorkflowStep {
  step: number;
  description: string;
  tool?: string;
  dependencies?: number[];
  estimatedDuration?: number;
}

export interface Guardrail {
  type: 'constraint' | 'validation' | 'requirement';
  description: string;
  severity: 'error' | 'warning' | 'info';
}

// Intent Parsing
export interface Intent {
  action: string; // search, create, update, delete, list, execute
  target: string; // notes, files, repos, objects, etc.
  category: string; // knowledge-management, version-control, etc.
  keywords: string[];
  useCase: string;
  embedding?: number[];
  confidence: number;
}

export interface Context {
  previousResult?: unknown;
  serverPreference?: string;
  multiStepMode?: boolean;
  userHistory?: string[];
}

// Routing
export interface RouteRequest {
  task: string;
  context?: Context;
  options?: RouteOptions;
}

export interface RouteOptions {
  returnCandidates?: boolean;
  maxResults?: number;
  allowMultiTool?: boolean;
  preferredPattern?: AgentPattern;
}

export interface RouteResult {
  success: boolean;
  routeType: 'skill' | 'direct' | 'workflow';
  
  // Spec-Kit
  spec?: Specification;
  
  // Execution
  executedTools?: string[];
  skill?: string;
  agentPattern?: AgentPattern;
  
  // Results
  result?: unknown;
  artifacts?: string[];
  
  // Metadata
  confidence: number;
  executionTime?: number;
  
  // Clarification
  needsClarification?: boolean;
  clarificationQuestion?: string;
  alternatives?: CandidateMatch[];
  
  // Quality
  meetsAcceptanceCriteria?: boolean;
  patternRecorded?: boolean;
  
  // Error handling
  error?: string;
}

export interface CandidateMatch {
  tool: string;
  score: number;
  confidence: number;
  matchReasons: string[];
  description: string;
}

// Agent Patterns (from Factory AI)
export enum AgentPattern {
  CODE = 'code',           // Feature dev, bug fixes
  KNOWLEDGE = 'knowledge', // Research, documentation
  RELIABILITY = 'reliability', // Production alerts
  PRODUCT = 'product',     // PM automation
  TUTORIAL = 'tutorial',   // Onboarding
}

// Skills
export enum SkillCategory {
  CREATIVE = 'creative',
  TECHNICAL = 'technical',
  AUTOMATION = 'automation',
  DOCUMENTATION = 'documentation',
  TESTING = 'testing',
  DESIGN = 'design',
}

export interface Skill {
  name: string;
  description: string;
  category: SkillCategory;
  
  // Workflow
  workflowSteps: WorkflowStep[];
  examples: string[];
  bestPractices: string[];
  
  // Spec-Kit integration
  defaultSpec?: Specification;
  acceptanceCriteria: string[];
  
  // Factory agent pattern
  agentPattern: AgentPattern;
  
  // Metadata
  tags: string[];
  keywords: string[];
  useCases: string[];
  
  // Performance
  successRate: number;
  usageCount: number;
  feedbackScore: number;
  
  // Execution
  execute: (task: string, context: Context) => Promise<SkillResult>;
}

export interface SkillResult {
  success: boolean;
  output: unknown;
  artifacts?: string[];
  executionTime: number;
  meetsAcceptanceCriteria: boolean;
  error?: string;
}

// Prompt Engineering
export interface PromptTemplate {
  name: string;
  pattern: string;
  variables: string[];
  examples: Example[];
  guardrails: Guardrail[];
  constraints: Constraint[];
}

export interface Example {
  input: string;
  output: string;
  explanation?: string;
}

export interface Constraint {
  type: string;
  value: unknown;
  description: string;
}

// Skill Sharing
export interface ExecutionPattern {
  task: string;
  skill: string;
  tools: string[];
  embedding?: number[];
  context: Context;
  successRate: number;
}

export interface SkillShare {
  pattern: ExecutionPattern;
  successRate: number;
  usageCount: number;
  contexts: Context[];
  improvements: Improvement[];
}

export interface Improvement {
  description: string;
  confidence: number;
  appliesTo: string[];
}

// Tool Metadata (Enhanced)
export interface EnhancedToolMetadata {
  name: string;
  description: string;
  longDescription?: string;
  
  // Search optimization
  tags: string[];
  keywords: string[];
  category: string;
  
  // Routing hints
  useCases: string[];
  examples: string[];
  
  // Semantic search
  embedding?: number[];
  
  // Constraints
  requiredParams: string[];
  optionalParams: string[];
  
  // Performance
  estimatedLatency: number;
  rateLimit?: { calls: number; period: number };
  
  // Chaining
  canChainWith?: string[];
  typicalWorkflows?: string[];
  
  // Server info
  server: string;
  serverStatus: 'connected' | 'disconnected' | 'error';
}
