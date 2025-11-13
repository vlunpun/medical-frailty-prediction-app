import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Heart, LayoutDashboard, ClipboardList, FileText, BookOpen, LogOut, User } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";

export default function Navigation() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const { toast } = useToast();

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = async () => {
    await logout();
    toast({
      title: "Logged out",
      description: "You have been logged out successfully",
    });
    navigate("/");
  };

  return (
    <nav className="border-b bg-background">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 font-bold text-xl">
            <Heart className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <span>Centauri Health</span>
          </Link>

          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              <>
                <Button
                  variant={isActive("/dashboard") ? "default" : "ghost"}
                  asChild
                >
                  <Link to="/dashboard">
                    <LayoutDashboard className="w-4 h-4 mr-2" />
                    Dashboard
                  </Link>
                </Button>
                <Button
                  variant={isActive("/assessment") ? "default" : "ghost"}
                  asChild
                >
                  <Link to="/assessment">
                    <ClipboardList className="w-4 h-4 mr-2" />
                    Assessment
                  </Link>
                </Button>
                <Button
                  variant={isActive("/reports") ? "default" : "ghost"}
                  asChild
                >
                  <Link to="/reports">
                    <FileText className="w-4 h-4 mr-2" />
                    Reports
                  </Link>
                </Button>
                <Button
                  variant={isActive("/guidance") ? "default" : "ghost"}
                  asChild
                >
                  <Link to="/guidance">
                    <BookOpen className="w-4 h-4 mr-2" />
                    Guidance
                  </Link>
                </Button>
                <div className="ml-4 flex items-center gap-2">
                  <Button variant="ghost" size="sm">
                    <User className="w-4 h-4 mr-2" />
                    {user?.email}
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleLogout}>
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </Button>
                </div>
              </>
            ) : (
              <>
                <Button variant="ghost" asChild>
                  <Link to="/login">Log In</Link>
                </Button>
                <Button asChild>
                  <Link to="/register">Sign Up</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
