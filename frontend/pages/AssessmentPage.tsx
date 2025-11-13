import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { useBackend } from "../hooks/useBackend";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/use-toast";
import Navigation from "@/components/Navigation";
import { Loader2 } from "lucide-react";

const CHRONIC_CONDITIONS = [
  "Diabetes",
  "Heart Disease",
  "COPD",
  "Arthritis",
  "Hypertension",
  "Chronic Kidney Disease",
  "Depression",
  "Anxiety",
  "Asthma",
  "Cancer",
];

export default function AssessmentPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const backend = useBackend();

  const [formData, setFormData] = useState({
    chronicConditions: [] as string[],
    medicationsCount: 0,
    recentHospitalizations: 0,
    mobilityLevel: "independent" as "independent" | "limited" | "dependent",
    cognitiveStatus: "normal" as "normal" | "mild_impairment" | "moderate_impairment" | "severe_impairment",
    activitiesDailyLivingScore: 10,
    includeHealthRecords: true,
  });

  const createAssessment = useMutation({
    mutationFn: async () => {
      return await backend.assessment.create(formData);
    },
    onSuccess: async (data) => {
      toast({
        title: "Assessment Complete",
        description: "Your frailty assessment has been saved successfully.",
      });

      try {
        await backend.report.generate({
          assessmentId: data.id,
        });
        navigate("/reports");
      } catch (error) {
        console.error("Error generating report:", error);
        toast({
          title: "Report Generation Failed",
          description: "Assessment saved but report generation failed. Please try again.",
          variant: "destructive",
        });
      }
    },
    onError: (error) => {
      console.error("Error creating assessment:", error);
      toast({
        title: "Error",
        description: "Failed to save assessment. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleConditionToggle = (condition: string) => {
    setFormData((prev) => ({
      ...prev,
      chronicConditions: prev.chronicConditions.includes(condition)
        ? prev.chronicConditions.filter((c) => c !== condition)
        : [...prev.chronicConditions, condition],
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createAssessment.mutate();
  };

  return (
    <div className="min-h-screen">
      <Navigation />
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Health Assessment</h1>
          <p className="text-gray-600 dark:text-gray-300">
            Complete this assessment to evaluate your medical frailty status
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <Card className="p-6 space-y-6">
            <div>
              <Label className="text-lg font-semibold mb-4 block">Chronic Health Conditions</Label>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                Select all conditions that apply to you
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                {CHRONIC_CONDITIONS.map((condition) => (
                  <div key={condition} className="flex items-center space-x-2">
                    <Checkbox
                      id={condition}
                      checked={formData.chronicConditions.includes(condition)}
                      onCheckedChange={() => handleConditionToggle(condition)}
                    />
                    <label htmlFor={condition} className="text-sm cursor-pointer">
                      {condition}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="medications">Number of Daily Medications</Label>
              <Input
                id="medications"
                type="number"
                min="0"
                value={formData.medicationsCount}
                onChange={(e) =>
                  setFormData({ ...formData, medicationsCount: parseInt(e.target.value) || 0 })
                }
                required
              />
            </div>

            <div>
              <Label htmlFor="hospitalizations">Recent Hospitalizations (past 6 months)</Label>
              <Input
                id="hospitalizations"
                type="number"
                min="0"
                value={formData.recentHospitalizations}
                onChange={(e) =>
                  setFormData({ ...formData, recentHospitalizations: parseInt(e.target.value) || 0 })
                }
                required
              />
            </div>

            <div>
              <Label htmlFor="mobility">Mobility Level</Label>
              <Select
                value={formData.mobilityLevel}
                onValueChange={(value: any) => setFormData({ ...formData, mobilityLevel: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="independent">Independent - No assistance needed</SelectItem>
                  <SelectItem value="limited">Limited - Occasional assistance needed</SelectItem>
                  <SelectItem value="dependent">Dependent - Regular assistance needed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="cognitive">Cognitive Status</Label>
              <Select
                value={formData.cognitiveStatus}
                onValueChange={(value: any) => setFormData({ ...formData, cognitiveStatus: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="normal">Normal - No impairment</SelectItem>
                  <SelectItem value="mild_impairment">Mild Impairment</SelectItem>
                  <SelectItem value="moderate_impairment">Moderate Impairment</SelectItem>
                  <SelectItem value="severe_impairment">Severe Impairment</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="adl">Activities of Daily Living Score (1-10)</Label>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                10 = Completely independent, 1 = Completely dependent
              </p>
              <Input
                id="adl"
                type="number"
                min="1"
                max="10"
                value={formData.activitiesDailyLivingScore}
                onChange={(e) =>
                  setFormData({ ...formData, activitiesDailyLivingScore: parseInt(e.target.value) || 10 })
                }
                required
              />
            </div>

            <div>
              <div className="flex items-center space-x-2 mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-md">
                <Checkbox
                  id="includeHealthRecords"
                  checked={formData.includeHealthRecords}
                  onCheckedChange={(checked) => 
                    setFormData({ ...formData, includeHealthRecords: checked as boolean })
                  }
                />
                <label htmlFor="includeHealthRecords" className="text-sm cursor-pointer">
                  Include my health records for AI-enhanced prediction (recommended for more accurate results)
                </label>
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/dashboard")}
                disabled={createAssessment.isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createAssessment.isPending} className="flex-1">
                {createAssessment.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Complete AI Assessment
              </Button>
            </div>
          </Card>
        </form>
      </div>
    </div>
  );
}
