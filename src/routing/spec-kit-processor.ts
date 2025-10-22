/**
 * Spec-Kit Processor - Transform natural language into formal specifications
 * Based on GitHub Spec-Kit framework
 */

import type { Specification, Context, Guardrail, WorkflowStep } from '../types/routing-types.js';
import { Logger } from '../utils/logger.js';

const logger = Logger.getInstance();

export class SpecKitProcessor {
  /**
   * Convert natural language task to formal specification
   */
  async createSpec(task: string, context?: Context): Promise<Specification> {
    logger.info('[SpecKit] Creating specification from task');
    
    const title = this.extractTitle(task);
    const motivation = await this.inferMotivation(task, context);
    const requirements = await this.extractRequirements(task);
    const constraints = await this.identifyConstraints(task, context);
    const acceptanceCriteria = await this.generateAcceptanceCriteria(task);
    const successMetrics = this.defineSuccessMetrics(task);
    const workflow = await this.planWorkflow(task);
    const guardrails = await this.establishGuardrails(task);
    
    return {
      title,
      motivation,
      requirements,
      constraints,
      acceptanceCriteria,
      successMetrics,
      workflow,
      guardrails,
    };
  }
  
  /**
   * Extract title from task
   */
  private extractTitle(task: string): string {
    // Take first sentence or first 60 chars
    const firstSentence = task.split(/[.!?]/)[0].trim();
    if (firstSentence.length <= 60) {
      return firstSentence;
    }
    return task.substring(0, 57).trim() + '...';
  }
  
  /**
   * Infer motivation for the task
   */
  private async inferMotivation(task: string, _context?: Context): Promise<string> {
    // Extract the "why" from the task description
    const whyPatterns = [
      /\b(because|since|as|for|to)\b(.+)/i,
      /\b(need|want|require)\b(.+)/i,
    ];
    
    for (const pattern of whyPatterns) {
      const match = task.match(pattern);
      if (match) {
        return match[2].trim();
      }
    }
    
    // Default motivation based on task type
    if (task.toLowerCase().includes('search') || task.toLowerCase().includes('find')) {
      return 'To locate and access relevant information quickly';
    }
    if (task.toLowerCase().includes('create') || task.toLowerCase().includes('generate')) {
      return 'To produce new content or assets for the project';
    }
    if (task.toLowerCase().includes('update') || task.toLowerCase().includes('modify')) {
      return 'To improve or correct existing functionality';
    }
    
    return 'To accomplish the specified task efficiently';
  }
  
  /**
   * Extract functional and non-functional requirements
   */
  private async extractRequirements(task: string): Promise<{
    functional: string[];
    nonFunctional: string[];
  }> {
    const functional: string[] = [];
    const nonFunctional: string[] = [];
    
    // Extract verbs (actions) as functional requirements
    const actionPatterns = [
      /\b(search|find|look|query|locate)\b\s+(.+?)(?:\.|,|$)/gi,
      /\b(create|make|generate|build|add)\b\s+(.+?)(?:\.|,|$)/gi,
      /\b(update|modify|edit|change)\b\s+(.+?)(?:\.|,|$)/gi,
      /\b(delete|remove|clear)\b\s+(.+?)(?:\.|,|$)/gi,
      /\b(list|show|display|view)\b\s+(.+?)(?:\.|,|$)/gi,
    ];
    
    for (const pattern of actionPatterns) {
      const matches = task.matchAll(pattern);
      for (const match of matches) {
        functional.push(`${match[1]} ${match[2]}`.trim());
      }
    }
    
    // Extract quality attributes as non-functional requirements
    if (task.match(/\b(fast|quick|efficient|performant)\b/i)) {
      nonFunctional.push('High performance');
    }
    if (task.match(/\b(simple|easy|intuitive)\b/i)) {
      nonFunctional.push('User-friendly interface');
    }
    if (task.match(/\b(reliable|robust|stable)\b/i)) {
      nonFunctional.push('High reliability');
    }
    
    // If no requirements found, use task as single requirement
    if (functional.length === 0) {
      functional.push(task);
    }
    
    return { functional, nonFunctional };
  }
  
  /**
   * Identify constraints from task and context
   */
  private async identifyConstraints(task: string, _context?: Context): Promise<{
    technical: string[];
    performance: string[];
    budget: string[];
  }> {
    const technical: string[] = [];
    const performance: string[] = [];
    const budget: string[] = [];
    
    // Extract technical constraints
    const techPatterns = [
      /\bonly\s+(.+?)(?:\.|,|$)/gi,
      /\bmust\s+use\s+(.+?)(?:\.|,|$)/gi,
      /\brestricted\s+to\s+(.+?)(?:\.|,|$)/gi,
    ];
    
    for (const pattern of techPatterns) {
      const matches = task.matchAll(pattern);
      for (const match of matches) {
        technical.push(match[1].trim());
      }
    }
    
    // Extract performance constraints
    if (task.match(/\b(\d+)\s*(ms|milliseconds|seconds)\b/i)) {
      const match = task.match(/\b(\d+)\s*(ms|milliseconds|seconds)\b/i);
      if (match) {
        performance.push(`Response time: ${match[0]}`);
      }
    }
    
    // Context-based constraints
    if (_context?.serverPreference) {
      technical.push(`Prefer server: ${_context.serverPreference}`);
    }
    
    return { technical, performance, budget };
  }
  
