// Service des joueurs : liste, profil, recherche, sync Riot.

import { api } from './api';
import type { Player, PlayerRole } from '../types';

export interface PlayerSearchParams {
  role?: PlayerRole;
  minRank?: string;
  available?: boolean;
  page?: number;
}

export const playerService = {
  /** Liste paginée des joueurs avec filtres optionnels */
  async list(params: PlayerSearchParams = {}): Promise<Player[]> {
    const { data } = await api.get<Player[]>('/players', { params });
    return data;
  },

  /** Détail d'un joueur par ID */
  async get(id: number): Promise<Player> {
    const { data } = await api.get<Player>(`/players/${id}`);
    return data;
  },

  /** Met à jour le profil du joueur connecté */
  async updateMyProfile(updates: Partial<Player>): Promise<Player> {
    const { data } = await api.patch<Player>('/players/me', updates);
    return data;
  },

  /** Lance la synchronisation avec l'API Riot Games */
  async syncRiotStats(): Promise<Player> {
    const { data } = await api.post<Player>('/players/me/sync-riot');
    return data;
  },
};