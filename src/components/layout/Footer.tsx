// Footer minimaliste avec liens et mentions.

import { Link } from 'react-router-dom';
import { Logo } from '../ui/Logo';
import styles from './Footer.module.css';

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.inner}`}>
        <div className={styles.brand}>
          <Logo variant="full" className={styles.logo} />
        </div>

        <div className={styles.links}>
          <Link to="/mentions-legales">Mentions légales</Link>
          <Link to="/cgu">CGU</Link>
          <Link to="/confidentialite">Confidentialité</Link>
          <a href="mailto:contact@lol-scout.fr">Contact</a>
        </div>

        <p className={styles.legal}>
          © {new Date().getFullYear()} LoL Scout — Plateforme étudiante. Non
          affiliée à Riot Games.
        </p>
      </div>
    </footer>
  );
}
