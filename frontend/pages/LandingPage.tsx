import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Heart, Shield, FileText, Users } from "lucide-react";

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <Heart className="w-16 h-16 text-blue-600 dark:text-blue-400" />
          </div>
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Centauri Health Solutions
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            Helping Indiana Medicaid patients navigate medical frailty exemptions with confidence
          </p>
          <Button
            size="lg"
            onClick={() => navigate("/dashboard")}
            className="px-8 py-6 text-lg"
          >
            Get Started
          </Button>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mt-16 max-w-5xl mx-auto">
          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-center w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg mb-4">
              <Shield className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Eligibility Assessment</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Complete a comprehensive health assessment to determine your medical frailty status
            </p>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-center w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg mb-4">
              <FileText className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Personalized Reports</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Receive detailed reports with actionable insights and recommendations
            </p>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-center w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg mb-4">
              <Users className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Expert Guidance</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Access tailored advice on maintaining Medicaid coverage and available support
            </p>
          </Card>
        </div>

        <div className="mt-16 text-center">
          <h2 className="text-3xl font-bold mb-6">How It Works</h2>
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="flex items-start gap-4 text-left">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                1
              </div>
              <div>
                <h4 className="font-semibold text-lg mb-1">Create Your Account</h4>
                <p className="text-gray-600 dark:text-gray-300">
                  Sign up securely and provide your basic health information
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4 text-left">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                2
              </div>
              <div>
                <h4 className="font-semibold text-lg mb-1">Complete Assessment</h4>
                <p className="text-gray-600 dark:text-gray-300">
                  Answer questions about your health conditions and daily activities
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4 text-left">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                3
              </div>
              <div>
                <h4 className="font-semibold text-lg mb-1">Get Your Results</h4>
                <p className="text-gray-600 dark:text-gray-300">
                  Receive a personalized report with recommendations and next steps
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
