import axios, { AxiosInstance } from 'axios';
import { GenerationJob, CostEstimate } from '../../types/workflow.types';

export class ApiClient {
  private client: AxiosInstance;
  private token: string | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: 'http://localhost:3000/api',
      timeout: 30000,
    });

    // Add token to requests
    this.client.interceptors.request.use((config) => {
      if (this.token) {
        config.headers.Authorization = `Bearer ${this.token}`;
      }
      return config;
    });

    // Handle errors
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Token expired or invalid - logout user
          this.logout();
        }
        return Promise.reject(error);
      }
    );

    // Restore token from localStorage
    const savedToken = localStorage.getItem('auth_token');
    if (savedToken) {
      this.token = savedToken;
    }
  }

  // ============= Auth =============

  async register(email: string, password: string): Promise<{ userId: string; token: string }> {
    const response = await this.client.post('/auth/register', { email, password });
    this.setToken(response.data.data.token);
    return response.data.data;
  }

  async login(email: string, password: string): Promise<{ userId: string; token: string }> {
    const response = await this.client.post('/auth/login', { email, password });
    this.setToken(response.data.data.token);
    return response.data.data;
  }

  async logout(): Promise<void> {
    this.token = null;
    localStorage.removeItem('auth_token');
  }

  // ============= Projects =============

  async createProject(name: string, description?: string): Promise<{ id: string }> {
    const response = await this.client.post('/projects', { name, description });
    return response.data.data;
  }

  async getProjects(): Promise<any[]> {
    const response = await this.client.get('/projects');
    return response.data.data;
  }

  async deleteProject(projectId: string): Promise<void> {
    await this.client.delete(`/projects/${projectId}`);
  }

  // ============= File Upload =============

  async uploadFile(
    projectId: string,
    file: File,
    assetType: 'product_image' | 'model_image'
  ): Promise<{ assetId: string; url: string }> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('assetType', assetType);

    const response = await this.client.post(`/projects/${projectId}/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return {
      assetId: response.data.data.id,
      url: response.data.data.storageUrl,
    };
  }

  // ============= Cost Estimation =============

  async estimateCost(
    duration: 5 | 10 | 15,
    includeAudio: boolean = true
  ): Promise<CostEstimate> {
    const response = await this.client.post('/generation/estimate-cost', {
      duration,
      includeAudio,
    });
    return response.data.data;
  }

  // ============= Generation =============

  async startGeneration(
    projectId: string,
    productAssetId: string,
    modelAssetId: string,
    videoSettings: {
      duration: 5 | 10 | 15;
      modelMovement: 'walking' | 'posing';
      voiceProfile: string;
      audioStyle: 'tts' | 'background_music';
      scriptText?: string;
    }
  ): Promise<{ jobId: string; status: string }> {
    const response = await this.client.post('/generation/generate-video', {
      projectId,
      productAssetId,
      modelAssetId,
      ...videoSettings,
    });
    return response.data.data;
  }

  async getJobStatus(jobId: string): Promise<GenerationJob> {
    const response = await this.client.post(`/generation/job/${jobId}/status`);
    return response.data.data;
  }

  async getJobOutput(jobId: string): Promise<GenerationJob> {
    const response = await this.client.get(`/generation/job/${jobId}`);
    return response.data.data;
  }

  // ============= Helper Methods =============

  private setToken(token: string): void {
    this.token = token;
    localStorage.setItem('auth_token', token);
  }

  getToken(): string | null {
    return this.token;
  }

  isAuthenticated(): boolean {
    return this.token !== null;
  }
}

// Export singleton instance
export const apiClient = new ApiClient();
