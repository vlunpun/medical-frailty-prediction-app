import { api, APIError } from "encore.dev/api";
import db from "../db";
import { sendEmail, generateVerificationEmail } from "../email/send";

export interface VerifyEmailRequest {
  token: string;
}

export interface VerifyEmailResponse {
  message: string;
}

export const verifyEmail = api<VerifyEmailRequest, VerifyEmailResponse>(
  { expose: true, method: "POST", path: "/auth/verify-email" },
  async (req) => {
    const { token } = req;

    if (!token) {
      throw APIError.invalidArgument("Verification token is required");
    }

    const user = await db.queryRow<{
      id: number;
      email: string;
      verification_token_expires: Date;
    }>`
      SELECT id, email, verification_token_expires
      FROM user_accounts
      WHERE verification_token = ${token}
    `;

    if (!user) {
      throw APIError.notFound("Invalid verification token");
    }

    if (new Date() > user.verification_token_expires) {
      throw APIError.failedPrecondition("Verification token has expired");
    }

    await db.exec`
      UPDATE user_accounts
      SET email_verified = true,
          verification_token = NULL,
          verification_token_expires = NULL
      WHERE id = ${user.id}
    `;

    return {
      message: "Email verified successfully. You can now log in.",
    };
  }
);

export interface ResendVerificationRequest {
  email: string;
}

export interface ResendVerificationResponse {
  message: string;
}

export const resendVerification = api<ResendVerificationRequest, ResendVerificationResponse>(
  { expose: true, method: "POST", path: "/auth/resend-verification" },
  async (req) => {
    const { email } = req;

    if (!email) {
      throw APIError.invalidArgument("Email is required");
    }

    const user = await db.queryRow<{
      id: number;
      email_verified: boolean;
    }>`
      SELECT id, email_verified
      FROM user_accounts
      WHERE email = ${email.toLowerCase()}
    `;

    if (!user) {
      throw APIError.notFound("No account found with this email address");
    }

    if (user.email_verified) {
      throw APIError.alreadyExists("Email is already verified");
    }

    const crypto = await import("crypto");
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const verificationExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await db.exec`
      UPDATE user_accounts
      SET verification_token = ${verificationToken},
          verification_token_expires = ${verificationExpiry}
      WHERE id = ${user.id}
    `;

    await sendEmail({
      to: email.toLowerCase(),
      subject: "Verify Your Email - Medicaid Frailty Assessment",
      html: generateVerificationEmail(email.toLowerCase(), verificationToken),
    });

    return {
      message: "Verification email sent. Please check your inbox.",
    };
  }
);
