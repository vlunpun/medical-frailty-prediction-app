import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import backend from "~backend/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const token = searchParams.get("token");
    if (token) {
      verifyEmail(token);
    }
  }, [searchParams]);

  const verifyEmail = async (token: string) => {
    setVerifying(true);
    try {
      const response = await backend.auth.verifyEmail({ token });
      setVerified(true);
      toast({
        title: "Success",
        description: response.message,
      });
    } catch (err: any) {
      console.error("Email verification error:", err);
      setError(err.message || "Failed to verify email");
      toast({
        title: "Verification Failed",
        description: err.message || "Failed to verify email",
        variant: "destructive",
      });
    } finally {
      setVerifying(false);
    }
  };

  const handleResendVerification = async () => {
    const email = prompt("Enter your email address:");
    if (!email) return;

    try {
      const response = await backend.auth.resendVerification({ email });
      toast({
        title: "Success",
        description: response.message,
      });
    } catch (err: any) {
      console.error("Resend verification error:", err);
      toast({
        title: "Error",
        description: err.message || "Failed to resend verification email",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Email Verification</CardTitle>
          <CardDescription>
            {verifying && "Verifying your email address..."}
            {verified && "Your email has been verified"}
            {error && "Verification failed"}
            {!verifying && !verified && !error && "Check your email for verification link"}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-8">
          {verifying && <Loader2 className="h-16 w-16 animate-spin text-primary" />}
          {verified && <CheckCircle2 className="h-16 w-16 text-green-500" />}
          {error && <XCircle className="h-16 w-16 text-red-500" />}
          {!verifying && !verified && !error && (
            <div className="text-center space-y-4">
              <p className="text-muted-foreground">
                We've sent a verification link to your email address. Please check your inbox and click the link to verify your account.
              </p>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          {verified && (
            <Button className="w-full" onClick={() => navigate("/login")}>
              Go to Login
            </Button>
          )}
          {error && (
            <>
              <Button className="w-full" onClick={handleResendVerification}>
                Resend Verification Email
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => navigate("/login")}
              >
                Back to Login
              </Button>
            </>
          )}
          {!verifying && !verified && !error && (
            <>
              <Button className="w-full" onClick={handleResendVerification}>
                Resend Verification Email
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => navigate("/login")}
              >
                Back to Login
              </Button>
            </>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
