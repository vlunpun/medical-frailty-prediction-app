import { api, APIError } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import db from "../db";
import { assessment } from "~encore/clients";

export interface GenerateReportRequest {
  assessmentId: number;
}

export interface Report {
  id: number;
  userId: string;
  assessmentId: number;
  reportType: string;
  title: string;
  summary: string;
  recommendations: string[];
  nextSteps: string[];
  generatedAt: Date;
}

// Generates a personalized frailty assessment report.
export const generate = api<GenerateReportRequest, Report>(
  { expose: true, method: "POST", path: "/reports/generate", auth: true },
  async (req) => {
    const auth = getAuthData()!;
    const userId = auth.userID;
    const assessmentData = await assessment.get({ id: req.assessmentId });

    if (assessmentData.userId !== userId) {
      throw APIError.permissionDenied("assessment does not belong to user");
    }

    const existingReport = await db.queryRow<{ id: number }>`
      SELECT id FROM reports WHERE assessment_id = ${req.assessmentId}
    `;

    if (existingReport) {
      throw APIError.alreadyExists("report already exists for this assessment");
    }

    const { summary, recommendations, nextSteps } = generateReportContent(assessmentData);

    const report = await db.queryRow<Report>`
      INSERT INTO reports (
        user_id,
        assessment_id,
        report_type,
        title,
        summary,
        recommendations,
        next_steps
      ) VALUES (
        ${userId},
        ${req.assessmentId},
        'frailty_assessment',
        'Medical Frailty Assessment Report',
        ${summary},
        ${recommendations},
        ${nextSteps}
      )
      RETURNING 
        id,
        user_id as "userId",
        assessment_id as "assessmentId",
        report_type as "reportType",
        title,
        summary,
        recommendations,
        next_steps as "nextSteps",
        generated_at as "generatedAt"
    `;

    if (!report) {
      throw new Error("Failed to generate report");
    }

    return report;
  }
);

function generateReportContent(assessment: any) {
  const summary = generateSummary(assessment);
  const recommendations = generateRecommendations(assessment);
  const nextSteps = generateNextSteps(assessment);

  return { summary, recommendations, nextSteps };
}

function generateSummary(assessment: any): string {
  const riskDescriptions = {
    high: "Your assessment indicates a high level of medical frailty. This means you likely meet the criteria for medical frailty exemptions under Indiana Medicaid.",
    moderate: "Your assessment shows moderate indicators of medical frailty. You may qualify for additional support services and should discuss options with your healthcare provider.",
    low: "Your assessment indicates low medical frailty at this time. Continue to monitor your health and maintain regular check-ups.",
  };

  return `Based on your health assessment, your frailty score is ${(assessment.frailtyScore * 100).toFixed(1)}%. ${riskDescriptions[assessment.riskLevel as keyof typeof riskDescriptions]} This assessment considers your chronic conditions, medications, recent hospitalizations, mobility, cognitive status, and daily living activities.`;
}

function generateRecommendations(assessment: any): string[] {
  const recs: string[] = [];

  if (assessment.riskLevel === "high") {
    recs.push("Schedule an appointment with your primary care physician to discuss medical frailty exemption documentation");
    recs.push("Request a comprehensive medical evaluation to support your Medicaid application");
    recs.push("Consider applying for home health services if you have mobility limitations");
  }

  if (assessment.chronicConditions.length >= 3) {
    recs.push("Ensure all chronic conditions are properly documented in your medical records");
    recs.push("Work with your healthcare team to develop a comprehensive care management plan");
  }

  if (assessment.medicationsCount >= 5) {
    recs.push("Request a medication review with your pharmacist to optimize your treatment plan");
  }

  if (assessment.recentHospitalizations >= 2) {
    recs.push("Discuss strategies with your doctor to prevent future hospitalizations");
  }

  if (assessment.mobilityLevel !== "independent") {
    recs.push("Explore mobility assistance programs and adaptive equipment options");
  }

  if (assessment.cognitiveStatus !== "normal") {
    recs.push("Consider a cognitive assessment to determine if additional support services are needed");
  }

  return recs;
}

function generateNextSteps(assessment: any): string[] {
  const steps: string[] = [
    "Review this report with your healthcare provider",
    "Gather all relevant medical documentation",
  ];

  if (assessment.riskLevel === "high" || assessment.riskLevel === "moderate") {
    steps.push("Contact Indiana Medicaid to discuss your eligibility for medical frailty exemptions");
    steps.push("Keep copies of all medical records and assessment reports for your application");
  }

  steps.push("Schedule a follow-up assessment in 6 months to track any changes");

  return steps;
}
