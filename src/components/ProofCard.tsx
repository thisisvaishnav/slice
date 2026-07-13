import type { KeeperHubTrailEntry, TransactionProof } from '../domain/types';

function TrailItem({ entry }: { entry: KeeperHubTrailEntry }) {
  return (
    <li>
      <span className="proof-label">{entry.step}</span>
      <span className="proof-value">{entry.detail}</span>
      <span className="subtle">{entry.at}</span>
    </li>
  );
}

export function ProofCard({
  proof,
  trail,
}: {
  proof?: TransactionProof;
  trail: KeeperHubTrailEntry[];
}) {
  return (
    <section className="card">
      <div className="card-header">
        <div>
          <div className="eyebrow">Evidence trail</div>
          <h2 style={{ margin: '8px 0 0', fontSize: '1.5rem' }}>KeeperHub proof and execution trail</h2>
        </div>
      </div>
      <div className="card-body stack">
        <div className="tag-row">
          <span className="tag">status: {proof?.status ?? 'unknown'}</span>
          <span className="tag">transaction: {proof?.transactionId ?? 'n/a'}</span>
          <span className="tag">proof hash: {proof?.proofHash ?? 'n/a'}</span>
          <span className="tag">resulting state: {proof?.resultingState ?? 'n/a'}</span>
        </div>

        <ul className="proof-list">
          {trail.length > 0 ? (
            trail.map((entry) => <TrailItem key={`${entry.step}-${entry.at}`} entry={entry} />)
          ) : (
            <li>
              <span className="proof-label">No trail</span>
              <span className="proof-value">Nothing has been recorded yet.</span>
            </li>
          )}
        </ul>
      </div>
    </section>
  );
}