import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import backend from "~backend/client";
import type { UserInfo } from "~backend/auth/me";

interface AuthContextType {
  user: UserInfo | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (token: string, user: UserInfo) => void;
  logout: () => void;
  getAuthenticatedBackend: () => typeof backend;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    const userInfo = localStorage.getItem("userInfo");

    if (token && userInfo) {
      try {
        setUser(JSON.parse(userInfo));
      } catch (error) {
        console.error("Failed to parse user info:", error);
        localStorage.removeItem("authToken");
        localStorage.removeItem("userInfo");
      }
    }
    setLoading(false);
  }, []);

  const login = (token: string, userInfo: UserInfo) => {
    localStorage.setItem("authToken", token);
    localStorage.setItem("userInfo", JSON.stringify(userInfo));
    setUser(userInfo);
  };

  const logout = async () => {
    try {
      await backend.auth.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      localStorage.removeItem("authToken");
      localStorage.removeItem("userInfo");
      setUser(null);
    }
  };

  const getAuthenticatedBackend = () => {
    const token = localStorage.getItem("authToken");
    if (!token) return backend;
    return backend.with({
      auth: () => ({ authorization: `Bearer ${token}` }),
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        loading,
        login,
        logout,
        getAuthenticatedBackend,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
