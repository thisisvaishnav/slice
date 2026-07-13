import type { EvaluationInput, EvaluationResult, KeeperHubTrailEntry } from './types';

function buildTrail(input: EvaluationInput): KeeperHubTrailEntry[] {
  return input.proof?.trail ?? [];
}

export function decidePolicy(input: EvaluationInput): EvaluationResult {
  const trail = buildTrail(input);

  if (!input.transactionId) {
    return {
      decision: 'stop',
      reason: 'A transaction id is required before KeeperHub can retry or verify anything.',
      trail,
    };
  }

  if (input.proof?.status === 'verified' && input.proof.proofHash && input.proof.resultingState) {
    return {
      decision: 'stop',
      reason: 'KeeperHub already returned verified proof with a resulting state.',
      proof: input.proof,
      trail,
    };
  }

  const normalizedStatus = input.status?.toLowerCase();

  if (input.verificationReady === false || normalizedStatus === 'pending' || normalizedStatus === 'running') {
    return {
      decision: 'wait_verify',
      reason: 'The transaction is still in flight, so the next safe step is to wait for verification.',
      proof: input.proof,
      trail,
    };
  }

  if (input.retryable) {
    return {
      decision: 'retry',
      reason: 'The failure is retryable and there is no verified proof that would block another attempt.',
      proof: input.proof,
      trail,
    };
  }

  return {
    decision: 'stop',
    reason: input.reasonHint ?? input.failure ?? 'No retry is justified from the current KeeperHub evidence.',
    proof: input.proof,
    trail,
  };
}