import { Link } from 'react-router-dom';
import styles from './LegalPage.module.css';

export function TermsPage() {
  return (
    <div className="container">
      <article className={styles.page}>
        <h1>Conditions générales d&apos;utilisation</h1>
        <p className={styles.updated}>Dernière mise à jour : septembre 2026</p>

        <div className={styles.notice}>
          LoL Scout est un projet pédagogique. Le service est fourni gratuitement, sans
          garantie de disponibilité.
        </div>

        <h2>1. Objet</h2>
        <p>
          LoL Scout met en relation des joueurs de League of Legends et des structures
          esport. La plateforme permet de publier un profil accompagné de statistiques
          vérifiées, de publier des offres de recrutement et de candidater.
        </p>

        <h2>2. Accès au service</h2>
        <p>
          La consultation des profils et des offres est libre. La création d&apos;un compte
          est nécessaire pour publier un profil, publier une offre ou candidater. Chaque
          compte est rattaché à un rôle unique — joueur ou club — choisi à l&apos;inscription.
        </p>

        <h2>3. Compte utilisateur</h2>
        <ul>
          <li>
            L&apos;utilisateur fournit une adresse électronique valide et un mot de passe
            d&apos;au moins douze caractères.
          </li>
          <li>Il est responsable de la confidentialité de ses identifiants.</li>
          <li>
            Il peut supprimer son compte à tout moment depuis son tableau de bord. Les effets
            de cette suppression sont détaillés dans la{' '}
            <Link to="/confidentialite">politique de confidentialité</Link>.
          </li>
        </ul>

        <h2>4. Liaison d&apos;un compte Riot Games</h2>
        <p>
          La liaison d&apos;un compte Riot est facultative. Elle permet d&apos;importer
          automatiquement le rang, le taux de victoire et les champions joués depuis
          l&apos;API officielle. L&apos;utilisateur garantit être titulaire du compte de jeu
          qu&apos;il déclare.
        </p>

        <h2>5. Contenus publiés</h2>
        <p>L&apos;utilisateur s&apos;engage à ne pas publier de contenu :</p>
        <ul>
          <li>injurieux, haineux, discriminatoire ou à caractère harcelant ;</li>
          <li>trompeur quant à son niveau de jeu ou à son identité ;</li>
          <li>portant atteinte aux droits d&apos;un tiers ;</li>
          <li>de nature publicitaire sans rapport avec le recrutement esport.</li>
        </ul>
        <p>
          L&apos;éditeur se réserve le droit de désactiver un compte ne respectant pas ces
          règles.
        </p>

        <h2>6. Candidatures</h2>
        <p>
          Une candidature engage son auteur mais ne crée aucune obligation contractuelle
          entre le joueur et le club. La plateforme n&apos;intervient ni dans la négociation,
          ni dans la conclusion d&apos;un éventuel engagement.
        </p>

        <h2>7. Disponibilité</h2>
        <p>
          Le service peut être interrompu à tout moment, notamment pour maintenance. Les
          statistiques dépendent de la disponibilité de l&apos;API Riot Games, sur laquelle
          l&apos;éditeur n&apos;a aucune maîtrise.
        </p>

        <h2>8. Modification des conditions</h2>
        <p>
          Les présentes conditions peuvent être modifiées. La date de dernière mise à jour
          figure en tête de page.
        </p>

        <h2>9. Droit applicable</h2>
        <p>Les présentes conditions sont soumises au droit français.</p>
      </article>
    </div>
  );
}
