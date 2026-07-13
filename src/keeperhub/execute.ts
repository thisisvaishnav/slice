import type { KeeperHubTrailEntry } from '../domain/types';

export type KeeperHubExecutionInput = {
  transactionId: string;
  payload?: Record<string, unknown>;
  reason: string;
};

export type KeeperHubExecutionResult = {
  submitted: boolean;
  statusCode?: number;
  trail: KeeperHubTrailEntry[];
};

function createTrailEntry(step: string, detail: string): KeeperHubTrailEntry {
  return {
    at: new Date().toISOString(),
    step,
    detail,
  };
}

export async function executeKeeperHubRetry(input: KeeperHubExecutionInput): Promise<KeeperHubExecutionResult> {
  const trail = [createTrailEntry('keeperhub.execute', `Preparing retry for ${input.transactionId}.`)];
  const baseUrl = (globalThis as typeof globalThis & {
    process?: { env?: { KEEPERHUB_URL?: string } };
  }).process?.env?.KEEPERHUB_URL;

  if (!baseUrl) {
    trail.push(
      createTrailEntry(
        'keeperhub.execute',
        'KEEPERHUB_URL is not configured, so the retry was recorded locally and not sent.'
      )
    );

    return {
      submitted: false,
      trail,
    };
  }

  const response = await fetch(`${baseUrl.replace(/\/$/, '')}/retry`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify(input),
  });

  trail.push(
    createTrailEntry(
      'keeperhub.execute',
      response.ok
        ? `KeeperHub accepted the retry request with status ${response.status}.`
        : `KeeperHub rejected the retry request with status ${response.status}.`
    )
  );

  return {
    submitted: response.ok,
    statusCode: response.status,
    trail,
  };
}