import { Link } from 'react-router-dom';
import styles from './LegalPage.module.css';

export function PrivacyPolicyPage() {
  return (
    <div className="container">
      <article className={styles.page}>
        <h1>Politique de confidentialité</h1>
        <p className={styles.updated}>Dernière mise à jour : septembre 2026</p>

        <div className={styles.notice}>
          LoL Scout est un projet pédagogique réalisé dans le cadre du titre professionnel
          Concepteur Développeur d&apos;Applications. La plateforme n&apos;est pas exploitée
          commercialement.
        </div>

        <h2>1. Responsable du traitement</h2>
        <p>
          Les données sont traitées par l&apos;éditeur de la plateforme, identifié dans les{' '}
          <Link to="/mentions-legales">mentions légales</Link>.
        </p>

        <h2>2. Données collectées</h2>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Donnée</th>
              <th>Pourquoi</th>
              <th>Conservation</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Adresse électronique</td>
              <td>Identifiant de connexion</td>
              <td>Durée de vie du compte</td>
            </tr>
            <tr>
              <td>Mot de passe</td>
              <td>
                Authentification. Seule une empreinte bcrypt est stockée — le mot de passe
                en clair n&apos;est jamais conservé.
              </td>
              <td>Durée de vie du compte</td>
            </tr>
            <tr>
              <td>Pseudonyme, prénom, nom</td>
              <td>Profil visible par les clubs</td>
              <td>Durée de vie du compte</td>
            </tr>
            <tr>
              <td>Riot ID et identifiant PUUID</td>
              <td>Rattacher les statistiques de jeu au bon compte</td>
              <td>Jusqu&apos;à dissociation du compte Riot</td>
            </tr>
            <tr>
              <td>Statistiques de jeu</td>
              <td>Importées depuis l&apos;API Riot Games</td>
              <td>Mises à jour à chaque synchronisation</td>
            </tr>
            <tr>
              <td>Messages de candidature</td>
              <td>Transmettre la candidature au club</td>
              <td>Durée de vie de la candidature</td>
            </tr>
          </tbody>
        </table>

        <p>
          Aucune donnée bancaire, aucune donnée de santé, aucune donnée relevant des
          catégories particulières de l&apos;article 9 du RGPD n&apos;est collectée. Le prénom
          et le nom sont facultatifs.
        </p>

        <h2>3. Base légale</h2>
        <p>
          Le traitement repose sur l&apos;exécution du service demandé : créer un compte,
          publier un profil ou une offre, candidater. La liaison d&apos;un compte Riot Games
          relève du consentement, et reste facultative.
        </p>

        <h2>4. Destinataires</h2>
        <ul>
          <li>
            <strong>Les clubs</strong> reçoivent le profil public et le message des joueurs
            qui candidatent à leurs offres.
          </li>
          <li>
            <strong>Riot Games</strong> : le Riot ID saisi est transmis à l&apos;API officielle
            pour récupérer le rang et les statistiques. Aucune autre donnée ne lui est
            envoyée.
          </li>
        </ul>
        <p>Les données ne sont ni vendues, ni cédées, ni utilisées à des fins publicitaires.</p>

        <h2>5. Cookies et traceurs</h2>
        <p>
          La plateforme <strong>ne dépose aucun cookie</strong>. Le jeton
          d&apos;authentification est conservé dans le stockage local du navigateur
          (<span className="mono">localStorage</span>) pour maintenir la session, et il est
          effacé à la déconnexion. Aucun traceur publicitaire ni outil de mesure
          d&apos;audience tiers n&apos;est utilisé.
        </p>

        <h2>6. Vos droits</h2>
        <ul>
          <li>
            <strong>Accès</strong> — votre profil complet est consultable depuis votre
            tableau de bord.
          </li>
          <li>
            <strong>Rectification</strong> — vos informations sont modifiables à tout moment
            depuis votre espace.
          </li>
          <li>
            <strong>Effacement</strong> — la suppression de compte est accessible depuis
            votre tableau de bord. Elle efface votre adresse, votre nom, votre pseudonyme et
            votre compte Riot, et rend la connexion impossible.
          </li>
          <li>
            <strong>Opposition et limitation</strong> — exerçables par courriel auprès de
            l&apos;éditeur.
          </li>
        </ul>

        <div className={styles.notice}>
          <strong>Ce que la suppression ne fait pas.</strong> Les candidatures déjà envoyées
          restent visibles par les clubs concernés, sous la mention « Compte supprimé », sans
          aucune donnée permettant de vous identifier. Elles font partie de l&apos;historique
          de recrutement du club, qui a un intérêt légitime à le conserver. Ces données étant
          anonymisées, elles ne relèvent plus du RGPD.
        </div>

        <h2>7. Sécurité</h2>
        <ul>
          <li>Mots de passe hachés avec bcrypt, jamais stockés ni journalisés en clair.</li>
          <li>Authentification par jeton JWT signé en RS256.</li>
          <li>Accès à la base exclusivement via un ORM à requêtes paramétrées.</li>
          <li>Communications chiffrées en HTTPS en production.</li>
        </ul>

        <h2>8. Décision automatisée</h2>
        <p>
          Aucun profilage ni décision automatisée au sens de l&apos;article 22 du RGPD. Le
          classement affiché est une donnée produite par le jeu, pas un score calculé par la
          plateforme.
        </p>

        <h2>9. Réclamation</h2>
        <p>
          Vous pouvez introduire une réclamation auprès de la CNIL, 3 place de Fontenoy,
          75007 Paris.
        </p>
      </article>
    </div>
  );
}
