import { useQuery } from "@tanstack/react-query";
import { useBackend } from "../hooks/useBackend";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Navigation from "@/components/Navigation";
import { FileText, AlertCircle, CheckCircle2 } from "lucide-react";

export default function ReportPage() {
  const backend = useBackend();

  const { data: reportsData, isLoading } = useQuery({
    queryKey: ["reports"],
    queryFn: async () => await backend.report.list(),
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
                  <h4 className="font-semibold mb-2">Summary</h4>
                  <p className="text-gray-700 dark:text-gray-300">{report.summary}</p>
                </div>

                <div className="mb-6">
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    Recommendations
                  </h4>
                  <ul className="space-y-2">
                    {report.recommendations.map((rec, index) => (
                      <li key={index} className="flex items-start gap-2 text-gray-700 dark:text-gray-300">
                        <span className="text-blue-600 dark:text-blue-400 mt-1">•</span>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                    Next Steps
                  </h4>
                  <ul className="space-y-2">
                    {report.nextSteps.map((step, index) => (
                      <li key={index} className="flex items-start gap-2 text-gray-700 dark:text-gray-300">
                        <span className="text-green-600 dark:text-green-400 font-bold">{index + 1}.</span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
