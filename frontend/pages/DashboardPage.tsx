import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ClipboardList, FileText, BookOpen, ArrowRight } from "lucide-react";
import Navigation from "@/components/Navigation";

export default function DashboardPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Welcome to Your Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-300">
            Manage your health assessments and access personalized guidance
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate("/assessment")}>
            <div className="flex items-center justify-center w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg mb-4">
              <ClipboardList className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-xl font-semibold mb-2">New Assessment</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Start a comprehensive health assessment to evaluate your medical frailty
            </p>
            <Button variant="ghost" className="p-0 h-auto font-semibold text-blue-600 dark:text-blue-400">
              Start Assessment <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate("/reports")}>
            <div className="flex items-center justify-center w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg mb-4">
              <FileText className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-xl font-semibold mb-2">View Reports</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Access your assessment reports and track your health status over time
            </p>
            <Button variant="ghost" className="p-0 h-auto font-semibold text-green-600 dark:text-green-400">
              View Reports <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate("/guidance")}>
            <div className="flex items-center justify-center w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg mb-4">
              <BookOpen className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Get Guidance</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Explore resources and get personalized advice for maintaining coverage
            </p>
            <Button variant="ghost" className="p-0 h-auto font-semibold text-purple-600 dark:text-purple-400">
              Explore Guidance <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </Card>
        </div>

        <Card className="mt-8 p-6 bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
          <h3 className="text-xl font-semibold mb-2">About Medical Frailty Exemptions</h3>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Medical frailty exemptions help Indiana Medicaid beneficiaries who have complex medical needs maintain their coverage. 
            This platform helps you assess your eligibility and provides guidance on the application process.
          </p>
          <ul className="space-y-2 text-gray-700 dark:text-gray-300">
            <li className="flex items-start gap-2">
              <span className="text-blue-600 dark:text-blue-400">•</span>
              <span>Complete regular assessments to track your health status</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 dark:text-blue-400">•</span>
              <span>Share reports with your healthcare providers</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 dark:text-blue-400">•</span>
              <span>Access resources to help navigate the Medicaid system</span>
            </li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
