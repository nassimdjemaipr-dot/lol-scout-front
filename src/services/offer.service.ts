// Service des offres de recrutement : liste, détail, création (côté club).

import { api } from './api';
import type { Offer, PlayerRole } from '../types';

export interface OfferSearchParams {
  role?: PlayerRole;
  minRank?: string;
  page?: number;
}

export interface CreateOfferPayload {
  title: string;
  description: string;
  wantedRole: PlayerRole;
  minimumRank: string;
  expiresAt?: string;
}

export const offerService = {
  /** Liste paginée des offres actives */
  async list(params: OfferSearchParams = {}): Promise<Offer[]> {
    const { data } = await api.get<Offer[]>('/offers', { params });
    return data;
  },

  /** Détail d'une offre */
  async get(id: number): Promise<Offer> {
    const { data } = await api.get<Offer>(`/offers/${id}`);
    return data;
  },

  /** Crée une offre (réservé aux clubs) */
  async create(payload: CreateOfferPayload): Promise<Offer> {
    const { data } = await api.post<Offer>('/offers', payload);
    return data;
  },
};