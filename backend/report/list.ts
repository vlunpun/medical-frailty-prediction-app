import { api } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import db from "../db";
import type { Report } from "./generate";

export interface ListReportsRequest {}

export interface ListReportsResponse {
  reports: Report[];
}

// Retrieves all reports for a user.
export const list = api<ListReportsRequest, ListReportsResponse>(
  { expose: true, method: "GET", path: "/reports", auth: true },
  async (req) => {
    const auth = getAuthData()!;
    const userId = auth.userID;
    const reports = await db.queryAll<Report>`
      SELECT 
        id,
        user_id as "userId",
        assessment_id as "assessmentId",
        report_type as "reportType",
        title,
        summary,
        recommendations,
        next_steps as "nextSteps",
        generated_at as "generatedAt"
      FROM reports
      WHERE user_id = ${userId}
      ORDER BY generated_at DESC
    `;

    return { reports };
  }
);
