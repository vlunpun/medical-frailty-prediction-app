import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Heart, LayoutDashboard, ClipboardList, FileText, BookOpen } from "lucide-react";

export default function Navigation() {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="border-b bg-background">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 font-bold text-xl">
            <Heart className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <span>Centauri Health</span>
          </Link>

          <div className="flex items-center gap-2">
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
          </div>
        </div>
      </div>
    </nav>
  );
}
