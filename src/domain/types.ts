export type Decision = 'retry' | 'wait_verify' | 'stop';

export type KeeperHubTrailEntry = {
  at: string;
  step: string;
  detail: string;
};

export type TransactionProof = {
  transactionId: string;
  status: 'pending' | 'verified' | 'failed';
  proofHash?: string;
  resultingState?: string;
  failure?: string;
  trail: KeeperHubTrailEntry[];
};

export type EvaluationInput = {
  transactionId?: string;
  status?: string;
  failure?: string;
  retryable?: boolean;
  verificationReady?: boolean;
  reasonHint?: string;
  proof?: TransactionProof;
};

export type EvaluationResult = {
  decision: Decision;
  reason: string;
  proof?: TransactionProof;
  trail: KeeperHubTrailEntry[];
};