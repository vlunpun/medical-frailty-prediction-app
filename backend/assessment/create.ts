import { api } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import db from "../db";
import { health_record } from "~encore/clients";
import { predictFrailty } from "./ai_prediction";

export interface CreateAssessmentRequest {
  chronicConditions: string[];
  medicationsCount: number;
  recentHospitalizations: number;
  mobilityLevel: "independent" | "limited" | "dependent";
  cognitiveStatus: "normal" | "mild_impairment" | "moderate_impairment" | "severe_impairment";
  activitiesDailyLivingScore: number;
  includeHealthRecords?: boolean;
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
  confidenceScore?: number;
  contributingFactors?: Array<{
    factor: string;
    impact: number;
    description: string;
  }>;
  insights?: string[];
  warningFlags?: string[];
}

export const create = api<CreateAssessmentRequest, Assessment>(
  { expose: true, method: "POST", path: "/assessments", auth: true },
  async (req) => {
    const auth = getAuthData()!;
    const userId = auth.userID;
    
    let healthRecords: any[] = [];
    if (req.includeHealthRecords) {
      const records = await health_record.list({});
      healthRecords = records.records;
    }
    
    const prediction = predictFrailty({
      chronicConditions: req.chronicConditions,
      medicationsCount: req.medicationsCount,
      recentHospitalizations: req.recentHospitalizations,
      mobilityLevel: req.mobilityLevel,
      cognitiveStatus: req.cognitiveStatus,
      activitiesDailyLivingScore: req.activitiesDailyLivingScore,
      healthRecords,
    });

    const result = await db.queryRow<{
      id: number;
      user_id: string;
      assessment_date: Date;
      chronic_conditions: string[];
      medications_count: number;
      recent_hospitalizations: number;
      mobility_level: string;
      cognitive_status: string;
      activities_daily_living_score: number;
      frailty_score: number;
      risk_level: string;
      confidence_score: number | null;
      contributing_factors: any;
      insights: string[] | null;
      warning_flags: string[] | null;
    }>`
      INSERT INTO assessments (
        user_id,
        chronic_conditions,
        medications_count,
        recent_hospitalizations,
        mobility_level,
        cognitive_status,
        activities_daily_living_score,
        frailty_score,
        risk_level,
        confidence_score,
        contributing_factors,
        insights,
        warning_flags
      ) VALUES (
        ${userId},
        ${req.chronicConditions},
        ${req.medicationsCount},
        ${req.recentHospitalizations},
        ${req.mobilityLevel},
        ${req.cognitiveStatus},
        ${req.activitiesDailyLivingScore},
        ${prediction.frailtyScore},
        ${prediction.riskLevel},
        ${prediction.confidenceScore},
        ${JSON.stringify(prediction.contributingFactors)},
        ${prediction.insights},
        ${prediction.warningFlags}
      )
      RETURNING 
        id,
        user_id,
        assessment_date,
        chronic_conditions,
        medications_count,
        recent_hospitalizations,
        mobility_level,
        cognitive_status,
        activities_daily_living_score,
        frailty_score,
        risk_level,
        confidence_score,
        contributing_factors,
        insights,
        warning_flags
    `;

    if (!result) {
      throw new Error("Failed to create assessment");
    }

    return {
      id: result.id,
      userId: result.user_id,
      assessmentDate: result.assessment_date,
      chronicConditions: result.chronic_conditions,
      medicationsCount: result.medications_count,
      recentHospitalizations: result.recent_hospitalizations,
      mobilityLevel: result.mobility_level,
      cognitiveStatus: result.cognitive_status,
      activitiesDailyLivingScore: result.activities_daily_living_score,
      frailtyScore: result.frailty_score,
      riskLevel: result.risk_level,
      confidenceScore: result.confidence_score || undefined,
      contributingFactors: result.contributing_factors || undefined,
      insights: result.insights || undefined,
      warningFlags: result.warning_flags || undefined,
    };
  }
);
