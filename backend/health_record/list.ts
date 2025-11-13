import { api, APIError } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import db from "../db";
import type { HealthRecord, RecordType } from "./create";

export interface ListHealthRecordsRequest {
  recordType?: RecordType;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}

export interface ListHealthRecordsResponse {
  records: HealthRecord[];
  total: number;
  limit: number;
  offset: number;
}

export const list = api(
  { method: "GET", path: "/health-records", auth: true, expose: true },
  async (req: ListHealthRecordsRequest): Promise<ListHealthRecordsResponse> => {
    const auth = getAuthData()!;
    
    const limit = req.limit && req.limit > 0 ? Math.min(req.limit, 100) : 50;
    const offset = req.offset && req.offset >= 0 ? req.offset : 0;
    
    if (req.startDate && req.endDate && new Date(req.startDate) > new Date(req.endDate)) {
      throw APIError.invalidArgument("Start date cannot be after end date");
    }
    
    interface QueryRow {
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
    
    let countQuery = "SELECT COUNT(*)::INTEGER as total FROM health_records WHERE user_id = $1";
    let selectQuery = "SELECT id::TEXT, user_id, record_type, record_date, title, description, provider_name, facility_name, vital_signs, lab_results, medication_details, diagnosis_details, procedure_details, immunization_details, allergy_details, other_details, attachments, notes, created_at, updated_at FROM health_records WHERE user_id = $1";
    const params: any[] = [auth.userID];
    
    if (req.recordType) {
      countQuery += ` AND record_type = $${params.length + 1}`;
      selectQuery += ` AND record_type = $${params.length + 1}`;
      params.push(req.recordType);
    }
    
    if (req.startDate) {
      countQuery += ` AND record_date >= $${params.length + 1}`;
      selectQuery += ` AND record_date >= $${params.length + 1}`;
      params.push(req.startDate);
    }
    
    if (req.endDate) {
      countQuery += ` AND record_date <= $${params.length + 1}`;
      selectQuery += ` AND record_date <= $${params.length + 1}`;
      params.push(req.endDate);
    }
    
    selectQuery += ` ORDER BY record_date DESC, created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    
    const countResult = await db.rawQueryRow<{ total: number }>(countQuery, ...params);
    const results = await db.rawQueryAll<QueryRow>(selectQuery, ...params, limit, offset);
    
    const records: HealthRecord[] = results.map((row) => ({
      id: row.id,
      userId: row.user_id,
      recordType: row.record_type as RecordType,
      recordDate: row.record_date,
      title: row.title,
      description: row.description || undefined,
      providerName: row.provider_name || undefined,
      facilityName: row.facility_name || undefined,
      vitalSigns: row.vital_signs,
      labResults: row.lab_results,
      medicationDetails: row.medication_details,
      diagnosisDetails: row.diagnosis_details,
      procedureDetails: row.procedure_details,
      immunizationDetails: row.immunization_details,
      allergyDetails: row.allergy_details,
      otherDetails: row.other_details,
      attachments: row.attachments || undefined,
      notes: row.notes || undefined,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));
    
    return {
      records,
      total: countResult?.total || 0,
      limit,
      offset,
    };
  }
);
