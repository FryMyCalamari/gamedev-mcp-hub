/**
 * Type definitions for GameDev MCP Hub
 */

export interface HubConfig {
  hub: {
    name: string;
    version: string;
    description: string;
    transport: 'stdio' | 'http' | 'websocket';
    port?: number;
    host?: string;
    log_level: 'debug' | 'info' | 'warn' | 'error';
  };
  token_management: {
    enabled: boolean;
    warning_threshold: number;
    hard_limit: number;
    auto_switch: boolean;
    auto_switch_threshold: number;
    preferred_models: string[];
    track_per_server: boolean;
    track_per_tool: boolean;
  };
  health_check: {
    enabled: boolean;
    interval: number;
    timeout: number;
    max_failures: number;
    log_failures: boolean;
    notify_on_failure: boolean;
  };
  logging: {
    level: string;
    file: string;
    console: boolean;
    max_file_size: string;
    max_files: number;
    format: 'json' | 'text';
    timestamp: boolean;
  };
  performance: {
    cache_enabled: boolean;
    cache_ttl: number;
    connection_pool_size: number;
    max_concurrent_calls: number;
    request_timeout: number;
    retry_enabled: boolean;
    retry_attempts: number;
    retry_delay: number;
  };
  security: {
    require_authentication: boolean;
    api_key_encryption: boolean;
    rate_limiting: {
      enabled: boolean;
      max_requests_per_minute: number;
      max_requests_per_hour: number;
    };
    audit_logging: boolean;
  };
  features: {
    tool_search: boolean;
    usage_analytics: boolean;
    task_breakdown: boolean;
    api_switching: boolean;
    rest_api: boolean;
    websocket: boolean;
  };
  integrations: {
    das_studio?: {
      enabled: boolean;
      api_endpoint: string;
      api_key: string;
    };
    super_agent?: {
      enabled: boolean;
      event_bus: string;
    };
  };
}

export interface ServerConfig {
  enabled: boolean;
  command: string;
  args: string[];
  category: string;
  priority: 'low' | 'medium' | 'high';
  auto_reconnect: boolean;
  retry_attempts: number;
  timeout: number;
  description: string;
  env?: Record<string, string>;
}

export interface ServersConfig {
  servers: Record<string, ServerConfig>;
  defaults: {
    health_check_interval: number;
    health_check_timeout: number;
    max_connection_failures: number;
    auto_reconnect: boolean;
    circuit_breaker_enabled: boolean;
    circuit_breaker_threshold: number;
    circuit_breaker_timeout: number;
  };
}

export interface Category {
  name: string;
  description: string;
  icon: string;
  priority: number;
  tools_prefix: string[];
  tags: string[];
}

export interface Tag {
  name: string;
  description: string;
  color: string;
}

export interface CategoriesConfig {
  categories: Record<string, Category>;
  tags: Record<string, Tag>;
}

export interface Tool {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
  category?: string;
  server: string;
  tags?: string[];
}

export interface Resource {
  uri: string;
  name: string;
  description?: string;
  mimeType?: string;
}

export interface ToolResult {
  content: Array<{
    type: 'text' | 'image' | 'resource';
    text?: string;
    data?: string;
    mimeType?: string;
  }>;
  isError?: boolean;
}

export interface ServerConnection {
  name: string;
  config: ServerConfig;
  status: 'connected' | 'disconnected' | 'error' | 'connecting';
  tools: Tool[];
  lastHealthCheck?: Date;
  failureCount: number;
  circuitBreakerOpen: boolean;
}

export interface TokenUsage {
  server: string;
  tool: string;
  tokens: number;
  timestamp: Date;
}

export interface AnalyticsData {
  totalCalls: number;
  totalTokens: number;
  callsByServer: Record<string, number>;
  callsByTool: Record<string, number>;
  tokensByServer: Record<string, number>;
  tokensByTool: Record<string, number>;
  errors: number;
  averageLatency: number;
}

export interface ToolCall {
  id?: string | number;
  name: string;
  arguments: Record<string, unknown>;
  timestamp?: number;
}
