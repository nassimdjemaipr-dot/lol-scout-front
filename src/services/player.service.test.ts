import { describe, expect, it, vi, beforeEach } from 'vitest';
import { playerService } from './player.service';
import { api } from './api';

vi.mock('./api', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
  },
}));

describe('playerService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('list() calls GET /players with params', async () => {
    (api.get as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ data: [] });
    await playerService.list({ role: 'MID', available: true });
    expect(api.get).toHaveBeenCalledWith('/players', { params: { role: 'MID', available: true } });
  });

  it('list() works without params', async () => {
    (api.get as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ data: [] });
    await playerService.list();
    expect(api.get).toHaveBeenCalledWith('/players', { params: {} });
  });

  it('get(id) calls GET /players/:id', async () => {
    (api.get as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ data: { id: 7 } });
    const result = await playerService.get(7);
    expect(api.get).toHaveBeenCalledWith('/players/7');
    expect(result.id).toBe(7);
  });

  it('getMyProfile() calls GET /players/me', async () => {
    (api.get as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ data: { id: 1 } });
    await playerService.getMyProfile();
    expect(api.get).toHaveBeenCalledWith('/players/me');
  });

  it('update(id, updates) calls PATCH /players/:id with body', async () => {
    (api.patch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ data: { id: 3, pseudo: 'NewPseudo' } });
    const result = await playerService.update(3, { pseudo: 'NewPseudo' });
    expect(api.patch).toHaveBeenCalledWith('/players/3', { pseudo: 'NewPseudo' });
    expect(result.pseudo).toBe('NewPseudo');
  });

  it('linkRiotAccount() POSTs /players/me/riot-account with summonerName+region', async () => {
    (api.post as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: { id: 1, summonerName: 'X#EUW', puuid: 'p', region: 'EUW1' },
    });
    await playerService.linkRiotAccount('X#EUW', 'EUW1');
    expect(api.post).toHaveBeenCalledWith('/players/me/riot-account', {
      summonerName: 'X#EUW',
      region: 'EUW1',
    });
  });

  it('syncRiotStats() POSTs /players/me/sync-riot', async () => {
    (api.post as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: { tier: 'Gold II', winrate: '50', rankedGamesCount: 80, lastSyncAt: '2026-01-01' },
    });
    await playerService.syncRiotStats();
    expect(api.post).toHaveBeenCalledWith('/players/me/sync-riot');
  });
});