-- Seed initial guidance resources for Medicaid coverage
INSERT INTO guidance_resources (category, title, description, resource_url, applicability_criteria, priority) VALUES
  ('medical_frailty', 'Understanding Medical Frailty Exemptions', 'Learn about medical frailty criteria and how they affect your Medicaid coverage in Indiana', 'https://www.in.gov/medicaid', ARRAY['frailty_score > 0.6'], 100),
  ('appeals', 'How to Appeal Medicaid Decisions', 'Step-by-step guide to filing an appeal if your coverage is denied or reduced', 'https://www.in.gov/medicaid/appeals', ARRAY['risk_level = high'], 90),
  ('support_services', 'Community Health Support Programs', 'Access local support services including home health care, transportation, and meal assistance', NULL, ARRAY['mobility_level = limited'], 80),
  ('maintenance', 'Maintaining Your Medicaid Coverage', 'Essential steps to keep your Medicaid benefits active and avoid coverage gaps', 'https://www.in.gov/medicaid/coverage', ARRAY[]::TEXT[], 70),
  ('documentation', 'Required Medical Documentation', 'What medical records and documentation you need for frailty assessments', NULL, ARRAY['chronic_conditions IS NOT NULL'], 60);
