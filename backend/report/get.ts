import { api, APIError } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import db from "../db";
import type { Report } from "./generate";

export interface GetReportRequest {
  id: number;
}

// Retrieves a single report by ID.
export const get = api<GetReportRequest, Report>(
  { expose: true, method: "GET", path: "/reports/detail/:id", auth: true },
  async (req) => {
    const auth = getAuthData()!;
    const userId = auth.userID;
    const report = await db.queryRow<Report>`
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
      WHERE id = ${req.id}
    `;

    if (!report) {
      throw APIError.notFound("report not found");
    }

    if (report.userId !== userId) {
      throw APIError.permissionDenied("not authorized to view this report");
    }

    return report;
  }
);
