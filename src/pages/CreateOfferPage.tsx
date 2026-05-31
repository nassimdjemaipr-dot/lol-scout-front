// Page de création d'une offre de recrutement (club authentifié).

import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { isAxiosError } from 'axios';
import { offerService, type CreateOfferPayload } from '../services/offer.service';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { PLAYER_ROLES, RANKS } from '../types';
import styles from './CreateOfferPage.module.css';

interface FormValues {
  title: string;
  description: string;
  wantedRole: CreateOfferPayload['wantedRole'];
  minimumRank: string;
  expiresAt?: string;
}

export function CreateOfferPage() {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    defaultValues: {
      title: '',
      description: '',
      wantedRole: 'MID',
      minimumRank: 'Diamond IV',
      expiresAt: '',
    },
  });

  const mutation = useMutation({
    mutationFn: (values: FormValues) =>
      offerService.create({
        title: values.title.trim(),
        description: values.description.trim(),
        wantedRole: values.wantedRole,
        minimumRank: values.minimumRank,
        expiresAt: values.expiresAt || undefined,
      }),
    onSuccess: (offer) => {
      navigate(`/offers/${offer.id}`);
    },
  });

  const serverError = mutation.isError
    ? isAxiosError(mutation.error)
      ? (mutation.error.response?.data as { error?: string; errors?: { message: string }[] })?.error ??
        'Erreur lors de la création de l\'offre.'
      : 'Erreur lors de la création de l\'offre.'
    : null;

  return (
    <div className="container">
      <header className={styles.header}>
        <h1>Publier une offre</h1>
        <p className="text-muted">
          Détaille le poste recherché. Ton offre sera visible immédiatement par tous les joueurs sur la plateforme.
        </p>
      </header>

      <Card className={styles.card}>
        <form onSubmit={handleSubmit((v) => mutation.mutate(v))} className={styles.form}>
          {/* ─── Titre ─────────────────────────────────────── */}
          <div className={styles.field}>
            <label htmlFor="title">
              Titre de l'offre <span className={styles.required}>*</span>
            </label>
            <input
              id="title"
              type="text"
              placeholder="ex : Recherche MID Diamond+ pour roster compétitif"
              {...register('title', {
                required: 'Titre requis',
                minLength: { value: 5, message: 'Au moins 5 caractères' },
                maxLength: { value: 200, message: 'Maximum 200 caractères' },
              })}
            />
            {errors.title && <span className={styles.error}>{errors.title.message}</span>}
          </div>

          {/* ─── Rôle recherché + rang minimum ─────────────── */}
          <div className={styles.row}>
            <div className={styles.field}>
              <label htmlFor="wantedRole">
                Rôle recherché <span className={styles.required}>*</span>
              </label>
              <select id="wantedRole" {...register('wantedRole', { required: true })}>
                {PLAYER_ROLES.map((role) => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
            </div>

            <div className={styles.field}>
              <label htmlFor="minimumRank">
                Rang minimum <span className={styles.required}>*</span>
              </label>
              <select id="minimumRank" {...register('minimumRank', { required: true })}>
                {RANKS.map((rank) => (
                  <option key={rank} value={rank}>{rank}</option>
                ))}
              </select>
            </div>
          </div>

          {/* ─── Description ───────────────────────────────── */}
          <div className={styles.field}>
            <label htmlFor="description">
              Description du poste <span className={styles.required}>*</span>
            </label>
            <textarea
              id="description"
              rows={6}
              placeholder="Présente ton club, le niveau visé, le rythme d'entraînement, ce que tu attends du candidat…"
              {...register('description', {
                required: 'Description requise',
                minLength: { value: 20, message: 'Au moins 20 caractères' },
                maxLength: { value: 5000, message: 'Maximum 5000 caractères' },
              })}
            />
            {errors.description && (
              <span className={styles.error}>{errors.description.message}</span>
            )}
          </div>

          {/* ─── Date d'expiration ─────────────────────────── */}
          <div className={styles.field}>
            <label htmlFor="expiresAt">Date d'expiration (optionnelle)</label>
            <input
              id="expiresAt"
              type="date"
              min={new Date(Date.now() + 86400_000).toISOString().slice(0, 10)}
              {...register('expiresAt')}
            />
            <span className={styles.hint}>Laissez vide pour une offre sans date limite.</span>
          </div>

          {serverError && <div className={styles.serverError}>{serverError}</div>}

          {/* ─── Actions ───────────────────────────────────── */}
          <div className={styles.actions}>
            <Button
              type="button"
              variant="ghost"
              onClick={() => navigate('/dashboard/club')}
            >
              Annuler
            </Button>
            <Button type="submit" variant="primary" isLoading={isSubmitting || mutation.isPending}>
              Publier l'offre
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}