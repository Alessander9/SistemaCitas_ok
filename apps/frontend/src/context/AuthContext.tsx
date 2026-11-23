import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import {
  getAuthToken,
  setAuthToken,
  getRefreshToken,
  setRefreshToken,
  clearAuthSession,
  getActiveClinicId,
  setActiveClinicId,
} from '../utils/storage';

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  clinicId: string;
  clinicName: string;
  roles: string[];
  permissions: string[];
}

export interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  activeRole: string;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, user: AuthUser, refreshToken?: string) => void;
  logout: () => void;
  switchRole: (role: string) => void;
  refreshProfile: () => Promise<void>;
}

const defaultAuthContext: AuthContextType = {
  user: null,
  token: null,
  activeRole: 'ADMIN_CLINIC',
  isAuthenticated: false,
  isLoading: false,
  login: () => {},
  logout: () => {},
  switchRole: () => {},
  refreshProfile: async () => {},
};

const AuthContext = createContext<AuthContextType>(defaultAuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setTokenState] = useState<string | null>(getAuthToken);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [activeRole, setActiveRole] = useState<string>('ADMIN_CLINIC');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchProfile = useCallback(async (jwt: string): Promise<AuthUser | null> => {
    try {
      const activeClinic = getActiveClinicId();
      const headers: Record<string, string> = {
        Authorization: `Bearer ${jwt}`,
      };
      if (activeClinic) {
        headers['x-clinic-id'] = activeClinic;
      }

      const res = await fetch('/api/auth/me', { headers });
      if (!res.ok) {
        return null;
      }
      const data: AuthUser = await res.json();
      return data;
    } catch {
      return null;
    }
  }, []);

  const logout = useCallback(() => {
    const activeToken = getAuthToken();
    const activeRefresh = getRefreshToken();
    if (activeToken) {
      fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${activeToken}`,
        },
        body: JSON.stringify({ refreshToken: activeRefresh }),
      }).catch(() => {
        // Ignorar fallo de red en logout
      });
    }
    clearAuthSession();
    setTokenState(null);
    setUser(null);
    setActiveRole('ADMIN_CLINIC');
  }, []);

  const login = useCallback((jwt: string, profile: AuthUser, refreshToken?: string) => {
    setAuthToken(jwt);
    if (refreshToken) {
      setRefreshToken(refreshToken);
    }
    if (profile.clinicId) {
      setActiveClinicId(profile.clinicId);
    }
    setTokenState(jwt);
    setUser(profile);
    const primaryRole = profile.roles?.[0] || 'ADMIN_CLINIC';
    setActiveRole(primaryRole);
  }, []);

  const switchRole = useCallback((newRole: string) => {
    setActiveRole(newRole);
  }, []);

  const refreshProfile = useCallback(async () => {
    const currentToken = getAuthToken();
    if (!currentToken) {
      logout();
      return;
    }
    const profile = await fetchProfile(currentToken);
    if (profile) {
      setUser(profile);
      if (!profile.roles.includes(activeRole)) {
        setActiveRole(profile.roles[0] || 'ADMIN_CLINIC');
      }
    } else {
      logout();
    }
  }, [activeRole, fetchProfile, logout]);

  // Rehidratar sesión en montaje inicial
  useEffect(() => {
    let mounted = true;
    const initSession = async () => {
      const savedToken = getAuthToken();
      if (!savedToken) {
        if (mounted) {
          setIsLoading(false);
        }
        return;
      }

      const profile = await fetchProfile(savedToken);
      if (mounted) {
        if (profile) {
          setUser(profile);
          const primaryRole = profile.roles?.[0] || 'ADMIN_CLINIC';
          setActiveRole(primaryRole);
          if (profile.clinicId) {
            setActiveClinicId(profile.clinicId);
          }
        } else {
          clearAuthSession();
          setTokenState(null);
          setUser(null);
        }
        setIsLoading(false);
      }
    };

    initSession();

    return () => {
      mounted = false;
    };
  }, [fetchProfile]);

  const value = useMemo<AuthContextType>(
    () => ({
      user,
      token,
      activeRole,
      isAuthenticated: Boolean(user && token),
      isLoading,
      login,
      logout,
      switchRole,
      refreshProfile,
    }),
    [user, token, activeRole, isLoading, login, logout, switchRole, refreshProfile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  return context || defaultAuthContext;
}
