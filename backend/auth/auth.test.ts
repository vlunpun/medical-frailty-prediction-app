import { describe, it, expect, beforeEach } from "vitest";
import { register } from "./register";
import { login } from "./login";
import { verifyEmail, resendVerification } from "./verify_email";
import { requestPasswordReset, resetPassword } from "./password_reset";
import db from "../db";

describe("Authentication System", () => {
  const testEmail = `test-${Date.now()}@example.com`;
  const testPassword = "TestPassword123!";
  let userId: number;
  let verificationToken: string;

  describe("User Registration", () => {
    it("should register a new user successfully", async () => {
      const result = await register({
        email: testEmail,
        password: testPassword,
      });

      expect(result.email).toBe(testEmail);
      expect(result.id).toBeDefined();
      expect(result.message).toContain("Registration successful");
      userId = result.id;
    });

    it("should reject registration with invalid email", async () => {
      await expect(
        register({
          email: "invalid-email",
          password: testPassword,
        })
      ).rejects.toThrow("Invalid email address");
    });

    it("should reject registration with short password", async () => {
      await expect(
        register({
          email: `new-${Date.now()}@example.com`,
          password: "short",
        })
      ).rejects.toThrow("Password must be at least 8 characters long");
    });

    it("should reject duplicate email registration", async () => {
      await expect(
        register({
          email: testEmail,
          password: testPassword,
        })
      ).rejects.toThrow("already exists");
    });
  });

  describe("Email Verification", () => {
    beforeEach(async () => {
      const user = await db.queryRow<{ verification_token: string }>`
        SELECT verification_token FROM user_accounts WHERE email = ${testEmail}
      `;
      if (user?.verification_token) {
        verificationToken = user.verification_token;
      }
    });

    it("should verify email with valid token", async () => {
      const result = await verifyEmail({ token: verificationToken });
      expect(result.message).toContain("verified successfully");
    });

    it("should reject invalid verification token", async () => {
      await expect(
        verifyEmail({ token: "invalid-token" })
      ).rejects.toThrow("Invalid verification token");
    });
  });

  describe("User Login", () => {
    it("should login with valid credentials", async () => {
      const result = await login({
        email: testEmail,
        password: testPassword,
      });

      expect(result.token).toBeDefined();
      expect(result.user.email).toBe(testEmail);
      expect(result.session).toBeDefined();
    });

    it("should reject login with invalid password", async () => {
      await expect(
        login({
          email: testEmail,
          password: "wrong-password",
        })
      ).rejects.toThrow("Invalid email or password");
    });

    it("should reject login with non-existent email", async () => {
      await expect(
        login({
          email: "nonexistent@example.com",
          password: testPassword,
        })
      ).rejects.toThrow("Invalid email or password");
    });
  });

  describe("Password Reset", () => {
    let resetToken: string;

    it("should request password reset", async () => {
      const result = await requestPasswordReset({ email: testEmail });
      expect(result.message).toContain("password reset link");

      const user = await db.queryRow<{ reset_token: string }>`
        SELECT reset_token FROM user_accounts WHERE email = ${testEmail}
      `;
      if (user?.reset_token) {
        resetToken = user.reset_token;
      }
    });

    it("should reset password with valid token", async () => {
      const newPassword = "NewPassword123!";
      const result = await resetPassword({
        token: resetToken,
        newPassword,
      });

      expect(result.message).toContain("Password reset successfully");

      const loginResult = await login({
        email: testEmail,
        password: newPassword,
      });
      expect(loginResult.token).toBeDefined();
    });

    it("should reject password reset with invalid token", async () => {
      await expect(
        resetPassword({
          token: "invalid-token",
          newPassword: "NewPassword123!",
        })
      ).rejects.toThrow("Invalid reset token");
    });

    it("should reject short password in reset", async () => {
      const result = await requestPasswordReset({ email: testEmail });
      const user = await db.queryRow<{ reset_token: string }>`
        SELECT reset_token FROM user_accounts WHERE email = ${testEmail}
      `;

      if (user?.reset_token) {
        await expect(
          resetPassword({
            token: user.reset_token,
            newPassword: "short",
          })
        ).rejects.toThrow("Password must be at least 8 characters long");
      }
    });
  });
});
