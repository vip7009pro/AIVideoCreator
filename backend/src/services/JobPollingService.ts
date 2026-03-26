import { PrismaClient } from '@prisma/client';
import { ProviderFactory } from '../providers/ProviderFactory';
import { CostCalculatorService } from './CostCalculatorService';
import { Logger } from '../utils/helpers';

export class JobPollingService {
  private prisma: PrismaClient;
  private logger = Logger.getInstance();
  private isPolling = false;
  private intervalId: NodeJS.Timeout | null = null;
  private pollingIntervalMs = 10000; // 10 seconds

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  public start() {
    if (this.intervalId) return;
    this.logger.info('Starting JobPollingService (Local In-Memory Mode)');
    this.intervalId = setInterval(() => this.pollJobs(), this.pollingIntervalMs);
  }

  public stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      this.logger.info('Stopped JobPollingService.');
    }
  }

  private async pollJobs() {
    if (this.isPolling) return;
    this.isPolling = true;

    try {
      // Find all jobs that are still waiting for completion
      const activeJobs = await this.prisma.generationJob.findMany({
        where: {
          overallStatus: { in: ['pending', 'processing'] }
        },
        include: {
          videoGeneration: true
        }
      });

      for (const job of activeJobs) {
        if (!job.videoGeneration || !job.videoGeneration.externalJobId) continue;
        if (['completed', 'failed'].includes(job.videoGeneration.status)) continue;

        try {
          const provider = ProviderFactory.create('kling');
          const statusResult = await provider.getJobStatus(job.videoGeneration.externalJobId);
          
          const videoStatusMap: { [key: string]: string } = {
            'queued': 'pending', 'processing': 'processing',
            'completed': 'completed', 'succeeded': 'completed',
            'failed': 'failed', 'error': 'failed'
          };
          const newStatus = videoStatusMap[statusResult.status] || statusResult.status;

          // If status has changed, update DB
          if (newStatus !== job.videoGeneration.status) {
            await this.prisma.videoGeneration.update({
              where: { id: job.videoGeneration.id },
              data: {
                status: newStatus,
                ...(newStatus === 'completed' && { outputVideoUrl: statusResult.videoUrl }),
                ...(newStatus === 'failed' && { errorMessage: statusResult.error })
              }
            });

            let overallStatus = job.overallStatus;
            
            if (newStatus === 'completed') {
              overallStatus = 'completed'; // Assuming no audio step for MVP
            } else if (newStatus === 'failed') {
               overallStatus = 'failed';
               // Release credits on failure
               const costCalc = new CostCalculatorService(this.prisma);
               await costCalc.releaseCredits(job.userId, job.creditsEstimated);
            }

            await this.prisma.generationJob.update({
              where: { id: job.id },
              data: { 
                overallStatus,
                ...(newStatus === 'completed' && { startedAt: job.startedAt || new Date() })
              }
            });
            
            this.logger.info(`JobPollingService: Job ${job.id} updated to ${newStatus}`);
          }
        } catch (jobErr) {
          this.logger.error(`JobPollingService: Error polling job ${job.id}`, jobErr);
        }
      }
    } catch (err) {
      this.logger.error('JobPollingService: Error during polling cycle', err);
    } finally {
      this.isPolling = false;
    }
  }
}