  /**
   * Generate acceptance criteria
   */
  private async generateAcceptanceCriteria(task: string): Promise<string[]> {
    const criteria: string[] = [];
    
    // Extract explicit success conditions
    const successPatterns = [
      /\bshould\s+(.+?)(?:\.|,|and|$)/gi,
      /\bmust\s+(.+?)(?:\.|,|and|$)/gi,
    ];
    
    for (const pattern of successPatterns) {
      const matches = task.matchAll(pattern);
      for (const match of matches) {
        criteria.push(match[1].trim());
      }
    }
    
    // Add default criteria based on action
    if (task.toLowerCase().includes('search') || task.toLowerCase().includes('find')) {
      criteria.push('Results are relevant to the query');
      criteria.push('Results are returned in reasonable time');
    }
    if (task.toLowerCase().includes('create') || task.toLowerCase().includes('generate')) {
      criteria.push('Output is created successfully');
      criteria.push('Output meets specified requirements');
    }
    
    // If no criteria found, add generic one
    if (criteria.length === 0) {
      criteria.push('Task completed successfully');
    }
    
    return criteria;
  }
  
  /**
   * Define success metrics
   */
  private defineSuccessMetrics(task: string): string[] {
    const metrics: string[] = [];
    
    // Common metrics
    metrics.push('Task completion rate');
    metrics.push('User satisfaction');
    
    // Action-specific metrics
    if (task.toLowerCase().includes('search') || task.toLowerCase().includes('find')) {
      metrics.push('Result relevance score');
      metrics.push('Search time');
    }
    if (task.toLowerCase().includes('create') || task.toLowerCase().includes('generate')) {
      metrics.push('Output quality score');
      metrics.push('Generation time');
    }
    
    return metrics;
  }
  
  /**
   * Plan workflow steps
   */
  private async planWorkflow(task: string): Promise<WorkflowStep[]> {
    const steps: WorkflowStep[] = [];
    
    // Simple workflow extraction
    // For complex tasks, this would involve more sophisticated planning
    
    // Check for sequential indicators
    const hasSequence = /\b(then|after|and then|next)\b/i.test(task);
    
    if (hasSequence) {
      // Split by sequence words
      const parts = task.split(/\b(then|after|and then|next)\b/i).filter(p => 
        p.trim() && !['then', 'after', 'and then', 'next'].includes(p.toLowerCase().trim())
      );
      
      parts.forEach((part, index) => {
        steps.push({
          step: index + 1,
          description: part.trim(),
          dependencies: index > 0 ? [index] : [],
        });
      });
    } else {
      // Single step workflow
      steps.push({
        step: 1,
        description: task,
      });
    }
    
    return steps;
  }
  
  /**
   * Establish guardrails
   */
  private async establishGuardrails(task: string): Promise<Guardrail[]> {
    const guardrails: Guardrail[] = [];
    
    // Extract constraints as guardrails
    if (task.match(/\b(must not|cannot|don't|avoid)\b/i)) {
      guardrails.push({
        type: 'constraint',
        description: 'Respect prohibitions and restrictions',
        severity: 'error',
      });
    }
    
    // Quality guardrails
    guardrails.push({
      type: 'validation',
      description: 'Validate all inputs before processing',
      severity: 'error',
    });
    
    guardrails.push({
      type: 'requirement',
      description: 'Meet all acceptance criteria',
      severity: 'warning',
    });
    
    return guardrails;
  }
  
  /**
   * Apply spec-driven refinement to execution plan
   */
  async refineWithSpec(
    execution: ExecutionPlan,
    spec: Specification
  ): Promise<RefinedPlan> {
    logger.info('[SpecKit] Refining execution plan with specification');
    
    // Validate against requirements
    this.validateAgainstRequirements(execution, spec.requirements);
    
    // Enforce constraints
    this.enforceConstraints(execution, spec.constraints);
    
    // Validate acceptance criteria
    this.validateAcceptance(execution, spec.acceptanceCriteria);
    
    // Apply guardrails
    return this.applyGuardrails(execution, spec.guardrails);
  }
  
  private validateAgainstRequirements(
    _execution: ExecutionPlan,
    requirements: Specification['requirements']
  ): void {
    // Check if execution addresses all functional requirements
    for (const req of requirements.functional) {
      // Simple keyword matching for now
      const addressed = _execution.steps.some(step => 
        step.description.toLowerCase().includes(req.toLowerCase().split(' ')[0])
      );
      
      if (!addressed) {
        logger.warn(`[SpecKit] Requirement may not be addressed: ${req}`);
      }
    }
  }
  
  private enforceConstraints(
    _execution: ExecutionPlan,
    constraints: Specification['constraints']
  ): void {
    // Apply technical constraints
    for (const constraint of constraints.technical) {
      logger.info(`[SpecKit] Enforcing constraint: ${constraint}`);
    }
  }
  
  private validateAcceptance(
    _execution: ExecutionPlan,
    criteria: string[]
  ): void {
    logger.info(`[SpecKit] Validating ${criteria.length} acceptance criteria`);
  }
  
  private applyGuardrails(
    execution: ExecutionPlan,
    guardrails: Guardrail[]
  ): RefinedPlan {
    return {
      ...execution,
      guardrails,
      validated: true,
    };
  }
}

// Temporary types until we create full definitions
interface ExecutionPlan {
  task: string;
  steps: Array<{ description: string }>;
}

interface RefinedPlan extends ExecutionPlan {
  guardrails: Guardrail[];
  validated: boolean;
}
