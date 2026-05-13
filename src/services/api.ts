// Client HTTP axios partagé par toute l'application.
// Inclut un intercepteur qui ajoute automatiquement le token JWT,
// et un autre qui redirige vers /login si le token expire (401).

import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});


/* ─── Intercepteur requête : injecte le JWT ─────────────── */
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem('lol-scout-token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});


/* ─── Intercepteur réponse : redirige sur 401 ───────────── */
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Token expiré ou invalide → on nettoie et on renvoie au login
      localStorage.removeItem('lol-scout-token');
      // Évite la boucle de redirection si on est déjà sur /login
      if (!window.location.pathname.startsWith('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);