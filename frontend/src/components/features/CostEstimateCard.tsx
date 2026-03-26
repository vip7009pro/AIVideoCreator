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
      <div className="rounded-lg border border-slate-700 p-4 bg-slate-800/50">
        <div className="animate-pulse space-y-2">
          <div className="h-4 w-24 rounded bg-slate-700" />
          <div className="h-8 w-32 rounded bg-slate-700" />
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
        ? 'border-green-900/50 bg-green-900/10' 
        : 'border-red-900/50 bg-red-900/10'
    }`}>
      <div className="space-y-3">
        {/* Header */}
        <h3 className="font-semibold text-white">Cost Estimate</h3>

        {/* Cost breakdown */}
        <div className="space-y-2 text-sm">
          {estimate.breakdown.imageGeneration > 0 && (
            <div className="flex justify-between text-slate-300">
              <span>Image Generation</span>
              <span>{estimate.breakdown.imageGeneration} credits</span>
            </div>
          )}
          {estimate.breakdown.videoGeneration > 0 && (
            <div className="flex justify-between text-slate-300">
              <span>Video Generation</span>
              <span>{estimate.breakdown.videoGeneration} credits</span>
            </div>
          )}
          {estimate.breakdown.audioGeneration > 0 && (
            <div className="flex justify-between text-slate-300">
              <span>Audio Generation</span>
              <span>{estimate.breakdown.audioGeneration} credits</span>
            </div>
          )}
        </div>

        {/* Total cost */}
        <div className="border-t border-slate-700 pt-2">
          <div className="flex justify-between">
            <span className="font-medium text-white">Total Cost</span>
            <span className="text-lg font-bold text-blue-400">
              {estimate.estimatedCost} credits
            </span>
          </div>
        </div>

        {/* Current credits */}
        <div className="flex justify-between text-sm">
          <span className="text-slate-400">Your current credits</span>
          <span className="font-medium text-white">
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
