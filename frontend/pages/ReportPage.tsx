import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useBackend } from "../hooks/useBackend";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import Navigation from "@/components/Navigation";
import { FileText, AlertCircle, CheckCircle2, TrendingUp, Activity, MessageSquare, Star } from "lucide-react";

export default function ReportPage() {
  const backend = useBackend();
  const { toast } = useToast();
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [feedbackRating, setFeedbackRating] = useState(0);

  const { data: reportsData, isLoading } = useQuery({
    queryKey: ["reports"],
    queryFn: async () => await backend.report.list(),
  });

  const submitFeedback = useMutation({
    mutationFn: async (data: { reportId: number; rating: number }) => {
      return await backend.feedback.submit({
        reportId: data.reportId,
        feedbackType: "report_quality",
        rating: data.rating,
      });
    },
    onSuccess: () => {
      toast({
        title: "Feedback Submitted",
        description: "Thank you for your feedback!",
      });
      setSelectedReport(null);
      setFeedbackRating(0);
    },
    onError: (error) => {
      console.error("Error submitting feedback:", error);
      toast({
        title: "Error",
        description: "Failed to submit feedback. Please try again.",
        variant: "destructive",
      });
    },
  });

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case "high":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "moderate":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "low":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <p className="text-gray-600 dark:text-gray-300">Loading reports...</p>
          </div>
        </div>
      </div>
    );
  }

  const reports = reportsData?.reports || [];

  return (
    <div className="min-h-screen">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Assessment Reports</h1>
          <p className="text-gray-600 dark:text-gray-300">
            View your medical frailty assessment reports and recommendations
          </p>
        </div>

        {reports.length === 0 ? (
          <Card className="p-12 text-center">
            <FileText className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-xl font-semibold mb-2">No Reports Yet</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Complete a health assessment to generate your first report
            </p>
          </Card>
        ) : (
          <div className="space-y-6">
            {reports.map((report) => (
              <Card key={report.id} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-semibold mb-1">{report.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Generated on {new Date(report.generatedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge className={getRiskColor(report.reportType)}>
                    {report.reportType.replace("_", " ").toUpperCase()}
                  </Badge>
                </div>

                <div className="mb-6">
                  <h4 className="font-semibold mb-2">AI-Powered Assessment Summary</h4>
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">{report.summary}</p>
                </div>

                {report.medicaidEligibility && (
                  <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <Activity className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      Indiana Medicaid Eligibility Assessment
                    </h4>
                    <div className="mb-3">
                      <p className="text-sm font-medium mb-1">
                        {report.medicaidEligibility.likelyQualifies ? (
                          <span className="text-green-600 dark:text-green-400">✓ Likely Qualifies for Medical Frailty Exemption</span>
                        ) : (
                          <span className="text-yellow-600 dark:text-yellow-400">Additional documentation may be needed</span>
                        )}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        Criteria Met: {report.medicaidEligibility.criteriaMetCount} of {report.medicaidEligibility.totalCriteria}
                      </p>
                    </div>
                    <ul className="space-y-1">
                      {report.medicaidEligibility.details.map((detail: string, index: number) => (
                        <li key={index} className="text-sm text-gray-700 dark:text-gray-300">
                          {detail}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {report.healthMetrics && report.healthMetrics.length > 0 && (
                  <div className="mb-6">
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                      Detailed Health Metrics
                    </h4>
                    <div className="grid md:grid-cols-2 gap-4">
                      {report.healthMetrics.map((metric: any, index: number) => (
                        <div key={index} className="p-3 border rounded-md">
                          <div className="flex justify-between items-start mb-1">
                            <span className="font-medium text-sm">{metric.metric}</span>
                            <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                              {metric.value}
                            </span>
                          </div>
                          <p className="text-xs text-gray-600 dark:text-gray-300">
                            {metric.interpretation}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mb-6">
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    Personalized Recommendations
                  </h4>
                  <ul className="space-y-2">
                    {report.recommendations.map((rec: string, index: number) => (
                      <li key={index} className="flex items-start gap-2 text-gray-700 dark:text-gray-300">
                        <span className="text-blue-600 dark:text-blue-400 mt-1">•</span>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mb-6">
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                    Next Steps
                  </h4>
                  <ul className="space-y-2">
                    {report.nextSteps.map((step: string, index: number) => (
                      <li key={index} className="flex items-start gap-2 text-gray-700 dark:text-gray-300">
                        <span className="text-green-600 dark:text-green-400 font-bold">{index + 1}.</span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="w-5 h-5 text-gray-500" />
                      <span className="text-sm font-medium">Rate this report</span>
                    </div>
                    {selectedReport === report.id ? (
                      <div className="flex items-center gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            onClick={() => setFeedbackRating(star)}
                            className="focus:outline-none"
                          >
                            <Star
                              className={`w-5 h-5 ${
                                star <= feedbackRating
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "text-gray-300"
                              }`}
                            />
                          </button>
                        ))}
                        <Button
                          size="sm"
                          onClick={() => submitFeedback.mutate({ reportId: report.id, rating: feedbackRating })}
                          disabled={feedbackRating === 0 || submitFeedback.isPending}
                        >
                          Submit
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedReport(null);
                            setFeedbackRating(0);
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedReport(report.id)}
                      >
                        Provide Feedback
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
