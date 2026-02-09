import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import {
  Menu,
  LayoutDashboard,
  Search,
  FileText,
  BarChart3,
  Settings,
  Shield,
  Users,
  TrendingUp,
  Eye,
  Globe,
  GitBranch,
  Sparkles,
  LogOut,
  Crown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useIsAdmin } from "@/hooks/useIsAdmin";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "New Scan", href: "/scan", icon: Search },
  { label: "Cases", href: "/cases", icon: FileText },
  { label: "Context Enrichment", href: "/context-enrichment", icon: Sparkles },
  { label: "Watchlists", href: "/watchlists", icon: Eye },
  { label: "Dark Web Monitoring", href: "/dark-web-monitoring", icon: Globe },
  { label: "Workflows", href: "/workflows", icon: GitBranch },
  { label: "Analytics", href: "/analytics", icon: BarChart3 },
  { label: "Trends", href: "/trends", icon: TrendingUp },
  { label: "Teams", href: "/teams", icon: Users },
  { label: "Security", href: "/security", icon: Shield },
  { label: "Settings", href: "/settings", icon: Settings },
];

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { isAdmin } = useIsAdmin();

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      setOpen(false);
      toast.success("Signed out successfully");
      navigate("/");
    } catch (error) {
      toast.error("Failed to sign out");
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[280px] sm:w-[320px]">
        <nav className="flex flex-col gap-2 mt-8 pb-safe">
          {navItems.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              onClick={() => setOpen(false)}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                location.pathname === item.href
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
          
          {/* Admin Dashboard - only visible to admins */}
          {isAdmin && (
            <>
              <Separator className="my-2" />
              <Link
                to="/admin"
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  location.pathname === "/admin" || location.pathname.startsWith("/admin/")
                    ? "bg-purple-600 text-white"
                    : "text-purple-600 hover:bg-purple-100 dark:hover:bg-purple-900/20"
                )}
              >
                <Crown className="h-4 w-4" />
                Admin Dashboard
              </Link>
            </>
          )}
          
          <Separator className="my-2" />
          
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors text-destructive hover:bg-destructive/10"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </nav>
      </SheetContent>
    </Sheet>
  );
}
