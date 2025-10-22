/**
 * Logger utility for GameDev MCP Hub
 */

import winston from 'winston';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { EventEmitter } from 'events';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

interface LogEntry {
  timestamp: string;
  level: string;
  message: string;
  meta?: any;
}

export class Logger extends EventEmitter {
  private static instance: Logger;
  private winstonLogger: winston.Logger;
  private logHistory: LogEntry[] = [];
  private maxHistorySize: number = 1000;

  private constructor() {
    super();
    this.winstonLogger = this.createLogger();
  }

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  private createLogger(): winston.Logger {
    const logLevel = process.env.LOG_LEVEL || 'info';
    const logDir = path.join(__dirname, '../../logs');

    const logger = winston.createLogger({
      level: logLevel,
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
      ),
      transports: [
        // Console transport
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.printf(({ timestamp, level, message, ...meta }) => {
              const metaStr = Object.keys(meta).length ? JSON.stringify(meta, null, 2) : '';
              return `${timestamp} [${level}]: ${message} ${metaStr}`;
            })
          ),
        }),
        // File transport
        new winston.transports.File({
          filename: path.join(logDir, 'hub.log'),
          maxsize: 10 * 1024 * 1024, // 10MB
          maxFiles: 5,
        }),
        // Error file transport
        new winston.transports.File({
          filename: path.join(logDir, 'error.log'),
          level: 'error',
          maxsize: 10 * 1024 * 1024, // 10MB
          maxFiles: 5,
        }),
      ],
    });

    return logger;
  }

  private addToHistory(level: string, message: string, meta?: any): void {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      meta,
    };

    this.logHistory.push(entry);

    // Keep history size limited
    if (this.logHistory.length > this.maxHistorySize) {
      this.logHistory.shift();
    }

    // Emit log event for WebSocket clients
    this.emit('log', entry);
  }

  public info(message: string, ...meta: any[]): void {
    this.winstonLogger.info(message, ...meta);
    this.addToHistory('info', message, meta.length > 0 ? meta : undefined);
  }

  public error(message: string, ...meta: any[]): void {
    this.winstonLogger.error(message, ...meta);
    this.addToHistory('error', message, meta.length > 0 ? meta : undefined);
  }

  public warn(message: string, ...meta: any[]): void {
    this.winstonLogger.warn(message, ...meta);
    this.addToHistory('warn', message, meta.length > 0 ? meta : undefined);
  }

  public debug(message: string, ...meta: any[]): void {
    this.winstonLogger.debug(message, ...meta);
    this.addToHistory('debug', message, meta.length > 0 ? meta : undefined);
  }

  public getRecentLogs(limit: number = 100): LogEntry[] {
    return this.logHistory.slice(-limit);
  }

  public clearHistory(): void {
    this.logHistory = [];
  }

  public setLevel(level: string): void {
    this.winstonLogger.level = level;
  }
}

// Export a singleton instance for convenience
export const logger = Logger.getInstance();
