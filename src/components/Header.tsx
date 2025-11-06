import { Shield, Menu, X, User, CreditCard, ChevronDown, Search, UserCircle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NotificationBell } from "@/components/workspace/NotificationBell";
import { WorkspacePresence } from "@/components/workspace/WorkspacePresence";
import { MobileNav } from "@/components/MobileNav";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";
import { useSubscription } from "@/hooks/useSubscription";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { CommandPalette } from "@/components/CommandPalette";
import { WorkspaceSwitcher } from "@/components/workspace/WorkspaceSwitcher";

export const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const { user, isPremium } = useSubscription();
  const { toast } = useToast();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery("");
    }
  };

  const handleManageSubscription = async () => {
    try {
      const { data, error } = await supabase.functions.invoke("customer-portal");
      if (error || !data?.url) {
        toast({
          title: "Error",
          description: "Could not open subscription management",
          variant: "destructive",
        });
        return;
      }
      window.open(data.url, "_blank");
    } catch (error) {
      toast({
        title: "Error",
        description: "Could not open subscription management",
        variant: "destructive",
      });
    }
  };

  const scrollToSection = (sectionId: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      navigate('/');
      setTimeout(() => {
        document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  };

  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <MobileNav />
            <Link to="/" className="flex items-center">
              <img 
                src="/logo-dark.png" 
                alt="FootprintIQ Logo" 
                className="h-16 w-auto"
              />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            {/* Product */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-1">
                  Product
                  <ChevronDown className="w-3 h-3" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48 bg-card/95 backdrop-blur-sm">
                <DropdownMenuItem 
                  onClick={() => scrollToSection('how-it-works')} 
                  className="cursor-pointer transition-[var(--transition-smooth)] hover:bg-[hsl(var(--muted)/0.5)]"
                >
                  How It Works
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/features" className="cursor-pointer transition-[var(--transition-smooth)] hover:bg-[hsl(var(--muted)/0.5)]">Features</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/pricing" className="cursor-pointer transition-[var(--transition-smooth)] hover:bg-[hsl(var(--muted)/0.5)]">Pricing</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Tools */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-1">
                  Tools
                  <ChevronDown className="w-3 h-3" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48 bg-card/95 backdrop-blur-sm">
                <DropdownMenuItem asChild>
                  <Link to="/dashboard" className="cursor-pointer transition-[var(--transition-smooth)] hover:bg-[hsl(var(--muted)/0.5)]">Dashboard</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/scan/advanced" className="cursor-pointer transition-[var(--transition-smooth)] hover:bg-[hsl(var(--muted)/0.5)]">Advanced Scan</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/graph" className="cursor-pointer transition-[var(--transition-smooth)] hover:bg-[hsl(var(--muted)/0.5)]">Entity Graph</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/search" className="cursor-pointer transition-[var(--transition-smooth)] hover:bg-[hsl(var(--muted)/0.5)]">Search Entities</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/dark-web-monitoring" className="cursor-pointer transition-[var(--transition-smooth)] hover:bg-[hsl(var(--muted)/0.5)]">Dark Web Monitoring</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/monitoring" className="cursor-pointer transition-[var(--transition-smooth)] hover:bg-[hsl(var(--muted)/0.5)]">Alerts & Monitoring</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/ai-analyst" className="cursor-pointer transition-[var(--transition-smooth)] hover:bg-[hsl(var(--muted)/0.5)]">AI Analyst</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/assistant" className="cursor-pointer transition-[var(--transition-smooth)] hover:bg-[hsl(var(--muted)/0.5)]">AI Assistant</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/cases" className="cursor-pointer transition-[var(--transition-smooth)] hover:bg-[hsl(var(--muted)/0.5)]">Cases</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/reports" className="cursor-pointer transition-[var(--transition-smooth)] hover:bg-[hsl(var(--muted)/0.5)]">Reports</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/api-docs" className="cursor-pointer transition-[var(--transition-smooth)] hover:bg-[hsl(var(--muted)/0.5)]">API Documentation</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/settings/api-keys" className="cursor-pointer transition-[var(--transition-smooth)] hover:bg-[hsl(var(--muted)/0.5)]">API Keys</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/persona-resolver" className="cursor-pointer transition-[var(--transition-smooth)] hover:bg-[hsl(var(--muted)/0.5)]">Persona Resolver</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/threat-forecast" className="cursor-pointer transition-[var(--transition-smooth)] hover:bg-[hsl(var(--muted)/0.5)]">Threat Forecast</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Company */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-1">
                  Company
                  <ChevronDown className="w-3 h-3" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48 bg-card/95 backdrop-blur-sm">
                <DropdownMenuItem asChild>
                  <Link to="/partners" className="cursor-pointer transition-[var(--transition-smooth)] hover:bg-[hsl(var(--muted)/0.5)]">Partners</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/global-index" className="cursor-pointer transition-[var(--transition-smooth)] hover:bg-[hsl(var(--muted)/0.5)]">Global Index</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/resources" className="cursor-pointer transition-[var(--transition-smooth)] hover:bg-[hsl(var(--muted)/0.5)]">Resources</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/blog" className="cursor-pointer transition-[var(--transition-smooth)] hover:bg-[hsl(var(--muted)/0.5)]">Blog</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/help" className="cursor-pointer transition-[var(--transition-smooth)] hover:bg-[hsl(var(--muted)/0.5)]">Help Center</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/support" className="cursor-pointer transition-[var(--transition-smooth)] hover:bg-[hsl(var(--muted)/0.5)]">Support</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Account */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 transition-[var(--transition-smooth)] hover:scale-105">
                    <div className="relative">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center ring-2 ring-accent ring-offset-2 ring-offset-background">
                        <UserCircle className="w-5 h-5 text-white" />
                      </div>
                      {isPremium && (
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-accent rounded-full border-2 border-background" />
                      )}
                    </div>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-card/95 backdrop-blur-sm">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium truncate">{user.email}</p>
                      <p className="text-xs text-muted-foreground">
                        {isPremium ? "Pro Plan" : "Free Plan"}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard" className="cursor-pointer transition-[var(--transition-smooth)] hover:bg-[hsl(var(--muted)/0.5)]">
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  {isPremium && (
                    <DropdownMenuItem onClick={handleManageSubscription} className="cursor-pointer transition-[var(--transition-smooth)] hover:bg-[hsl(var(--muted)/0.5)]">
                      <CreditCard className="w-4 h-4 mr-2" />
                      Manage Subscription
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={async () => {
                      await supabase.auth.signOut();
                      navigate('/');
                    }} 
                    className="cursor-pointer transition-[var(--transition-smooth)] hover:bg-[hsl(var(--muted)/0.5)]"
                  >
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link
                to="/auth"
                className="text-sm text-muted-foreground hover:text-primary transition-[var(--transition-smooth)]"
              >
                Sign In
              </Link>
            )}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            {/* Search Bar */}
            {user && (
              <form onSubmit={handleSearch} className="relative">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Search scans..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 w-64 shadow-inner bg-secondary/50 border-border/50 focus:border-primary transition-[var(--transition-smooth)]"
                  />
                </div>
              </form>
            )}
            <ThemeToggle />
            <WorkspaceSwitcher />
            <WorkspacePresence />
            <CommandPalette />
            {user && <NotificationBell />}
            {!user && (
              <Button onClick={() => navigate('/auth')}>
                Get Started
              </Button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="md:hidden mt-4 pb-4 flex flex-col gap-4 animate-fade-in">
            {/* Mobile Search & Theme Toggle */}
            <div className="flex items-center gap-2">
              {user && (
                <form onSubmit={handleSearch} className="relative flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="Search scans..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 pr-4 w-full shadow-inner bg-secondary/50 border-border/50 focus:border-primary transition-[var(--transition-smooth)]"
                    />
                  </div>
                </form>
              )}
              <ThemeToggle />
            </div>

            {/* Product Section */}
            <div className="flex flex-col gap-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Product</p>
              <button
                onClick={() => scrollToSection('how-it-works')}
                className="text-left text-sm text-muted-foreground pl-2 transition-[var(--transition-smooth)] hover:bg-[hsl(var(--muted)/0.5)] hover:text-primary py-2 rounded"
              >
                How It Works
              </button>
              <button
                onClick={() => scrollToSection('features')}
                className="text-left text-sm text-muted-foreground pl-2 transition-[var(--transition-smooth)] hover:bg-[hsl(var(--muted)/0.5)] hover:text-primary py-2 rounded"
              >
                Features
              </button>
              <button
                onClick={() => scrollToSection('pricing')}
                className="text-left text-sm text-muted-foreground pl-2 transition-[var(--transition-smooth)] hover:bg-[hsl(var(--muted)/0.5)] hover:text-primary py-2 rounded"
              >
                Pricing
              </button>
            </div>

            {/* Tools Section */}
            <div className="flex flex-col gap-2 border-t pt-4">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Tools</p>
              <Link
                to="/dashboard"
                className="text-sm text-muted-foreground pl-2 py-2 rounded transition-[var(--transition-smooth)] hover:bg-[hsl(var(--muted)/0.5)] hover:text-primary"
                onClick={() => setMobileMenuOpen(false)}
              >
                Dashboard
              </Link>
              <Link
                to="/assistant"
                className="text-sm text-muted-foreground pl-2 py-2 rounded transition-[var(--transition-smooth)] hover:bg-[hsl(var(--muted)/0.5)] hover:text-primary"
                onClick={() => setMobileMenuOpen(false)}
              >
                AI Assistant
              </Link>
              <Link
                to="/cases"
                className="text-sm text-muted-foreground pl-2 py-2 rounded transition-[var(--transition-smooth)] hover:bg-[hsl(var(--muted)/0.5)] hover:text-primary"
                onClick={() => setMobileMenuOpen(false)}
              >
                Cases
              </Link>
              <Link
                to="/monitoring"
                className="text-sm text-muted-foreground pl-2 py-2 rounded transition-[var(--transition-smooth)] hover:bg-[hsl(var(--muted)/0.5)] hover:text-primary"
                onClick={() => setMobileMenuOpen(false)}
              >
                Monitoring
              </Link>
              <Link
                to="/reports"
                className="text-sm text-muted-foreground pl-2 py-2 rounded transition-[var(--transition-smooth)] hover:bg-[hsl(var(--muted)/0.5)] hover:text-primary"
                onClick={() => setMobileMenuOpen(false)}
              >
                Reports
              </Link>
              <Link
                to="/persona-resolver"
                className="text-sm text-muted-foreground pl-2 py-2 rounded transition-[var(--transition-smooth)] hover:bg-[hsl(var(--muted)/0.5)] hover:text-primary"
                onClick={() => setMobileMenuOpen(false)}
              >
                Persona Resolver
              </Link>
              <Link
                to="/threat-forecast"
                className="text-sm text-muted-foreground pl-2 py-2 rounded transition-[var(--transition-smooth)] hover:bg-[hsl(var(--muted)/0.5)] hover:text-primary"
                onClick={() => setMobileMenuOpen(false)}
              >
                Threat Forecast
              </Link>
            </div>

            {/* Company Section */}
            <div className="flex flex-col gap-2 border-t pt-4">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Company</p>
              <Link
                to="/partners"
                className="text-sm text-muted-foreground pl-2 py-2 rounded transition-[var(--transition-smooth)] hover:bg-[hsl(var(--muted)/0.5)] hover:text-primary"
                onClick={() => setMobileMenuOpen(false)}
              >
                Partners
              </Link>
              <Link
                to="/global-index"
                className="text-sm text-muted-foreground pl-2 py-2 rounded transition-[var(--transition-smooth)] hover:bg-[hsl(var(--muted)/0.5)] hover:text-primary"
                onClick={() => setMobileMenuOpen(false)}
              >
                Global Index
              </Link>
              <Link
                to="/resources"
                className="text-sm text-muted-foreground pl-2 py-2 rounded transition-[var(--transition-smooth)] hover:bg-[hsl(var(--muted)/0.5)] hover:text-primary"
                onClick={() => setMobileMenuOpen(false)}
              >
                Resources
              </Link>
              <Link
                to="/blog"
                className="text-sm text-muted-foreground pl-2 py-2 rounded transition-[var(--transition-smooth)] hover:bg-[hsl(var(--muted)/0.5)] hover:text-primary"
                onClick={() => setMobileMenuOpen(false)}
              >
                Blog
              </Link>
              <Link
                to="/support"
                className="text-sm text-muted-foreground pl-2 py-2 rounded transition-[var(--transition-smooth)] hover:bg-[hsl(var(--muted)/0.5)] hover:text-primary"
                onClick={() => setMobileMenuOpen(false)}
              >
                Support
              </Link>
            </div>

            {/* Account Section */}
            <div className="border-t pt-4">
              {user ? (
                <>
                  <div className="text-xs text-muted-foreground mb-3">
                    {user.email} ({isPremium ? "Pro" : "Free"})
                  </div>
                  <Link
                    to="/dashboard"
                    className="text-sm text-muted-foreground pl-2 py-2 rounded transition-[var(--transition-smooth)] hover:bg-[hsl(var(--muted)/0.5)] hover:text-primary block mb-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  {isPremium && (
                    <button
                      onClick={() => {
                        handleManageSubscription();
                        setMobileMenuOpen(false);
                      }}
                      className="text-left text-sm text-muted-foreground pl-2 py-2 rounded transition-[var(--transition-smooth)] hover:bg-[hsl(var(--muted)/0.5)] hover:text-primary block mb-2 w-full"
                    >
                      Manage Subscription
                    </button>
                  )}
                  <button
                    onClick={async () => {
                      await supabase.auth.signOut();
                      setMobileMenuOpen(false);
                      navigate('/');
                    }}
                    className="text-left text-sm text-muted-foreground pl-2 py-2 rounded transition-[var(--transition-smooth)] hover:bg-[hsl(var(--muted)/0.5)] hover:text-primary block w-full"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/auth"
                    className="text-sm text-muted-foreground pl-2 py-2 rounded transition-[var(--transition-smooth)] hover:bg-[hsl(var(--muted)/0.5)] hover:text-primary block mb-3"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                  <Button onClick={() => { navigate('/auth'); setMobileMenuOpen(false); }} className="w-full">
                    Get Started
                  </Button>
                </>
              )}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};
