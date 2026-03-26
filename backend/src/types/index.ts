// ============= User & Auth Types =============

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserPayload {
  email: string;
  password: string;
}

export interface AuthToken {
  userId: string;
  email: string;
  iat: number;
  exp: number;
}

// ============= Project Types =============

export interface Project {
  id: string;
  userId: string;
  name: string;
  description?: string;
  status: 'active' | 'archived';
  createdAt: Date;
  updatedAt: Date;
}

export interface ProjectAsset {
  id: string;
  projectId: string;
  userId: string;
  assetType: 'product_image' | 'model_image' | 'template';
  storageUrl: string;
  storageKey: string;
  fileSize: number;
  mimeType: string;
  uploadedAt: Date;
}

// ============= Generation Job Types =============

export enum JobStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export interface GenerationJob {
  id: string;
  userId: string;
  projectId: string;
  overallStatus: JobStatus;
  creditsEstimated: number;
  creditsUsed: number;
  errorMessage?: string;
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
}

export interface GenerationSettings {
  duration: 5 | 10 | 15;
  modelMovement: 'walking' | 'posing';
  voiceProfile: string;
  audioStyle: 'tts' | 'background_music';
  scriptText?: string;
}

// ============= Cost Estimation Types =============

export interface CostEstimate {
  estimatedCost: number;
  breakdown: {
    imageGeneration: number;
    videoGeneration: number;
    audioGeneration: number;
  };
  userCurrentCredits: number;
  canProceed: boolean;
}

// ============= API Response Types =============

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  statusCode: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}

// ============= File Upload Types =============

export interface UploadedFile {
  storageKey: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
}
