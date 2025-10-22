/**
 * Smart Router - Intelligent tool routing with Spec-Kit integration
 * Single tool interface that routes to 1000+ tools
 */

import type {
  RouteRequest,
  RouteResult,
  Intent,
  Specification,
  EnhancedToolMetadata,
} from '../types/routing-types.js';
import { SpecKitProcessor } from './spec-kit-processor.js';
import { IntentParser } from './intent-parser.js';
import { CandidateRanker, type RankedCandidate } from './candidate-ranker.js';
import { Logger } from '../utils/logger.js';

const logger = Logger.getInstance();

export class SmartRouter {
  private specKitProcessor: SpecKitProcessor;
  private intentParser: IntentParser;
  private candidateRanker: CandidateRanker;
  private toolRegistry: Map<string, EnhancedToolMetadata>;
  
  // Configuration
  private confidenceThreshold = 0.7;
  private maxCandidates = 5;
  
  constructor(toolRegistry: Map<string, EnhancedToolMetadata>) {
    this.specKitProcessor = new SpecKitProcessor();
    this.intentParser = new IntentParser();
    this.candidateRanker = new CandidateRanker();
    this.toolRegistry = toolRegistry;
    
    logger.info(`[SmartRouter] Initialized with ${toolRegistry.size} tools`);
  }
  
  /**
   * Route a request to the best tool(s)
   */
  async route(request: RouteRequest): Promise<RouteResult> {
    const startTime = Date.now();
    logger.info(`[SmartRouter] Routing request: "${request.task}"`);
    
    try {
      // Step 1: Create formal specification
      const spec = await this.specKitProcessor.createSpec(request.task, request.context);
      logger.info(`[SmartRouter] Created spec: "${spec.title}"`);
      
      // Step 2: Parse intent
      const intent = this.intentParser.parse(request.task);
      logger.info(`[SmartRouter] Parsed intent: ${intent.action} ${intent.target} (confidence: ${intent.confidence.toFixed(2)})`);
      
      // Step 3: Find candidate tools
      const candidates = this.findCandidates(intent);
      logger.info(`[SmartRouter] Found ${candidates.length} candidate tools`);
      
      // Step 4: Rank candidates
      const rankedCandidates = this.candidateRanker.rank(candidates, intent);
      
      // Step 5: Check if we need clarification
      const topCandidate = rankedCandidates[0];
      if (!topCandidate || topCandidate.confidence < this.confidenceThreshold) {
        return this.requestClarification(
          spec,
          intent,
          rankedCandidates.slice(0, this.maxCandidates),
          Date.now() - startTime
        );
      }
      
      // Step 6: Return candidate for execution (single tool for now)
      // In Phase 5, this will handle multi-tool workflows
      return {
        success: true,
        routeType: 'direct',
        spec,
        executedTools: [topCandidate.tool.name],
        confidence: topCandidate.confidence,
        executionTime: Date.now() - startTime,
        alternatives: rankedCandidates.slice(1, 4).map(c => ({
          tool: c.tool.name,
          score: c.score,
          confidence: c.confidence,
          matchReasons: c.matchReasons,
          description: c.tool.description,
        })),
      };
      
    } catch (error) {
      logger.error('[SmartRouter] Routing failed:', error);
      return {
        success: false,
        routeType: 'direct',
        confidence: 0,
        error: error instanceof Error ? error.message : 'Unknown error',
        executionTime: Date.now() - startTime,
      };
    }
  }
  
  /**
   * Find candidate tools based on intent
   */
  private findCandidates(intent: Intent): EnhancedToolMetadata[] {
    const candidates: EnhancedToolMetadata[] = [];
    
    // Strategy 1: Category match
    for (const tool of this.toolRegistry.values()) {
      if (tool.category === intent.category) {
        candidates.push(tool);
      }
    }
    
    // Strategy 2: Keyword match
    for (const tool of this.toolRegistry.values()) {
      const hasKeywordMatch = tool.keywords.some(k => 
        intent.keywords.includes(k.toLowerCase())
      );
      if (hasKeywordMatch && !candidates.includes(tool)) {
        candidates.push(tool);
      }
    }
    
    // Strategy 3: Use case match (fuzzy)
    for (const tool of this.toolRegistry.values()) {
      const hasUseCaseMatch = tool.useCases.some(uc => 
        uc.toLowerCase().includes(intent.action) || 
        uc.toLowerCase().includes(intent.target)
      );
      if (hasUseCaseMatch && !candidates.includes(tool)) {
        candidates.push(tool);
      }
    }
    
    // If no candidates, return all tools (will be ranked anyway)
    if (candidates.length === 0) {
      return Array.from(this.toolRegistry.values());
    }
    
    return candidates;
  }
  
  /**
   * Request clarification from user
   */
  private requestClarification(
    spec: Specification,
    intent: Intent,
    alternatives: RankedCandidate[],
    executionTime: number
  ): RouteResult {
    logger.info('[SmartRouter] Requesting clarification');
    
    const question = this.generateClarificationQuestion(intent, alternatives);
    
    return {
      success: false,
      routeType: 'direct',
      spec,
      confidence: intent.confidence,
      needsClarification: true,
      clarificationQuestion: question,
      alternatives: alternatives.map(c => ({
        tool: c.tool.name,
        score: c.score,
        confidence: c.confidence,
        matchReasons: c.matchReasons,
        description: c.tool.description,
      })),
      executionTime,
    };
  }
  
  /**
   * Generate clarification question
   */
  private generateClarificationQuestion(intent: Intent, alternatives: RankedCandidate[]): string {
    if (alternatives.length === 0) {
      return `I couldn't find any tools for "${intent.action} ${intent.target}". Could you rephrase your request?`;
    }
    
    if (alternatives.length === 1) {
      return `Did you want to use ${alternatives[0].tool.name}? (${alternatives[0].tool.description})`;
    }
    
    const topTwo = alternatives.slice(0, 2);
    return `I found multiple tools. Did you want to:\n` +
      topTwo.map((c, i) => 
        `${i + 1}. ${c.tool.name} - ${c.tool.description}`
      ).join('\n');
  }
  
  /**
   * Get router statistics
   */
  getStats(): {
    toolCount: number;
    confidenceThreshold: number;
    maxCandidates: number;
  } {
    return {
      toolCount: this.toolRegistry.size,
      confidenceThreshold: this.confidenceThreshold,
      maxCandidates: this.maxCandidates,
    };
  }
  
  /**
   * Update configuration
   */
  updateConfig(config: {
    confidenceThreshold?: number;
    maxCandidates?: number;
  }): void {
    if (config.confidenceThreshold !== undefined) {
      this.confidenceThreshold = config.confidenceThreshold;
      logger.info(`[SmartRouter] Updated confidence threshold: ${this.confidenceThreshold}`);
    }
    if (config.maxCandidates !== undefined) {
      this.maxCandidates = config.maxCandidates;
      logger.info(`[SmartRouter] Updated max candidates: ${this.maxCandidates}`);
    }
  }
}
