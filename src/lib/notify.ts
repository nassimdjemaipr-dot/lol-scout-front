// Helper centralise pour emettre des notifications (toasts).
// Wrapper fin autour de react-hot-toast pour garder un seul point d'import
// dans l'app et faciliter un eventuel changement de lib.

import toast from 'react-hot-toast';
import { isAxiosError } from 'axios';

export const notify = {
  success: (message: string) => toast.success(message),
  error: (message: string) => toast.error(message),
  loading: (message: string) => toast.loading(message),
  dismiss: (id?: string) => toast.dismiss(id),

  /** Extrait le message d'erreur d'une erreur Axios et l'affiche. */
  apiError: (error: unknown, fallback = 'Une erreur est survenue.') => {
    const message = isAxiosError(error)
      ? ((error.response?.data as { error?: string })?.error ?? fallback)
      : fallback;
    toast.error(message);
  },
};