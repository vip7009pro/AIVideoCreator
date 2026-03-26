// Frontend types

export enum JobStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export interface FileWithPreview {
  id: string;
  file: File | null;
  preview: string; // Data URL
  status: 'pending' | 'uploading' | 'success' | 'error';
  uploadProgress: number;
  error?: string;
}

export interface GenerationJob {
  id: string;
  status: JobStatus;
  imageGenerationStatus?: JobStatus;
  videoGenerationStatus?: JobStatus;
  audioGenerationStatus?: JobStatus;
  progress: number;
  createdAt: string;
  completedAt?: string;
  errorMessage?: string;
}

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

export interface GenerationSettings {
  duration: 5 | 10 | 15;
  modelMovement: 'walking' | 'posing';
  voiceProfile: string;
  audioStyle: 'tts' | 'background_music';
  scriptText?: string;
}

export interface WorkflowState {
  currentStep: number;
  completedSteps: number[];
  uploadedFiles: {
    productImage?: FileWithPreview;
    modelImage?: FileWithPreview;
  };
  settings: {
    duration: 5 | 10 | 15;
    modelMovement: 'walking' | 'posing';
    voiceProfile: string;
    audioStyle: 'tts' | 'background_music';
    scriptText?: string;
  };
  currentJobId?: string;
  jobStatus?: GenerationJob;
  costEstimate?: CostEstimate;
  error?: string;
}
