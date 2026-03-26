import axios, { AxiosInstance } from 'axios';
import { Logger } from '../utils/helpers';

export interface ProviderResponse {
  status: 'success' | 'error' | 'pending';
  jobId: string;
  data?: any;
  error?: string;
}

export interface JobStatusResponse {
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress?: number;
  outputUrl?: string;
  error?: string;
}

export abstract class BaseProvider {
  protected logger: Logger;
  protected apiClient: AxiosInstance;
  protected apiKey: string;
  protected baseUrl: string;
  protected name: string;

  constructor(name: string, apiKey: string, baseUrl: string) {
    this.name = name;
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
    this.logger = Logger.getInstance();
    this.apiClient = axios.create({
      baseURL: baseUrl,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
    });
  }

  /**
   * Initialize provider (verify credentials, etc.)
   */
  async initialize(): Promise<boolean> {
    try {
      this.logger.info(`Initializing ${this.name} provider`);
      return await this.validateCredentials();
    } catch (error) {
      this.logger.error(`Failed to initialize ${this.name} provider`, error);
      return false;
    }
  }

  /**
   * Validate provider credentials
   */
  protected abstract validateCredentials(): Promise<boolean>;

  /**
   * Call provider API with error handling and retries
   */
  protected async callApi(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    endpoint: string,
    data?: any,
    retries: number = 3
  ): Promise<any> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const response = await this.apiClient({
          method,
          url: endpoint,
          data,
        });
        return response.data;
      } catch (error: any) {
        lastError = error;
        this.logger.warn(
          `${this.name} API call attempt ${attempt}/${retries} failed: ${endpoint}`,
          error.message
        );

        if (attempt < retries) {
          // Exponential backoff
          await this.delay(Math.pow(2, attempt) * 1000);
        }
      }
    }

    throw lastError || new Error('API call failed after retries');
  }

  /**
   * Delay helper for retries
   */
  protected delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Get job status from provider
   */
  abstract getJobStatus(externalJobId: string): Promise<JobStatusResponse>;

  /**
   * Handle provider-specific response mapping
   */
  protected mapResponse(data: any): ProviderResponse {
    return {
      status: 'success',
      jobId: data.id || data.jobId || '',
      data,
    };
  }
}
