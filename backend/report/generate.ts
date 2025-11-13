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
  medicaidEligibility?: {
    likelyQualifies: boolean;
    criteriaMetCount: number;
    totalCriteria: number;
    details: string[];
  };
  healthMetrics?: {
    metric: string;
    value: string;
    interpretation: string;
  }[];
  generatedAt: Date;
}

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

    const { summary, recommendations, nextSteps, medicaidEligibility, healthMetrics } = 
      generateReportContent(assessmentData);

    const report = await db.queryRow<{
      id: number;
      user_id: string;
      assessment_id: number;
      report_type: string;
      title: string;
      summary: string;
      recommendations: string[];
      next_steps: string[];
      medicaid_eligibility: any;
      health_metrics: any;
      generated_at: Date;
    }>`
      INSERT INTO reports (
        user_id,
        assessment_id,
        report_type,
        title,
        summary,
        recommendations,
        next_steps,
        medicaid_eligibility,
        health_metrics
      ) VALUES (
        ${userId},
        ${req.assessmentId},
        'frailty_assessment',
        'Medical Frailty Assessment Report',
        ${summary},
        ${recommendations},
        ${nextSteps},
        ${JSON.stringify(medicaidEligibility)},
        ${JSON.stringify(healthMetrics)}
      )
      RETURNING 
        id,
        user_id,
        assessment_id,
        report_type,
        title,
        summary,
        recommendations,
        next_steps,
        medicaid_eligibility,
        health_metrics,
        generated_at
    `;

    if (!report) {
      throw new Error("Failed to generate report");
    }

    return {
      id: report.id,
      userId: report.user_id,
      assessmentId: report.assessment_id,
      reportType: report.report_type,
      title: report.title,
      summary: report.summary,
      recommendations: report.recommendations,
      nextSteps: report.next_steps,
      medicaidEligibility: report.medicaid_eligibility || undefined,
      healthMetrics: report.health_metrics || undefined,
      generatedAt: report.generated_at,
    };
  }
);

function generateReportContent(assessment: any) {
  const summary = generateSummary(assessment);
  const recommendations = generateRecommendations(assessment);
  const nextSteps = generateNextSteps(assessment);
  const medicaidEligibility = evaluateMedicaidEligibility(assessment);
  const healthMetrics = generateHealthMetrics(assessment);

  return { summary, recommendations, nextSteps, medicaidEligibility, healthMetrics };
}

function generateSummary(assessment: any): string {
  const riskDescriptions = {
    high: "Your assessment indicates a high level of medical frailty. This means you likely meet the criteria for medical frailty exemptions under Indiana Medicaid.",
    moderate: "Your assessment shows moderate indicators of medical frailty. You may qualify for additional support services and should discuss options with your healthcare provider.",
    low: "Your assessment indicates low medical frailty at this time. Continue to monitor your health and maintain regular check-ups.",
  };

  const confidenceText = assessment.confidenceScore 
    ? ` (confidence: ${(assessment.confidenceScore * 100).toFixed(0)}%)`
    : "";

  let summary = `Based on your comprehensive health assessment, your frailty score is ${(assessment.frailtyScore * 100).toFixed(1)}%${confidenceText}. ${riskDescriptions[assessment.riskLevel as keyof typeof riskDescriptions]}`;

  if (assessment.insights && assessment.insights.length > 0) {
    summary += "\n\nKey Insights:\n" + assessment.insights.map((i: string) => `• ${i}`).join("\n");
  }

  if (assessment.warningFlags && assessment.warningFlags.length > 0) {
    summary += "\n\n⚠️ Important Alerts:\n" + assessment.warningFlags.map((w: string) => `• ${w}`).join("\n");
  }

  return summary;
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
    recs.push("Consider transitional care services to reduce readmission risk");
  }

  if (assessment.mobilityLevel !== "independent") {
    recs.push("Explore mobility assistance programs and adaptive equipment options");
    recs.push("Consult with a physical therapist for mobility improvement strategies");
  }

  if (assessment.cognitiveStatus !== "normal") {
    recs.push("Consider a cognitive assessment to determine if additional support services are needed");
    recs.push("Investigate memory care programs and cognitive support resources");
  }

  if (assessment.activitiesDailyLivingScore < 7) {
    recs.push("Explore in-home assistance services for activities of daily living");
    recs.push("Consider occupational therapy to improve independence in daily tasks");
  }

  if (assessment.contributingFactors && assessment.contributingFactors.length > 0) {
    const topFactor = assessment.contributingFactors[0];
    if (topFactor.factor === "Polypharmacy") {
      recs.push("High medication burden detected - prioritize medication therapy management");
    }
  }

  return recs;
}

function generateNextSteps(assessment: any): string[] {
  const steps: string[] = [
    "Review this report with your healthcare provider",
    "Gather all relevant medical documentation",
  ];

  if (assessment.riskLevel === "high" || assessment.riskLevel === "moderate") {
    steps.push("Contact Indiana Medicaid at 1-800-889-9949 to discuss medical frailty exemptions");
    steps.push("Request medical frailty documentation from your healthcare providers");
    steps.push("Keep copies of all medical records and assessment reports for your application");
    steps.push("Consider consulting with a Medicaid eligibility specialist or social worker");
  }

  if (assessment.riskLevel === "high") {
    steps.push("Begin gathering documentation immediately - processing can take 30-90 days");
    steps.push("Request a comprehensive medical evaluation letter from your primary care physician");
  }

  steps.push("Schedule a follow-up assessment in 3-6 months to track any changes");
  steps.push("Maintain detailed health records and track all medical appointments");

  return steps;
}

