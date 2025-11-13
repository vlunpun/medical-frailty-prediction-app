CREATE TABLE health_records (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  
  record_type TEXT NOT NULL CHECK (record_type IN ('vital_signs', 'lab_result', 'medication', 'diagnosis', 'procedure', 'immunization', 'allergy', 'other')),
  record_date DATE NOT NULL,
  
  title TEXT NOT NULL,
  description TEXT,
  
  provider_name TEXT,
  facility_name TEXT,
  
  vital_signs JSONB,
  lab_results JSONB,
  medication_details JSONB,
  diagnosis_details JSONB,
  procedure_details JSONB,
  immunization_details JSONB,
  allergy_details JSONB,
  other_details JSONB,
  
  attachments TEXT[],
  notes TEXT,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_health_records_user_id ON health_records(user_id);
CREATE INDEX idx_health_records_date ON health_records(record_date DESC);
CREATE INDEX idx_health_records_type ON health_records(record_type);
CREATE INDEX idx_health_records_created ON health_records(created_at DESC);

CREATE OR REPLACE FUNCTION update_health_record_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER health_records_updated_at
  BEFORE UPDATE ON health_records
  FOR EACH ROW
  EXECUTE FUNCTION update_health_record_timestamp();
