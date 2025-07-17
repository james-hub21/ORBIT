import { useEffect } from "react";
import { useParams } from "wouter";
import { BookOpen, Dock, Calendar } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export default function Login() {
  const { subsystem } = useParams<{ subsystem?: string }>();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      window.location.href = "/";
    }
  }, [isAuthenticated]);

  const getSubsystemInfo = () => {
    switch (subsystem) {
      case "orz":
        return {
          title: "ORZ Computer Usage System",
          icon: <Dock className="h-12 w-12 text-primary" />,
          description: "Access computer workstations in the Online Resource Zone"
        };
      case "booking":
        return {
          title: "Library Facility Booking System",
          icon: <Calendar className="h-12 w-12 text-secondary" />,
          description: "Book and manage library facilities and study rooms"
        };
      default:
        return {
          title: "ORBIT System",
          icon: <BookOpen className="h-12 w-12 text-primary" />,
          description: "Integrated Library Facility & Computer Usage Management System"
        };
    }
  };

  const subsystemInfo = getSubsystemInfo();

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary to-blue-800 dark:from-blue-900 dark:to-blue-950 flex items-center justify-center">
      <div className="material-card p-8 w-full max-w-md mx-6">
        <div className="text-center mb-8">
          {subsystemInfo.icon}
          <h2 className="text-2xl font-bold mt-4 mb-2">Login to ORBIT</h2>
          <p className="text-muted-foreground">{subsystemInfo.title}</p>
          <p className="text-sm text-muted-foreground mt-2">{subsystemInfo.description}</p>
        </div>

        <div className="space-y-6">
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-4">
              Please use your university credentials to access the system
            </p>
            <a href="/api/login" className="material-button primary w-full">
              Login with University Account
            </a>
          </div>

          <div className="text-center pt-4 border-t">
            <p className="text-sm text-muted-foreground">
              By logging in, you agree to our{" "}
              <a href="#" className="text-primary hover:underline">
                Terms and Conditions
              </a>
            </p>
          </div>
        </div>

        <div className="mt-6 text-center">
          <a href="/" className="text-primary hover:underline text-sm">
            ← Back to System Selection
          </a>
        </div>
      </div>
    </div>
  );
}
