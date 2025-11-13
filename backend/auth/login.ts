import { api, APIError, Cookie } from "encore.dev/api";
import { secret } from "encore.dev/config";
import db from "../db";
import * as crypto from "crypto";
import { promisify } from "util";
import * as jwt from "jsonwebtoken";

const scrypt = promisify(crypto.scrypt);
const jwtSecret = secret("JWTSecret");

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: {
    id: number;
    email: string;
    role: string;
  };
  session: Cookie<"session">;
}

async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const [salt, storedHash] = hash.split(":");
  const derivedKey = (await scrypt(password, salt, 64)) as Buffer;
  return storedHash === derivedKey.toString("hex");
}

export const login = api<LoginRequest, LoginResponse>(
  { expose: true, method: "POST", path: "/auth/login" },
  async (req) => {
    const { email, password } = req;

    if (!email || !password) {
      throw APIError.invalidArgument("Email and password are required");
    }

    const user = await db.queryRow<{
      id: number;
      email: string;
      password_hash: string;
      email_verified: boolean;
      role: string;
    }>`
      SELECT id, email, password_hash, email_verified, role
      FROM user_accounts
      WHERE email = ${email.toLowerCase()}
    `;

    if (!user) {
      throw APIError.unauthenticated("Invalid email or password");
    }

    if (!user.email_verified) {
      throw APIError.permissionDenied("Please verify your email address before logging in");
    }

    const isValidPassword = await verifyPassword(password, user.password_hash);
    if (!isValidPassword) {
      throw APIError.unauthenticated("Invalid email or password");
    }

    const token = jwt.sign(
      {
        userID: user.id.toString(),
        email: user.email,
        role: user.role,
      },
      jwtSecret(),
      { expiresIn: "30d" }
    );

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      session: {
        value: token,
        expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        httpOnly: true,
        secure: true,
        sameSite: "Lax",
      },
    };
  }
);
