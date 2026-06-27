import { createContext, useContext, useState } from 'react';
import { authAPI, saveTokens, clearTokens } from '../services/api';

const Ctx = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('user')); } catch { return null; }
  });

  const login = async (email, password) => {
    const d = await authAPI.login({ email, password });
    saveTokens(d.accessToken, d.refreshToken);
    localStorage.setItem('user', JSON.stringify(d.user));
    setUser(d.user);
    return d.user;
  };

  const signup = async (data) => {
    const d = await authAPI.signup(data);
    saveTokens(d.accessToken, d.refreshToken);
    localStorage.setItem('user', JSON.stringify(d.user));
    setUser(d.user);
    return d.user;
  };

  const logout = () => { clearTokens(); setUser(null); };

  return <Ctx.Provider value={{ user, login, signup, logout }}>{children}</Ctx.Provider>;
}

export const useAuth = () => useContext(Ctx);
