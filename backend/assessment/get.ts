import { api, APIError } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import db from "../db";
import type { Assessment } from "./create";

export interface GetAssessmentRequest {
  id: number;
}

// Retrieves a single assessment by ID.
export const get = api<GetAssessmentRequest, Assessment>(
  { expose: true, method: "GET", path: "/assessments/detail/:id", auth: true },
  async (req) => {
    const auth = getAuthData()!;
    const userId = auth.userID;
    const assessment = await db.queryRow<Assessment>`
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
      WHERE id = ${req.id}
    `;

    if (!assessment) {
      throw APIError.notFound("assessment not found");
    }

    if (assessment.userId !== userId) {
      throw APIError.permissionDenied("not authorized to view this assessment");
    }

    return assessment;
  }
);
