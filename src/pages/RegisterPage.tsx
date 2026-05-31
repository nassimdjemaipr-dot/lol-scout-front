// Page d'inscription. Demande email + mot de passe + rôle (joueur ou club).

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/auth.service';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { notify } from '../lib/notify';
import type { UserRole } from '../types';
import styles from './AuthForm.module.css';

interface RegisterFormValues {
  email: string;
  password: string;
  passwordConfirm: string;
  role: UserRole;
}

export function RegisterPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({ defaultValues: { role: 'ROLE_PLAYER' } });

  const password = watch('password');

  const onSubmit = async (values: RegisterFormValues) => {
    setServerError(null);
    try {
      await authService.register({
        email: values.email,
        password: values.password,
        role: values.role,
      });
      // Auto-login après inscription réussie
      await login(values.email, values.password);
      notify.success('Compte cree avec succes. Bienvenue sur LoL Scout !');
      navigate('/', { replace: true });
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Erreur lors de l'inscription.";
      setServerError(msg);
      notify.error(msg);
    }
  };

  return (
    <div className={`container ${styles.wrapper}`}>
      <Card className={styles.card}>
        <h1 className={styles.title}>Créer un compte</h1>
        <p className={styles.subtitle}>
          Déjà inscrit ?{' '}
          <Link to="/login" className="text-teal">
            Connecte-toi
          </Link>
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
          <div className={styles.field}>
            <label htmlFor="role">Je suis…</label>
            <select id="role" {...register('role', { required: true })}>
              <option value="ROLE_PLAYER">🎮 Joueur</option>
              <option value="ROLE_CLUB">🏆 Club / équipe</option>
            </select>
          </div>

          <div className={styles.field}>
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              {...register('email', {
                required: 'Email requis',
                pattern: { value: /^\S+@\S+\.\S+$/, message: 'Email invalide' },
              })}
            />
            {errors.email && <span className={styles.error}>{errors.email.message}</span>}
          </div>

          <div className={styles.field}>
            <label htmlFor="password">Mot de passe</label>
            <input
              id="password"
              type="password"
              autoComplete="new-password"
              {...register('password', {
                required: 'Mot de passe requis',
                minLength: { value: 8, message: 'Au moins 8 caractères' },
              })}
            />
            {errors.password && <span className={styles.error}>{errors.password.message}</span>}
          </div>

          <div className={styles.field}>
            <label htmlFor="passwordConfirm">Confirmer le mot de passe</label>
            <input
              id="passwordConfirm"
              type="password"
              autoComplete="new-password"
              {...register('passwordConfirm', {
                required: 'Confirmation requise',
                validate: (v) => v === password || 'Les mots de passe ne correspondent pas',
              })}
            />
            {errors.passwordConfirm && (
              <span className={styles.error}>{errors.passwordConfirm.message}</span>
            )}
          </div>

          {serverError && <div className={styles.serverError}>{serverError}</div>}

          <Button type="submit" variant="primary" fullWidth isLoading={isSubmitting}>
            S'inscrire
          </Button>
        </form>
      </Card>
    </div>
  );
}
