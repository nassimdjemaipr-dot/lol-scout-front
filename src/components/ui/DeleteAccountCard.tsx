import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { authService } from '../../services/auth.service';
import { Card } from './Card';
import { Button } from './Button';
import { notify } from '../../lib/notify';
import styles from './DeleteAccountCard.module.css';

export function DeleteAccountCard() {
  const [confirming, setConfirming] = useState(false);
  const { logout } = useAuth();
  const navigate = useNavigate();

  const deleteMutation = useMutation({
    mutationFn: () => authService.deleteAccount(),
    onSuccess: () => {
      notify.success('Compte supprimé. Tes données personnelles ont été effacées.');
      logout();
      navigate('/');
    },
    onError: (err) => notify.apiError(err, 'Impossible de supprimer le compte.'),
  });

  return (
    <Card>
      <h3 className={styles.title}>Supprimer mon compte</h3>

      {confirming ? (
        <>
          <p className={styles.warning}>
            Cette action est définitive. Ton adresse, ton nom et ton profil seront
            effacés, et tu ne pourras plus te connecter.
          </p>
          <p className="text-muted">
            Tes candidatures restent visibles par les clubs concernés, sous la
            mention « Compte supprimé » — elles font partie de leur historique de
            recrutement.
          </p>
          <div className={styles.actions}>
            <Button
              variant="danger"
              size="sm"
              isLoading={deleteMutation.isPending}
              onClick={() => deleteMutation.mutate()}
            >
              Confirmer la suppression
            </Button>
            <Button
              variant="ghost"
              size="sm"
              disabled={deleteMutation.isPending}
              onClick={() => setConfirming(false)}
            >
              Annuler
            </Button>
          </div>
        </>
      ) : (
        <>
          <p className="text-muted">
            Conformément au RGPD, tu peux demander l&apos;effacement de tes données
            personnelles à tout moment.
          </p>
          <Button variant="danger" size="sm" fullWidth onClick={() => setConfirming(true)}>
            Supprimer mon compte
          </Button>
        </>
      )}
    </Card>
  );
}
