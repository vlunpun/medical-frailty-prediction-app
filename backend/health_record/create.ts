import { api, APIError } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import db from "../db";

export interface VitalSigns {
  bloodPressureSystolic?: number;
  bloodPressureDiastolic?: number;
  heartRate?: number;
  temperature?: number;
  respiratoryRate?: number;
  oxygenSaturation?: number;
  weight?: number;
  height?: number;
  bmi?: number;
}

export interface LabResult {
  testName: string;
  value: string;
  unit?: string;
  referenceRange?: string;
  abnormalFlag?: boolean;
}

export interface MedicationDetails {
  medicationName: string;
  dosage?: string;
  frequency?: string;
  route?: string;
  startDate?: Date;
  endDate?: Date;
  prescribingPhysician?: string;
}

export interface DiagnosisDetails {
  condition: string;
  icdCode?: string;
  severity?: string;
  diagnosisDate?: Date;
  status?: "active" | "resolved" | "chronic";
}

export interface ProcedureDetails {
  procedureName: string;
  cptCode?: string;
  bodyPart?: string;
  outcome?: string;
}

export interface ImmunizationDetails {
  vaccineName: string;
  cvxCode?: string;
  doseNumber?: number;
  lotNumber?: string;
  administeredBy?: string;
}

export interface AllergyDetails {
  allergen: string;
  reactionType?: string;
  severity?: "mild" | "moderate" | "severe";
  onsetDate?: Date;
}

export type RecordType = 
  | "vital_signs"
  | "lab_result"
  | "medication"
  | "diagnosis"
  | "procedure"
  | "immunization"
  | "allergy"
  | "other";

export interface CreateHealthRecordRequest {
  recordType: RecordType;
  recordDate: Date;
  title: string;
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

export interface HealthRecord {
  id: string;
  userId: string;
  recordType: RecordType;
  recordDate: Date;
  title: string;
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
  createdAt: Date;
  updatedAt: Date;
}

function validateRecordType(recordType: string): recordType is RecordType {
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
  return validTypes.includes(recordType as RecordType);
}

function validateHealthRecord(req: CreateHealthRecordRequest): void {
  if (!req.recordType || !validateRecordType(req.recordType)) {
    throw APIError.invalidArgument("Invalid record type");
  }
  
  if (!req.recordDate) {
    throw APIError.invalidArgument("Record date is required");
  }
  
  if (!req.title || req.title.trim().length === 0) {
    throw APIError.invalidArgument("Title is required");
  }
  
  if (req.title.length > 200) {
    throw APIError.invalidArgument("Title must be 200 characters or less");
  }
  
  const recordDate = new Date(req.recordDate);
  const now = new Date();
  if (recordDate > now) {
    throw APIError.invalidArgument("Record date cannot be in the future");
  }
  
  if (req.recordType === "vital_signs" && !req.vitalSigns) {
    throw APIError.invalidArgument("Vital signs data is required for vital_signs record type");
  }
  
  if (req.recordType === "lab_result" && (!req.labResults || req.labResults.length === 0)) {
    throw APIError.invalidArgument("Lab results data is required for lab_result record type");
  }
  
  if (req.recordType === "medication" && !req.medicationDetails) {
    throw APIError.invalidArgument("Medication details are required for medication record type");
  }
  
  if (req.recordType === "diagnosis" && !req.diagnosisDetails) {
    throw APIError.invalidArgument("Diagnosis details are required for diagnosis record type");
  }
}

export const create = api(
  { method: "POST", path: "/health-records", auth: true, expose: true },
  async (req: CreateHealthRecordRequest): Promise<HealthRecord> => {
    const auth = getAuthData()!;
    
    validateHealthRecord(req);
    
    const result = await db.queryRow<{
      id: string;
      user_id: string;
      record_type: string;
      record_date: Date;
      title: string;
      description: string | null;
      provider_name: string | null;
      facility_name: string | null;
      vital_signs: VitalSigns | null;
      lab_results: LabResult[] | null;
      medication_details: MedicationDetails | null;
      diagnosis_details: DiagnosisDetails | null;
      procedure_details: ProcedureDetails | null;
      immunization_details: ImmunizationDetails | null;
      allergy_details: AllergyDetails | null;
      other_details: Record<string, unknown> | null;
      attachments: string[] | null;
      notes: string | null;
      created_at: Date;
      updated_at: Date;
    }>`
      INSERT INTO health_records (
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
        notes
      ) VALUES (
        ${auth.userID},
        ${req.recordType},
        ${req.recordDate},
        ${req.title},
        ${req.description || null},
        ${req.providerName || null},
        ${req.facilityName || null},
        ${req.vitalSigns ? JSON.stringify(req.vitalSigns) : null},
        ${req.labResults ? JSON.stringify(req.labResults) : null},
        ${req.medicationDetails ? JSON.stringify(req.medicationDetails) : null},
        ${req.diagnosisDetails ? JSON.stringify(req.diagnosisDetails) : null},
        ${req.procedureDetails ? JSON.stringify(req.procedureDetails) : null},
        ${req.immunizationDetails ? JSON.stringify(req.immunizationDetails) : null},
        ${req.allergyDetails ? JSON.stringify(req.allergyDetails) : null},
        ${req.otherDetails ? JSON.stringify(req.otherDetails) : null},
        ${req.attachments || null},
        ${req.notes || null}
      )
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
    
    if (!result) {
      throw APIError.internal("Failed to create health record");
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
      vitalSigns: result.vital_signs || undefined,
      labResults: result.lab_results || undefined,
      medicationDetails: result.medication_details || undefined,
      diagnosisDetails: result.diagnosis_details || undefined,
      procedureDetails: result.procedure_details || undefined,
      immunizationDetails: result.immunization_details || undefined,
      allergyDetails: result.allergy_details || undefined,
      otherDetails: result.other_details || undefined,
      attachments: result.attachments || undefined,
      notes: result.notes || undefined,
      createdAt: result.created_at,
      updatedAt: result.updated_at,
    };
  }
);
