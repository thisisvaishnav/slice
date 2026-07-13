import { NextResponse } from 'next/server';
import { decidePolicy } from '../../../src/domain/policy';
import type { EvaluationInput } from '../../../src/domain/types';
import { executeKeeperHubRetry } from '../../../src/keeperhub/execute';
import { verifyKeeperHubTransaction } from '../../../src/keeperhub/verify';

export async function POST(request: Request) {
  const body = (await request.json()) as EvaluationInput;

  const decision = decidePolicy(body);

  if (decision.decision === 'retry') {
    const execution = await executeKeeperHubRetry({
      transactionId: body.transactionId ?? 'unknown',
      payload: body as Record<string, unknown>,
      reason: decision.reason,
    });

    const proof = body.transactionId ? await verifyKeeperHubTransaction({ transactionId: body.transactionId }) : undefined;

    return NextResponse.json({
      ...decision,
      proof,
      trail: [...decision.trail, ...execution.trail],
      execution,
    });
  }

  if (decision.decision === 'wait_verify') {
    const proof = body.transactionId ? await verifyKeeperHubTransaction({ transactionId: body.transactionId }) : undefined;

    return NextResponse.json({
      ...decision,
      proof,
      trail: [...decision.trail, ...(proof?.trail ?? [])],
    });
  }

  return NextResponse.json({
    ...decision,
    trail: decision.trail,
  });
}