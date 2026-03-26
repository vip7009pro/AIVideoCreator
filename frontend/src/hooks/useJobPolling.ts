import { useState, useEffect, useCallback, useRef } from 'react';
import { apiClient } from '../services/api/client';
import { GenerationJob } from '../types/workflow.types';
import { Logger } from '../utils/helpers';

const logger = Logger.getInstance();

const POLL_INTERVAL = 3000; // 3 seconds

export const useJobPolling = (jobId?: string, enabled = true) => {
  const [job, setJob] = useState<GenerationJob | null>(null);
  const [isPolling, setIsPolling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const pollJobStatus = useCallback(async () => {
    if (!jobId) return;

    try {
      const jobDetails = await apiClient.getJobStatus(jobId);
      setJob(jobDetails);

      // Stop polling if job is completed or failed
      if (['completed', 'failed'].includes(jobDetails.overallStatus)) {
        if (pollIntervalRef.current) {
          clearInterval(pollIntervalRef.current);
          setIsPolling(false);
        }
        logger.info(`Job ${jobId} finished with status: ${jobDetails.overallStatus}`);
      }

      setError(null);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to fetch job status';
      setError(errorMsg);
      logger.error(`Job polling error for ${jobId}:`, err);
    }
  }, [jobId]);

  useEffect(() => {
    if (!jobId || !enabled) return;

    // Initial fetch
    pollJobStatus();

    // Set up polling interval
    setIsPolling(true);
    pollIntervalRef.current = setInterval(pollJobStatus, POLL_INTERVAL);

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, [jobId, enabled, pollJobStatus]);

  const stopPolling = useCallback(() => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      setIsPolling(false);
    }
  }, []);

  const resumePolling = useCallback(() => {
    if (jobId && !isPolling) {
      setIsPolling(true);
      pollJobStatus();
      pollIntervalRef.current = setInterval(pollJobStatus, POLL_INTERVAL);
    }
  }, [jobId, isPolling, pollJobStatus]);

  return {
    job,
    isPolling,
    error,
    stopPolling,
    resumePolling,
    refetch: pollJobStatus,
  };
};
