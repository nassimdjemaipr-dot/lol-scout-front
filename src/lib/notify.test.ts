import { describe, expect, it, vi, beforeEach } from 'vitest';
import { notify } from './notify';
import toast from 'react-hot-toast';

vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
    loading: vi.fn(),
    dismiss: vi.fn(),
  },
}));

describe('notify', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('success() calls toast.success with the message', () => {
    notify.success('Bravo !');
    expect(toast.success).toHaveBeenCalledWith('Bravo !');
  });

  it('error() calls toast.error with the message', () => {
    notify.error('Echec.');
    expect(toast.error).toHaveBeenCalledWith('Echec.');
  });

  it('loading() calls toast.loading', () => {
    notify.loading('Chargement...');
    expect(toast.loading).toHaveBeenCalledWith('Chargement...');
  });

  it('dismiss() calls toast.dismiss', () => {
    notify.dismiss('toast-id');
    expect(toast.dismiss).toHaveBeenCalledWith('toast-id');
  });

  it('apiError() extracts message from an Axios-like error', () => {
    const axiosError = {
      isAxiosError: true,
      response: { data: { error: 'Email already used' } },
    };
    notify.apiError(axiosError);
    expect(toast.error).toHaveBeenCalledWith('Email already used');
  });

  it('apiError() uses fallback when error.response.data.error is missing', () => {
    const noMsgError = { isAxiosError: true, response: { data: {} } };
    notify.apiError(noMsgError, 'Erreur custom');
    expect(toast.error).toHaveBeenCalledWith('Erreur custom');
  });

  it('apiError() uses fallback for non-axios errors', () => {
    notify.apiError(new Error('boom'), 'Erreur fallback');
    expect(toast.error).toHaveBeenCalledWith('Erreur fallback');
  });

  it('apiError() uses default fallback when none provided', () => {
    notify.apiError(null);
    expect(toast.error).toHaveBeenCalledWith('Une erreur est survenue.');
  });
});