import { api } from "encore.dev/api";
import db from "../db";

export interface GuidanceResource {
  id: number;
  category: string;
  title: string;
  description: string | null;
  resourceUrl: string | null;
  applicabilityCriteria: string[];
  priority: number;
}

export interface ListGuidanceRequest {
  category?: string;
}

export interface ListGuidanceResponse {
  resources: GuidanceResource[];
}

// Retrieves guidance resources, optionally filtered by category.
export const list = api<ListGuidanceRequest, ListGuidanceResponse>(
  { expose: true, method: "GET", path: "/guidance" },
  async (req) => {
    let query;
    if (req.category) {
      query = db.queryAll<GuidanceResource>`
        SELECT 
          id,
          category,
          title,
          description,
          resource_url as "resourceUrl",
          applicability_criteria as "applicabilityCriteria",
          priority
        FROM guidance_resources
        WHERE category = ${req.category}
        ORDER BY priority DESC, title
      `;
    } else {
      query = db.queryAll<GuidanceResource>`
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
    }

    const resources = await query;
    return { resources };
  }
);
