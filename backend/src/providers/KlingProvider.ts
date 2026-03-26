import { BaseProvider, JobStatusResponse, ProviderResponse } from './BaseProvider';

export class KlingProvider extends BaseProvider {
  constructor(apiKey: string, baseUrl: string) {
    super('Kling', apiKey, baseUrl);
  }

  /**
   * Validate Kling API credentials
   */
  protected async validateCredentials(): Promise<boolean> {
    try {
      // For MVP, we'll skip credential validation
      // In production, call a Kling endpoint to verify the API key
      return true;
    } catch (error) {
      this.logger.error('Kling credential validation failed', error);
      return false;
    }
  }

  /**
   * Generate video using Kling AI
   * POST /v1/videos/generation
   */
  async generateVideo(
    imageUrl: string,
    duration: 5 | 10 | 15,
    movement: 'walking' | 'posing'
  ): Promise<ProviderResponse> {
    try {
      this.logger.info(`Generating video with Kling: duration=${duration}s, movement=${movement}`);

      const payload = {
        image_url: imageUrl,
        duration: duration,
        mode: movement,
        quality: 'standard',
      };

      const response = await this.callApi('POST', '/videos/generation', payload);

      return {
        status: 'success',
        jobId: response.data?.id || response.id,
        data: response,
      };
    } catch (error) {
      this.logger.error('Kling video generation failed', error);
      return {
        status: 'error',
        jobId: '',
        error: `Video generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  /**
   * Get video generation job status from Kling
   * GET /v1/videos/generation/{job_id}
   */
  async getJobStatus(externalJobId: string): Promise<JobStatusResponse> {
    try {
      const response = await this.callApi('GET', `/videos/generation/${externalJobId}`);

      const status = response.data?.status || response.status;
      const jobStatus = this.mapKlingStatus(status);

      return {
        status: jobStatus,
        progress: response.data?.progress || 0,
        outputUrl: response.data?.video_url || response.data?.output_url,
        error: response.data?.error || undefined,
      };
    } catch (error) {
      this.logger.error(`Failed to get Kling job status: ${externalJobId}`, error);
      return {
        status: 'failed',
        error: `Failed to fetch status: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  /**
   * Map Kling API status to our internal status enum
   */
  private mapKlingStatus(
    klingStatus: string
  ): 'pending' | 'processing' | 'completed' | 'failed' {
    const statusMap: Record<string, 'pending' | 'processing' | 'completed' | 'failed'> = {
      queued: 'pending',
      processing: 'processing',
      completed: 'completed',
      succeeded: 'completed',
      failed: 'failed',
      error: 'failed',
    };

    return statusMap[klingStatus.toLowerCase()] || 'processing';
  }

  /**
   * Retrieve the generated video output
   */
  async retrieveOutput(externalJobId: string): Promise<string | null> {
    try {
      const status = await this.getJobStatus(externalJobId);
      return status.outputUrl || null;
    } catch (error) {
      this.logger.error(`Failed to retrieve Kling output: ${externalJobId}`, error);
      return null;
    }
  }
}
