ALTER TABLE assessments
ADD COLUMN confidence_score DOUBLE PRECISION,
ADD COLUMN contributing_factors JSONB,
ADD COLUMN insights TEXT[],
ADD COLUMN warning_flags TEXT[];
