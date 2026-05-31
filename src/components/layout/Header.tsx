// Header — barre de navigation en haut de toutes les pages.
// Navigation adaptative selon le rôle (visiteur / player / club / admin).

import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/Button';
import { notify } from '../../lib/notify';
import styles from './Header.module.css';

export function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    notify.success('A bientot ! Tu es deconnecte.');
    navigate('/');
  };

  const roleBadge =
    user?.role === 'ROLE_PLAYER' ? '🎮 Joueur'
    : user?.role === 'ROLE_CLUB' ? '🏆 Club'
    : null;

  return (
    <header className={styles.header}>
      <div className={`container ${styles.inner}`}>
        <Link to="/" className={styles.logo}>
          <span className={styles.logoMark}>⬢</span>
          <span className={styles.logoText}>
            LoL <span className={styles.logoAccent}>Scout</span>
          </span>
        </Link>

        <nav className={styles.nav}>
          <NavLink to="/players" className={({ isActive }) => (isActive ? styles.active : styles.link)}>
            Joueurs
          </NavLink>
          <NavLink to="/offers" className={({ isActive }) => (isActive ? styles.active : styles.link)}>
            Offres
          </NavLink>
          {isAuthenticated && user?.role === 'ROLE_PLAYER' && (
            <NavLink to="/dashboard/player" className={({ isActive }) => (isActive ? styles.active : styles.link)}>
              Mon profil
            </NavLink>
          )}
          {isAuthenticated && user?.role === 'ROLE_CLUB' && (
            <NavLink to="/dashboard/club" className={({ isActive }) => (isActive ? styles.active : styles.link)}>
              Mon club
            </NavLink>
          )}
        </nav>

        <div className={styles.actions}>
          {isAuthenticated ? (
            <>
              {roleBadge && <span className={styles.roleBadge}>{roleBadge}</span>}
              <span className={styles.email}>{user?.email}</span>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                Déconnexion
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" onClick={() => navigate('/login')}>
                Connexion
              </Button>
              <Button variant="primary" size="sm" onClick={() => navigate('/register')}>
                Créer un compte
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
