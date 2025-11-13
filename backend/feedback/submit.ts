import { api, APIError } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import db from "../db";

export interface SubmitFeedbackRequest {
  assessmentId?: number;
  reportId?: number;
  feedbackType: "prediction_accuracy" | "report_quality" | "feature_request" | "bug_report" | "general";
  rating?: number;
  comments?: string;
  predictionWasAccurate?: boolean;
  suggestedImprovements?: string[];
}

export interface Feedback {
  id: number;
  userId: string;
  assessmentId?: number;
  reportId?: number;
  feedbackType: string;
  rating?: number;
  comments?: string;
  predictionWasAccurate?: boolean;
  suggestedImprovements?: string[];
  createdAt: Date;
}

export const submit = api(
  { method: "POST", path: "/feedback", auth: true, expose: true },
  async (req: SubmitFeedbackRequest): Promise<Feedback> => {
    const auth = getAuthData()!;
    
    if (req.feedbackType === "prediction_accuracy" && !req.assessmentId) {
      throw APIError.invalidArgument("assessmentId is required for prediction_accuracy feedback");
    }
    
    if (req.rating !== undefined && (req.rating < 1 || req.rating > 5)) {
      throw APIError.invalidArgument("rating must be between 1 and 5");
    }
    
    const result = await db.queryRow<{
      id: number;
      user_id: string;
      assessment_id: number | null;
      report_id: number | null;
      feedback_type: string;
      rating: number | null;
      comments: string | null;
      prediction_was_accurate: boolean | null;
      suggested_improvements: string[] | null;
      created_at: Date;
    }>`
      INSERT INTO feedback (
        user_id,
        assessment_id,
        report_id,
        feedback_type,
        rating,
        comments,
        prediction_was_accurate,
        suggested_improvements
      ) VALUES (
        ${auth.userID},
        ${req.assessmentId || null},
        ${req.reportId || null},
        ${req.feedbackType},
        ${req.rating || null},
        ${req.comments || null},
        ${req.predictionWasAccurate ?? null},
        ${req.suggestedImprovements || null}
      )
      RETURNING 
        id,
        user_id,
        assessment_id,
        report_id,
        feedback_type,
        rating,
        comments,
        prediction_was_accurate,
        suggested_improvements,
        created_at
    `;
    
    if (!result) {
      throw APIError.internal("Failed to submit feedback");
    }
    
    return {
      id: result.id,
      userId: result.user_id,
      assessmentId: result.assessment_id || undefined,
      reportId: result.report_id || undefined,
      feedbackType: result.feedback_type,
      rating: result.rating || undefined,
      comments: result.comments || undefined,
      predictionWasAccurate: result.prediction_was_accurate || undefined,
      suggestedImprovements: result.suggested_improvements || undefined,
      createdAt: result.created_at,
    };
  }
);