function evaluateMedicaidEligibility(assessment: any) {
  const criteria = [];
  let metCount = 0;

  if (assessment.chronicConditions.length >= 2) {
    criteria.push("✓ Multiple chronic conditions documented");
    metCount++;
  } else {
    criteria.push("✗ Less than 2 chronic conditions");
  }

  if (assessment.medicationsCount >= 5) {
    criteria.push("✓ Polypharmacy (5+ medications)");
    metCount++;
  } else {
    criteria.push("✗ Less than 5 medications");
  }

  if (assessment.recentHospitalizations >= 2) {
    criteria.push("✓ Multiple recent hospitalizations");
    metCount++;
  } else {
    criteria.push("✗ Less than 2 recent hospitalizations");
  }

  if (assessment.mobilityLevel === "dependent" || assessment.mobilityLevel === "limited") {
    criteria.push("✓ Mobility limitations present");
    metCount++;
  } else {
    criteria.push("✗ Independent mobility");
  }

  if (assessment.cognitiveStatus !== "normal") {
    criteria.push("✓ Cognitive impairment documented");
    metCount++;
  } else {
    criteria.push("✗ Normal cognitive status");
  }

  if (assessment.activitiesDailyLivingScore <= 6) {
    criteria.push("✓ Significant ADL limitations");
    metCount++;
  } else {
    criteria.push("✗ Minimal ADL limitations");
  }

  const totalCriteria = 6;
  const likelyQualifies = metCount >= 3 && assessment.riskLevel === "high";

  return {
    likelyQualifies,
    criteriaMetCount: metCount,
    totalCriteria,
    details: criteria,
  };
}

function generateHealthMetrics(assessment: any) {
  const metrics = [];

  metrics.push({
    metric: "Frailty Score",
    value: `${(assessment.frailtyScore * 100).toFixed(1)}%`,
    interpretation: `${assessment.riskLevel.toUpperCase()} risk - ${
      assessment.riskLevel === "high" 
        ? "Immediate attention recommended" 
        : assessment.riskLevel === "moderate" 
        ? "Monitoring and intervention suggested" 
        : "Continue preventive care"
    }`,
  });

  if (assessment.confidenceScore) {
    metrics.push({
      metric: "Prediction Confidence",
      value: `${(assessment.confidenceScore * 100).toFixed(0)}%`,
      interpretation: assessment.confidenceScore >= 0.8 
        ? "High confidence in prediction" 
        : "Moderate confidence - additional health data may improve accuracy",
    });
  }

  metrics.push({
    metric: "Chronic Conditions",
    value: `${assessment.chronicConditions.length}`,
    interpretation: assessment.chronicConditions.length >= 3 
      ? "Multiple conditions require coordinated care" 
      : assessment.chronicConditions.length >= 1 
      ? "Active disease management needed" 
      : "Good chronic disease status",
  });

  metrics.push({
    metric: "Medication Count",
    value: `${assessment.medicationsCount}`,
    interpretation: assessment.medicationsCount >= 10 
      ? "Very high - urgent medication review needed" 
      : assessment.medicationsCount >= 5 
      ? "Polypharmacy - medication review recommended" 
      : "Appropriate medication burden",
  });

  metrics.push({
    metric: "Recent Hospitalizations",
    value: `${assessment.recentHospitalizations}`,
    interpretation: assessment.recentHospitalizations >= 3 
      ? "Critical - care coordination urgently needed" 
      : assessment.recentHospitalizations >= 2 
      ? "High - preventive interventions recommended" 
      : assessment.recentHospitalizations >= 1 
      ? "Moderate risk of readmission" 
      : "Low hospitalization risk",
  });

  metrics.push({
    metric: "Mobility Status",
    value: assessment.mobilityLevel.charAt(0).toUpperCase() + assessment.mobilityLevel.slice(1),
    interpretation: assessment.mobilityLevel === "dependent" 
      ? "Full assistance required - explore support services" 
      : assessment.mobilityLevel === "limited" 
      ? "Partial assistance needed - consider mobility aids" 
      : "Good mobility - maintain with regular activity",
  });

  metrics.push({
    metric: "Cognitive Status",
    value: assessment.cognitiveStatus.replace("_", " ").split(" ").map((w: string) => 
      w.charAt(0).toUpperCase() + w.slice(1)
    ).join(" "),
    interpretation: assessment.cognitiveStatus === "severe_impairment" 
      ? "Severe impairment - comprehensive support needed" 
      : assessment.cognitiveStatus === "moderate_impairment" 
      ? "Moderate impairment - support services recommended" 
      : assessment.cognitiveStatus === "mild_impairment" 
      ? "Mild impairment - monitoring suggested" 
      : "Good cognitive function",
  });

  metrics.push({
    metric: "ADL Score",
    value: `${assessment.activitiesDailyLivingScore}/10`,
    interpretation: assessment.activitiesDailyLivingScore >= 8 
      ? "Good independence in daily activities" 
      : assessment.activitiesDailyLivingScore >= 5 
      ? "Some assistance needed - explore support options" 
      : "Significant limitations - in-home care recommended",
  });

  return metrics;
}
