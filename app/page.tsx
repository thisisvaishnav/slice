'use client';

import type { FormEvent } from 'react';
import { useState } from 'react';
import { DecisionCard } from '../src/components/DecisionCard';
import { ProofCard } from '../src/components/ProofCard';
import type { Decision, KeeperHubTrailEntry, TransactionProof } from '../src/domain/types';

type EvaluateResponse = {
  decision: Decision;
  reason: string;
  proof?: TransactionProof;
  trail: KeeperHubTrailEntry[];
  execution?: {
    submitted: boolean;
    statusCode?: number;
    trail: KeeperHubTrailEntry[];
  };
};

export default function Page() {
  const [transactionId, setTransactionId] = useState('tx_1042');
  const [status, setStatus] = useState('failed');
  const [failure, setFailure] = useState('timeout while waiting on downstream confirmation');
  const [retryable, setRetryable] = useState(true);
  const [verificationReady, setVerificationReady] = useState(true);
  const [result, setResult] = useState<EvaluateResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleEvaluate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/evaluate', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          transactionId,
          status,
          failure,
          retryable,
          verificationReady,
        }),
      });

      if (!response.ok) {
        throw new Error(`Evaluate request failed with status ${response.status}`);
      }

      setResult((await response.json()) as EvaluateResponse);
    } catch (thrown) {
      setError(thrown instanceof Error ? thrown.message : 'Unexpected evaluation failure.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="shell">
      <div className="container">
        <header className="hero">
          <div className="eyebrow">KeeperHub control surface</div>
          <h1 className="title">Retry, verify, or stop.</h1>
          <p className="lede">
            This dashboard keeps the decision logic separate from execution and verification. The policy decides,
            KeeperHub adapters do the external work, and the cards only present the result and the evidence.
          </p>
        </header>

        <section className="dashboard">
          <div className="panel">
            <div className="panel-inner">
              <form className="form-grid" onSubmit={handleEvaluate}>
                <div className="field">
                  <label htmlFor="transactionId">Transaction id</label>
                  <input
                    id="transactionId"
                    value={transactionId}
                    onChange={(event) => setTransactionId(event.target.value)}
                    placeholder="tx_1042"
                  />
                </div>

                <div className="row">
                  <div className="field">
                    <label htmlFor="status">Current status</label>
                    <select id="status" value={status} onChange={(event) => setStatus(event.target.value)}>
                      <option value="failed">failed</option>
                      <option value="pending">pending</option>
                      <option value="running">running</option>
                      <option value="verified">verified</option>
                      <option value="unknown">unknown</option>
                    </select>
                  </div>

                  <div className="field">
                    <label htmlFor="failure">Observed failure</label>
                    <input
                      id="failure"
                      value={failure}
                      onChange={(event) => setFailure(event.target.value)}
                      placeholder="timeout, validation error, upstream 500"
                    />
                  </div>
                </div>

                <div className="row">
                  <div className="field">
                    <label htmlFor="retryable">Retryable</label>
                    <select
                      id="retryable"
                      value={String(retryable)}
                      onChange={(event) => setRetryable(event.target.value === 'true')}
                    >
                      <option value="true">true</option>
                      <option value="false">false</option>
                    </select>
                  </div>

                  <div className="field">
                    <label htmlFor="verificationReady">Verification ready</label>
                    <select
                      id="verificationReady"
                      value={String(verificationReady)}
                      onChange={(event) => setVerificationReady(event.target.value === 'true')}
                    >
                      <option value="true">true</option>
                      <option value="false">false</option>
                    </select>
                  </div>
                </div>

                <div className="actions">
                  <button className="button" type="submit" disabled={loading}>
                    {loading ? 'Evaluating...' : 'Evaluate'}
                  </button>
                  <span className="subtle">The API will decide first, then call KeeperHub only for retry or verification.</span>
                </div>

                {error ? <p style={{ margin: 0, color: 'var(--stop)' }}>{error}</p> : null}
              </form>
            </div>
          </div>

          <div className="stack">
            <DecisionCard decision={result?.decision ?? 'stop'} reason={result?.reason ?? 'Run an evaluation to see the policy decision.'} />
            <ProofCard proof={result?.proof} trail={result?.trail ?? []} />
          </div>
        </section>
      </div>
    </main>
  );
}