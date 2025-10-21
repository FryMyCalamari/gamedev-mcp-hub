/**
 * Error handling utilities for GameDev MCP Hub
 */

import { Logger } from './logger.js';

const logger = Logger.getInstance();

export class HubError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'HubError';
  }
}

export class ServerConnectionError extends HubError {
  constructor(serverName: string, details?: unknown) {
    super(`Failed to connect to server: ${serverName}`, 'SERVER_CONNECTION_ERROR', details);
    this.name = 'ServerConnectionError';
  }
}

export class ToolExecutionError extends HubError {
  constructor(toolName: string, details?: unknown) {
    super(`Failed to execute tool: ${toolName}`, 'TOOL_EXECUTION_ERROR', details);
    this.name = 'ToolExecutionError';
  }
}

export class ConfigurationError extends HubError {
  constructor(message: string, details?: unknown) {
    super(message, 'CONFIGURATION_ERROR', details);
    this.name = 'ConfigurationError';
  }
}

export class ErrorHandler {
  public static handle(error: unknown, context?: string): never {
    if (error instanceof HubError) {
      logger.error(`[${context || 'Unknown'}] ${error.name}: ${error.message}`, {
        code: error.code,
        details: error.details,
      });
    } else if (error instanceof Error) {
      logger.error(`[${context || 'Unknown'}] ${error.name}: ${error.message}`, {
        stack: error.stack,
      });
    } else {
      logger.error(`[${context || 'Unknown'}] Unknown error:`, error);
    }

    throw error;
  }

  public static async retry<T>(
    fn: () => Promise<T>,
    attempts: number = 3,
    delay: number = 1000,
    context?: string
  ): Promise<T> {
    let lastError: unknown;

    for (let i = 0; i < attempts; i++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;
        logger.warn(`[${context || 'Retry'}] Attempt ${i + 1}/${attempts} failed`, { error });

        if (i < attempts - 1) {
          await new Promise((resolve) => setTimeout(resolve, delay * (i + 1)));
        }
      }
    }

    throw lastError;
  }

  public static createCircuitBreaker<T>(
    fn: (...args: unknown[]) => Promise<T>,
    threshold: number = 5,
    timeout: number = 60000
  ) {
    let failures = 0;
    let lastFailureTime: number | null = null;
    let isOpen = false;

    return async (...args: unknown[]): Promise<T> => {
      // Check if circuit breaker should be reset
      if (isOpen && lastFailureTime && Date.now() - lastFailureTime > timeout) {
        logger.info('Circuit breaker reset - attempting to close');
        isOpen = false;
        failures = 0;
      }

      if (isOpen) {
        throw new HubError('Circuit breaker is open', 'CIRCUIT_BREAKER_OPEN');
      }

      try {
        const result = await fn(...args);
        // Success - reset failure count
        failures = 0;
        return result;
      } catch (error) {
        failures++;
        lastFailureTime = Date.now();

        if (failures >= threshold) {
          isOpen = true;
          logger.error(`Circuit breaker opened after ${failures} failures`);
        }

        throw error;
      }
    };
  }
}
