import { Header, Cookie, APIError, Gateway } from "encore.dev/api";
import { authHandler } from "encore.dev/auth";
import { secret } from "encore.dev/config";
import * as jwt from "jsonwebtoken";
import db from "../db";

const jwtSecret = secret("JWTSecret");

interface JWTPayload {
  userID: string;
  email: string;
  role: string;
}

interface AuthParams {
  authorization?: Header<"Authorization">;
  session?: Cookie<"session">;
}

export interface AuthData {
  userID: string;
  email: string;
  role: string;
}

export const auth = authHandler<AuthParams, AuthData>(async (data) => {
  const token = data.authorization?.replace("Bearer ", "") ?? data.session?.value;
  if (!token) {
    throw APIError.unauthenticated("missing token");
  }

  try {
    const decoded = jwt.verify(token, jwtSecret()) as JWTPayload;

    const user = await db.queryRow<{
      id: number;
      email: string;
      role: string;
      email_verified: boolean;
    }>`
      SELECT id, email, role, email_verified
      FROM user_accounts
      WHERE id = ${parseInt(decoded.userID)}
    `;

    if (!user) {
      throw APIError.unauthenticated("user not found");
    }

    if (!user.email_verified) {
      throw APIError.unauthenticated("email not verified");
    }

    return {
      userID: decoded.userID,
      email: user.email,
      role: user.role,
    };
  } catch (err) {
    throw APIError.unauthenticated("invalid token", err as Error);
  }
});

export const gw = new Gateway({ authHandler: auth });
