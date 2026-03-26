import React from 'react';
import { Clock, CheckCircle, AlertCircle, Download } from 'lucide-react';

interface JobStatusCardProps {
  jobId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress?: number;
  error?: string;
  outputUrl?: string;
  startedAt?: string;
  completedAt?: string;
  onSave?: () => void;
  onRetry?: () => void;
}

export const JobStatusCard: React.FC<JobStatusCardProps> = ({
  jobId,
  status,
  progress = 0,
  error,
  outputUrl,
  startedAt,
  completedAt,
  onSave,
  onRetry,
}) => {
  const statusColors = {
    pending: 'bg-yellow-900/10 border-yellow-900/50',
    processing: 'bg-blue-900/10 border-blue-900/50',
    completed: 'bg-green-900/10 border-green-900/50',
    failed: 'bg-red-900/10 border-red-900/50',
  };

  const statusIcons = {
    pending: <Clock className="text-yellow-600" size={20} />,
    processing: <Clock className="text-blue-600 animate-spin" size={20} />,
    completed: <CheckCircle className="text-green-600" size={20} />,
    failed: <AlertCircle className="text-red-600" size={20} />,
  };

  const statusLabels = {
    pending: 'Pending',
    processing: 'Processing',
    completed: 'Completed',
    failed: 'Failed',
  };

  return (
    <div className={`rounded-lg border p-6 ${statusColors[status]}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {statusIcons[status]}
          <div>
            <h3 className="font-semibold text-white">{statusLabels[status]}</h3>
            <p className="text-xs text-slate-400">Job ID: {jobId.substring(0, 8)}...</p>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      {(status === 'processing' || status === 'pending') && (
        <div className="mt-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-300">Progress</p>
            <p className="text-sm text-slate-400">{progress}%</p>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-700">
            <div
              className="h-full bg-blue-500 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Timeline */}
      {(startedAt || completedAt) && (
        <div className="mt-4 space-y-2 text-xs text-slate-400">
          {startedAt && <p>Started: {new Date(startedAt).toLocaleString()}</p>}
          {completedAt && <p>Completed: {new Date(completedAt).toLocaleString()}</p>}
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="mt-4 rounded bg-red-100 p-3 text-sm text-red-800">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Output */}
      {outputUrl && status === 'completed' && (
        <div className="mt-4">
          <video
            src={outputUrl}
            className="max-h-64 w-full rounded"
            controls
          />
          {onSave && (
            <button
              onClick={onSave}
              className="mt-3 flex items-center gap-2 rounded bg-green-600 py-2 px-4 text-white hover:bg-green-700"
            >
              <Download size={16} />
              Save Video
            </button>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="mt-4 flex gap-2">
        {status === 'failed' && onRetry && (
          <button
            onClick={onRetry}
            className="flex-1 rounded bg-blue-600 py-2 px-4 text-white hover:bg-blue-700"
          >
            Retry
          </button>
        )}
      </div>
    </div>
  );
};
