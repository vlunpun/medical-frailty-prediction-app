import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ClerkProvider } from "@clerk/clerk-react";
import { Toaster } from "@/components/ui/toaster";
import LandingPage from "./pages/LandingPage";
import AssessmentPage from "./pages/AssessmentPage";
import ReportPage from "./pages/ReportPage";
import GuidancePage from "./pages/GuidancePage";
import DashboardPage from "./pages/DashboardPage";

const queryClient = new QueryClient();
const PUBLISHABLE_KEY = "pk_test_bW9yYWwtYm9hLTUxLmNsZXJrLmFjY291bnRzLmRldiQ";

export default function App() {
  return (
    <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <div className="min-h-screen bg-background">
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/assessment" element={<AssessmentPage />} />
              <Route path="/reports" element={<ReportPage />} />
              <Route path="/guidance" element={<GuidancePage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
            <Toaster />
          </div>
        </BrowserRouter>
      </QueryClientProvider>
    </ClerkProvider>
  );
}
