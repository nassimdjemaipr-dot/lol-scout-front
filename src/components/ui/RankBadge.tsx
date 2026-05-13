// Badge pour afficher le rang d'un joueur (Iron → Challenger).
// La couleur s'adapte au tier.

import styles from './RankBadge.module.css';

interface RankBadgeProps {
  tier?: string;
  size?: 'sm' | 'md';
}

function getTierClass(tier?: string): string {
  if (!tier) return styles.unranked;
  const t = tier.toLowerCase();
  if (t.includes('iron')) return styles.iron;
  if (t.includes('bronze')) return styles.bronze;
  if (t.includes('silver')) return styles.silver;
  if (t.includes('gold')) return styles.gold;
  if (t.includes('platinum')) return styles.platinum;
  if (t.includes('emerald')) return styles.emerald;
  if (t.includes('diamond')) return styles.diamond;
  if (t.includes('master')) return styles.master;
  if (t.includes('grandmaster')) return styles.grandmaster;
  if (t.includes('challenger')) return styles.challenger;
  return styles.unranked;
}

export function RankBadge({ tier, size = 'md' }: RankBadgeProps) {
  return (
    <span
      className={`${styles.badge} ${getTierClass(tier)} ${styles[size]}`}
    >
      <span aria-hidden="true">⬢</span>
      <span>{tier || 'Unranked'}</span>
    </span>
  );
}
