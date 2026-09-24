// Page "Mes offres" — le club retrouve ses annonces, les active ou les
// désactive, et peut les supprimer.

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { offerService } from '../services/offer.service';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { RoleBadge } from '../components/ui/RoleBadge';
import { RankBadge } from '../components/ui/RankBadge';
import { notify } from '../lib/notify';
import type { Offer } from '../types';
import styles from './MyOffersPage.module.css';

type OfferState = 'active' | 'expired' | 'disabled';

function offerState(offer: Offer): OfferState {
  if (!offer.isActive) return 'disabled';
  if (offer.expiresAt && new Date(offer.expiresAt) < new Date()) return 'expired';
  return 'active';
}

const STATE_LABEL: Record<OfferState, string> = {
  active: 'En ligne',
  expired: 'Expirée',
  disabled: 'Désactivée',
};

export function MyOffersPage() {
  const queryClient = useQueryClient();
  const [confirmingId, setConfirmingId] = useState<number | null>(null);

  const { data: offers, isLoading, isError } = useQuery({
    queryKey: ['offers', 'mine'],
    queryFn: () => offerService.listMine(),
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['offers'] });
  };

  const toggleMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: number; isActive: boolean }) =>
      offerService.update(id, { isActive }),
    onSuccess: (_data, { isActive }) => {
      invalidate();
      notify.success(isActive ? 'Offre remise en ligne.' : 'Offre désactivée.');
    },
    onError: (err) => notify.apiError(err, 'Impossible de modifier cette offre.'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => offerService.remove(id),
    onSuccess: () => {
      invalidate();
      setConfirmingId(null);
      notify.success('Offre supprimée.');
    },
    onError: (err) => notify.apiError(err, 'Impossible de supprimer cette offre.'),
  });

  return (
    <div className="container">
      <header className={styles.header}>
        <div>
          <h1>Mes offres</h1>
          <p className="text-muted">Gère les annonces publiées par ton club.</p>
        </div>
        <Link to="/dashboard/club/offers/new">
          <Button variant="primary">Publier une offre</Button>
        </Link>
      </header>

      {isLoading && <p className="text-center text-muted">Chargement…</p>}

      {isError && (
        <Card>
          <p className="text-center text-muted">Impossible de charger tes offres.</p>
        </Card>
      )}

      {!isLoading && !isError && offers && offers.length === 0 && (
        <Card>
          <p className="text-center text-muted">
            Tu n'as publié aucune offre pour le moment.
          </p>
        </Card>
      )}

      {!isLoading && !isError && offers && offers.length > 0 && (
        <div className={styles.list}>
          {offers.map((offer) => {
            const state = offerState(offer);
            const isBusy =
              (toggleMutation.isPending && toggleMutation.variables?.id === offer.id) ||
              (deleteMutation.isPending && deleteMutation.variables === offer.id);

            return (
              <Card key={offer.id} className={styles.offerCard}>
                <div className={styles.offerHead}>
                  <div>
                    <Link to={`/offers/${offer.id}`} className={styles.offerTitle}>
                      {offer.title}
                    </Link>
                    <p className={styles.dates}>
                      Publiée le {new Date(offer.publishedAt).toLocaleDateString('fr-FR')}
                      {offer.expiresAt && (
                        <> · Expire le {new Date(offer.expiresAt).toLocaleDateString('fr-FR')}</>
                      )}
                    </p>
                  </div>
                  <div className={styles.badges}>
                    <RoleBadge role={offer.wantedRole} size="sm" />
                    <RankBadge tier={offer.minimumRank} size="sm" />
                    <span className={`${styles.state} ${styles[state]}`}>
                      {STATE_LABEL[state]}
                    </span>
                  </div>
                </div>

                {confirmingId === offer.id ? (
                  <div className={styles.actions}>
                    <span className={styles.confirmText}>
                      Supprimer définitivement cette offre ?
                    </span>
                    <Button
                      variant="danger"
                      size="sm"
                      isLoading={isBusy}
                      onClick={() => deleteMutation.mutate(offer.id)}
                    >
                      Confirmer
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setConfirmingId(null)}>
                      Annuler
                    </Button>
                  </div>
                ) : (
                  <div className={styles.actions}>
                    <Button
                      variant={offer.isActive ? 'ghost' : 'success'}
                      size="sm"
                      isLoading={isBusy}
                      onClick={() =>
                        toggleMutation.mutate({ id: offer.id, isActive: !offer.isActive })
                      }
                    >
                      {offer.isActive ? 'Désactiver' : 'Remettre en ligne'}
                    </Button>
                    <Button variant="danger" size="sm" onClick={() => setConfirmingId(offer.id)}>
                      Supprimer
                    </Button>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
