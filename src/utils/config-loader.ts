/**
 * Configuration loader for GameDev MCP Hub
 */

import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import type { HubConfig, ServersConfig, CategoriesConfig } from '../types/hub-types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export class ConfigLoader {
  private static configDir = path.join(__dirname, '../../config');

  public static async loadConfig(): Promise<HubConfig> {
    const configPath = path.join(ConfigLoader.configDir, 'hub-config.json');
    const content = await fs.readFile(configPath, 'utf-8');
    return JSON.parse(content) as HubConfig;
  }

  public static async loadServersConfig(): Promise<ServersConfig> {
    let configPath = path.join(ConfigLoader.configDir, 'mcp-servers.json');
    
    try {
      await fs.access(configPath);
    } catch {
      // Fall back to example if main config doesn't exist
      configPath = path.join(ConfigLoader.configDir, 'mcp-servers.example.json');
    }

    const content = await fs.readFile(configPath, 'utf-8');
    return JSON.parse(content) as ServersConfig;
  }

  public static async loadCategoriesConfig(): Promise<CategoriesConfig> {
    const configPath = path.join(ConfigLoader.configDir, 'categories.json');
    const content = await fs.readFile(configPath, 'utf-8');
    return JSON.parse(content) as CategoriesConfig;
  }

  public static async saveServersConfig(config: ServersConfig): Promise<void> {
    const configPath = path.join(ConfigLoader.configDir, 'mcp-servers.json');
    await fs.writeFile(configPath, JSON.stringify(config, null, 2), 'utf-8');
  }

  public static async saveHubConfig(config: HubConfig): Promise<void> {
    const configPath = path.join(ConfigLoader.configDir, 'hub-config.json');
    await fs.writeFile(configPath, JSON.stringify(config, null, 2), 'utf-8');
  }
}
