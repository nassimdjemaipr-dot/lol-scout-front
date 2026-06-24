import { describe, expect, it, vi, beforeEach } from 'vitest';
import { applicationService } from './application.service';
import { api } from './api';

vi.mock('./api', () => ({
  api: { get: vi.fn(), post: vi.fn(), patch: vi.fn() },
}));

describe('applicationService', () => {
  beforeEach(() => vi.clearAllMocks());

  it('apply() POSTs /applications with offerId + message', async () => {
    (api.post as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ data: { id: 1 } });
    await applicationService.apply(42, 'Hello, I want to apply.');
    expect(api.post).toHaveBeenCalledWith('/applications', {
      offerId: 42,
      message: 'Hello, I want to apply.',
    });
  });

  it('listMine() GETs /applications/me', async () => {
    (api.get as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ data: [] });
    await applicationService.listMine();
    expect(api.get).toHaveBeenCalledWith('/applications/me');
  });

  it('listForClub() GETs /clubs/me/applications', async () => {
    (api.get as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ data: [] });
    await applicationService.listForClub();
    expect(api.get).toHaveBeenCalledWith('/clubs/me/applications');
  });

  it('updateStatus() PATCHes /applications/:id with status', async () => {
    (api.patch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: { id: 7, status: 'ACCEPTEE' },
    });
    await applicationService.updateStatus(7, 'ACCEPTEE');
    expect(api.patch).toHaveBeenCalledWith('/applications/7', { status: 'ACCEPTEE' });
  });
});