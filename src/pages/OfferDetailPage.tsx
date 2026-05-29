// Détail d'une offre. Permet de candidater si l'user est connecté en tant que joueur.

import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { offerService } from '../services/offer.service';
import { applicationService } from '../services/application.service';
import { useAuth } from '../contexts/AuthContext';
import { Card } from '../components/ui/Card';
import { RoleBadge } from '../components/ui/RoleBadge';
import { RankBadge } from '../components/ui/RankBadge';
import { Button } from '../components/ui/Button';
import { isAxiosError } from 'axios';
import styles from './OfferDetailPage.module.css';

export function OfferDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user, isAuthenticated } = useAuth();

  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState('');

  const { data: offer, isLoading, isError } = useQuery({
    queryKey: ['offer', id],
    queryFn: () => offerService.get(Number(id)),
    enabled: !!id,
  });

  const applyMutation = useMutation({
    mutationFn: () => applicationService.apply(Number(id), message),
  });

  if (isLoading) return <p className="text-center text-muted">Chargement…</p>;

  if (isError || !offer) {
    return (
      <div className="container">
        <Card>
          <p className="text-center text-muted">Offre introuvable.</p>
        </Card>
      </div>
    );
  }

  const canApply = isAuthenticated && user?.role === 'ROLE_PLAYER' && offer.isActive;

  // Message d'erreur lisible renvoyé par l'API
  const applyError = applyMutation.isError
    ? isAxiosError(applyMutation.error)
      ? (applyMutation.error.response?.data as { error?: string })?.error ??
        'Erreur lors de la candidature.'
      : 'Erreur lors de la candidature.'
    : null;

  return (
    <div className="container">
      <Card className={styles.card}>
        <header className={styles.header}>
          <Link to={`/clubs/${offer.club.id}`} className={styles.club}>
            {offer.club.name}
          </Link>
          <h1 className={styles.title}>{offer.title}</h1>

          <div className={styles.badges}>
            <RoleBadge role={offer.wantedRole} />
            <RankBadge tier={offer.minimumRank} />
            {!offer.isActive && <span className={styles.closed}>Offre fermée</span>}
          </div>

          <div className={styles.meta}>
            <span>Publiée le {new Date(offer.publishedAt).toLocaleDateString('fr-FR')}</span>
            {offer.expiresAt && (
              <span> · Expire le {new Date(offer.expiresAt).toLocaleDateString('fr-FR')}</span>
            )}
          </div>
        </header>

        <section className={styles.body}>
          <h2 className={styles.sectionTitle}>Description du poste</h2>
          <p className={styles.description}>{offer.description}</p>
        </section>

        <footer className={styles.footer}>
          {/* ─── Cas 1 : succès ─────────────────────────── */}
          {applyMutation.isSuccess ? (
            <div className={styles.success}>
              ✅ Candidature envoyée ! Le club a reçu ton message.
            </div>
          ) : canApply && showForm ? (
            /* ─── Cas 2 : formulaire de candidature ──────── */
            <div className={styles.applyForm}>
              <label htmlFor="motivation" className={styles.label}>
                Message de motivation
              </label>
              <textarea
                id="motivation"
                className={styles.textarea}
                rows={5}
                placeholder="Présente-toi en quelques lignes : ton rôle, ton rang, tes disponibilités, pourquoi cette équipe t'intéresse…"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
              {message.trim().length > 0 && message.trim().length < 10 && (
                <span className={styles.hint}>Encore {10 - message.trim().length} caractères minimum</span>
              )}
              {applyError && <div className={styles.error}>{applyError}</div>}
              <div className={styles.formActions}>
                <Button variant="ghost" onClick={() => setShowForm(false)}>
                  Annuler
                </Button>
                <Button
                  variant="primary"
                  isLoading={applyMutation.isPending}
                  disabled={message.trim().length < 10}
                  onClick={() => applyMutation.mutate()}
                >
                  Envoyer ma candidature
                </Button>
              </div>
            </div>
          ) : canApply ? (
            /* ─── Cas 3 : bouton initial ─────────────────── */
            <Button variant="primary" size="lg" onClick={() => setShowForm(true)}>
              Postuler à cette offre
            </Button>
          ) : !isAuthenticated ? (
            <>
              <p className="text-muted">Connecte-toi en tant que joueur pour postuler.</p>
              <Link to="/login">
                <Button variant="ghost">Se connecter</Button>
              </Link>
            </>
          ) : user?.role !== 'ROLE_PLAYER' ? (
            <p className="text-muted">Seuls les joueurs peuvent candidater à une offre.</p>
          ) : (
            <p className="text-muted">Cette offre n'est plus active.</p>
          )}
        </footer>
      </Card>
    </div>
  );
}