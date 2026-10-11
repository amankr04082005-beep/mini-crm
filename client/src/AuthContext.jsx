import { createContext, useCallback, useContext, useMemo, useState } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('crm_token'));
  const [admin, setAdmin] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('crm_admin'));
    } catch {
      return null;
    }
  });

  const login = useCallback((data) => {
    localStorage.setItem('crm_token', data.token);
    localStorage.setItem('crm_admin', JSON.stringify(data.admin));
    setToken(data.token);
    setAdmin(data.admin);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('crm_token');
    localStorage.removeItem('crm_admin');
    setToken(null);
    setAdmin(null);
  }, []);

  const value = useMemo(() => ({ token, admin, login, logout }), [token, admin, login, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
