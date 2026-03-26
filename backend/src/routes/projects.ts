import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import path from 'path';
import { prisma } from '../index';
import { authMiddleware } from '../middleware/auth';
import { FileStorageService } from '../services/FileStorageService';
import { ValidationHelper, Logger } from '../utils/helpers';

const router = Router();
const logger = Logger.getInstance();

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB
  },
  fileFilter: (req, file, cb) => {
    // Accept images only
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
});

interface AuthRequest extends Request {
  userId?: string;
}

// POST /api/projects - Create a new project
router.post('/', authMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId;
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        error: 'Project name is required',
      });
    }

    const project = await prisma.project.create({
      data: {
        userId: userId!,
        name,
        description: description || '',
        status: 'active',
      },
    });

    logger.info(`Project created: ${project.id} for user ${userId}`);

    return res.status(201).json({
      success: true,
      data: project,
    });
  } catch (error) {
    logger.error('Create project error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to create project',
    });
  }
});

// GET /api/projects - Get all projects for user
router.get('/', authMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId;

    const projects = await prisma.project.findMany({
      where: { userId: userId! },
      include: {
        assets: true,
        generationJobs: {
          take: 5, // Last 5 jobs
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.status(200).json({
      success: true,
      data: projects,
    });
  } catch (error) {
    logger.error('Get projects error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch projects',
    });
  }
});

// GET /api/projects/:projectId - Get single project
router.get('/:projectId', authMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId;
    const projectId = req.params.projectId as string;

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        assets: true,
        generationJobs: {
          take: 10,
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Project not found',
      });
    }

    // Check ownership
    if (project.userId !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized',
      });
    }

    return res.status(200).json({
      success: true,
      data: project,
    });
  } catch (error) {
    logger.error('Get project error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch project',
    });
  }
});

// PUT /api/projects/:projectId - Update project
router.put('/:projectId', authMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId;
    const projectId = req.params.projectId as string;
    const { name, description, status } = req.body;

    // Check ownership
    const project = await prisma.project.findUnique({
      where: { id: projectId as string },
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Project not found',
      });
    }

    if (project.userId !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized',
      });
    }

    const updated = await prisma.project.update({
      where: { id: projectId as string },
      data: {
        ...(name && { name }),
        ...(description && { description }),
        ...(status && { status }),
      },
    });

    logger.info(`Project updated: ${projectId}`);

    return res.status(200).json({
      success: true,
      data: updated,
    });
  } catch (error) {
    logger.error('Update project error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to update project',
    });
  }
});

// DELETE /api/projects/:projectId - Delete project
router.delete('/:projectId', authMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId;
    const projectId = req.params.projectId as string;

    // Check ownership
    const project = await prisma.project.findUnique({
      where: { id: projectId as string },
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Project not found',
      });
    }

    if (project.userId !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized',
      });
    }

    await prisma.project.delete({
      where: { id: projectId as string },
    });

    logger.info(`Project deleted: ${projectId}`);

    return res.status(200).json({
      success: true,
      message: 'Project deleted',
    });
  } catch (error) {
    logger.error('Delete project error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to delete project',
    });
  }
});

// POST /api/projects/:projectId/upload - Upload asset
router.post('/:projectId/upload', authMiddleware, upload.single('file'), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId;
    const projectId = req.params.projectId as string;
    const assetType = req.body.assetType; // product_image, model_image

    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file provided',
      });
    }

    if (!assetType || !['product_image', 'model_image', 'template'].includes(assetType)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid asset type',
      });
    }

    // Check project ownership
    const project = await prisma.project.findUnique({
      where: { id: projectId as string },
    });

    if (!project || project.userId !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized',
      });
    }

    // Save file
    const fileBuffer = req.file.buffer;
    const randomName = `${Date.now()}-${Math.random().toString(36).substring(7)}`;
    const fileName = `${randomName}${path.extname(req.file.originalname)}`;

    const fileStorageService = new FileStorageService();
    const storedFile = await fileStorageService.saveFile(
      fileBuffer,
      fileName,
      userId!,
      projectId
    );

    // Create asset record
    const asset = await prisma.projectAsset.create({
      data: {
        projectId: projectId as string,
        userId: userId!,
        assetType,
        originalFileName: req.file.originalname,
        storageUrl: storedFile.storageUrl,
        storageKey: storedFile.storageKey,
        fileSize: req.file.size,
        mimeType: req.file.mimetype,
        width: parseInt(req.body.width || '0') || null,
        height: parseInt(req.body.height || '0') || null,
      },
    });

    logger.info(`Asset uploaded: ${asset.id} for project ${projectId}`);

    return res.status(201).json({
      success: true,
      data: asset,
    });
  } catch (error) {
    logger.error('Asset upload error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to upload asset',
    });
  }
});

// GET /api/projects/:projectId/assets - Get project assets
router.get('/:projectId/assets', authMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId;
    const projectId = req.params.projectId as string;

    // Check ownership
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project || project.userId !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized',
      });
    }

    const assets = await prisma.projectAsset.findMany({
      where: { projectId: projectId as string },
      orderBy: { uploadedAt: 'desc' },
    });

    return res.status(200).json({
      success: true,
      data: assets,
    });
  } catch (error) {
    logger.error('Get assets error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch assets',
    });
  }
});

// DELETE /api/projects/:projectId/assets/:assetId - Delete asset
router.delete('/:projectId/assets/:assetId', authMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId;
    const projectId = req.params.projectId as string;
    const assetId = req.params.assetId as string;

    // Check project ownership
    const project = await prisma.project.findUnique({
      where: { id: projectId as string },
    });

    if (!project || project.userId !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized',
      });
    }

    // Get asset to delete file
    const asset = await prisma.projectAsset.findUnique({
      where: { id: assetId as string },
    });

    if (!asset || asset.projectId !== projectId) {
      return res.status(404).json({
        success: false,
        error: 'Asset not found',
      });
    }

    // Delete file from storage
    const fileStorageService = new FileStorageService();
    await fileStorageService.deleteFile(asset.storageKey);

    // Delete asset record
    await prisma.projectAsset.delete({
      where: { id: assetId as string },
    });

    logger.info(`Asset deleted: ${assetId}`);

    return res.status(200).json({
      success: true,
      message: 'Asset deleted',
    });
  } catch (error) {
    logger.error('Delete asset error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to delete asset',
    });
  }
});

export default router;
