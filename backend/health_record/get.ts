import { api, APIError } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import db from "../db";
import type { HealthRecord } from "./create";

export interface GetHealthRecordRequest {
  id: string;
}

export const get = api(
  { method: "GET", path: "/health-records/:id", auth: true, expose: true },
  async ({ id }: GetHealthRecordRequest): Promise<HealthRecord> => {
    const auth = getAuthData()!;
    
    if (!id || id.trim().length === 0) {
      throw APIError.invalidArgument("Record ID is required");
    }
    
    const recordId = parseInt(id, 10);
    if (isNaN(recordId)) {
      throw APIError.invalidArgument("Invalid record ID format");
    }
    
    const result = await db.queryRow`
      SELECT 
        id::TEXT,
        user_id,
        record_type,
        record_date,
        title,
        description,
        provider_name,
        facility_name,
        vital_signs,
        lab_results,
        medication_details,
        diagnosis_details,
        procedure_details,
        immunization_details,
        allergy_details,
        other_details,
        attachments,
        notes,
        created_at,
        updated_at
      FROM health_records
      WHERE id = ${recordId} AND user_id = ${auth.userID}
    `;
    
    if (!result) {
      throw APIError.notFound("Health record not found");
    }
    
    return {
      id: result.id,
      userId: result.user_id,
      recordType: result.record_type,
      recordDate: result.record_date,
      title: result.title,
      description: result.description,
      providerName: result.provider_name,
      facilityName: result.facility_name,
      vitalSigns: result.vital_signs,
      labResults: result.lab_results,
      medicationDetails: result.medication_details,
      diagnosisDetails: result.diagnosis_details,
      procedureDetails: result.procedure_details,
      immunizationDetails: result.immunization_details,
      allergyDetails: result.allergy_details,
      otherDetails: result.other_details,
      attachments: result.attachments,
      notes: result.notes,
      createdAt: result.created_at,
      updatedAt: result.updated_at,
    };
  }
);
