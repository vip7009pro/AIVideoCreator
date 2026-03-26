export class Logger {
  private static instance: Logger;

  private constructor() {}

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  info(message: string, context?: any): void {
    console.log(`[INFO] ${new Date().toISOString()} - ${message}`, context || '');
  }

  error(message: string, error?: any): void {
    console.error(`[ERROR] ${new Date().toISOString()} - ${message}`, error || '');
  }

  warn(message: string, context?: any): void {
    console.warn(`[WARN] ${new Date().toISOString()} - ${message}`, context || '');
  }

  debug(message: string, context?: any): void {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[DEBUG] ${new Date().toISOString()} - ${message}`, context || '');
    }
  }
}
