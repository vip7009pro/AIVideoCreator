import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import config from '../config';
import { Logger } from '../utils/helpers';
import { AuthToken } from '../types';

declare global {
  namespace Express {
    interface Request {
      userId?: string;
      user?: AuthToken;
    }
  }
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      res.status(401).json({ success: false, error: 'No token provided' });
      return;
    }

    const decoded = jwt.verify(token, config.jwtSecret) as AuthToken;
    req.userId = decoded.userId;
    req.user = decoded;
    next();
  } catch (error) {
    Logger.getInstance().warn('Token verification failed', error);
    res.status(401).json({ success: false, error: 'Invalid token' });
  }
};

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  Logger.getInstance().error('Unhandled error', error);

  if (error.name === 'ValidationError') {
    res.status(400).json({ success: false, error: error.message });
    return;
  }

  res.status(500).json({
    success: false,
    error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
  });
};

export const creditValidationMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  // This will be implemented in Phase 5 when we have database access
  next();
};
