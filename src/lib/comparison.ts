// Logique de comparaison de joueurs, isolee de l'affichage.
// Fonctions pures : testables sans rendre le moindre composant.

import { RANKS } from '../types';

/** Nombre maximum de joueurs comparables simultanement. */
export const MAX_COMPARISON = 3;

/**
 * Position d'un palier dans le classement, a partir d'un libelle stocke.
 * "Diamond II" donne l'indice de Diamond. -1 si absent ou non classe.
 */
export function tierRank(tier?: string): number {
  if (!tier) return -1;

  const name = tier.trim().split(' ')[0]?.toLowerCase();

  return RANKS.findIndex((rank) => rank.toLowerCase() === name);
}

/**
 * Indices des meilleures valeurs d'une ligne.
 *
 * Plusieurs indices en cas d'egalite. Aucun s'il y a moins de deux valeurs
 * exploitables : designer un gagnant quand un seul joueur a renseigne le
 * critere ne comparerait rien.
 */
export function bestIndexes(values: (number | null)[]): number[] {
  const usable = values.filter((value): value is number => value !== null);

  if (usable.length < 2) return [];

  const max = Math.max(...usable);

  return values.flatMap((value, index) => (value === max ? [index] : []));
}

/** Convertit une valeur textuelle de l'API en nombre comparable. */
export function toNumber(value?: string): number | null {
  if (value === undefined || value === null || value === '') return null;

  const parsed = Number(value);

  return Number.isFinite(parsed) ? parsed : null;
}

/** Rendu d'une valeur numerique, ou tiret si elle est absente. */
export function formatValue(value?: string, suffix = ''): string {
  const parsed = toNumber(value);

  return parsed === null ? '—' : parsed.toFixed(1) + suffix;
}

/**
 * Identifiants a comparer, extraits du parametre d'URL "ids".
 * Filtre les valeurs invalides et plafonne a MAX_COMPARISON.
 */
export function parseComparisonIds(raw: string | null): number[] {
  return (raw ?? '')
    .split(',')
    .map((part) => Number(part.trim()))
    .filter((id) => Number.isInteger(id) && id > 0)
    .slice(0, MAX_COMPARISON);
}
