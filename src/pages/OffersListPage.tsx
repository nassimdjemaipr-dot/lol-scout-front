// Liste des offres de recrutement publiées par les clubs.

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { offerService } from '../services/offer.service';
import { PLAYER_ROLES, type PlayerRole } from '../types';
import { Card } from '../components/ui/Card';
import { RoleBadge } from '../components/ui/RoleBadge';
import { RankBadge } from '../components/ui/RankBadge';
import { Button } from '../components/ui/Button';
import styles from './OffersListPage.module.css';

export function OffersListPage() {
  const [filterRole, setFilterRole] = useState<PlayerRole | ''>('');

  const { data: offers, isLoading, isError } = useQuery({
    queryKey: ['offers', filterRole],
    queryFn: () => offerService.list({ role: filterRole || undefined }),
  });

  return (
    <div className="container">
      <header className={styles.header}>
        <h1>Offres de recrutement</h1>
        <p className="text-muted">
          Découvre les opportunités publiées par les clubs partenaires.
        </p>
      </header>

      <div className={styles.filters}>
        <div className={styles.chips}>
          <button
            className={`${styles.chip} ${filterRole === '' ? styles.chipActive : ''}`}
            onClick={() => setFilterRole('')}
          >
            Tous rôles
          </button>
          {PLAYER_ROLES.map((r) => (
            <button
              key={r}
              className={`${styles.chip} ${filterRole === r ? styles.chipActive : ''}`}
              onClick={() => setFilterRole(r)}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {isLoading && <p className="text-muted text-center">Chargement…</p>}

      {isError && (
        <Card>
          <p className="text-muted text-center">
            Impossible de charger les offres. Le back-end est peut-être hors
            ligne.
          </p>
        </Card>
      )}

      {!isLoading && !isError && offers && offers.length === 0 && (
        <Card>
          <p className="text-muted text-center">Aucune offre disponible.</p>
        </Card>
      )}

      {!isLoading && !isError && offers && offers.length > 0 && (
        <div className={styles.grid}>
          {offers.map((offer) => (
            <Card key={offer.id} hoverable className={styles.offerCard}>
              <div className={styles.offerHead}>
                <h3 className={styles.offerTitle}>{offer.title}</h3>
                <span className={styles.club}>{offer.club.name}</span>
              </div>

              <div className={styles.offerBadges}>
                <RoleBadge role={offer.wantedRole} size="sm" />
                <RankBadge tier={offer.minimumRank} size="sm" />
              </div>

              <p className={styles.offerDesc}>
                {offer.description.length > 140
                  ? `${offer.description.slice(0, 140)}…`
                  : offer.description}
              </p>

              <Link to={`/offers/${offer.id}`} className={styles.cta}>
                <Button variant="primary" size="sm" fullWidth>
                  Voir l'offre
                </Button>
              </Link>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
