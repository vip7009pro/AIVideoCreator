import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '../index';
import { authMiddleware } from '../middleware/auth';
import { CostCalculatorService } from '../services/CostCalculatorService';
import { ProviderFactory } from '../providers/ProviderFactory';
import { Logger } from '../utils/helpers';

const router = Router();
const logger = Logger.getInstance();

interface AuthRequest extends Request {
  userId?: string;
}

// POST /api/generation/estimate-cost
router.post('/estimate-cost', authMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId;
    const { duration, includeAudio } = req.body;

    if (!duration || ![5, 10, 15].includes(duration)) {
      return res.status(400).json({
        success: false,
        error: 'Duration must be 5, 10, or 15 seconds',
      });
    }

    // Get cost estimate
    const costCalculator = new CostCalculatorService(prisma);
    const costEstimate = await costCalculator.estimateCost(userId!, duration, includeAudio !== false);

    // Get user's current credits
    const userCredits = await prisma.userCredits.findUnique({
      where: { userId: userId! },
    });

    return res.status(200).json({
      success: true,
      data: {
        ...costEstimate,
        userCurrentCredits: userCredits?.availableCredits || 0,
        canProceed: (userCredits?.availableCredits || 0) >= costEstimate.estimatedCost,
      },
    });
  } catch (error) {
    logger.error('Cost estimation error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to estimate cost',
    });
  }
});

