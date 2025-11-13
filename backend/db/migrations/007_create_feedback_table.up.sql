CREATE TABLE feedback (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  assessment_id BIGINT REFERENCES assessments(id) ON DELETE SET NULL,
  report_id BIGINT REFERENCES reports(id) ON DELETE SET NULL,
  
  feedback_type TEXT NOT NULL CHECK (feedback_type IN ('prediction_accuracy', 'report_quality', 'feature_request', 'bug_report', 'general')),
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comments TEXT,
  prediction_was_accurate BOOLEAN,
  suggested_improvements TEXT[],
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_feedback_user_id ON feedback(user_id);
CREATE INDEX idx_feedback_type ON feedback(feedback_type);
CREATE INDEX idx_feedback_created ON feedback(created_at DESC);
CREATE INDEX idx_feedback_assessment ON feedback(assessment_id);
