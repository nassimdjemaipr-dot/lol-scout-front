// Service d'authentification : login, register, récupération de l'user courant.
// S'appuie sur le client axios (api.ts) qui gère le JWT automatiquement.

import { api } from './api';
import type { LoginResponse, RegisterPayload, User } from '../types';

export const authService = {
  /** Inscription d'un nouvel utilisateur (joueur ou club) */
  async register(payload: RegisterPayload): Promise<User> {
    const { data } = await api.post<User>('/register', payload);
    return data;
  },

  /** Login → renvoie un JWT à stocker en localStorage */
  async login(email: string, password: string): Promise<LoginResponse> {
    const { data } = await api.post<LoginResponse>('/login_check', {
      username: email,
      password,
    });
    return data;
  },

  /** Récupère l'user courant (vérification du token) */
  async me(): Promise<User> {
    const { data } = await api.get<User>('/me');
    return data;
  },
};