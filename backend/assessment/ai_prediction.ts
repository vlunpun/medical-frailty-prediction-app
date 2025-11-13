import type { HealthRecord } from "../health_record/create";

export interface FrailtyPredictionInput {
  chronicConditions: string[];
  medicationsCount: number;
  recentHospitalizations: number;
  mobilityLevel: "independent" | "limited" | "dependent";
  cognitiveStatus: "normal" | "mild_impairment" | "moderate_impairment" | "severe_impairment";
  activitiesDailyLivingScore: number;
  healthRecords?: HealthRecord[];
}

export interface FrailtyPrediction {
  frailtyScore: number;
  riskLevel: "low" | "moderate" | "high";
  confidenceScore: number;
  contributingFactors: ContributingFactor[];
  insights: string[];
  warningFlags: string[];
}

export interface ContributingFactor {
  factor: string;
  impact: number;
  description: string;
}

export function predictFrailty(input: FrailtyPredictionInput): FrailtyPrediction {
  const baseScore = calculateBaseScore(input);
  const healthRecordAdjustment = analyzeHealthRecords(input.healthRecords || []);
  const finalScore = Math.min(baseScore + healthRecordAdjustment, 1.0);
  const riskLevel = determineRiskLevel(finalScore);
  const confidenceScore = calculateConfidence(input);
  const contributingFactors = identifyContributingFactors(input);
  const insights = generateInsights(input, finalScore, riskLevel);
  const warningFlags = identifyWarningFlags(input);

  return {
    frailtyScore: finalScore,
    riskLevel,
    confidenceScore,
    contributingFactors,
    insights,
    warningFlags,
  };
}

function calculateBaseScore(input: FrailtyPredictionInput): number {
  let score = 0;

  const conditionWeights: Record<string, number> = {
    "diabetes": 0.08,
    "heart disease": 0.12,
    "copd": 0.10,
    "chronic kidney disease": 0.15,
    "dementia": 0.18,
    "stroke": 0.14,
    "cancer": 0.13,
    "arthritis": 0.06,
    "osteoporosis": 0.08,
    "depression": 0.07,
  };

  for (const condition of input.chronicConditions) {
    const conditionLower = condition.toLowerCase();
    let weight = 0.05;
    for (const [key, value] of Object.entries(conditionWeights)) {
      if (conditionLower.includes(key)) {
        weight = value;
        break;
      }
    }
    score += weight;
  }

  if (input.medicationsCount >= 10) {
    score += 0.20;
  } else if (input.medicationsCount >= 7) {
    score += 0.15;
  } else if (input.medicationsCount >= 5) {
    score += 0.10;
  } else {
    score += input.medicationsCount * 0.02;
  }

  if (input.recentHospitalizations >= 3) {
    score += 0.25;
  } else if (input.recentHospitalizations >= 2) {
    score += 0.18;
  } else {
    score += input.recentHospitalizations * 0.10;
  }

  const mobilityScores = {
    independent: 0,
    limited: 0.25,
    dependent: 0.45,
  };
  score += mobilityScores[input.mobilityLevel];

  const cognitiveScores = {
    normal: 0,
    mild_impairment: 0.12,
    moderate_impairment: 0.25,
    severe_impairment: 0.40,
  };
  score += cognitiveScores[input.cognitiveStatus];

  const adlFactor = Math.max(0, (10 - input.activitiesDailyLivingScore)) * 0.06;
  score += adlFactor;

  return score;
}

function analyzeHealthRecords(records: HealthRecord[]): number {
  let adjustment = 0;
  
  const vitalSignsRecords = records.filter(r => r.recordType === "vital_signs");
  const labRecords = records.filter(r => r.recordType === "lab_result");
  const diagnosisRecords = records.filter(r => r.recordType === "diagnosis");
  
  for (const record of vitalSignsRecords) {
    if (record.vitalSigns) {
      const vs = record.vitalSigns;
      
      if (vs.bloodPressureSystolic && vs.bloodPressureSystolic > 160) {
        adjustment += 0.03;
      }
      if (vs.bloodPressureSystolic && vs.bloodPressureSystolic < 90) {
        adjustment += 0.04;
      }
      
      if (vs.heartRate && (vs.heartRate > 100 || vs.heartRate < 50)) {
        adjustment += 0.02;
      }
      
      if (vs.oxygenSaturation && vs.oxygenSaturation < 92) {
        adjustment += 0.05;
      }
      
      if (vs.bmi && (vs.bmi < 18.5 || vs.bmi > 35)) {
        adjustment += 0.03;
      }
    }
  }
  
  for (const record of labRecords) {
    if (record.labResults) {
      for (const lab of record.labResults) {
        if (lab.abnormalFlag) {
          adjustment += 0.01;
        }
      }
    }
  }
  
  for (const record of diagnosisRecords) {
    if (record.diagnosisDetails) {
      const dd = record.diagnosisDetails;
      if (dd.severity === "severe" || dd.status === "chronic") {
        adjustment += 0.02;
      }
    }
  }
  
  return Math.min(adjustment, 0.3);
}

function determineRiskLevel(score: number): "low" | "moderate" | "high" {
  if (score >= 0.65) return "high";
  if (score >= 0.35) return "moderate";
  return "low";
}

