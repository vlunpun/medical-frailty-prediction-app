-- Users table with string-based user_id for Clerk integration
CREATE TABLE users (
  user_id TEXT PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  date_of_birth DATE,
  phone TEXT,
  email TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Health assessments table
CREATE TABLE assessments (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  assessment_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Health metrics
  chronic_conditions TEXT[],
  medications_count INTEGER,
  recent_hospitalizations INTEGER,
  mobility_level TEXT,
  cognitive_status TEXT,
  activities_daily_living_score INTEGER,
  
  -- Calculated scores
  frailty_score DOUBLE PRECISION,
  risk_level TEXT,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_assessments_user_id ON assessments(user_id);
CREATE INDEX idx_assessments_date ON assessments(assessment_date DESC);

-- Reports table
CREATE TABLE reports (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  assessment_id BIGINT NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
  
  report_type TEXT NOT NULL,
  title TEXT NOT NULL,
  summary TEXT,
  recommendations TEXT[],
  next_steps TEXT[],
  
  generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(assessment_id)
);

CREATE INDEX idx_reports_user_id ON reports(user_id);

-- Guidance resources table
CREATE TABLE guidance_resources (
  id BIGSERIAL PRIMARY KEY,
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  resource_url TEXT,
  applicability_criteria TEXT[],
  priority INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_guidance_category ON guidance_resources(category);
