import type { Decision } from '../domain/types';

export function DecisionCard({ decision, reason }: { decision: Decision; reason: string }) {
  return (
    <section className="card">
      <div className="card-header">
        <div>
          <div className="eyebrow">Policy decision</div>
          <h2 style={{ margin: '8px 0 0', fontSize: '1.5rem' }}>What the agent decided</h2>
        </div>
        <div className="decision-badge" data-decision={decision}>
          {decision}
        </div>
      </div>
      <div className="card-body">
        <p style={{ margin: 0, color: 'var(--muted)', lineHeight: 1.65 }}>{reason}</p>
      </div>
    </section>
  );
}