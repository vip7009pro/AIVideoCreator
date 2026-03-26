import { create } from 'zustand';
import { FileWithPreview, GenerationJob, CostEstimate, GenerationSettings } from '../types/workflow.types';

interface UploadStore {
  files: {
    productImage?: FileWithPreview;
    modelImage?: FileWithPreview;
  };
  addFile: (type: 'productImage' | 'modelImage', file: FileWithPreview) => void;
  removeFile: (type: 'productImage' | 'modelImage') => void;
  updateFileProgress: (type: 'productImage' | 'modelImage', progress: number) => void;
  setFileStatus: (type: 'productImage' | 'modelImage', status: FileWithPreview['status']) => void;
  setFileError: (type: 'productImage' | 'modelImage', error: string) => void;
  clearFiles: () => void;
}

export const useUploadStore = create<UploadStore>((set) => ({
  files: {},
  addFile: (type, file) =>
    set((state) => ({
      files: { ...state.files, [type]: file },
    })),
  removeFile: (type) =>
    set((state) => {
      const newFiles = { ...state.files };
      delete newFiles[type as keyof typeof newFiles];
      return { files: newFiles };
    }),
  updateFileProgress: (type, progress) =>
    set((state) => {
      const file = state.files[type as keyof typeof state.files];
      if (file) {
        return {
          files: {
            ...state.files,
            [type]: { ...file, uploadProgress: progress },
          },
        };
      }
      return state;
    }),
  setFileStatus: (type, status) =>
    set((state) => {
      const file = state.files[type as keyof typeof state.files];
      if (file) {
        return {
          files: {
            ...state.files,
            [type]: { ...file, status },
          },
        };
      }
      return state;
    }),
  setFileError: (type, error) =>
    set((state) => {
      const file = state.files[type as keyof typeof state.files];
      if (file) {
        return {
          files: {
            ...state.files,
            [type]: { ...file, status: 'error', error },
          },
        };
      }
      return state;
    }),
  clearFiles: () => set({ files: {} }),
}));

interface JobStore {
  currentJobId?: string;
  jobStatus?: GenerationJob;
  isPolling: boolean;
  setJobId: (jobId: string) => void;
  setJobStatus: (status: GenerationJob) => void;
  startPolling: () => void;
  stopPolling: () => void;
}

export const useJobStore = create<JobStore>((set) => ({
  currentJobId: undefined,
  jobStatus: undefined,
  isPolling: false,
  setJobId: (jobId) => set({ currentJobId: jobId }),
  setJobStatus: (status) => set({ jobStatus: status }),
  startPolling: () => set({ isPolling: true }),
  stopPolling: () => set({ isPolling: false }),
}));

interface WorkflowStore {
  currentStep: number;
  completedSteps: number[];
  productAssetId?: string;
  modelAssetId?: string;
  settings?: GenerationSettings;
  costEstimate?: CostEstimate;
  error?: string;
  goToStep: (step: number) => void;
  completeStep: (step: number) => void;
  setAssetIds: (productAssetId: string, modelAssetId: string) => void;
  setSettings: (settings: GenerationSettings) => void;
  setCostEstimate: (estimate: CostEstimate) => void;
  setError: (error?: string) => void;
  reset: () => void;
}

export const useWorkflowStore = create<WorkflowStore>((set) => ({
  currentStep: 1,
  completedSteps: [],
  productAssetId: undefined,
  modelAssetId: undefined,
  settings: undefined,
  costEstimate: undefined,
  error: undefined,
  goToStep: (step) => set({ currentStep: step }),
  completeStep: (step) => set((state) => ({
    completedSteps: [...new Set([...state.completedSteps, step])],
  })),
  setAssetIds: (productAssetId, modelAssetId) => set({ productAssetId, modelAssetId }),
  setSettings: (settings) => set({ settings }),
  setCostEstimate: (estimate) => set({ costEstimate: estimate }),
  setError: (error) => set({ error }),
  reset: () => set({
    currentStep: 1,
    completedSteps: [],
    productAssetId: undefined,
    modelAssetId: undefined,
    settings: undefined,
    costEstimate: undefined,
    error: undefined,
  }),
}));

interface AuthStore {
  userId?: string;
  email?: string;
  userCredits: number;
  isAuthenticated: boolean;
  setAuth: (data: { userId: string; email: string; userCredits: number; isAuthenticated: boolean }) => void;
  checkAuth: () => void;
  logout: () => void;
  setCredits: (credits: number) => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  userId: undefined,
  email: undefined,
  userCredits: 0,
  isAuthenticated: !!localStorage.getItem('auth_token'),
  setAuth: (data) => set({ userId: data.userId, email: data.email, userCredits: data.userCredits, isAuthenticated: data.isAuthenticated }),
  checkAuth: () => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      // For MVP, we'll assume the token is valid if it exists
      // In a real app, we'd decode the JWT to get user info or call a /me endpoint
      set({ isAuthenticated: true });
    }
  },
  logout: () => {
    localStorage.removeItem('auth_token');
    set({ userId: undefined, email: undefined, isAuthenticated: false });
  },
  setCredits: (credits) => set({ userCredits: credits }),
}));
