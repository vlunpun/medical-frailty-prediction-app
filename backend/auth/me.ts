import { api } from "encore.dev/api";
import { getAuthData } from "~encore/auth";

export interface UserInfo {
  id: string;
  email: string;
  role: string;
}

export const me = api<void, UserInfo>(
  { auth: true, expose: true, method: "GET", path: "/auth/me" },
  async () => {
    const auth = getAuthData()!;
    return {
      id: auth.userID,
      email: auth.email,
      role: auth.role,
    };
  }
);
