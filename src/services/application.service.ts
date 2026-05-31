// Service des candidatures : postuler, lister (joueur / club), changer le statut.

import { api } from './api';
import type { Application, ApplicationStatus } from '../types';

export const applicationService = {
  /** Un joueur postule à une offre */
  async apply(offerId: number, message: string): Promise<Application> {
    const { data } = await api.post<Application>('/applications', {
      offerId,
      message,
    });
    return data;
  },

  /** Candidatures envoyées par le joueur connecté */
  async listMine(): Promise<Application[]> {
    const { data } = await api.get<Application[]>('/applications/me');
    return data;
  },

  /** Candidatures reçues par le club connecté */
  async listForClub(): Promise<Application[]> {
    const { data } = await api.get<Application[]>('/clubs/me/applications');
    return data;
  },

  /** Le club accepte ou refuse une candidature */
  async updateStatus(id: number, status: ApplicationStatus): Promise<Application> {
    const { data } = await api.patch<Application>(`/applications/${id}`, { status });
    return data;
  },
};