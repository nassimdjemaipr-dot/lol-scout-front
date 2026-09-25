// Service d'administration : statistiques, comptes, verification des clubs.
// Tous les appels exigent ROLE_ADMIN, refuse par le pare-feu cote API.

import { api } from './api';
import type { UserRole } from '../types';

export interface AdminStats {
  users: {
    total: number;
    inactive: number;
    byRole: Record<string, number>;
  };
  clubs: {
    total: number;
    unverified: number;
  };
  players: number;
  offers: number;
  applications: number;
}

export interface AdminUser {
  id: number;
  email: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string | null;
}

export interface AdminClub {
  id: number;
  name: string;
  description?: string | null;
  website?: string | null;
  isVerified: boolean;
  owner: {
    id: number | null;
    email: string | null;
    isActive: boolean | null;
  };
}

export interface AdminUserFilters {
  role?: UserRole;
  active?: boolean;
}

export const adminService = {
  async stats(): Promise<AdminStats> {
    const { data } = await api.get<AdminStats>('/admin/stats');
    return data;
  },

  async users(filters: AdminUserFilters = {}): Promise<AdminUser[]> {
    const { data } = await api.get<AdminUser[]>('/admin/users', { params: filters });
    return data;
  },

  async setUserStatus(id: number, isActive: boolean): Promise<AdminUser> {
    const { data } = await api.patch<AdminUser>(`/admin/users/${id}/status`, { isActive });
    return data;
  },

  async clubs(verified?: boolean): Promise<AdminClub[]> {
    const params = verified === undefined ? {} : { verified };
    const { data } = await api.get<AdminClub[]>('/admin/clubs', { params });
    return data;
  },

  async setClubVerified(id: number, isVerified: boolean): Promise<AdminClub> {
    const { data } = await api.patch<AdminClub>(`/admin/clubs/${id}/verify`, { isVerified });
    return data;
  },
};
