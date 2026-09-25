// Logo LoL Scout : le O de SCOUT est remplacé par une mire.
// Le mot est du texte, pas une image, pour suivre la police d'affichage
// et rester net à toutes les tailles. La mire hérite de la couleur
// courante via currentColor.

import styles from './Logo.module.css';

interface LogoProps {
  /** "mark" n'affiche que la mire, "full" le bloc LOL + SCOUT. */
  variant?: 'mark' | 'full';
  className?: string;
}

function Crosshair({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 100 100"
      role="presentation"
      aria-hidden="true"
      focusable="false"
    >
      <circle
        cx="50"
        cy="50"
        r="31"
        fill="none"
        stroke="currentColor"
        strokeWidth="9"
      />
      <g stroke="currentColor" strokeWidth="9" strokeLinecap="butt">
        <line x1="50" y1="1" x2="50" y2="37" />
        <line x1="50" y1="63" x2="50" y2="99" />
        <line x1="1" y1="50" x2="37" y2="50" />
        <line x1="63" y1="50" x2="99" y2="50" />
      </g>
      <circle cx="50" cy="50" r="7" className={styles.dot} />
    </svg>
  );
}

export function Logo({ variant = 'full', className }: LogoProps) {
  if (variant === 'mark') {
    return (
      <span
        className={`${styles.mark} ${className ?? ''}`}
        role="img"
        aria-label="LoL Scout"
      >
        <Crosshair className={styles.markIcon} />
      </span>
    );
  }

  return (
    <span
      className={`${styles.lockup} ${className ?? ''}`}
      role="img"
      aria-label="LoL Scout"
    >
      <span className={styles.top} aria-hidden="true">
        <span className={styles.rule} />
        <span className={styles.lol}>LOL</span>
        <span className={styles.rule} />
      </span>

      <span className={styles.word} aria-hidden="true">
        SC
        <Crosshair className={styles.crosshair} />
        UT
      </span>
    </span>
  );
}
