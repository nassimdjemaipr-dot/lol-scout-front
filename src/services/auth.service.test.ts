import { describe, expect, it, vi, beforeEach } from 'vitest';
import { authService } from './auth.service';
import { api } from './api';

vi.mock('./api', () => ({
  api: {
    post: vi.fn(),
    get: vi.fn(),
  },
}));

describe('authService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('login', () => {
    it('POSTs to /login_check with username + password and returns the token', async () => {
      (api.post as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        data: { token: 'fake-jwt-token' },
      });

      const result = await authService.login('test@example.com', 'mypass');

      expect(api.post).toHaveBeenCalledWith('/login_check', {
        username: 'test@example.com',
        password: 'mypass',
      });
      expect(result.token).toBe('fake-jwt-token');
    });

    it('propagates errors from the API', async () => {
      (api.post as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error('Network error'));
      await expect(authService.login('a', 'b')).rejects.toThrow('Network error');
    });
  });

  describe('register', () => {
    it('POSTs to /register with the payload', async () => {
      const fakeUser = { id: 1, email: 'new@test.com', role: 'ROLE_PLAYER' };
      (api.post as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ data: fakeUser });

      const result = await authService.register({
        email: 'new@test.com',
        password: 'abcdef',
        role: 'ROLE_PLAYER',
      });

      expect(api.post).toHaveBeenCalledWith('/register', {
        email: 'new@test.com',
        password: 'abcdef',
        role: 'ROLE_PLAYER',
      });
      expect(result).toEqual(fakeUser);
    });
  });

  describe('me', () => {
    it('GETs /me and returns the current user', async () => {
      const fakeUser = { id: 42, email: 'me@test.com', role: 'ROLE_CLUB' };
      (api.get as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ data: fakeUser });

      const result = await authService.me();

      expect(api.get).toHaveBeenCalledWith('/me');
      expect(result).toEqual(fakeUser);
    });
  });
});