// POST /api/generation/generate-video
router.post('/generate-video', authMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId;
    const {
      projectId,
      productAssetId,
      modelAssetId,
      duration,
      modelMovement,
      voiceProfile,
      audioStyle,
      scriptText,
      includeAudio,
    } = req.body;

    // Validation
    if (!projectId || !productAssetId || !modelAssetId) {
      return res.status(400).json({
        success: false,
        error: 'projectId, productAssetId, and modelAssetId are required',
      });
    }

    if (!duration || ![5, 10, 15].includes(duration)) {
      return res.status(400).json({
        success: false,
        error: 'Duration must be 5, 10, or 15 seconds',
      });
    }

    // Check project ownership
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project || project.userId !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized',
      });
    }

    // Check assets existence
    const productAsset = await prisma.projectAsset.findUnique({
      where: { id: productAssetId },
    });

    if (!productAsset || productAsset.projectId !== projectId) {
      return res.status(404).json({
        success: false,
        error: 'Product asset not found',
      });
    }

    // Calculate costs
    const costCalculator = new CostCalculatorService(prisma);
    const costEstimate = await costCalculator.estimateCost(userId!, duration, includeAudio !== false);

    // Check user has sufficient credits
    const userCredits = await prisma.userCredits.findUnique({
      where: { userId: userId! },
    });

    if (!userCredits || userCredits.availableCredits < costEstimate.estimatedCost) {
      return res.status(402).json({
        success: false,
        error: 'Insufficient credits',
        required: costEstimate.estimatedCost,
        available: userCredits?.availableCredits || 0,
      });
    }

    // Reserve credits
    await costCalculator.reserveCredits(userId!, costEstimate.estimatedCost);

    // Create top-level generation job
    const generationJob = await prisma.generationJob.create({
      data: {
        userId: userId!,
        projectId,
        overallStatus: 'pending',
        creditsEstimated: costEstimate.estimatedCost,
      },
    });

    // Step 1: Create Image Generation record (Bypass Akool for MVP Phase 1)
    // We mock this as completed using the product image as the result
    const imageJob = await prisma.imageGeneration.create({
      data: {
        jobId: generationJob.id,
        projectId,
        projectAssetId: productAssetId,
        modelAssetId,
        status: 'completed', // Immediately completed for MVP
        provider: 'akool',
        outputImageUrl: productAsset.storageUrl,
        completedAt: new Date(),
      },
    });

    // Step 2: Create Video Generation record
    const videoJob = await prisma.videoGeneration.create({
      data: {
        jobId: generationJob.id,
        projectId,
        imageGenerationJobId: imageJob.id,
        duration,
        modelMovement: modelMovement || 'walking',
        status: 'pending',
        provider: 'kling',
      },
    });

    // Step 3: Trigger actual generation with AI provider
    try {
      const provider = ProviderFactory.create('kling');
      const response = await (provider as any).generateVideo(
        imageJob.outputImageUrl,
        duration,
        modelMovement || 'walking'
      );

      if (response.status === 'success') {
        await prisma.videoGeneration.update({
          where: { id: videoJob.id },
          data: {
            externalJobId: response.jobId,
            status: 'processing',
          },
        });
        
        await prisma.generationJob.update({
          where: { id: generationJob.id },
          data: { 
            overallStatus: 'processing',
            startedAt: new Date()
          },
        });
      } else {
        throw new Error(response.error || 'Provider failed to start generation');
      }
    } catch (providerErr) {
      logger.error('Failed to trigger AI provider:', providerErr);
      await prisma.videoGeneration.update({
        where: { id: videoJob.id },
        data: {
          status: 'failed',
          errorMessage: providerErr instanceof Error ? providerErr.message : 'Provider error',
        },
      });
      await prisma.generationJob.update({
        where: { id: generationJob.id },
        data: { overallStatus: 'failed' },
      });
    }

    // Step 4: Create Audio Generation job if requested
    if (includeAudio) {
      await prisma.audioGeneration.create({
        data: {
          jobId: generationJob.id,
          projectId,
          videoGenerationJobId: videoJob.id,
          status: 'pending',
          voiceProfile: voiceProfile || 'default',
          audioStyle: audioStyle || 'tts',
          scriptText: scriptText || '',
          provider: 'elevenlabs',
        },
      });
    }

    // Create credit transaction audit
    await prisma.creditTransaction.create({
      data: {
        userId: userId!,
        jobId: generationJob.id,
        type: 'job_consumed',
        amount: -costEstimate.estimatedCost,
        reason: `Video generation (${duration}s)${includeAudio ? ' + Audio' : ''}`,
      },
    });

    // Debit credits
    await costCalculator.debitCredits(userId!, costEstimate.estimatedCost, generationJob.id);

    logger.info(`Generation job started: ${generationJob.id} for user ${userId}`);

    // TODO: Queue job for processing via job queue (Bull, RabbitMQ, etc.)
    // For now, we'll add status endpoint that polls the provider

    return res.status(201).json({
      success: true,
      data: {
        jobId: generationJob.id,
        videoJobId: videoJob.id,
        status: 'pending',
        creditsUsed: costEstimate.estimatedCost,
      },
    });
  } catch (error) {
    logger.error('Generation start error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to start generation',
    });
  }
});

// GET /api/generation/job/:jobId
router.get('/job/:jobId', authMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId;
    const jobId = req.params.jobId as string;

    // Get generation job with all details
    const job = await prisma.generationJob.findUnique({
      where: { id: jobId },
      include: {
        imageGeneration: true,
        videoGeneration: true,
        audioGeneration: true,
        outputs: true,
      },
    });

    if (!job) {
      return res.status(404).json({
        success: false,
        error: 'Job not found',
      });
    }

    // Check ownership
    if (job.userId !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized',
      });
    }

    return res.status(200).json({
      success: true,
      data: job,
    });
  } catch (error) {
    logger.error('Get job error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch job',
    });
  }
});

