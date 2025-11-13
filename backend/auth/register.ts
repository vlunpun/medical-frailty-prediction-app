import { api, APIError } from "encore.dev/api";
import db from "../db";
import * as crypto from "crypto";
import { promisify } from "util";
import { sendEmail, generateVerificationEmail } from "../email/send";

const scrypt = promisify(crypto.scrypt);

export interface RegisterRequest {
  email: string;
  password: string;
}

export interface RegisterResponse {
  id: number;
  email: string;
  message: string;
}

async function hashPassword(password: string): Promise<string> {
  const salt = crypto.randomBytes(16).toString("hex");
  const derivedKey = (await scrypt(password, salt, 64)) as Buffer;
  return `${salt}:${derivedKey.toString("hex")}`;
}

function generateVerificationToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

export const register = api<RegisterRequest, RegisterResponse>(
  { expose: true, method: "POST", path: "/auth/register" },
  async (req) => {
    const { email, password } = req;

    if (!email || !email.includes("@")) {
      throw APIError.invalidArgument("Invalid email address");
    }

    if (!password || password.length < 8) {
      throw APIError.invalidArgument("Password must be at least 8 characters long");
    }

    const existingUser = await db.queryRow<{ id: number }>`
      SELECT id FROM user_accounts WHERE email = ${email.toLowerCase()}
    `;

    if (existingUser) {
      throw APIError.alreadyExists("An account with this email already exists");
    }

    const passwordHash = await hashPassword(password);
    const verificationToken = generateVerificationToken();
    const verificationExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const user = await db.queryRow<{ id: number; email: string }>`
      INSERT INTO user_accounts (email, password_hash, verification_token, verification_token_expires)
      VALUES (${email.toLowerCase()}, ${passwordHash}, ${verificationToken}, ${verificationExpiry})
      RETURNING id, email
    `;

    if (!user) {
      throw APIError.internal("Failed to create user account");
    }

    await sendEmail({
      to: user.email,
      subject: "Verify Your Email - Medicaid Frailty Assessment",
      html: generateVerificationEmail(user.email, verificationToken),
    });

    return {
      id: user.id,
      email: user.email,
      message: "Registration successful. Please check your email to verify your account.",
    };
  }
);
