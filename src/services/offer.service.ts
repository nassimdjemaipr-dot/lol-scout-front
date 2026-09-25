// Service des offres de recrutement : liste, détail, création et gestion (côté club).

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

export type UpdateOfferPayload = Partial<CreateOfferPayload> & { isActive?: boolean };

export const offerService = {
  /** Liste paginée des offres actives */
  async list(params: OfferSearchParams = {}): Promise<Offer[]> {
    const { data } = await api.get<Offer[]>('/offers', { params });
    return data;
  },

  /** Offres du club connecté, actives comme désactivées */
  async listMine(): Promise<Offer[]> {
    const { data } = await api.get<Offer[]>('/offers/me');
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

  /** Modifie une offre (réservé au club propriétaire) */
  async update(id: number, payload: UpdateOfferPayload): Promise<Offer> {
    const { data } = await api.patch<Offer>(`/offers/${id}`, payload);
    return data;
  },

  /** Supprime une offre (réservé au club propriétaire) */
  async remove(id: number): Promise<void> {
    await api.delete(`/offers/${id}`);
  },
};
