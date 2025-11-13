import { describe, it, expect, beforeAll } from "vitest";
import { create } from "./create";
import { get } from "./get";
import { list } from "./list";
import { update } from "./update";
import { remove } from "./delete";
import type { CreateHealthRecordRequest, HealthRecord } from "./create";

describe("Health Record CRUD Operations", () => {
  let createdRecordId: string;
  
  describe("Create", () => {
    it("should create a vital signs record", async () => {
      const request: CreateHealthRecordRequest = {
        recordType: "vital_signs",
        recordDate: new Date("2024-01-15"),
        title: "Annual Physical Exam",
        description: "Routine checkup",
        providerName: "Dr. Smith",
        facilityName: "Memorial Hospital",
        vitalSigns: {
          bloodPressureSystolic: 120,
          bloodPressureDiastolic: 80,
          heartRate: 72,
          temperature: 98.6,
          weight: 165,
          height: 68,
        },
        notes: "Patient feeling well",
      };
      
      const record = await create(request);
      
      expect(record).toBeDefined();
      expect(record.id).toBeDefined();
      expect(record.recordType).toBe("vital_signs");
      expect(record.title).toBe("Annual Physical Exam");
      expect(record.vitalSigns?.heartRate).toBe(72);
      
      createdRecordId = record.id;
    });
    
    it("should create a medication record", async () => {
      const request: CreateHealthRecordRequest = {
        recordType: "medication",
        recordDate: new Date("2024-01-20"),
        title: "New Prescription",
        medicationDetails: {
          medicationName: "Lisinopril",
          dosage: "10mg",
          frequency: "Once daily",
          route: "Oral",
          startDate: new Date("2024-01-20"),
          prescribingPhysician: "Dr. Johnson",
        },
      };
      
      const record = await create(request);
      
      expect(record).toBeDefined();
      expect(record.recordType).toBe("medication");
      expect(record.medicationDetails?.medicationName).toBe("Lisinopril");
    });
    
    it("should create a lab result record", async () => {
      const request: CreateHealthRecordRequest = {
        recordType: "lab_result",
        recordDate: new Date("2024-02-01"),
        title: "Blood Work Results",
        labResults: [
          {
            testName: "Glucose",
            value: "95",
            unit: "mg/dL",
            referenceRange: "70-100",
            abnormalFlag: false,
          },
          {
            testName: "Cholesterol",
            value: "190",
            unit: "mg/dL",
            referenceRange: "<200",
            abnormalFlag: false,
          },
        ],
      };
      
      const record = await create(request);
      
      expect(record).toBeDefined();
      expect(record.labResults).toHaveLength(2);
      expect(record.labResults?.[0].testName).toBe("Glucose");
    });
    
    it("should fail when creating record with invalid type", async () => {
      const request = {
        recordType: "invalid_type",
        recordDate: new Date(),
        title: "Test",
      } as unknown as CreateHealthRecordRequest;
      
      await expect(create(request)).rejects.toThrow();
    });
    
    it("should fail when title is missing", async () => {
      const request = {
        recordType: "vital_signs",
        recordDate: new Date(),
        title: "",
      } as CreateHealthRecordRequest;
      
      await expect(create(request)).rejects.toThrow();
    });
    
    it("should fail when record date is in the future", async () => {
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1);
      
      const request: CreateHealthRecordRequest = {
        recordType: "vital_signs",
        recordDate: futureDate,
        title: "Future Record",
      };
      
      await expect(create(request)).rejects.toThrow();
    });
  });
  
  describe("Read", () => {
    it("should get a health record by id", async () => {
      const record = await get({ id: createdRecordId });
      
      expect(record).toBeDefined();
      expect(record.id).toBe(createdRecordId);
      expect(record.title).toBe("Annual Physical Exam");
    });
    
    it("should fail when record id is invalid", async () => {
      await expect(get({ id: "invalid" })).rejects.toThrow();
    });
    
    it("should fail when record does not exist", async () => {
      await expect(get({ id: "999999" })).rejects.toThrow();
    });
  });
  
  describe("List", () => {
    it("should list all health records", async () => {
      const response = await list({});
      
      expect(response).toBeDefined();
      expect(response.records).toBeDefined();
      expect(response.total).toBeGreaterThan(0);
      expect(response.records.length).toBeGreaterThan(0);
    });
    
    it("should filter by record type", async () => {
      const response = await list({ recordType: "vital_signs" });
      
      expect(response.records.every(r => r.recordType === "vital_signs")).toBe(true);
    });
    
    it("should filter by date range", async () => {
      const startDate = new Date("2024-01-01");
      const endDate = new Date("2024-01-31");
      
      const response = await list({ startDate, endDate });
      
      expect(response.records.every(r => {
        const date = new Date(r.recordDate);
        return date >= startDate && date <= endDate;
      })).toBe(true);
    });
    
    it("should respect limit and offset", async () => {
      const response = await list({ limit: 1, offset: 0 });
      
      expect(response.records).toHaveLength(1);
      expect(response.limit).toBe(1);
      expect(response.offset).toBe(0);
    });
    
    it("should fail when start date is after end date", async () => {
      await expect(list({
        startDate: new Date("2024-02-01"),
        endDate: new Date("2024-01-01"),
      })).rejects.toThrow();
    });
  });
  
  describe("Update", () => {
    it("should update a health record", async () => {
      const updated = await update({
        id: createdRecordId,
        title: "Updated Physical Exam",
        notes: "Updated notes",
      });
      
      expect(updated.title).toBe("Updated Physical Exam");
      expect(updated.notes).toBe("Updated notes");
    });
    
    it("should update vital signs", async () => {
      const updated = await update({
        id: createdRecordId,
        vitalSigns: {
          bloodPressureSystolic: 125,
          bloodPressureDiastolic: 82,
          heartRate: 75,
        },
      });
      
      expect(updated.vitalSigns?.bloodPressureSystolic).toBe(125);
      expect(updated.vitalSigns?.heartRate).toBe(75);
    });
    
    it("should fail when updating non-existent record", async () => {
      await expect(update({
        id: "999999",
        title: "Should Fail",
      })).rejects.toThrow();
    });
    
    it("should fail when title is empty", async () => {
      await expect(update({
        id: createdRecordId,
        title: "",
      })).rejects.toThrow();
    });
    
    it("should fail when updating with future date", async () => {
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1);
      
      await expect(update({
        id: createdRecordId,
        recordDate: futureDate,
      })).rejects.toThrow();
    });
  });
  
  describe("Delete", () => {
    it("should delete a health record", async () => {
      const response = await remove({ id: createdRecordId });
      
      expect(response.success).toBe(true);
      expect(response.message).toBeDefined();
    });
    
    it("should fail when deleting already deleted record", async () => {
      await expect(remove({ id: createdRecordId })).rejects.toThrow();
    });
    
    it("should fail when record id is invalid", async () => {
      await expect(remove({ id: "invalid" })).rejects.toThrow();
    });
    
    it("should fail when record does not exist", async () => {
      await expect(remove({ id: "999999" })).rejects.toThrow();
    });
  });
});
