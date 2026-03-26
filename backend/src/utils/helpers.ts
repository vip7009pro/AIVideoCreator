import fs from 'fs';
import path from 'path';

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

export class FileSystemHelper {
  static ensureDirectoryExists(dirPath: string): void {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  }

  static deleteFile(filePath: string): boolean {
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        return true;
      }
      return false;
    } catch (error) {
      Logger.getInstance().error(`Failed to delete file: ${filePath}`, error);
      return false;
    }
  }

  static getFileSize(filePath: string): number {
    try {
      const stats = fs.statSync(filePath);
      return stats.size;
    } catch (error) {
      Logger.getInstance().error(`Failed to get file size: ${filePath}`, error);
      return 0;
    }
  }
}

export class ValidationHelper {
  static validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  static validateImageFile(mimeType: string): boolean {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    return allowedTypes.includes(mimeType);
  }

  static validateVideoFile(mimeType: string): boolean {
    const allowedTypes = ['video/mp4', 'video/webm', 'video/mpeg'];
    return allowedTypes.includes(mimeType);
  }
}

export class ErrorHelper {
  static getErrorMessage(error: any): string {
    if (error instanceof Error) {
      return error.message;
    }
    if (typeof error === 'string') {
      return error;
    }
    return JSON.stringify(error);
  }
}