function calculateConfidence(input: FrailtyPredictionInput): number {
  let confidence = 0.5;
  
  if (input.chronicConditions.length > 0) confidence += 0.1;
  if (input.medicationsCount > 0) confidence += 0.1;
  if (input.healthRecords && input.healthRecords.length > 0) {
    confidence += Math.min(input.healthRecords.length * 0.05, 0.3);
  }
  
  return Math.min(confidence, 1.0);
}

function identifyContributingFactors(input: FrailtyPredictionInput): ContributingFactor[] {
  const factors: ContributingFactor[] = [];
  
  if (input.chronicConditions.length >= 3) {
    factors.push({
      factor: "Multiple Chronic Conditions",
      impact: input.chronicConditions.length * 0.08,
      description: `You have ${input.chronicConditions.length} documented chronic conditions, which significantly impacts frailty risk.`,
    });
  }
  
  if (input.medicationsCount >= 5) {
    factors.push({
      factor: "Polypharmacy",
      impact: input.medicationsCount * 0.05,
      description: `Taking ${input.medicationsCount} medications increases risk of adverse effects and frailty.`,
    });
  }
  
  if (input.recentHospitalizations >= 2) {
    factors.push({
      factor: "Recent Hospitalizations",
      impact: input.recentHospitalizations * 0.15,
      description: `${input.recentHospitalizations} recent hospitalizations indicate acute health events that contribute to frailty.`,
    });
  }
  
  if (input.mobilityLevel !== "independent") {
    const impact = input.mobilityLevel === "dependent" ? 0.45 : 0.25;
    factors.push({
      factor: "Mobility Limitations",
      impact,
      description: `${input.mobilityLevel === "dependent" ? "Dependent" : "Limited"} mobility is a strong indicator of frailty.`,
    });
  }
  
  if (input.cognitiveStatus !== "normal") {
    const cognitiveImpact = {
      mild_impairment: 0.12,
      moderate_impairment: 0.25,
      severe_impairment: 0.40,
    };
    factors.push({
      factor: "Cognitive Impairment",
      impact: cognitiveImpact[input.cognitiveStatus],
      description: `Cognitive status shows ${input.cognitiveStatus.replace("_", " ")}, affecting daily functioning.`,
    });
  }
  
  if (input.activitiesDailyLivingScore < 7) {
    factors.push({
      factor: "Activities of Daily Living",
      impact: (10 - input.activitiesDailyLivingScore) * 0.06,
      description: `ADL score of ${input.activitiesDailyLivingScore}/10 indicates difficulty with daily activities.`,
    });
  }
  
  return factors.sort((a, b) => b.impact - a.impact);
}

function generateInsights(
  input: FrailtyPredictionInput,
  score: number,
  riskLevel: "low" | "moderate" | "high"
): string[] {
  const insights: string[] = [];
  
  if (riskLevel === "high") {
    insights.push(
      "Your frailty assessment indicates you likely meet Indiana Medicaid's medical frailty criteria."
    );
    insights.push(
      "Medical frailty exemption can provide access to comprehensive health services and support."
    );
  } else if (riskLevel === "moderate") {
    insights.push(
      "You show moderate frailty indicators that may qualify you for enhanced Medicaid services."
    );
    insights.push(
      "Consider discussing preventive interventions with your healthcare provider to avoid progression."
    );
  } else {
    insights.push(
      "Your current frailty assessment shows low risk, but continued monitoring is recommended."
    );
  }
  
  if (input.chronicConditions.length >= 3) {
    insights.push(
      "Managing multiple chronic conditions requires coordinated care - consider a care management program."
    );
  }
  
  if (input.medicationsCount >= 7) {
    insights.push(
      "High medication count increases risk of interactions - medication therapy management may be beneficial."
    );
  }
  
  if (input.recentHospitalizations >= 2) {
    insights.push(
      "Frequent hospitalizations suggest need for better care coordination and preventive services."
    );
  }
  
  return insights;
}

function identifyWarningFlags(input: FrailtyPredictionInput): string[] {
  const warnings: string[] = [];
  
  if (input.recentHospitalizations >= 3) {
    warnings.push("CRITICAL: Three or more recent hospitalizations - immediate care coordination needed");
  }
  
  if (input.mobilityLevel === "dependent" && input.cognitiveStatus !== "normal") {
    warnings.push("HIGH RISK: Combined mobility and cognitive impairment requires comprehensive support");
  }
  
  if (input.medicationsCount >= 10) {
    warnings.push("ALERT: Very high medication count - urgent medication review recommended");
  }
  
  if (input.activitiesDailyLivingScore <= 3) {
    warnings.push("CRITICAL: Severe limitations in daily activities - immediate assistance needed");
  }
  
  const seriousConditions = ["dementia", "chronic kidney disease", "heart failure", "copd"];
  const hasSerious = input.chronicConditions.some(c =>
    seriousConditions.some(sc => c.toLowerCase().includes(sc))
  );
  if (hasSerious && input.chronicConditions.length >= 3) {
    warnings.push("HIGH RISK: Multiple serious chronic conditions require specialized care management");
  }
  
  return warnings;
}
