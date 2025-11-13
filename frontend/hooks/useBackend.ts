import { useAuth } from "../contexts/AuthContext";
import backend from "~backend/client";

export function useBackend() {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return backend;
  
  const token = localStorage.getItem("authToken");
  if (!token) return backend;
  
  return backend.with({
    auth: () => ({ authorization: `Bearer ${token}` }),
  });
}
