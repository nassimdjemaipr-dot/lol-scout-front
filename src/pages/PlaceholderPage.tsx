// Page temporaire pour les routes pas encore implémentées.

import { Card } from '../components/ui/Card';

export function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="container">
      <Card>
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <h1 style={{ marginBottom: '1rem' }}>{title}</h1>
          <p className="text-muted">Cette page sera implémentée prochainement.</p>
        </div>
      </Card>
    </div>
  );
}
