// Enhanced logging utility for better debugging and production handling

export const LogLevels = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3
};

export const LogLevel = process.env.NODE_ENV === 'production' ? LogLevels.WARN : LogLevels.DEBUG;

class Logger {
  private context: string;

  constructor(context = 'App') {
    this.context = context;
  }

  private formatMessage(level: string, message: string, ...args: any[]) {
    const timestamp = new Date().toISOString();
    const contextStr = this.context ? `[${this.context}]` : '';
    return [`${timestamp} ${level} ${contextStr} ${message}`, ...args];
  }

  error(message: string, ...args: any[]) {
    if (LogLevel >= LogLevels.ERROR) {
      console.error(...this.formatMessage('ERROR', message, ...args));
    }
  }

  warn(message: string, ...args: any[]) {
    if (LogLevel >= LogLevels.WARN) {
      console.warn(...this.formatMessage('WARN', message, ...args));
    }
  }

  info(message: string, ...args: any[]) {
    if (LogLevel >= LogLevels.INFO) {
      console.info(...this.formatMessage('INFO', message, ...args));
    }
  }

  debug(message: string, ...args: any[]) {
    if (LogLevel >= LogLevels.DEBUG) {
      console.log(...this.formatMessage('DEBUG', message, ...args));
    }
  }

  // Special methods for different types of operations
  api(message: string, ...args: any[]) {
    if (LogLevel >= LogLevels.DEBUG) {
      console.log(...this.formatMessage('API', message, ...args));
    }
  }

  auth(message: string, ...args: any[]) {
    if (LogLevel >= LogLevels.INFO) {
      console.log(...this.formatMessage('AUTH', message, ...args));
    }
  }

  database(message: string, ...args: any[]) {
    if (LogLevel >= LogLevels.DEBUG) {
      console.log(...this.formatMessage('DB', message, ...args));
    }
  }

  // Performance logging
  time(label: string) {
    if (LogLevel >= LogLevels.DEBUG) {
      console.time(`[${this.context}] ${label}`);
    }
  }

  timeEnd(label: string) {
    if (LogLevel >= LogLevels.DEBUG) {
      console.timeEnd(`[${this.context}] ${label}`);
    }
  }
}

// Create loggers for different parts of the application
export const logger = new Logger('App');
export const apiLogger = new Logger('API');
export const authLogger = new Logger('Auth');
export const dbLogger = new Logger('Database');
export const sharePointLogger = new Logger('SharePoint');

// Helper function to create contextual loggers
export const createLogger = (context: string) => new Logger(context);

// Export default logger
export default logger;