// AuthContext — état d'authentification global de l'app.
// Stocke l'utilisateur courant + le token, et expose login/logout.
// Le token est aussi persisté en localStorage pour survivre aux rechargements.

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { authService } from '../services/auth.service';
import type { User } from '../types';

const TOKEN_KEY = 'lol-scout-token';


interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);


export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);


  // Au montage : si un token existe en localStorage, on essaie de récupérer l'user
  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      setIsLoading(false);
      return;
    }

    authService
      .me()
      .then(setUser)
      .catch(() => {
        // Token invalide / expiré → on nettoie
        localStorage.removeItem(TOKEN_KEY);
        setUser(null);
      })
      .finally(() => setIsLoading(false));
  }, []);


  const login = useCallback(async (email: string, password: string) => {
    const { token } = await authService.login(email, password);
    localStorage.setItem(TOKEN_KEY, token);
    const me = await authService.me();
    setUser(me);
  }, []);


  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
  }, []);


  const value: AuthContextValue = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}


/** Hook custom pour accéder à l'auth depuis n'importe quel composant */
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth doit être utilisé dans un <AuthProvider>');
  }
  return ctx;
}
