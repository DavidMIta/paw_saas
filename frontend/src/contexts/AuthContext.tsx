import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { authAPI, clearTokens, getAccessToken, setTokens } from "../services/api.ts";
import type { User } from "../types";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = getAccessToken();
    if (token) {
      authAPI
        .me()
        .then((response) => setUser(response.data))
        .catch(() => {
          clearTokens();
          setUser(null);
        })
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  async function login(email: string, password: string) {
    const { data } = await authAPI.login(email, password);
    setTokens(data);
    const response = await authAPI.me();
    setUser(response.data);
  }

  function logout() {
    clearTokens();
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{ user, isLoading, isAuthenticated: !!user, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