// POST /api/generation/job/:jobId/status - Poll job status
router.post('/job/:jobId/status', authMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId;
    const jobId = req.params.jobId as string;

    // Get generation job
    const job = await prisma.generationJob.findUnique({
      where: { id: jobId },
      include: {
        videoGeneration: true,
        audioGeneration: true,
      },
    });

    if (!job) {
      return res.status(404).json({
        success: false,
        error: 'Job not found',
      });
    }

    // Check ownership
    if (job.userId !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized',
      });
    }

    // If job is pending or processing, check provider status
    if (['pending', 'processing'].includes(job.overallStatus)) {
      if (job.videoGeneration && job.videoGeneration.externalJobId) {
        try {
          // Get provider and check status
          const provider = 'kling'; // Currently hardcoded, would be dynamic
          const klingProvider = ProviderFactory.create(provider);

          const providerStatus = await klingProvider.getJobStatus(job.videoGeneration.externalJobId);

          // Update video generation status
          const videoStatusMap: { [key: string]: string } = {
            'queued': 'pending',
            'processing': 'processing',
            'completed': 'completed',
            'succeeded': 'completed',
            'failed': 'failed',
            'error': 'failed',
          };

          const mappedStatus = videoStatusMap[providerStatus.status] || providerStatus.status;

          await prisma.videoGeneration.update({
            where: { id: job.videoGeneration.id },
            data: {
              status: mappedStatus,
              ...(mappedStatus === 'completed' && { outputVideoUrl: providerStatus.videoUrl }),
              ...(mappedStatus === 'failed' && { errorMessage: providerStatus.error }),
            },
          });

          // Update overall job status
          let overallStatus = job.overallStatus;
          if (mappedStatus === 'completed' && !job.audioGeneration) {
            overallStatus = 'completed';
          } else if (mappedStatus === 'failed') {
            overallStatus = 'failed';
            // Release reserved credits on failure
            const costCalculator = new CostCalculatorService(prisma);
            await costCalculator.releaseCredits(userId!, job.creditsEstimated);
          }

          await prisma.generationJob.update({
            where: { id: jobId },
            data: {
              overallStatus,
              ...(mappedStatus === 'completed' && { startedAt: job.startedAt || new Date() }),
            },
          });

          logger.info(`Job status updated: ${jobId} -> ${mappedStatus}`);
        } catch (error) {
          logger.error(`Error polling provider status:`, error);
          // Continue anyway - don't fail the status check
        }
      }
    }

    // Get updated job
    const updatedJob = await prisma.generationJob.findUnique({
      where: { id: jobId },
      include: {
        videoGeneration: true,
        audioGeneration: true,
        outputs: true,
      },
    });

    return res.status(200).json({
      success: true,
      data: updatedJob,
    });
  } catch (error) {
    logger.error('Job status polling error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to check job status',
    });
  }
});

// GET /api/generation/jobs - Get user's generation jobs
router.get('/jobs', authMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
    const offset = parseInt(req.query.offset as string) || 0;

    const jobs = await prisma.generationJob.findMany({
      where: { userId: userId! },
      include: {
        videoGeneration: true,
        audioGeneration: true,
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    });

    const total = await prisma.generationJob.count({
      where: { userId: userId! },
    });

    return res.status(200).json({
      success: true,
      data: jobs,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    });
  } catch (error) {
    logger.error('Get jobs error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch jobs',
    });
  }
});

// POST /api/generation/job/:jobId/cancel - Cancel a job
router.post('/job/:jobId/cancel', authMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId;
    const jobId = req.params.jobId as string;

    const job = await prisma.generationJob.findUnique({
      where: { id: jobId },
    });

    if (!job) {
      return res.status(404).json({
        success: false,
        error: 'Job not found',
      });
    }

    if (job.userId !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized',
      });
    }

    if (!['pending', 'processing'].includes(job.overallStatus)) {
      return res.status(400).json({
        success: false,
        error: 'Can only cancel pending or processing jobs',
      });
    }

    // Release reserved credits
    const costCalculator = new CostCalculatorService(prisma);
    await costCalculator.releaseCredits(userId!, job.creditsEstimated);

    // Update job status
    await prisma.generationJob.update({
      where: { id: jobId as string },
      data: {
        overallStatus: 'failed',
        errorMessage: 'Cancelled by user',
      },
    });

    logger.info(`Job cancelled: ${jobId}`);

    return res.status(200).json({
      success: true,
      message: 'Job cancelled',
    });
  } catch (error) {
    logger.error('Job cancellation error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to cancel job',
    });
  }
});

export default router;
