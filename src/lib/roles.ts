// Libelles lisibles des roles, pour l'affichage.

const LABELS: Record<string, string> = {
  ROLE_PLAYER: 'Joueur',
  ROLE_CLUB: 'Club',
  ROLE_ADMIN: 'Administrateur',
};

const PLURALS: Record<string, string> = {
  ROLE_PLAYER: 'Joueurs',
  ROLE_CLUB: 'Clubs',
  ROLE_ADMIN: 'Administrateurs',
};

export function roleLabel(role: string): string {
  return LABELS[role] ?? role;
}

export function roleLabelPlural(role: string): string {
  return PLURALS[role] ?? role;
}
