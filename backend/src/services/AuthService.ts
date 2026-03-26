import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import config from '../config';
import { Logger } from '../utils/helpers';
import { AuthToken } from '../types';

export class AuthService {
  private prisma: PrismaClient;
  private logger: Logger;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
    this.logger = Logger.getInstance();
  }

  /**
   * Register a new user
   */
  async registerUser(email: string, password: string): Promise<{ userId: string; token: string }> {
    try {
      // Check if user already exists
      const existingUser = await this.prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        throw new Error('User already exists with this email');
      }

      // Hash password
      const passwordHash = await bcrypt.hash(password, 10);

      // Create user
      const user = await this.prisma.user.create({
        data: {
          email,
          passwordHash,
          credits: {
            create: {
              availableCredits: config.pricing.initialUserCredits,
            },
          },
        },
      });

      // Generate token
      const token = this.generateToken(user.id, email);

      this.logger.info(`User registered: ${email}`);

      return { userId: user.id, token };
    } catch (error) {
      this.logger.error('User registration failed', error);
      throw error;
    }
  }

  /**
   * Login user
   */
  async loginUser(email: string, password: string): Promise<{ userId: string; token: string }> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        throw new Error('Invalid email or password');
      }

      const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

      if (!isPasswordValid) {
        throw new Error('Invalid email or password');
      }

      const token = this.generateToken(user.id, email);

      this.logger.info(`User logged in: ${email}`);

      return { userId: user.id, token };
    } catch (error) {
      this.logger.error('User login failed', error);
      throw error;
    }
  }

  /**
   * Verify JWT token
   */
  async verifyToken(token: string): Promise<AuthToken> {
    try {
      const decoded = jwt.verify(token, config.jwtSecret) as AuthToken;
      return decoded;
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  }

  /**
   * Generate JWT token
   */
  private generateToken(userId: string, email: string): string {
    const payload: AuthToken = {
      userId,
      email,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60, // 7 days
    };

    return jwt.sign(payload, config.jwtSecret);
  }
}
