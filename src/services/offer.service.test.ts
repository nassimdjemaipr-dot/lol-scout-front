import { describe, expect, it, vi, beforeEach } from 'vitest';
import { offerService } from './offer.service';
import { api } from './api';

vi.mock('./api', () => ({
  api: { get: vi.fn(), post: vi.fn() },
}));

describe('offerService', () => {
  beforeEach(() => vi.clearAllMocks());

  it('list() calls GET /offers with params', async () => {
    (api.get as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ data: [] });
    await offerService.list({ role: 'MID' });
    expect(api.get).toHaveBeenCalledWith('/offers', { params: { role: 'MID' } });
  });

  it('list() works without params', async () => {
    (api.get as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ data: [] });
    await offerService.list();
    expect(api.get).toHaveBeenCalledWith('/offers', { params: {} });
  });

  it('get(id) calls GET /offers/:id', async () => {
    (api.get as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ data: { id: 5 } });
    const result = await offerService.get(5);
    expect(api.get).toHaveBeenCalledWith('/offers/5');
    expect(result.id).toBe(5);
  });

  it('create() POSTs /offers with payload', async () => {
    (api.post as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ data: { id: 9 } });
    const payload = {
      title: 'Recherche MID',
      description: 'Description',
      wantedRole: 'MID' as const,
      minimumRank: 'Diamond IV',
    };
    await offerService.create(payload);
    expect(api.post).toHaveBeenCalledWith('/offers', payload);
  });
});