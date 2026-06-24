import { describe, expect, it, beforeEach } from 'vitest';
import { api } from './api';

describe('api (axios client)', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('is configured with the expected baseURL', () => {
    expect(api.defaults.baseURL).toMatch(/\/api$/);
  });

  it('sets Content-Type to application/json by default', () => {
    expect(api.defaults.headers['Content-Type']).toBe('application/json');
  });

  it('injects the Bearer token if present in localStorage', async () => {
    localStorage.setItem('lol-scout-token', 'super-token-123');

    // On simule un objet config et on declenche l'intercepteur de requete
    const handler = (api.interceptors.request as unknown as {
      handlers: Array<{ fulfilled: (cfg: { headers: Record<string, string> }) => unknown }>;
    }).handlers[0];

    const config = { headers: {} as Record<string, string> };
    handler.fulfilled(config);

    expect(config.headers.Authorization).toBe('Bearer super-token-123');
  });

  it('does not inject Authorization header when no token', () => {
    const handler = (api.interceptors.request as unknown as {
      handlers: Array<{ fulfilled: (cfg: { headers: Record<string, string> }) => unknown }>;
    }).handlers[0];

    const config = { headers: {} as Record<string, string> };
    handler.fulfilled(config);

    expect(config.headers.Authorization).toBeUndefined();
  });
});