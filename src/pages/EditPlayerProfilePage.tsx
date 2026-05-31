// Page d'édition du profil joueur. Pré-rempli avec les données actuelles.

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { isAxiosError } from 'axios';
import { playerService } from '../services/player.service';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { notify } from '../lib/notify';
import { PLAYER_ROLES, type PlayerRole } from '../types';
import styles from './CreateOfferPage.module.css';

interface FormValues {
  pseudo: string;
  firstName: string;
  lastName: string;
  gameRole: PlayerRole;
  bio: string;
  isAvailable: boolean;
}

export function EditPlayerProfilePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: player, isLoading } = useQuery({
    queryKey: ['me', 'player'],
    queryFn: () => playerService.getMyProfile(),
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>();

  // Pré-remplir le formulaire dès que le profil est chargé
  useEffect(() => {
    if (player) {
      reset({
        pseudo: player.pseudo,
        firstName: player.firstName ?? '',
        lastName: player.lastName ?? '',
        gameRole: player.gameRole,
        bio: player.bio ?? '',
        isAvailable: player.isAvailable,
      });
    }
  }, [player, reset]);

  const mutation = useMutation({
    mutationFn: (values: FormValues) =>
      playerService.update(player!.id, {
        pseudo: values.pseudo.trim(),
        firstName: values.firstName.trim() || undefined,
        lastName: values.lastName.trim() || undefined,
        gameRole: values.gameRole,
        bio: values.bio.trim() || undefined,
        isAvailable: values.isAvailable,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['me', 'player'] });
      queryClient.invalidateQueries({ queryKey: ['players'] });
      notify.success('Profil mis a jour.');
      navigate('/dashboard/player');
    },
    onError: (err) => notify.apiError(err, 'Erreur lors de la mise a jour.'),
  });

  const serverError = mutation.isError
    ? isAxiosError(mutation.error)
      ? (mutation.error.response?.data as { error?: string })?.error ??
        'Erreur lors de la mise à jour.'
      : 'Erreur lors de la mise à jour.'
    : null;

  if (isLoading) {
    return <p className="text-center text-muted">Chargement…</p>;
  }

  if (!player) {
    return (
      <div className="container">
        <Card>
          <p className="text-center text-muted">Profil introuvable.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="container">
      <header className={styles.header}>
        <h1>Modifier mon profil</h1>
        <p className="text-muted">
          Tes infos de profil. Le pseudo et le rôle sont visibles publiquement par les clubs.
        </p>
      </header>

      <Card className={styles.card}>
        <form onSubmit={handleSubmit((v) => mutation.mutate(v))} className={styles.form}>
          <div className={styles.field}>
            <label htmlFor="pseudo">
              Pseudo en jeu <span className={styles.required}>*</span>
            </label>
            <input
              id="pseudo"
              type="text"
              {...register('pseudo', {
                required: 'Pseudo requis',
                minLength: { value: 2, message: 'Au moins 2 caractères' },
                maxLength: { value: 100, message: 'Maximum 100 caractères' },
              })}
            />
            {errors.pseudo && <span className={styles.error}>{errors.pseudo.message}</span>}
          </div>

          <div className={styles.row}>
            <div className={styles.field}>
              <label htmlFor="firstName">Prénom</label>
              <input id="firstName" type="text" {...register('firstName')} />
            </div>

            <div className={styles.field}>
              <label htmlFor="lastName">Nom</label>
              <input id="lastName" type="text" {...register('lastName')} />
            </div>
          </div>

          <div className={styles.field}>
            <label htmlFor="gameRole">
              Rôle de jeu <span className={styles.required}>*</span>
            </label>
            <select id="gameRole" {...register('gameRole', { required: true })}>
              {PLAYER_ROLES.map((role) => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>
          </div>

          <div className={styles.field}>
            <label htmlFor="bio">Bio (optionnelle)</label>
            <textarea
              id="bio"
              rows={4}
              placeholder="Parle un peu de toi : ton style de jeu, tes ambitions, tes disponibilités…"
              {...register('bio', {
                maxLength: { value: 2000, message: 'Maximum 2000 caractères' },
              })}
            />
            {errors.bio && <span className={styles.error}>{errors.bio.message}</span>}
          </div>

          <div className={styles.field}>
            <label
              htmlFor="isAvailable"
              style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 'var(--space-3)', cursor: 'pointer', textTransform: 'none', letterSpacing: 'normal' }}
            >
              <input
                id="isAvailable"
                type="checkbox"
                {...register('isAvailable')}
                style={{ width: 20, height: 20, accentColor: 'var(--color-teal)' }}
              />
              <span style={{ fontSize: 'var(--font-size-base)' }}>
                Je suis disponible pour rejoindre une équipe
              </span>
            </label>
          </div>

          {serverError && <div className={styles.serverError}>{serverError}</div>}

          <div className={styles.actions}>
            <Button
              type="button"
              variant="ghost"
              onClick={() => navigate('/dashboard/player')}
            >
              Annuler
            </Button>
            <Button type="submit" variant="primary" isLoading={isSubmitting || mutation.isPending}>
              Enregistrer
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}