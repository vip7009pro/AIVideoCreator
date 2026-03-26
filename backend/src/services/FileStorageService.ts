import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import config from '../config';
import { FileSystemHelper, Logger } from '../utils/helpers';

export class FileStorageService {
  private logger: Logger;
  private uploadDir: string;
  private maxFileSize: number;

  constructor() {
    this.logger = Logger.getInstance();
    this.uploadDir = config.uploadDir;
    this.maxFileSize = config.maxFileSize;
    FileSystemHelper.ensureDirectoryExists(this.uploadDir);
  }

  /**
   * Save file to local storage
   */
  async saveFile(
    buffer: Buffer,
    originalFilename: string,
    userId: string,
    projectId: string
  ): Promise<{ storageKey: string; storageUrl: string; fileSize: number }> {
    try {
      // Validate file size
      if (buffer.length > this.maxFileSize) {
        throw new Error(`File size exceeds maximum allowed size of ${this.maxFileSize} bytes`);
      }

      // Create directory structure: uploads/{userId}/{projectId}/
      const userProjectDir = path.join(this.uploadDir, userId, projectId);
      FileSystemHelper.ensureDirectoryExists(userProjectDir);

      // Generate unique filename
      const fileExt = path.extname(originalFilename);
      const fileName = `${Date.now()}-${uuidv4()}${fileExt}`;
      const filePath = path.join(userProjectDir, fileName);

      // Write file to disk
      fs.writeFileSync(filePath, buffer);

      // Generate storage key (relative path for database)
      const storageKey = path.relative(this.uploadDir, filePath).replace(/\\/g, '/');

      // Generate URL (relative path for serving)
      const storageUrl = `/uploads/${storageKey}`;

      this.logger.info(`File saved: ${storageKey}`);

      return {
        storageKey,
        storageUrl,
        fileSize: buffer.length,
      };
    } catch (error) {
      this.logger.error('File save failed', error);
      throw error;
    }
  }

  /**
   * Delete file from storage
   */
  async deleteFile(storageKey: string): Promise<boolean> {
    try {
      const filePath = path.join(this.uploadDir, storageKey);
      return FileSystemHelper.deleteFile(filePath);
    } catch (error) {
      this.logger.error(`File deletion failed for ${storageKey}`, error);
      return false;
    }
  }

  /**
   * Get file size
   */
  getFileSize(storageKey: string): number {
    try {
      const filePath = path.join(this.uploadDir, storageKey);
      return FileSystemHelper.getFileSize(filePath);
    } catch (error) {
      this.logger.error(`Failed to get file size for ${storageKey}`, error);
      return 0;
    }
  }

  /**
   * Check if file exists
   */
  fileExists(storageKey: string): boolean {
    const filePath = path.join(this.uploadDir, storageKey);
    return fs.existsSync(filePath);
  }

  /**
   * Get file path (for internal use only)
   */
  getFilePath(storageKey: string): string {
    return path.join(this.uploadDir, storageKey);
  }

  /**
   * Download file from external URL and save locally
   */
  async downloadAndSave(
    externalUrl: string,
    userId: string,
    projectId: string,
    filename: string
  ): Promise<{ storageKey: string; storageUrl: string; fileSize: number }> {
    try {
      this.logger.info(`Downloading file from external URL: ${externalUrl}`);

      // In a real implementation, fetch the file from the external URL
      // For MVP, this is a stub that would use a library like axios or node-fetch
      throw new Error('External file download not yet implemented');
    } catch (error) {
      this.logger.error('External file download failed', error);
      throw error;
    }
  }
}
