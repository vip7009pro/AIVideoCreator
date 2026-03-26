import { PrismaClient } from '@prisma/client';
import config from '../config';
import { Logger } from '../utils/helpers';
import { CostEstimate } from '../types';

export class CostCalculatorService {
  private prisma: PrismaClient;
  private logger: Logger;
  private pricing = config.pricing;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
    this.logger = Logger.getInstance();
  }

  /**
   * Estimate generation cost before user initiates
   */
  async estimateCost(
    userId: string,
    duration: 5 | 10 | 15,
    includeAudio: boolean = true
  ): Promise<CostEstimate> {
    try {
      // Get user's current credits
      const userCredits = await this.prisma.userCredits.findUnique({
        where: { userId },
      });

      if (!userCredits) {
        throw new Error('User credits not found');
      }

      // Calculate cost breakdown
      const videoGenerationCost = this.pricing.videoGeneration[duration];
      const audioGenerationCost = includeAudio ? this.pricing.audioGeneration : 0;
      const totalEstimatedCost = videoGenerationCost + audioGenerationCost;

      const canProceed = userCredits.availableCredits >= totalEstimatedCost;

      const estimate: CostEstimate = {
        estimatedCost: totalEstimatedCost,
        breakdown: {
          imageGeneration: 0, // Free in MVP
          videoGeneration: videoGenerationCost,
          audioGeneration: audioGenerationCost,
        },
        userCurrentCredits: userCredits.availableCredits,
        canProceed,
      };

      this.logger.info(`Cost estimation for user ${userId}:`, estimate);

      return estimate;
    } catch (error) {
      this.logger.error('Cost calculation failed', error);
      throw error;
    }
  }

  /**
   * Debit credits from user account after successful generation
   */
  async debitCredits(userId: string, amount: number, jobId: string): Promise<boolean> {
    try {
      const userCredits = await this.prisma.userCredits.findUnique({
        where: { userId },
      });

      if (!userCredits) {
        throw new Error('User credits not found');
      }

      if (userCredits.availableCredits < amount) {
        throw new Error('Insufficient credits');
      }

      // Update credits
      await this.prisma.userCredits.update({
        where: { userId },
        data: {
          availableCredits: userCredits.availableCredits - amount,
          usedCredits: userCredits.usedCredits + amount,
        },
      });

      // Log transaction
      await this.prisma.creditTransaction.create({
        data: {
          userId,
          jobId,
          type: 'job_consumed',
          amount: -amount,
          reason: `Generation job completed`,
          details: {
            jobId,
            timestamp: new Date().toISOString(),
          } as any,
        },
      });

      this.logger.info(`Debited ${amount} credits from user ${userId}`);

      return true;
    } catch (error) {
      this.logger.error('Credit debit failed', error);
      throw error;
    }
  }

  /**
   * Reserve credits (prevent user from spending them elsewhere)
   */
  async reserveCredits(userId: string, amount: number): Promise<boolean> {
    try {
      const userCredits = await this.prisma.userCredits.findUnique({
        where: { userId },
      });

      if (!userCredits || userCredits.availableCredits < amount) {
        return false;
      }

      // Update reserved credits
      await this.prisma.userCredits.update({
        where: { userId },
        data: {
          reservedCredits: userCredits.reservedCredits + amount,
        },
      });

      return true;
    } catch (error) {
      this.logger.error('Credit reservation failed', error);
      return false;
    }
  }

  /**
   * Release reserved credits (if generation fails or is cancelled)
   */
  async releaseCredits(userId: string, amount: number): Promise<boolean> {
    try {
      const userCredits = await this.prisma.userCredits.findUnique({
        where: { userId },
      });

      if (!userCredits) {
        return false;
      }

      await this.prisma.userCredits.update({
        where: { userId },
        data: {
          reservedCredits: Math.max(0, userCredits.reservedCredits - amount),
        },
      });

      return true;
    } catch (error) {
      this.logger.error('Failed to release credits', error);
      return false;
    }
  }
}
