// Page de connexion. Formulaire email + mot de passe, géré par react-hook-form.

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { notify } from '../lib/notify';
import styles from './AuthForm.module.css';

interface LoginFormValues {
  email: string;
  password: string;
}

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>();

  const onSubmit = async (values: LoginFormValues) => {
    setServerError(null);
    try {
      await login(values.email, values.password);
      notify.success('Connexion reussie. Bienvenue !');
      // Redirige vers la page d'origine (si fournie) ou /
      const from = (location.state as { from?: string } | null)?.from ?? '/';
      navigate(from, { replace: true });
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : 'Email ou mot de passe incorrect.';
      setServerError(msg);
      notify.error(msg);
    }
  };

  return (
    <div className={`container ${styles.wrapper}`}>
      <Card className={styles.card}>
        <h1 className={styles.title}>Connexion</h1>
        <p className={styles.subtitle}>
          Pas encore de compte ?{' '}
          <Link to="/register" className="text-teal">
            Inscris-toi
          </Link>
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
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
              autoComplete="current-password"
              {...register('password', {
                required: 'Mot de passe requis',
                minLength: { value: 6, message: 'Au moins 6 caractères' },
              })}
            />
            {errors.password && <span className={styles.error}>{errors.password.message}</span>}
          </div>

          {serverError && <div className={styles.serverError}>{serverError}</div>}

          <Button type="submit" variant="primary" fullWidth isLoading={isSubmitting}>
            Se connecter
          </Button>
        </form>
      </Card>
    </div>
  );
}
