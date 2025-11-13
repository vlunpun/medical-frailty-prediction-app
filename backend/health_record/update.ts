import { api, APIError } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import db from "../db";
import type { 
  HealthRecord, 
  RecordType,
  VitalSigns,
  LabResult,
  MedicationDetails,
  DiagnosisDetails,
  ProcedureDetails,
  ImmunizationDetails,
  AllergyDetails
} from "./create";

export interface UpdateHealthRecordRequest {
  id: string;
  recordType?: RecordType;
  recordDate?: Date;
  title?: string;
  description?: string;
  providerName?: string;
  facilityName?: string;
  vitalSigns?: VitalSigns;
  labResults?: LabResult[];
  medicationDetails?: MedicationDetails;
  diagnosisDetails?: DiagnosisDetails;
  procedureDetails?: ProcedureDetails;
  immunizationDetails?: ImmunizationDetails;
  allergyDetails?: AllergyDetails;
  otherDetails?: Record<string, unknown>;
  attachments?: string[];
  notes?: string;
}

function validateUpdateRequest(req: UpdateHealthRecordRequest): void {
  if (!req.id || req.id.trim().length === 0) {
    throw APIError.invalidArgument("Record ID is required");
  }
  
  if (req.title !== undefined && req.title.trim().length === 0) {
    throw APIError.invalidArgument("Title cannot be empty");
  }
  
  if (req.title !== undefined && req.title.length > 200) {
    throw APIError.invalidArgument("Title must be 200 characters or less");
  }
  
  if (req.recordDate !== undefined) {
    const recordDate = new Date(req.recordDate);
    const now = new Date();
    if (recordDate > now) {
      throw APIError.invalidArgument("Record date cannot be in the future");
    }
  }
  
  const validTypes: RecordType[] = [
    "vital_signs",
    "lab_result",
    "medication",
    "diagnosis",
    "procedure",
    "immunization",
    "allergy",
    "other"
  ];
  
  if (req.recordType !== undefined && !validTypes.includes(req.recordType)) {
    throw APIError.invalidArgument("Invalid record type");
  }
}

interface UpdateResult {
  id: string;
  user_id: string;
  record_type: string;
  record_date: Date;
  title: string;
  description: string | null;
  provider_name: string | null;
  facility_name: string | null;
  vital_signs: any;
  lab_results: any;
  medication_details: any;
  diagnosis_details: any;
  procedure_details: any;
  immunization_details: any;
  allergy_details: any;
  other_details: any;
  attachments: string[] | null;
  notes: string | null;
  created_at: Date;
  updated_at: Date;
}

export const update = api(
  { method: "PUT", path: "/health-records/:id", auth: true, expose: true },
  async (req: UpdateHealthRecordRequest): Promise<HealthRecord> => {
    const auth = getAuthData()!;
    
    validateUpdateRequest(req);
    
    const recordId = parseInt(req.id, 10);
    if (isNaN(recordId)) {
      throw APIError.invalidArgument("Invalid record ID format");
    }
    
    const existing = await db.queryRow`
      SELECT id FROM health_records
      WHERE id = ${recordId} AND user_id = ${auth.userID}
    `;
    
    if (!existing) {
      throw APIError.notFound("Health record not found");
    }
    
    const updates: string[] = [];
    const values: any[] = [];
    
    if (req.recordType !== undefined) {
      updates.push(`record_type = $${values.length + 1}`);
      values.push(req.recordType);
    }
    if (req.recordDate !== undefined) {
      updates.push(`record_date = $${values.length + 1}`);
      values.push(req.recordDate);
    }
    if (req.title !== undefined) {
      updates.push(`title = $${values.length + 1}`);
      values.push(req.title);
    }
    if (req.description !== undefined) {
      updates.push(`description = $${values.length + 1}`);
      values.push(req.description);
    }
    if (req.providerName !== undefined) {
      updates.push(`provider_name = $${values.length + 1}`);
      values.push(req.providerName);
    }
    if (req.facilityName !== undefined) {
      updates.push(`facility_name = $${values.length + 1}`);
      values.push(req.facilityName);
    }
    if (req.vitalSigns !== undefined) {
      updates.push(`vital_signs = $${values.length + 1}`);
      values.push(JSON.stringify(req.vitalSigns));
    }
    if (req.labResults !== undefined) {
      updates.push(`lab_results = $${values.length + 1}`);
      values.push(JSON.stringify(req.labResults));
    }
    if (req.medicationDetails !== undefined) {
      updates.push(`medication_details = $${values.length + 1}`);
      values.push(JSON.stringify(req.medicationDetails));
    }
    if (req.diagnosisDetails !== undefined) {
      updates.push(`diagnosis_details = $${values.length + 1}`);
      values.push(JSON.stringify(req.diagnosisDetails));
    }
    if (req.procedureDetails !== undefined) {
      updates.push(`procedure_details = $${values.length + 1}`);
      values.push(JSON.stringify(req.procedureDetails));
    }
    if (req.immunizationDetails !== undefined) {
      updates.push(`immunization_details = $${values.length + 1}`);
      values.push(JSON.stringify(req.immunizationDetails));
    }
    if (req.allergyDetails !== undefined) {
      updates.push(`allergy_details = $${values.length + 1}`);
      values.push(JSON.stringify(req.allergyDetails));
    }
    if (req.otherDetails !== undefined) {
      updates.push(`other_details = $${values.length + 1}`);
      values.push(JSON.stringify(req.otherDetails));
    }
    if (req.attachments !== undefined) {
      updates.push(`attachments = $${values.length + 1}`);
      values.push(req.attachments);
    }
    if (req.notes !== undefined) {
      updates.push(`notes = $${values.length + 1}`);
      values.push(req.notes);
    }
    
    if (updates.length === 0) {
      throw APIError.invalidArgument("No fields to update");
    }
    
    const query = `
      UPDATE health_records
      SET ${updates.join(", ")}
      WHERE id = $${values.length + 1} AND user_id = $${values.length + 2}
      RETURNING 
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
    `;
    
    const result = await db.rawQueryRow<UpdateResult>(query, ...values, recordId, auth.userID);
    
    if (!result) {
      throw APIError.internal("Failed to update record");
    }
    
    return {
      id: result.id,
      userId: result.user_id,
      recordType: result.record_type as RecordType,
      recordDate: result.record_date,
      title: result.title,
      description: result.description || undefined,
      providerName: result.provider_name || undefined,
      facilityName: result.facility_name || undefined,
      vitalSigns: result.vital_signs,
      labResults: result.lab_results,
      medicationDetails: result.medication_details,
      diagnosisDetails: result.diagnosis_details,
      procedureDetails: result.procedure_details,
      immunizationDetails: result.immunization_details,
      allergyDetails: result.allergy_details,
      otherDetails: result.other_details,
      attachments: result.attachments || undefined,
      notes: result.notes || undefined,
      createdAt: result.created_at,
      updatedAt: result.updated_at,
    };
  }
);
