import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { ArrowRight } from 'lucide-react';
import { DropZone } from '../components/features/DropZone';
import { PreviewGallery } from '../components/features/PreviewGallery';
import { SettingsForm } from '../components/features/SettingsForm';
import { StepIndicator } from '../components/features/StepIndicator';
import { JobStatusCard } from '../components/features/JobStatusCard';
import { CostEstimateCard } from '../components/features/CostEstimateCard';
import { useFileUpload } from '../hooks/useFileUpload';
import { useJobPolling } from '../hooks/useJobPolling';
import { useWorkflowStore, useUploadStore } from '../store';
import { apiClient } from '../services/api/client';
import { GenerationSettings, CostEstimate } from '../types/workflow.types';
import { Logger } from '../utils/helpers';

const logger = Logger.getInstance();

const WORKFLOW_STEPS = [
  { step: 1, label: 'Upload Images', description: 'Upload product and model images' },
  { step: 2, label: 'Configure Settings', description: 'Choose video duration and style' },
  { step: 3, label: 'Estimate & Confirm', description: 'Review cost and confirm generation' },
  { step: 4, label: 'Generate Video', description: 'Video is being created' },
];

export const WorkflowPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [projectId, setProjectId] = useState<string | null>(null);
  const [estimatedCost, setEstimatedCost] = useState<CostEstimate | null>(null);
  const [costError, setCostError] = useState<string | null>(null);
  const [isEstimating, setIsEstimating] = useState(false);

  const { currentStep, completedSteps, productAssetId, modelAssetId, settings, goToStep, completeStep, setAssetIds, setSettings, reset } = useWorkflowStore();
  const { files, clearFiles } = useUploadStore();
  const { uploadBothFiles, isUploading } = useFileUpload(projectId || undefined);
  const [jobId, setJobId] = useState<string | null>(null);
  const { job } = useJobPolling(jobId || undefined, !!jobId);

  // Initialize projectId from URL or create new project
  useEffect(() => {
    const queryProjectId = searchParams.get('projectId');
    
    if (queryProjectId) {
      setProjectId(queryProjectId);
      logger.info(`Using project from URL: ${queryProjectId}`);
    } else {
      // Create a new project
      const createProject = async () => {
        try {
          const { id } = await apiClient.createProject('Video Generation Project', 'Auto-generated project');
          setProjectId(id);
          logger.info(`Project created: ${id}`);
        } catch (error) {
          logger.error('Failed to create project:', error);
        }
      };
      createProject();
    }
  }, [searchParams]);

  const handleEstimateCost = async (duration: number, includeAudio: boolean = true) => {
    setIsEstimating(true);
    setCostError(null);
    try {
      const estimate = await apiClient.estimateCost(duration as 5 | 10 | 15, includeAudio);
      setEstimatedCost(estimate);
      logger.info(`Cost estimated: ${estimate.estimatedCost} credits`);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to estimate cost';
      setCostError(errorMsg);
      logger.error('Cost estimation error:', error);
    } finally {
      setIsEstimating(false);
    }
  };

  const handleUploadImages = async () => {
    try {
      const uploadedIds = await uploadBothFiles();
      if (uploadedIds) {
        setAssetIds(uploadedIds.productImageId!, uploadedIds.modelImageId!);
        completeStep(1);
        goToStep(2);
        logger.info('Images uploaded successfully');
      }
    } catch (error) {
      logger.error('Image upload error:', error);
    }
  };

  const handleSettingsSubmit = async (settings: GenerationSettings) => {
    if (!projectId) {
      logger.error('No project ID available');
      return;
    }

    // Estimate cost first
    await handleEstimateCost(settings.duration, true);
    setSettings(settings);
    completeStep(2);
    goToStep(3);
  };

  const handleConfirmAndGenerate = async () => {
    if (!projectId || !estimatedCost || !productAssetId || !modelAssetId || !settings) {
      logger.error('Missing required data for generation');
      return;
    }

    try {
      const { jobId } = await apiClient.startGeneration(projectId, productAssetId, modelAssetId, settings);
      setJobId(jobId);
      completeStep(3);
      goToStep(4);
      logger.info(`Generation job submitted: ${jobId}`);
    } catch (error) {
      logger.error('Generation start error:', error);
    }
  };

  const handleReset = () => {
    reset();
    clearFiles();
    setEstimatedCost(null);
    setCostError(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 py-8">
      <div className="mx-auto max-w-6xl px-4">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <button
              onClick={() => navigate('/dashboard')}
              className="mb-4 inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
            >
              <ArrowLeft size={18} />
              Back to Dashboard
            </button>
            <h1 className="text-4xl font-bold text-white">Video Generation Workflow</h1>
            <p className="mt-2 text-lg text-gray-400">
              Create professional AI-generated videos from product and model images
            </p>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main workflow content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Step 1: Upload Images */}
            {currentStep >= 1 && (
              <div className="rounded-lg border border-slate-700 bg-slate-800 p-6 shadow-xl">
                <h2 className="mb-4 text-xl font-semibold text-white">
                  Step 1: Upload Images
                </h2>

                <div className="space-y-4">
                  <DropZone assetType="product_image" />
                  <DropZone assetType="model_image" />

                  {files.productImage || files.modelImage ? (
                    <>
                      <PreviewGallery />
                      <button
                        onClick={handleUploadImages}
                        disabled={isUploading || !files.productImage || !files.modelImage}
                        className="mt-6 w-full rounded-lg bg-blue-600 py-3 px-4 font-medium text-white hover:bg-blue-700 disabled:bg-gray-400 flex items-center justify-center gap-2"
                      >
                        {isUploading ? 'Uploading...' : 'Proceed to Settings'}
                        {!isUploading && <ArrowRight size={18} />}
                      </button>
                    </>
                  ) : (
                    <p className="text-sm text-gray-400">Upload both images to continue</p>
                  )}
                </div>
              </div>
            )}

            {/* Step 2: Configure Settings */}
            {currentStep >= 2 && completedSteps.includes(1) && (
              <div className="rounded-lg border border-slate-700 bg-slate-800 p-6 shadow-xl">
                <h2 className="mb-4 text-xl font-semibold text-white">
                  Step 2: Configure Settings
                </h2>
                <SettingsForm
                  onSubmit={handleSettingsSubmit}
                  isLoading={isEstimating}
                />
              </div>
            )}

            {/* Step 3: Review Cost */}
            {currentStep >= 3 && completedSteps.includes(2) && (
              <div className="rounded-lg border border-slate-700 bg-slate-800 p-6 shadow-xl">
                <h2 className="mb-4 text-xl font-semibold text-white">
                  Step 3: Review & Confirm
                </h2>

                <CostEstimateCard
                  estimate={estimatedCost}
                  isLoading={isEstimating}
                  error={costError || undefined}
                />

                <button
                  onClick={handleConfirmAndGenerate}
                  disabled={!estimatedCost?.canProceed || isEstimating}
                  className="mt-6 w-full rounded-lg bg-green-600 py-3 px-4 font-medium text-white hover:bg-green-700 disabled:bg-gray-400"
                >
                  Generate Video
                </button>
              </div>
            )}

            {/* Step 4: Generation Progress */}
            {currentStep >= 4 && completedSteps.includes(3) && (
              <div className="rounded-lg border border-slate-700 bg-slate-800 p-6 shadow-xl">
                <h2 className="mb-4 text-xl font-semibold text-white">
                  Step 4: Generation in Progress
                </h2>

                <JobStatusCard
                  jobId={jobId || ''}
                  status={job?.overallStatus as any || 'pending'}
                  progress={0}
                  error={job?.errorMessage}
                  outputUrl={job?.videoGeneration?.outputVideoUrl}
                  startedAt={job?.createdAt || new Date().toISOString()}
                  completedAt={job?.completedAt}
                />

                {job?.overallStatus === 'completed' && (
                  <button
                    onClick={handleReset}
                    className="mt-6 w-full rounded-lg bg-blue-600 py-3 px-4 font-medium text-white hover:bg-blue-700"
                  >
                    Start New Generation
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Sidebar: Progress indicator */}
          <div className="rounded-lg border border-slate-700 bg-slate-800 p-6 shadow-xl h-fit">
            <h3 className="mb-6 text-lg font-semibold text-white">Workflow Progress</h3>
            <StepIndicator
              steps={WORKFLOW_STEPS}
              currentStep={currentStep}
              completedSteps={completedSteps}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
