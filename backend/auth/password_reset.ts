import { api, APIError } from "encore.dev/api";
import db from "../db";
import * as crypto from "crypto";
import { promisify } from "util";
import { sendEmail, generatePasswordResetEmail } from "../email/send";

const scrypt = promisify(crypto.scrypt);

export interface RequestPasswordResetRequest {
  email: string;
}

export interface RequestPasswordResetResponse {
  message: string;
}

export const requestPasswordReset = api<RequestPasswordResetRequest, RequestPasswordResetResponse>(
  { expose: true, method: "POST", path: "/auth/request-password-reset" },
  async (req) => {
    const { email } = req;

    if (!email) {
      throw APIError.invalidArgument("Email is required");
    }

    const user = await db.queryRow<{ id: number }>`
      SELECT id FROM user_accounts WHERE email = ${email.toLowerCase()}
    `;

    if (!user) {
      return {
        message: "If an account exists with this email, a password reset link has been sent.",
      };
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetExpiry = new Date(Date.now() + 60 * 60 * 1000);

    await db.exec`
      UPDATE user_accounts
      SET reset_token = ${resetToken},
          reset_token_expires = ${resetExpiry}
      WHERE id = ${user.id}
    `;

    await sendEmail({
      to: email.toLowerCase(),
      subject: "Reset Your Password - Medicaid Frailty Assessment",
      html: generatePasswordResetEmail(email.toLowerCase(), resetToken),
    });

    return {
      message: "If an account exists with this email, a password reset link has been sent.",
    };
  }
);

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

export interface ResetPasswordResponse {
  message: string;
}

async function hashPassword(password: string): Promise<string> {
  const salt = crypto.randomBytes(16).toString("hex");
  const derivedKey = (await scrypt(password, salt, 64)) as Buffer;
  return `${salt}:${derivedKey.toString("hex")}`;
}

export const resetPassword = api<ResetPasswordRequest, ResetPasswordResponse>(
  { expose: true, method: "POST", path: "/auth/reset-password" },
  async (req) => {
    const { token, newPassword } = req;

    if (!token || !newPassword) {
      throw APIError.invalidArgument("Token and new password are required");
    }

    if (newPassword.length < 8) {
      throw APIError.invalidArgument("Password must be at least 8 characters long");
    }

    const user = await db.queryRow<{
      id: number;
      reset_token_expires: Date;
    }>`
      SELECT id, reset_token_expires
      FROM user_accounts
      WHERE reset_token = ${token}
    `;

    if (!user) {
      throw APIError.notFound("Invalid reset token");
    }

    if (new Date() > user.reset_token_expires) {
      throw APIError.failedPrecondition("Reset token has expired");
    }

    const passwordHash = await hashPassword(newPassword);

    await db.exec`
      UPDATE user_accounts
      SET password_hash = ${passwordHash},
          reset_token = NULL,
          reset_token_expires = NULL
      WHERE id = ${user.id}
    `;

    return {
      message: "Password reset successfully. You can now log in with your new password.",
    };
  }
);
