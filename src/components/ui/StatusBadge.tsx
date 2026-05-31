// Badge de statut d'une candidature : En attente / Acceptée / Refusée.

import type { ApplicationStatus } from '../../types';
import { APPLICATION_STATUS_LABELS } from '../../types';
import styles from './StatusBadge.module.css';

interface StatusBadgeProps {
  status: ApplicationStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span className={`${styles.badge} ${styles[status.toLowerCase()]}`}>
      {APPLICATION_STATUS_LABELS[status]}
    </span>
  );
}