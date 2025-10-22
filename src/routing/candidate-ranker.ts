/**
 * Candidate Ranker - Score and rank tool candidates for a given intent
 */

import type { Intent, EnhancedToolMetadata } from '../types/routing-types.js';
import { Logger } from '../utils/logger.js';

const logger = Logger.getInstance();

export interface RankedCandidate {
  tool: EnhancedToolMetadata;
  score: number;
  confidence: number;
  matchReasons: string[];
}

export class CandidateRanker {
  /**
   * Rank tool candidates based on intent
   */
  rank(candidates: EnhancedToolMetadata[], intent: Intent): RankedCandidate[] {
    logger.info(`[CandidateRanker] Ranking ${candidates.length} candidates`);
    
    const scored = candidates.map(tool => ({
      tool,
      score: this.calculateScore(tool, intent),
      confidence: this.calculateConfidence(tool, intent),
      matchReasons: this.getMatchReasons(tool, intent),
    }));
    
    // Sort by score descending
    const sorted = scored.sort((a, b) => b.score - a.score);
    
    logger.info(`[CandidateRanker] Top match: ${sorted[0]?.tool.name} (score: ${sorted[0]?.score.toFixed(2)})`);
    
    return sorted;
  }
  
  /**
   * Calculate match score for a tool
   */
  private calculateScore(tool: EnhancedToolMetadata, intent: Intent): number {
    let score = 0;
    
    // Category match (40% weight)
    if (tool.category === intent.category) {
      score += 0.4;
    }
    
    // Keyword match (30% weight)
    const keywordMatches = tool.keywords.filter(k => 
      intent.keywords.includes(k.toLowerCase())
    ).length;
    
    if (intent.keywords.length > 0) {
      score += (keywordMatches / intent.keywords.length) * 0.3;
    }
    
    // Use case match (20% weight)
    const useCaseMatch = tool.useCases.some(uc => 
      this.similarity(uc.toLowerCase(), intent.useCase.toLowerCase()) > 0.7
    );
    if (useCaseMatch) {
      score += 0.2;
    }
    
    // Server availability (10% weight)
    if (tool.serverStatus === 'connected') {
      score += 0.1;
    }
    
    return Math.min(score, 1.0); // Cap at 1.0
  }
  
  /**
   * Calculate confidence in the match
   */
  private calculateConfidence(tool: EnhancedToolMetadata, intent: Intent): number {
    // Confidence is based on:
    // 1. Match score
    // 2. Intent confidence
    // 3. Tool usage history (if available)
    
    const matchScore = this.calculateScore(tool, intent);
    const intentConfidence = intent.confidence;
    
    // Weighted average
    return (matchScore * 0.6) + (intentConfidence * 0.4);
  }
  
  /**
   * Get human-readable match reasons
   */
  private getMatchReasons(tool: EnhancedToolMetadata, intent: Intent): string[] {
    const reasons: string[] = [];
    
    // Category match
    if (tool.category === intent.category) {
      reasons.push(`Category match: ${tool.category}`);
    }
    
    // Keyword matches
    const keywordMatches = tool.keywords.filter(k => 
      intent.keywords.includes(k.toLowerCase())
    );
    if (keywordMatches.length > 0) {
      reasons.push(`Keywords: ${keywordMatches.join(', ')}`);
    }
    
    // Use case match
    const matchingUseCases = tool.useCases.filter(uc => 
      this.similarity(uc.toLowerCase(), intent.useCase.toLowerCase()) > 0.7
    );
    if (matchingUseCases.length > 0) {
      reasons.push(`Use case: ${matchingUseCases[0]}`);
    }
    
    // Server status
    if (tool.serverStatus === 'connected') {
      reasons.push('Server available');
    }
    
    // Action match
    if (tool.name.includes(intent.action) || tool.description.toLowerCase().includes(intent.action)) {
      reasons.push(`Action: ${intent.action}`);
    }
    
    return reasons;
  }
  
  /**
   * Calculate similarity between two strings
   * Simple word-overlap similarity for now
   */
  private similarity(str1: string, str2: string): number {
    const words1 = new Set(str1.toLowerCase().split(/\s+/));
    const words2 = new Set(str2.toLowerCase().split(/\s+/));
    
    const intersection = new Set([...words1].filter(w => words2.has(w)));
    const union = new Set([...words1, ...words2]);
    
    return intersection.size / union.size;
  }
}
