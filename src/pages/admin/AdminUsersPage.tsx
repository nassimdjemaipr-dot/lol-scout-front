// Gestion des comptes : filtrage et activation / désactivation.

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminService, type AdminUser } from '../../services/admin.service';
import { roleLabel } from '../../lib/roles';
import { notify } from '../../lib/notify';
import { useAuth } from '../../contexts/AuthContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import type { UserRole } from '../../types';
import styles from './Admin.module.css';

const ROLE_FILTERS: { value: UserRole | ''; label: string }[] = [
  { value: '', label: 'Tous' },
  { value: 'ROLE_PLAYER', label: 'Joueurs' },
  { value: 'ROLE_CLUB', label: 'Clubs' },
  { value: 'ROLE_ADMIN', label: 'Administrateurs' },
];

export function AdminUsersPage() {
  const [roleFilter, setRoleFilter] = useState<UserRole | ''>('');
  const queryClient = useQueryClient();
  const { user: currentUser } = useAuth();

  const { data: users, isLoading, isError } = useQuery({
    queryKey: ['admin', 'users', roleFilter],
    queryFn: () => adminService.users({ role: roleFilter || undefined }),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: number; isActive: boolean }) =>
      adminService.setUserStatus(id, isActive),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ['admin'] });
      notify.success(
        updated.isActive
          ? `${updated.email} est réactivé.`
          : `${updated.email} est désactivé et ne peut plus se connecter.`
      );
    },
    onError: (error) => notify.apiError(error, 'Impossible de modifier ce compte.'),
  });

  return (
    <div className="container">
      <header className={styles.header}>
        <h1>Comptes</h1>
        <p className="text-muted">
          Désactiver un compte empêche immédiatement sa connexion, et invalide
          les jetons déjà émis.
        </p>
      </header>

      <div className={styles.filters}>
        {ROLE_FILTERS.map((filter) => (
          <button
            key={filter.value || 'all'}
            type="button"
            className={`${styles.chip} ${roleFilter === filter.value ? styles.chipActive : ''}`}
            onClick={() => setRoleFilter(filter.value)}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {isLoading && <p className="text-muted text-center">Chargement…</p>}

      {isError && (
        <Card>
          <p className="text-muted text-center">Impossible de charger les comptes.</p>
        </Card>
      )}

      {users && users.length === 0 && (
        <Card>
          <p className="text-muted text-center">Aucun compte pour ce filtre.</p>
        </Card>
      )}

      {users && users.length > 0 && (
        <Card>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Adresse</th>
                  <th>Rôle</th>
                  <th>Inscrit le</th>
                  <th>État</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <UserRow
                    key={user.id}
                    user={user}
                    isSelf={user.email === currentUser?.email}
                    isPending={statusMutation.isPending}
                    onToggle={() =>
                      statusMutation.mutate({ id: user.id, isActive: !user.isActive })
                    }
                  />
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}

function UserRow({
  user,
  isSelf,
  isPending,
  onToggle,
}: {
  user: AdminUser;
  isSelf: boolean;
  isPending: boolean;
  onToggle: () => void;
}) {
  return (
    <tr className={user.isActive ? undefined : styles.inactiveRow}>
      <td className="mono">
        {user.email}
        {isSelf && <span className={styles.selfTag}>vous</span>}
      </td>
      <td>{roleLabel(user.role)}</td>
      <td className="text-muted">
        {new Date(user.createdAt).toLocaleDateString('fr-FR')}
      </td>
      <td>
        {user.isActive ? (
          <span className={styles.active}>● Actif</span>
        ) : (
          <span className={styles.inactive}>● Désactivé</span>
        )}
      </td>
      <td>
        <Button
          variant={user.isActive ? 'danger' : 'success'}
          size="sm"
          disabled={isSelf || isPending}
          title={
            isSelf
              ? 'Un administrateur ne peut pas désactiver son propre compte'
              : undefined
          }
          onClick={onToggle}
        >
          {user.isActive ? 'Désactiver' : 'Réactiver'}
        </Button>
      </td>
    </tr>
  );
}
