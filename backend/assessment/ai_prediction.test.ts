import { describe, it, expect } from "vitest";
import { predictFrailty } from "./ai_prediction";

describe("AI Frailty Prediction", () => {
  it("should predict high risk for severely frail patient", () => {
    const result = predictFrailty({
      chronicConditions: ["diabetes", "heart disease", "copd", "chronic kidney disease"],
      medicationsCount: 12,
      recentHospitalizations: 3,
      mobilityLevel: "dependent",
      cognitiveStatus: "moderate_impairment",
      activitiesDailyLivingScore: 3,
    });

    expect(result.riskLevel).toBe("high");
    expect(result.frailtyScore).toBeGreaterThan(0.65);
    expect(result.contributingFactors.length).toBeGreaterThan(0);
    expect(result.insights.length).toBeGreaterThan(0);
  });

  it("should predict low risk for healthy patient", () => {
    const result = predictFrailty({
      chronicConditions: [],
      medicationsCount: 0,
      recentHospitalizations: 0,
      mobilityLevel: "independent",
      cognitiveStatus: "normal",
      activitiesDailyLivingScore: 10,
    });

    expect(result.riskLevel).toBe("low");
    expect(result.frailtyScore).toBeLessThan(0.35);
  });

  it("should predict moderate risk for moderately frail patient", () => {
    const result = predictFrailty({
      chronicConditions: ["diabetes", "arthritis"],
      medicationsCount: 5,
      recentHospitalizations: 1,
      mobilityLevel: "limited",
      cognitiveStatus: "mild_impairment",
      activitiesDailyLivingScore: 6,
    });

    expect(result.riskLevel).toBe("moderate");
    expect(result.frailtyScore).toBeGreaterThanOrEqual(0.35);
    expect(result.frailtyScore).toBeLessThan(0.65);
  });

  it("should identify polypharmacy as contributing factor", () => {
    const result = predictFrailty({
      chronicConditions: ["diabetes"],
      medicationsCount: 10,
      recentHospitalizations: 0,
      mobilityLevel: "independent",
      cognitiveStatus: "normal",
      activitiesDailyLivingScore: 8,
    });

    const polypharmacyFactor = result.contributingFactors.find(
      f => f.factor === "Polypharmacy"
    );
    expect(polypharmacyFactor).toBeDefined();
  });

  it("should generate warning flags for critical conditions", () => {
    const result = predictFrailty({
      chronicConditions: ["dementia", "heart failure", "copd"],
      medicationsCount: 12,
      recentHospitalizations: 4,
      mobilityLevel: "dependent",
      cognitiveStatus: "severe_impairment",
      activitiesDailyLivingScore: 2,
    });

    expect(result.warningFlags.length).toBeGreaterThan(0);
    expect(result.warningFlags.some(w => w.includes("CRITICAL"))).toBe(true);
  });

  it("should increase confidence with health records", () => {
    const resultWithoutRecords = predictFrailty({
      chronicConditions: ["diabetes"],
      medicationsCount: 3,
      recentHospitalizations: 0,
      mobilityLevel: "independent",
      cognitiveStatus: "normal",
      activitiesDailyLivingScore: 9,
    });

    const resultWithRecords = predictFrailty({
      chronicConditions: ["diabetes"],
      medicationsCount: 3,
      recentHospitalizations: 0,
      mobilityLevel: "independent",
      cognitiveStatus: "normal",
      activitiesDailyLivingScore: 9,
      healthRecords: [
        {
          id: "1",
          userId: "test",
          recordType: "vital_signs",
          recordDate: new Date(),
          title: "Recent Vitals",
          vitalSigns: {
            bloodPressureSystolic: 120,
            bloodPressureDiastolic: 80,
            heartRate: 72,
          },
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
    });

    expect(resultWithRecords.confidenceScore).toBeGreaterThan(resultWithoutRecords.confidenceScore);
  });

  it("should adjust score based on abnormal vital signs", () => {
    const baseResult = predictFrailty({
      chronicConditions: ["diabetes"],
      medicationsCount: 3,
      recentHospitalizations: 0,
      mobilityLevel: "independent",
      cognitiveStatus: "normal",
      activitiesDailyLivingScore: 9,
    });

    const resultWithAbnormalVitals = predictFrailty({
      chronicConditions: ["diabetes"],
      medicationsCount: 3,
      recentHospitalizations: 0,
      mobilityLevel: "independent",
      cognitiveStatus: "normal",
      activitiesDailyLivingScore: 9,
      healthRecords: [
        {
          id: "1",
          userId: "test",
          recordType: "vital_signs",
          recordDate: new Date(),
          title: "Abnormal Vitals",
          vitalSigns: {
            bloodPressureSystolic: 180,
            oxygenSaturation: 88,
          },
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
    });

    expect(resultWithAbnormalVitals.frailtyScore).toBeGreaterThan(baseResult.frailtyScore);
  });
});
