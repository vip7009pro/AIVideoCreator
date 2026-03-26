import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '../index';
import { AuthService } from '../services/AuthService';
import { Logger } from '../utils/helpers';

const router = Router();
const logger = Logger.getInstance();

interface RegisterRequest extends Request {
  body: {
    email: string;
    password: string;
  };
}

interface LoginRequest extends Request {
  body: {
    email: string;
    password: string;
  };
}

// POST /api/auth/register
router.post('/register', async (req: RegisterRequest, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required',
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 8 characters',
      });
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: 'User with this email already exists',
      });
    }

    // Register user
    const authService = new AuthService(prisma);
    const result = await authService.registerUser(email, password);

    logger.info(`User registered: ${email}`);

    return res.status(201).json({
      success: true,
      data: {
        userId: result.userId,
        email,
        token: result.token,
      },
    });
  } catch (error) {
    logger.error('Registration error:', error);
    return res.status(500).json({
      success: false,
      error: 'Registration failed',
    });
  }
});

// POST /api/auth/login
router.post('/login', async (req: LoginRequest, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required',
      });
    }

    // Login user
    const authService = new AuthService(prisma);
    const result = await authService.loginUser(email, password);

    if (!result) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password',
      });
    }

    logger.info(`User logged in: ${email}`);

    return res.status(200).json({
      success: true,
      data: {
        userId: result.userId,
        email,
        token: result.token,
      },
    });
  } catch (error) {
    logger.error('Login error:', error);
    return res.status(500).json({
      success: false,
      error: 'Login failed',
    });
  }
});

export default router;
