// Page d'accueil publique.
// Hero avec accroche + 3 cartes "comment ça marche" + CTA inscription.

import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import styles from './HomePage.module.css';

export function HomePage() {
  return (
    <div className="container">
      {/* ─── HERO ───────────────────────────────────────── */}
      <section className={styles.hero}>
        <h1 className={styles.title}>
          Trouvez votre <span className="text-gold">prochain talent</span>
        </h1>
        <p className={styles.subtitle}>
          La plateforme de recrutement esport League of Legends. Mise en
          relation des joueurs Diamond+ et des clubs amateurs ou
          semi-professionnels grâce à des statistiques vérifiées via l'API Riot
          Games.
        </p>
        <div className={styles.heroActions}>
          <Link to="/register">
            <Button variant="primary" size="lg">
              Créer un compte
            </Button>
          </Link>
          <Link to="/players">
            <Button variant="ghost" size="lg">
              Explorer les joueurs
            </Button>
          </Link>
        </div>
      </section>

      {/* ─── STATS BARRES ────────────────────────────────── */}
      <section className={styles.stats}>
        <div className={styles.stat}>
          <strong className={styles.statNumber}>2 847</strong>
          <span className={styles.statLabel}>joueurs vérifiés</span>
        </div>
        <div className={styles.stat}>
          <strong className={styles.statNumber}>159</strong>
          <span className={styles.statLabel}>clubs partenaires</span>
        </div>
        <div className={styles.stat}>
          <strong className={styles.statNumber}>89</strong>
          <span className={styles.statLabel}>offres actives</span>
        </div>
        <div className={styles.stat}>
          <strong className={styles.statNumber}>1 203</strong>
          <span className={styles.statLabel}>recrutements réussis</span>
        </div>
      </section>

      {/* ─── COMMENT ÇA MARCHE ────────────────────────────── */}
      <section className={styles.steps}>
        <h2 className={styles.sectionTitle}>Comment ça marche</h2>

        <div className={styles.stepsGrid}>
          <Card>
            <div className={styles.stepNum}>01</div>
            <h3 className={styles.stepTitle}>Crée ton profil</h3>
            <p className="text-muted">
              Inscris-toi en tant que joueur ou club, lie ton compte Riot Games
              et fais découvrir tes statistiques certifiées.
            </p>
          </Card>

          <Card>
            <div className={styles.stepNum}>02</div>
            <h3 className={styles.stepTitle}>Sois découvert</h3>
            <p className="text-muted">
              Les clubs filtrent par rôle, rang et winrate. Apparais dans leurs
              résultats dès que ton profil correspond à leurs critères.
            </p>
          </Card>

          <Card>
            <div className={styles.stepNum}>03</div>
            <h3 className={styles.stepTitle}>Postule en un clic</h3>
            <p className="text-muted">
              Parcoure les offres ouvertes et candidate avec un message de
              motivation. Suis l'état de ta candidature en temps réel.
            </p>
          </Card>
        </div>
      </section>
    </div>
  );
}
