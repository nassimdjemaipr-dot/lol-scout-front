// Footer minimaliste avec liens et mentions.

import styles from './Footer.module.css';

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.inner}`}>
        <div className={styles.brand}>
          <span className={styles.logoMark}>⬢</span>
          <strong>LoL Scout</strong>
        </div>

        <div className={styles.links}>
          <a href="#">À propos</a>
          <a href="#">CGU</a>
          <a href="#">Confidentialité</a>
          <a href="#">Contact</a>
        </div>

        <p className={styles.legal}>
          © {new Date().getFullYear()} LoL Scout — Plateforme étudiante. Non
          affiliée à Riot Games.
        </p>
      </div>
    </footer>
  );
}
