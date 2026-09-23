import { Link } from 'react-router-dom';
import styles from './LegalPage.module.css';

export function LegalNoticePage() {
  return (
    <div className="container">
      <article className={styles.page}>
        <h1>Mentions légales</h1>
        <p className={styles.updated}>Dernière mise à jour : septembre 2026</p>

        <div className={styles.notice}>
          LoL Scout est un projet pédagogique réalisé dans le cadre du titre professionnel
          Concepteur Développeur d&apos;Applications (IPSSI, campus de Montpellier). La
          plateforme n&apos;est pas exploitée commercialement et ne propose aucun service
          payant.
        </div>

        <h2>Éditeur</h2>
        <p>
          DJEMAI Nassim, étudiant en Concepteur Développeur d&apos;Applications.
          <br />
          Contact : <a href="mailto:contact@lol-scout.fr">contact@lol-scout.fr</a>
        </p>

        <h2>Directeur de la publication</h2>
        <p>DJEMAI Nassim.</p>

        <h2>Hébergement</h2>
        <p>
          L&apos;application est conteneurisée avec Docker et destinée à un hébergement sur
          serveur dédié virtuel. Dans le cadre du projet pédagogique, elle fonctionne en
          environnement local.
        </p>

        <h2>Propriété intellectuelle</h2>
        <p>
          Le code source de la plateforme est l&apos;œuvre de son éditeur. Les contenus
          publiés par les utilisateurs (profils, offres, messages) restent la propriété de
          leurs auteurs.
        </p>

        <h2>Marques et contenus tiers</h2>
        <p>
          <strong>LoL Scout n&apos;est ni affilié ni approuvé par Riot Games, Inc.</strong>{' '}
          League of Legends et Riot Games sont des marques déposées de Riot Games, Inc. Les
          statistiques de jeu affichées proviennent de l&apos;API publique de Riot Games et
          restent la propriété de son éditeur.
        </p>

        <h2>Données personnelles</h2>
        <p>
          Le traitement des données personnelles est décrit dans la{' '}
          <Link to="/confidentialite">politique de confidentialité</Link>. Les conditions
          d&apos;utilisation du service figurent dans les <Link to="/cgu">CGU</Link>.
        </p>

        <h2>Responsabilité</h2>
        <p>
          S&apos;agissant d&apos;un projet pédagogique, aucune garantie de disponibilité ni
          d&apos;exactitude des données n&apos;est fournie. L&apos;éditeur ne saurait être
          tenu responsable de l&apos;usage fait des informations publiées sur la plateforme.
        </p>
      </article>
    </div>
  );
}
