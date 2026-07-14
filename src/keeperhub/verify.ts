import type { KeeperHubTrailEntry, TransactionProof } from '../domain/types';

// this file contain the types of keeperhub verification and the function that will be used to verify the transaction
// also to contain the logic of createTrailEntry function
export type KeeperHubVerifyInput = {
  transactionId: string;
};

function createTrailEntry(step: string, detail: string): KeeperHubTrailEntry {
  return {
    at: new Date().toISOString(),
    step,
    detail,
  };
}

export async function verifyKeeperHubTransaction(input: KeeperHubVerifyInput): Promise<TransactionProof> {
  const trail = [createTrailEntry('keeperhub.verify', `Looking up transaction ${input.transactionId}.`)];
  const baseUrl = (globalThis as typeof globalThis & {
    process?: { env?: { KEEPERHUB_URL?: string } };
  }).process?.env?.KEEPERHUB_URL;

  if (!baseUrl) {
    trail.push(
      createTrailEntry(
        'keeperhub.verify',
        'KEEPERHUB_URL is not configured, so verification returned a local pending result.'
      )
    );

    return {
      transactionId: input.transactionId,
      status: 'pending',
      trail,
    };
  }

  const response = await fetch(`${baseUrl.replace(/\/$/, '')}/transactions/${encodeURIComponent(input.transactionId)}`, {
    method: 'GET',
    headers: {
      accept: 'application/json',
    },
  });

  if (!response.ok) {
    trail.push(
      createTrailEntry('keeperhub.verify', `Verification failed with status ${response.status}.`)
    );

    return {
      transactionId: input.transactionId,
      status: 'failed',
      failure: `KeeperHub verification failed with status ${response.status}.`,
      trail,
    };
  }

  const payload = (await response.json()) as Partial<TransactionProof> & {
    trail?: KeeperHubTrailEntry[];
  };

  trail.push(createTrailEntry('keeperhub.verify', 'KeeperHub returned transaction evidence.'));

  return {
    transactionId: input.transactionId,
    status: payload.status ?? 'pending',
    proofHash: payload.proofHash,
    resultingState: payload.resultingState,
    failure: payload.failure,
    trail: [...trail, ...(payload.trail ?? [])],
  };
}