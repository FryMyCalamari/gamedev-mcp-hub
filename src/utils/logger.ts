/**
 * Logger utility for GameDev MCP Hub
 */

import winston from 'winston';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export class Logger {
  private static instance: winston.Logger;

  private constructor() {}

  public static getInstance(): winston.Logger {
    if (!Logger.instance) {
      Logger.instance = Logger.createLogger();
    }
    return Logger.instance;
  }

  private static createLogger(): winston.Logger {
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

  public static setLevel(level: string): void {
    if (Logger.instance) {
      Logger.instance.level = level;
    }
  }
}
