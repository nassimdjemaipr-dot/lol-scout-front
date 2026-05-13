// Card — conteneur réutilisable avec fond Charcoal et bord doré subtil.

import type { HTMLAttributes, ReactNode } from 'react';
import styles from './Card.module.css';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
  children: ReactNode;
}

export function Card({ hoverable = false, className, children, ...rest }: CardProps) {
  const classes = [
    styles.card,
    hoverable ? styles.hoverable : '',
    className || '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classes} {...rest}>
      {children}
    </div>
  );
}