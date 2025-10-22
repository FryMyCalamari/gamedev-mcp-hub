/**
 * Intent Parser - Extract meaning and intent from natural language
 */

import type { Intent } from '../types/routing-types.js';
import { Logger } from '../utils/logger.js';

const logger = Logger.getInstance();

export class IntentParser {
  /**
   * Parse natural language task into structured intent
   */
  parse(task: string): Intent {
    logger.info('[IntentParser] Parsing task intent');
    
    const action = this.extractAction(task);
    const target = this.extractTarget(task);
    const category = this.inferCategory(action, target);
    const keywords = this.extractKeywords(task);
    const useCase = this.generateUseCase(action, target);
    const confidence = this.calculateConfidence(action, target, category);
    
    return {
      action,
      target,
      category,
      keywords,
      useCase,
      confidence,
    };
  }
  
  /**
   * Extract action verb from task
   */
  private extractAction(task: string): string {
    const actionPatterns = {
      search: /\b(search|find|look|query|locate|lookup)\b/i,
      create: /\b(create|make|new|add|generate|build)\b/i,
      update: /\b(update|modify|edit|change|set|alter)\b/i,
      delete: /\b(delete|remove|destroy|clear|erase)\b/i,
      list: /\b(list|show|get|display|view|see)\b/i,
      execute: /\b(run|execute|perform|do|start)\b/i,
      test: /\b(test|check|verify|validate)\b/i,
      analyze: /\b(analyze|examine|inspect|review)\b/i,
    };
    
    for (const [action, pattern] of Object.entries(actionPatterns)) {
      if (pattern.test(task)) {
        return action;
      }
    }
    
    return 'unknown';
  }
  
  /**
   * Extract target noun from task
   */
  private extractTarget(task: string): string {
    const targetPatterns = {
      notes: /\b(note|notes|vault|obsidian)\b/i,
      files: /\b(file|files|document|documents)\b/i,
      repositories: /\b(repo|repos|repository|repositories)\b/i,
      code: /\b(code|source|script|program)\b/i,
      objects: /\b(object|objects|model|models|mesh|meshes)\b/i,
      scenes: /\b(scene|scenes|level|levels)\b/i,
      issues: /\b(issue|issues|ticket|tickets|bug|bugs)\b/i,
      commits: /\b(commit|commits|change|changes)\b/i,
      art: /\b(art|artwork|visual|graphics|animation)\b/i,
      design: /\b(design|layout|ui|interface)\b/i,
      documentation: /\b(doc|docs|documentation|readme)\b/i,
      tests: /\b(test|tests|spec|specs)\b/i,
    };
    
    for (const [target, pattern] of Object.entries(targetPatterns)) {
      if (pattern.test(task)) {
        return target;
      }
    }
    
    return 'item';
  }
  
  /**
   * Infer category from action and target
   */
  private inferCategory(action: string, target: string): string {
    // Knowledge management
    if (['notes', 'files', 'documentation'].includes(target)) {
      return 'knowledge-management';
    }
    
    // Version control
    if (['repositories', 'commits', 'issues', 'code'].includes(target)) {
      return 'version-control';
    }
    
    // 3D/Game assets
    if (['objects', 'scenes', 'meshes'].includes(target)) {
      return '3d-modeling';
    }
    
    // Creative
    if (['art', 'design', 'animation'].includes(target)) {
      return 'creative';
    }
    
    // Testing
    if (['tests'].includes(target) || action === 'test') {
      return 'testing';
    }
    
    return 'general';
  }
  
  /**
   * Extract keywords for matching
   */
  private extractKeywords(task: string): string[] {
    // Remove common stop words
    const stopWords = new Set([
      'a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
      'of', 'with', 'by', 'from', 'about', 'as', 'into', 'through', 'during',
      'before', 'after', 'above', 'below', 'between', 'under', 'over',
      'i', 'me', 'my', 'we', 'us', 'you', 'your', 'he', 'she', 'it', 'they',
      'this', 'that', 'these', 'those', 'is', 'are', 'was', 'were', 'be', 'been',
      'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should',
    ]);
    
    // Tokenize and filter
    const words = task
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 2 && !stopWords.has(word));
    
    // Remove duplicates
    return [...new Set(words)];
  }
  
  /**
   * Generate use case description
   */
  private generateUseCase(action: string, target: string): string {
    return `${action} ${target}`.replace(/unknown/g, 'perform operation on');
  }
  
  /**
   * Calculate confidence score
   */
  private calculateConfidence(action: string, target: string, category: string): number {
    let confidence = 0;
    
    // Known action: +0.4
    if (action !== 'unknown') {
      confidence += 0.4;
    }
    
    // Known target: +0.3
    if (target !== 'item') {
      confidence += 0.3;
    }
    
    // Known category: +0.3
    if (category !== 'general') {
      confidence += 0.3;
    }
    
    return confidence;
  }
}
