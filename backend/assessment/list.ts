import { api, APIError } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import db from "../db";
import type { Assessment } from "./create";

export interface ListAssessmentsRequest {}

export interface ListAssessmentsResponse {
  assessments: Assessment[];
}

// Retrieves all assessments for a user, ordered by date (latest first).
export const list = api<ListAssessmentsRequest, ListAssessmentsResponse>(
  { expose: true, method: "GET", path: "/assessments", auth: true },
  async (req) => {
    const auth = getAuthData()!;
    const userId = auth.userID;
    const assessments = await db.queryAll<Assessment>`
      SELECT 
        id,
        user_id as "userId",
        assessment_date as "assessmentDate",
        chronic_conditions as "chronicConditions",
        medications_count as "medicationsCount",
        recent_hospitalizations as "recentHospitalizations",
        mobility_level as "mobilityLevel",
        cognitive_status as "cognitiveStatus",
        activities_daily_living_score as "activitiesDailyLivingScore",
        frailty_score as "frailtyScore",
        risk_level as "riskLevel"
      FROM assessments
      WHERE user_id = ${userId}
      ORDER BY assessment_date DESC
    `;

    return { assessments };
  }
);
