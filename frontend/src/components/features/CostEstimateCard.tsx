import React from 'react';
import { AlertCircle } from 'lucide-react';
import { CostEstimate } from '../../types/workflow.types';

interface CostEstimateCardProps {
  estimate: CostEstimate | null;
  isLoading?: boolean;
  error?: string;
}

export const CostEstimateCard: React.FC<CostEstimateCardProps> = ({
  estimate,
  isLoading = false,
  error,
}) => {
  if (isLoading) {
    return (
      <div className="rounded-lg border border-gray-200 p-4">
        <div className="animate-pulse space-y-2">
          <div className="h-4 w-24 rounded bg-gray-200" />
          <div className="h-8 w-32 rounded bg-gray-200" />
        </div>
      </div>
    );
  }

  if (!estimate) {
    return null;
  }

  const hasEnoughCredits = estimate.canProceed;

  return (
    <div className={`rounded-lg border-2 p-4 ${
      hasEnoughCredits 
        ? 'border-green-200 bg-green-50' 
        : 'border-red-200 bg-red-50'
    }`}>
      <div className="space-y-3">
        {/* Header */}
        <h3 className="font-semibold text-gray-900">Cost Estimate</h3>

        {/* Cost breakdown */}
        <div className="space-y-2 text-sm">
          {estimate.breakdown.imageGeneration > 0 && (
            <div className="flex justify-between text-gray-700">
              <span>Image Generation</span>
              <span>{estimate.breakdown.imageGeneration} credits</span>
            </div>
          )}
          {estimate.breakdown.videoGeneration > 0 && (
            <div className="flex justify-between text-gray-700">
              <span>Video Generation</span>
              <span>{estimate.breakdown.videoGeneration} credits</span>
            </div>
          )}
          {estimate.breakdown.audioGeneration > 0 && (
            <div className="flex justify-between text-gray-700">
              <span>Audio Generation</span>
              <span>{estimate.breakdown.audioGeneration} credits</span>
            </div>
          )}
        </div>

        {/* Total cost */}
        <div className="border-t-2 border-gray-300 pt-2">
          <div className="flex justify-between">
            <span className="font-medium text-gray-900">Total Cost</span>
            <span className="text-lg font-bold text-blue-600">
              {estimate.estimatedCost} credits
            </span>
          </div>
        </div>

        {/* Current credits */}
        <div className="flex justify-between text-sm">
          <span className="text-gray-700">Your current credits</span>
          <span className="font-medium text-gray-900">
            {estimate.userCurrentCredits} credits
          </span>
        </div>

        {/* Warning */}
        {!hasEnoughCredits && (
          <div className="flex gap-2 rounded bg-red-100 p-2 text-sm text-red-800">
            <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">Insufficient credits</p>
              <p className="text-xs">
                You need {estimate.estimatedCost - estimate.userCurrentCredits} more credits
              </p>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="mt-2 rounded bg-red-100 p-2 text-xs text-red-800">
          {error}
        </div>
      )}
    </div>
  );
};
