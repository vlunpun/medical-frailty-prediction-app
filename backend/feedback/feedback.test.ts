import { describe, it, expect } from "vitest";
import { submit } from "./submit";

describe("Feedback Service", () => {
  it("should accept valid feedback submission", async () => {
    const result = await submit({
      feedbackType: "general",
      rating: 5,
      comments: "Great app!",
    });

    expect(result).toBeDefined();
    expect(result.id).toBeDefined();
    expect(result.feedbackType).toBe("general");
    expect(result.rating).toBe(5);
    expect(result.comments).toBe("Great app!");
  });

  it("should accept prediction accuracy feedback", async () => {
    const result = await submit({
      assessmentId: 1,
      feedbackType: "prediction_accuracy",
      predictionWasAccurate: true,
      comments: "The prediction matched my doctor's assessment",
    });

    expect(result).toBeDefined();
    expect(result.feedbackType).toBe("prediction_accuracy");
    expect(result.predictionWasAccurate).toBe(true);
  });

  it("should accept feedback with suggested improvements", async () => {
    const result = await submit({
      feedbackType: "feature_request",
      rating: 4,
      comments: "Would like more features",
      suggestedImprovements: ["Add medication reminders", "Include exercise tracking"],
    });

    expect(result).toBeDefined();
    expect(result.suggestedImprovements).toEqual([
      "Add medication reminders",
      "Include exercise tracking",
    ]);
  });
});
