import { api } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import db from "../db";
import { assessment } from "~encore/clients";
import type { GuidanceResource } from "./list";

export interface PersonalizedGuidanceRequest {}

export interface PersonalizedGuidanceResponse {
  resources: GuidanceResource[];
}

// Retrieves personalized guidance based on the user's latest assessment.
export const personalized = api<PersonalizedGuidanceRequest, PersonalizedGuidanceResponse>(
  { expose: true, method: "GET", path: "/guidance/personalized", auth: true },
  async (req) => {
    const auth = getAuthData()!;
    const userId = auth.userID;
    const assessments = await assessment.list({});

    if (assessments.assessments.length === 0) {
      const allResources = await db.queryAll<GuidanceResource>`
        SELECT 
          id,
          category,
          title,
          description,
          resource_url as "resourceUrl",
          applicability_criteria as "applicabilityCriteria",
          priority
        FROM guidance_resources
        WHERE applicability_criteria = '{}'
        ORDER BY priority DESC, title
      `;
      return { resources: allResources };
    }

    const latestAssessment = assessments.assessments[0];

    const allResources = await db.queryAll<GuidanceResource>`
      SELECT 
        id,
        category,
        title,
        description,
        resource_url as "resourceUrl",
        applicability_criteria as "applicabilityCriteria",
        priority
      FROM guidance_resources
      ORDER BY priority DESC, title
    `;

    const filtered = allResources.filter((resource) => {
      if (resource.applicabilityCriteria.length === 0) {
        return true;
      }

      return resource.applicabilityCriteria.some((criteria) => {
        if (criteria.includes("frailty_score")) {
          const match = criteria.match(/frailty_score\s*([><=]+)\s*([\d.]+)/);
          if (match) {
            const operator = match[1];
            const threshold = parseFloat(match[2]);
            const score = latestAssessment.frailtyScore;

            if (operator === ">") return score > threshold;
            if (operator === ">=") return score >= threshold;
            if (operator === "<") return score < threshold;
            if (operator === "<=") return score <= threshold;
            if (operator === "=") return score === threshold;
          }
        }

        if (criteria.includes("risk_level")) {
          const match = criteria.match(/risk_level\s*=\s*(\w+)/);
          if (match) {
            return latestAssessment.riskLevel === match[1];
          }
        }

        if (criteria.includes("mobility_level")) {
          const match = criteria.match(/mobility_level\s*=\s*(\w+)/);
          if (match) {
            return latestAssessment.mobilityLevel === match[1];
          }
        }

        if (criteria.includes("chronic_conditions")) {
          return latestAssessment.chronicConditions.length > 0;
        }

        return false;
      });
    });

    return { resources: filtered };
  }
);
