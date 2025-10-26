import { Shield, Menu, X, User, CreditCard, ChevronDown } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
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

export const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { user, isPremium } = useSubscription();
  const { toast } = useToast();

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
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-primary" />
            <span className="text-xl font-bold">footprintiq</span>
          </Link>

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
                <DropdownMenuItem onClick={() => scrollToSection('how-it-works')} className="cursor-pointer">
                  How It Works
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => scrollToSection('features')} className="cursor-pointer">
                  Features
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => scrollToSection('pricing')} className="cursor-pointer">
                  Pricing
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
                  <Link to="/dashboard" className="cursor-pointer">Dashboard</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/graph" className="cursor-pointer">Entity Graph</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/search" className="cursor-pointer">Search Entities</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/ai-analyst" className="cursor-pointer">AI Analyst</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/assistant" className="cursor-pointer">AI Assistant</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/cases" className="cursor-pointer">Cases</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/monitoring" className="cursor-pointer">Monitoring</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/reports" className="cursor-pointer">Reports</Link>
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
                  <Link to="/partners" className="cursor-pointer">Partners</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/global-index" className="cursor-pointer">Global Index</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/resources" className="cursor-pointer">Resources</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/blog" className="cursor-pointer">Blog</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/support" className="cursor-pointer">Support</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Account */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-1">
                    <User className="w-4 h-4" />
                    Account
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
                    <Link to="/dashboard" className="cursor-pointer">
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  {isPremium && (
                    <DropdownMenuItem onClick={handleManageSubscription} className="cursor-pointer">
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
                    className="cursor-pointer"
                  >
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link
                to="/auth"
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Sign In
              </Link>
            )}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <CommandPalette />
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
          <nav className="md:hidden mt-4 pb-4 flex flex-col gap-4">
            {/* Product Section */}
            <div className="flex flex-col gap-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Product</p>
              <button
                onClick={() => scrollToSection('how-it-works')}
                className="text-left text-sm text-muted-foreground hover:text-primary transition-colors pl-2"
              >
                How It Works
              </button>
              <button
                onClick={() => scrollToSection('features')}
                className="text-left text-sm text-muted-foreground hover:text-primary transition-colors pl-2"
              >
                Features
              </button>
              <button
                onClick={() => scrollToSection('pricing')}
                className="text-left text-sm text-muted-foreground hover:text-primary transition-colors pl-2"
              >
                Pricing
              </button>
            </div>

            {/* Tools Section */}
            <div className="flex flex-col gap-2 border-t pt-4">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Tools</p>
              <Link
                to="/dashboard"
                className="text-sm text-muted-foreground hover:text-primary transition-colors pl-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Dashboard
              </Link>
              <Link
                to="/assistant"
                className="text-sm text-muted-foreground hover:text-primary transition-colors pl-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                AI Assistant
              </Link>
              <Link
                to="/cases"
                className="text-sm text-muted-foreground hover:text-primary transition-colors pl-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Cases
              </Link>
              <Link
                to="/monitoring"
                className="text-sm text-muted-foreground hover:text-primary transition-colors pl-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Monitoring
              </Link>
              <Link
                to="/reports"
                className="text-sm text-muted-foreground hover:text-primary transition-colors pl-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Reports
              </Link>
            </div>

            {/* Company Section */}
            <div className="flex flex-col gap-2 border-t pt-4">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Company</p>
              <Link
                to="/partners"
                className="text-sm text-muted-foreground hover:text-primary transition-colors pl-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Partners
              </Link>
              <Link
                to="/global-index"
                className="text-sm text-muted-foreground hover:text-primary transition-colors pl-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Global Index
              </Link>
              <Link
                to="/resources"
                className="text-sm text-muted-foreground hover:text-primary transition-colors pl-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Resources
              </Link>
              <Link
                to="/blog"
                className="text-sm text-muted-foreground hover:text-primary transition-colors pl-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Blog
              </Link>
              <Link
                to="/support"
                className="text-sm text-muted-foreground hover:text-primary transition-colors pl-2"
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
                    className="text-sm text-muted-foreground hover:text-primary transition-colors block mb-2"
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
                      className="text-left text-sm text-muted-foreground hover:text-primary transition-colors block mb-2"
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
                    className="text-left text-sm text-muted-foreground hover:text-primary transition-colors block"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/auth"
                    className="text-sm text-muted-foreground hover:text-primary transition-colors block mb-3"
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
