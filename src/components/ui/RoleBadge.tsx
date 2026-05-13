// Badge coloré pour les 5 rôles LoL : TOP / JUNGLE / MID / ADC / SUPPORT.
// Couleurs reprises de la charte graphique.

import type { PlayerRole } from '../../types';
import styles from './RoleBadge.module.css';

const ROLE_ICONS: Record<PlayerRole, string> = {
  TOP: '⚔️',
  JUNGLE: '🌲',
  MID: '✨',
  ADC: '🏹',
  SUPPORT: '🛡️',
};

interface RoleBadgeProps {
  role: PlayerRole;
  size?: 'sm' | 'md';
}

export function RoleBadge({ role, size = 'md' }: RoleBadgeProps) {
  return (
    <span className={`${styles.badge} ${styles[role.toLowerCase()]} ${styles[size]}`}>
      <span aria-hidden="true">{ROLE_ICONS[role]}</span>
      <span>{role}</span>
    </span>
  );
}
