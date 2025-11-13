import { api, APIError } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import db from "../db";

export interface DeleteHealthRecordRequest {
  id: string;
}

export interface DeleteHealthRecordResponse {
  success: boolean;
  message: string;
}

export const remove = api(
  { method: "DELETE", path: "/health-records/:id", auth: true, expose: true },
  async ({ id }: DeleteHealthRecordRequest): Promise<DeleteHealthRecordResponse> => {
    const auth = getAuthData()!;
    
    if (!id || id.trim().length === 0) {
      throw APIError.invalidArgument("Record ID is required");
    }
    
    const recordId = parseInt(id, 10);
    if (isNaN(recordId)) {
      throw APIError.invalidArgument("Invalid record ID format");
    }
    
    const existing = await db.queryRow`
      SELECT id, title FROM health_records
      WHERE id = ${recordId} AND user_id = ${auth.userID}
    `;
    
    if (!existing) {
      throw APIError.notFound("Health record not found");
    }
    
    await db.exec`
      DELETE FROM health_records
      WHERE id = ${recordId} AND user_id = ${auth.userID}
    `;
    
    return {
      success: true,
      message: "Health record deleted successfully",
    };
  }
);
