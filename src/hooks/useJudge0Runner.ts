/**
 * useJudge0Runner Hook
 * 
 * Custom React hook for running code using Judge0 API.
 * Handles submission, polling, and result management.
 */

import { useState, useCallback } from 'react';
import {
  submitCode,
  type SubmitPayload,
  type SubmissionResult,
} from '../lib/judge0Client';

export interface UseJudge0RunnerResult {
  run: (languageId: number, sourceCode: string, stdin?: string) => Promise<void>;
  isRunning: boolean;
  result: SubmissionResult | null;
  error: string | null;
  statusLabel: string | null;
  reset: () => void;
}

/**
 * Custom hook for running code with Judge0
 * @returns Object with run function and state
 */
export function useJudge0Runner(): UseJudge0RunnerResult {
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<SubmissionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [statusLabel, setStatusLabel] = useState<string | null>(null);

  /**
   * Reset all state
   */
  const reset = useCallback(() => {
    setIsRunning(false);
    setResult(null);
    setError(null);
    setStatusLabel(null);
  }, []);

  /**
   * Run code with Judge0
   * @param languageId - Judge0 language ID
   * @param sourceCode - Source code to execute
   * @param stdin - Optional stdin input
   */
  const run = useCallback(
    async (languageId: number, sourceCode: string, stdin: string = '') => {
      // Reset previous state
      setError(null);
      setResult(null);
      setStatusLabel(null);
      setIsRunning(true);

      try {
        // Submit code with wait=true - returns result immediately (no polling needed)
        const payload: SubmitPayload = {
          language_id: languageId,
          source_code: sourceCode,
          stdin: stdin || undefined,
        };

        // submitCode now returns the full result directly (wait=true mode)
        const submissionResult = await submitCode(payload);

        // Process result
        setResult(submissionResult);

        // Determine status label
        const statusId = submissionResult.status.id;
        let label = submissionResult.status.description;

        // Map common status IDs to user-friendly labels
        if (statusId === 3) {
          label = 'Accepted';
        } else if (statusId === 4) {
          label = 'Wrong Answer';
        } else if (statusId === 5) {
          label = 'Time Limit Exceeded';
        } else if (statusId === 6) {
          label = 'Compilation Error';
        } else if (statusId === 7) {
          label = 'Runtime Error (SIGSEGV)';
        } else if (statusId === 8) {
          label = 'Runtime Error (SIGXFSZ)';
        } else if (statusId === 9) {
          label = 'Runtime Error (SIGFPE)';
        } else if (statusId === 10) {
          label = 'Runtime Error (SIGABRT)';
        } else if (statusId === 11) {
          label = 'Runtime Error (NZEC)';
        } else if (statusId === 12) {
          label = 'Runtime Error (Other)';
        } else if (statusId === 13) {
          label = 'Internal Error';
        } else if (statusId === 14) {
          label = 'Exec Format Error';
        }

        setStatusLabel(label);

        // If there's an error message, set it
        if (submissionResult.message) {
          setError(submissionResult.message);
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : 'Execution failed. Please try again.';

        // Check for specific error types
        if (errorMessage.includes('timed out')) {
          setError('Execution timed out. Please try again.');
        } else if (
          errorMessage.includes('not reachable') ||
          errorMessage.includes('Service unavailable')
        ) {
          setError(
            'Execution server is not reachable right now. Please try again later.'
          );
        } else {
          setError(errorMessage);
        }

        setStatusLabel('Error');
        setResult(null);
      } finally {
        setIsRunning(false);
      }
    },
    []
  );

  return {
    run,
    isRunning,
    result,
    error,
    statusLabel,
    reset,
  };
}

