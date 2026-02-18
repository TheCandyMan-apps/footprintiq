import { useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowRight, Mail, Phone, User, UserCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { analytics } from "@/lib/analytics";

type DetectedType = "email" | "phone" | "name" | "username";

function detectType(input: string): DetectedType {
  const trimmed = input.trim();
  if (!trimmed) return "username";
  
  // Email: contains @ with a valid domain pattern
  if (/@.+\..+/.test(trimmed)) {
    return "email";
  }
  
  // Phone: starts with + OR is primarily numeric
  const digits = trimmed.replace(/\D/g, '');
  const isPhoneLike = trimmed.startsWith('+') || 
    (digits.length >= 7 && /^[\d\s\-().+]+$/.test(trimmed));
  if (isPhoneLike) {
    return "phone";
  }
  
  // Name: contains whitespace
  if (/\s/.test(trimmed)) {
    return "name";
  }
  
  return "username";
}

const TYPE_INDICATORS: Record<DetectedType, { icon: React.ReactNode; label: string; color: string }> = {
  email: {
    icon: <Mail className="h-3 w-3" />,
    label: "Email",
    color: "text-green-400 bg-green-500/10 border-green-500/30"
  },
  phone: {
    icon: <Phone className="h-3 w-3" />,
    label: "Phone",
    color: "text-blue-400 bg-blue-500/10 border-blue-500/30"
  },
  name: {
    icon: <UserCircle className="h-3 w-3" />,
    label: "Name",
    color: "text-purple-400 bg-purple-500/10 border-purple-500/30"
  },
  username: {
    icon: <User className="h-3 w-3" />,
    label: "Username",
    color: "text-muted-foreground bg-muted/50 border-border"
  }
};

interface HeroInputFieldProps {
  className?: string;
}

export function HeroInputField({ className }: HeroInputFieldProps) {
  const [identifier, setIdentifier] = useState("");
  const navigate = useNavigate();

  const detectedType = useMemo((): DetectedType | null => {
    const trimmed = identifier.trim();
    if (!trimmed) return null;
    return detectType(trimmed);
  }, [identifier]);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = identifier.trim();
    if (!trimmed) return;
    
    const type = detectType(trimmed);
    analytics.trackEvent('hero_scan_start', { type });
    
    // Route to anonymous free scan page — no auth required
    // Non-username types will prompt signup on that page
    navigate(`/free-scan?q=${encodeURIComponent(trimmed)}`);
  }, [identifier, navigate]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={cn("w-full", className)}>
      <div className="flex flex-col sm:flex-row gap-3 max-w-xl mx-auto">
        <div className="relative flex-1">
          <Input
            type="text"
            placeholder="Enter username, email, or phone"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            onKeyDown={handleKeyDown}
            className="h-14 text-base sm:text-lg px-5 pr-24 bg-background border-2 border-border focus:border-primary rounded-xl"
            aria-label="digital footprint scanner input"
            maxLength={255}
            autoCorrect="off"
            autoCapitalize="off"
          />
          {detectedType && (
            <div className={cn(
              "absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium transition-all",
              TYPE_INDICATORS[detectedType].color
            )}>
              {TYPE_INDICATORS[detectedType].icon}
              <span>{TYPE_INDICATORS[detectedType].label}</span>
            </div>
          )}
        </div>
        <Button 
          type="submit" 
          size="lg"
          disabled={!identifier.trim()}
          className="h-14 px-8 text-lg rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm active:scale-[0.97] transition-transform"
        >
          Check Now
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
      </div>
    </form>
  );
}
