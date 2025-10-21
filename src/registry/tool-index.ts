/**
 * Tool Registry - Index and search tools from all servers
 */

import type { Tool, CategoriesConfig, Category } from '../types/hub-types.js';
import { Logger } from '../utils/logger.js';

const logger = Logger.getInstance();

export class ToolRegistry {
  private tools: Map<string, Tool> = new Map();
  private categories: Map<string, Category> = new Map();
  private searchIndex: Map<string, Set<string>> = new Map(); // keyword -> tool names

  /**
   * Load categories configuration
   */
  public loadCategories(config: CategoriesConfig): void {
    for (const [key, category] of Object.entries(config.categories)) {
      this.categories.set(key, category);
    }
    logger.info(`Loaded ${this.categories.size} tool categories`);
  }

  /**
   * Register a tool in the registry
   */
  public registerTool(tool: Tool): void {
    this.tools.set(tool.name, tool);

    // Index tool for search
    this.indexTool(tool);

    logger.debug(`Registered tool: ${tool.name}`);
  }

  /**
   * Index a tool for search
   */
  private indexTool(tool: Tool): void {
    // Index by name words
    const nameWords = tool.name.toLowerCase().split(/[_\s-]+/);
    for (const word of nameWords) {
      if (!this.searchIndex.has(word)) {
        this.searchIndex.set(word, new Set());
      }
      this.searchIndex.get(word)!.add(tool.name);
    }

    // Index by description words
    if (tool.description) {
      const descWords = tool.description.toLowerCase().split(/[\s,.-]+/);
      for (const word of descWords) {
        if (word.length > 3) {
          // Only index words longer than 3 chars
          if (!this.searchIndex.has(word)) {
            this.searchIndex.set(word, new Set());
          }
          this.searchIndex.get(word)!.add(tool.name);
        }
      }
    }

    // Index by category
    if (tool.category) {
      if (!this.searchIndex.has(tool.category)) {
        this.searchIndex.set(tool.category, new Set());
      }
      this.searchIndex.get(tool.category)!.add(tool.name);
    }

    // Index by tags
    if (tool.tags) {
      for (const tag of tool.tags) {
        const tagLower = tag.toLowerCase();
        if (!this.searchIndex.has(tagLower)) {
          this.searchIndex.set(tagLower, new Set());
        }
        this.searchIndex.get(tagLower)!.add(tool.name);
      }
    }
  }

  /**
   * Search for tools by query
   */
  public searchTools(query: string, category?: string): Tool[] {
    const queryLower = query.toLowerCase();
    const queryWords = queryLower.split(/[\s,.-]+/).filter((w) => w.length > 0);

    // Find tools matching query
    const matchingToolNames = new Set<string>();

    for (const word of queryWords) {
      // Exact match
      if (this.searchIndex.has(word)) {
        for (const toolName of this.searchIndex.get(word)!) {
          matchingToolNames.add(toolName);
        }
      }

      // Partial match
      for (const [indexWord, toolNames] of this.searchIndex) {
        if (indexWord.includes(word) || word.includes(indexWord)) {
          for (const toolName of toolNames) {
            matchingToolNames.add(toolName);
          }
        }
      }
    }

    // Get tools
    let results = Array.from(matchingToolNames)
      .map((name) => this.tools.get(name)!)
      .filter((tool) => tool !== undefined);

    // Filter by category if specified
    if (category) {
      results = results.filter((tool) => tool.category === category);
    }

    // Sort by relevance (tools with more matches first)
    results.sort((a, b) => {
      const aMatches = this.countMatches(a, queryWords);
      const bMatches = this.countMatches(b, queryWords);
      return bMatches - aMatches;
    });

    logger.debug(`Search for "${query}" found ${results.length} tools`);

    return results;
  }

  /**
   * Count how many query words match a tool
   */
  private countMatches(tool: Tool, queryWords: string[]): number {
    let count = 0;
    const toolText = `${tool.name} ${tool.description || ''} ${tool.category || ''}`.toLowerCase();

    for (const word of queryWords) {
      if (toolText.includes(word)) {
        count++;
      }
    }

    return count;
  }

  /**
   * Get a tool by name
   */
  public getTool(name: string): Tool | undefined {
    return this.tools.get(name);
  }

  /**
   * Get all tools
   */
  public getAllTools(): Tool[] {
    return Array.from(this.tools.values());
  }

  /**
   * Get tools by category
   */
  public getToolsByCategory(category: string): Tool[] {
    return Array.from(this.tools.values()).filter((tool) => tool.category === category);
  }

  /**
   * Get all categories
   */
  public getCategories(): Category[] {
    return Array.from(this.categories.values()).sort((a, b) => a.priority - b.priority);
  }

  /**
   * Get category by key
   */
  public getCategory(key: string): Category | undefined {
    return this.categories.get(key);
  }

  /**
   * Get statistics
   */
  public getStats(): {
    totalTools: number;
    toolsByCategory: Record<string, number>;
    toolsByServer: Record<string, number>;
  } {
    const stats = {
      totalTools: this.tools.size,
      toolsByCategory: {} as Record<string, number>,
      toolsByServer: {} as Record<string, number>,
    };

    for (const tool of this.tools.values()) {
      // Count by category
      if (tool.category) {
        stats.toolsByCategory[tool.category] =
          (stats.toolsByCategory[tool.category] || 0) + 1;
      }

      // Count by server
      if (tool.server) {
        stats.toolsByServer[tool.server] = (stats.toolsByServer[tool.server] || 0) + 1;
      }
    }

    return stats;
  }
}
