import { api } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import db from "../db";

export interface CreateAssessmentRequest {
  chronicConditions: string[];
  medicationsCount: number;
  recentHospitalizations: number;
  mobilityLevel: "independent" | "limited" | "dependent";
  cognitiveStatus: "normal" | "mild_impairment" | "moderate_impairment" | "severe_impairment";
  activitiesDailyLivingScore: number;
}

export interface Assessment {
  id: number;
  userId: string;
  assessmentDate: Date;
  chronicConditions: string[];
  medicationsCount: number;
  recentHospitalizations: number;
  mobilityLevel: string;
  cognitiveStatus: string;
  activitiesDailyLivingScore: number;
  frailtyScore: number;
  riskLevel: string;
}

// Creates a new health assessment and calculates frailty score.
export const create = api<CreateAssessmentRequest, Assessment>(
  { expose: true, method: "POST", path: "/assessments", auth: true },
  async (req) => {
    const auth = getAuthData()!;
    const userId = auth.userID;
    const frailtyScore = calculateFrailtyScore(req);
    const riskLevel = determineRiskLevel(frailtyScore);

    const result = await db.queryRow<Assessment>`
      INSERT INTO assessments (
        user_id,
        chronic_conditions,
        medications_count,
        recent_hospitalizations,
        mobility_level,
        cognitive_status,
        activities_daily_living_score,
        frailty_score,
        risk_level
      ) VALUES (
        ${userId},
        ${req.chronicConditions},
        ${req.medicationsCount},
        ${req.recentHospitalizations},
        ${req.mobilityLevel},
        ${req.cognitiveStatus},
        ${req.activitiesDailyLivingScore},
        ${frailtyScore},
        ${riskLevel}
      )
      RETURNING 
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
    `;

    if (!result) {
      throw new Error("Failed to create assessment");
    }

    return result;
  }
);

function calculateFrailtyScore(req: CreateAssessmentRequest): number {
  let score = 0;

  score += req.chronicConditions.length * 0.1;
  score += req.medicationsCount * 0.05;
  score += req.recentHospitalizations * 0.15;

  const mobilityScores = {
    independent: 0,
    limited: 0.2,
    dependent: 0.4,
  };
  score += mobilityScores[req.mobilityLevel];

  const cognitiveScores = {
    normal: 0,
    mild_impairment: 0.1,
    moderate_impairment: 0.2,
    severe_impairment: 0.3,
  };
  score += cognitiveScores[req.cognitiveStatus];

  const adlFactor = (10 - req.activitiesDailyLivingScore) * 0.05;
  score += adlFactor;

  return Math.min(score, 1.0);
}

function determineRiskLevel(frailtyScore: number): string {
  if (frailtyScore >= 0.7) return "high";
  if (frailtyScore >= 0.4) return "moderate";
  return "low";
}
