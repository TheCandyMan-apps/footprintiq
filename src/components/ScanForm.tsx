import { useState, useCallback, useRef, useMemo } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { ArrowRight, Shield, User, Mail, AlertCircle, ChevronDown, ChevronUp, Phone, UserCircle, Info } from "lucide-react";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { PhoneInput } from "@/components/scan/PhoneInput";
import { validatePhone } from "@/lib/phone/phoneUtils";
import { TurnstileWidget, type TurnstileWidgetRef } from "@/components/security/TurnstileWidget";
import { useTurnstileRequired } from "@/hooks/useTurnstileRequired";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { detectIdentifierType, type IdentifierType, getIdentifierLabel } from "@/lib/scan/identifierDetection";
import { analytics } from "@/lib/analytics";
import { cn } from "@/lib/utils";

interface ScanFormProps {
  onSubmit: (data: ScanFormData) => void;
}

export interface ScanFormData {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  username?: string;
  phoneProviders?: string[];
  highRiskOptIn?: boolean;
  turnstile_token?: string;
}

// Schema for advanced/refined fields
const advancedFieldsSchema = z.object({
  firstName: z.string().trim().max(100, "First name must be less than 100 characters").optional(),
  lastName: z.string().trim().max(100, "Last name must be less than 100 characters").optional(),
  email: z.string().trim().email("Invalid email address").max(255, "Email must be less than 255 characters").optional().or(z.literal("")),
  phone: z.string().trim().max(20, "Phone number must be less than 20 characters").optional().or(z.literal("")),
});

export const ScanForm = ({ onSubmit }: ScanFormProps) => {
  // Primary single input
  const [identifier, setIdentifier] = useState("");
  
  // Refine section state
  const [showRefine, setShowRefine] = useState(false);
  const [advancedFields, setAdvancedFields] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });
  
  // Phone validation state (for advanced fields)
  const [phoneValid, setPhoneValid] = useState(false);
  const [normalizedPhone, setNormalizedPhone] = useState<string | null>(null);
  
  const { toast } = useToast();
  
  // Turnstile state
  const turnstileRef = useRef<TurnstileWidgetRef>(null);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [turnstileError, setTurnstileError] = useState<string | null>(null);
  const { required: requiresTurnstile } = useTurnstileRequired();

  // Live detection of identifier type for user feedback
  const detectedType = useMemo(() => {
    const trimmed = identifier.trim();
    if (!trimmed) return null;
    return detectIdentifierType(trimmed);
  }, [identifier]);

  // Format hints for each type
  const formatHints: Record<IdentifierType, { icon: React.ReactNode; hint: string; example: string }> = {
    email: {
      icon: <Mail className="h-3.5 w-3.5" />,
      hint: 'Email detected',
      example: 'e.g., john.doe@gmail.com'
    },
    phone: {
      icon: <Phone className="h-3.5 w-3.5" />,
      hint: 'Phone detected',
      example: 'Include country code: +1 555 123 4567'
    },
    fullname: {
      icon: <UserCircle className="h-3.5 w-3.5" />,
      hint: 'Full name detected',
      example: 'e.g., John Doe'
    },
    username: {
      icon: <User className="h-3.5 w-3.5" />,
      hint: 'Username detected',
      example: 'e.g., johndoe123'
    }
  };

  const handlePhoneChange = useCallback((value: string) => {
    setAdvancedFields((prev) => ({ ...prev, phone: value }));
  }, []);

  const handlePhoneValidChange = useCallback((isValid: boolean, normalized: string | null) => {
    setPhoneValid(isValid);
    setNormalizedPhone(normalized);
  }, []);

  const handleRefineToggle = (open: boolean) => {
    setShowRefine(open);
    if (open) {
      analytics.scanRefineOpen();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Fire analytics for click
    analytics.scanStartClick();
    
    // Clear previous turnstile error
    setTurnstileError(null);
    
    // Validate Turnstile token if required
    if (requiresTurnstile && !turnstileToken) {
      setTurnstileError('Please complete the verification to continue.');
      return;
    }
    
    const trimmedIdentifier = identifier.trim();
    
    // Check if we have any input
    const hasIdentifier = trimmedIdentifier.length > 0;
    const hasAdvancedInput = showRefine && (
      advancedFields.firstName.trim() ||
      advancedFields.lastName.trim() ||
      advancedFields.email.trim() ||
      advancedFields.phone.trim()
    );
    
    if (!hasIdentifier && !hasAdvancedInput) {
      toast({
        title: "Missing Input",
        description: "Please enter an identifier to search",
        variant: "destructive",
      });
      return;
    }
    
    // Build submit data
    let submitData: ScanFormData = {};
    let detectedType: IdentifierType = 'username';
    
    if (hasIdentifier) {
      const detection = detectIdentifierType(trimmedIdentifier);
      detectedType = detection.type;
      
      switch (detection.type) {
        case 'email':
          submitData.email = detection.normalized.email;
          break;
        case 'phone':
          // Validate the phone number
          const phoneValidation = validatePhone(trimmedIdentifier);
          if (!phoneValidation.isValid) {
            toast({
              title: "Invalid Phone Number",
              description: phoneValidation.error || "Please enter a valid phone number",
              variant: "destructive",
            });
            return;
          }
          submitData.phone = phoneValidation.normalized || trimmedIdentifier;
          break;
        case 'fullname':
          submitData.firstName = detection.normalized.firstName;
          submitData.lastName = detection.normalized.lastName;
          break;
        case 'username':
        default:
          submitData.username = detection.normalized.username;
          break;
      }
    }
    
    // Merge advanced fields if Refine was used
    if (showRefine) {
      // Validate advanced fields
      const advancedResult = advancedFieldsSchema.safeParse(advancedFields);
      if (!advancedResult.success) {
        const firstError = advancedResult.error.errors[0];
        toast({
          title: "Validation Error",
          description: firstError.message,
          variant: "destructive",
        });
        return;
      }
      
      // Validate phone in advanced fields if provided
      if (advancedFields.phone && advancedFields.phone.trim().length > 0) {
        const phoneValidation = validatePhone(advancedFields.phone);
        if (!phoneValidation.isValid) {
          toast({
            title: "Invalid Phone Number",
            description: phoneValidation.error || "Please enter a valid phone number",
            variant: "destructive",
          });
          return;
        }
      }
      
      // Override/merge with advanced fields (only non-empty values)
      if (advancedFields.firstName.trim()) {
        submitData.firstName = advancedFields.firstName.trim();
      }
      if (advancedFields.lastName.trim()) {
        submitData.lastName = advancedFields.lastName.trim();
      }
      if (advancedFields.email.trim()) {
        submitData.email = advancedFields.email.trim();
      }
      if (advancedFields.phone.trim()) {
        submitData.phone = normalizedPhone || advancedFields.phone.trim();
      }
    }
    
    // Add turnstile token if present
    if (turnstileToken) {
      submitData.turnstile_token = turnstileToken;
    }
    
    // Fire submit analytics
    analytics.scanSubmit(detectedType);
    
    onSubmit(submitData);
    
    // Reset Turnstile after successful submit
    setTurnstileToken(null);
    turnstileRef.current?.reset();
  };

  const handleTurnstileToken = useCallback((token: string) => {
    setTurnstileToken(token);
    setTurnstileError(null);
  }, []);

  const handleTurnstileError = useCallback((error: string) => {
    setTurnstileToken(null);
    setTurnstileError(error);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit(e);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-20">
      <Card className="w-full max-w-2xl p-8 bg-gradient-card border-border shadow-card">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-3">Start Your Digital Footprint Scan</h2>
          <p className="text-muted-foreground">
            Search by username or personal details to find your online presence
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Single Input Field */}
          <div className="space-y-3">
            <Label htmlFor="identifier" className="sr-only">
              Search identifier
            </Label>
            <Input
              id="identifier"
              type="text"
              placeholder="Username, email, phone number, or full name"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              onKeyDown={handleKeyDown}
              className="h-12 text-lg bg-secondary border-border"
              maxLength={255}
              autoFocus
              data-tour="scan-input"
            />
            
            {/* Dynamic type detection hint */}
            {detectedType ? (
              <div className={cn(
                "flex items-center gap-2 text-xs px-3 py-2 rounded-lg transition-all",
                detectedType.type === 'phone' ? "bg-blue-500/10 text-blue-400 border border-blue-500/20" :
                detectedType.type === 'email' ? "bg-green-500/10 text-green-400 border border-green-500/20" :
                detectedType.type === 'fullname' ? "bg-purple-500/10 text-purple-400 border border-purple-500/20" :
                "bg-muted/50 text-muted-foreground border border-border"
              )}>
                {formatHints[detectedType.type].icon}
                <span className="font-medium">{formatHints[detectedType.type].hint}</span>
                <span className="text-muted-foreground">—</span>
                <span className="opacity-80">{formatHints[detectedType.type].example}</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-xs text-muted-foreground px-3 py-2 rounded-lg bg-muted/30 border border-border/50">
                <Info className="h-3.5 w-3.5" />
                <span>
                  <strong>Phone format:</strong> Include country code (+1, +44, etc.) for best results
                </span>
              </div>
            )}
          </div>

          {/* Turnstile verification - de-emphasized */}
          {requiresTurnstile && (
            <div className="space-y-2 opacity-90">
              <TurnstileWidget
                ref={turnstileRef}
                onToken={handleTurnstileToken}
                onError={handleTurnstileError}
                theme="dark"
                action="scan-start"
                inline
              />
              {turnstileError && (
                <div className="flex items-center gap-2 text-destructive text-sm">
                  <AlertCircle className="h-4 w-4" />
                  <span>{turnstileError}</span>
                </div>
              )}
            </div>
          )}

          {/* Primary CTA */}
          <Button 
            type="submit" 
            size="lg" 
            data-tour="scan-button"
            className="w-full"
          >
            Run free scan
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>

          {/* Helper Text */}
          <p className="text-xs text-muted-foreground text-center">
            We only use public sources. Queries are discarded after processing.
          </p>

          {/* Refine Section */}
          <div className="flex justify-center">
            <Collapsible open={showRefine} onOpenChange={handleRefineToggle}>
              <CollapsibleTrigger asChild>
                <Button 
                  type="button" 
                  variant="link" 
                  size="sm" 
                  className="text-muted-foreground hover:text-foreground"
                >
                  {showRefine ? (
                    <>
                      <ChevronUp className="w-4 h-4 mr-1" />
                      Hide refine options
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-4 h-4 mr-1" />
                      Refine search options
                    </>
                  )}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="pt-6 space-y-4 w-full">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      placeholder="John"
                      value={advancedFields.firstName}
                      onChange={(e) => setAdvancedFields({ ...advancedFields, firstName: e.target.value })}
                      className="bg-secondary border-border"
                      maxLength={100}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      placeholder="Doe"
                      value={advancedFields.lastName}
                      onChange={(e) => setAdvancedFields({ ...advancedFields, lastName: e.target.value })}
                      className="bg-secondary border-border"
                      maxLength={100}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="advancedEmail">Email Address</Label>
                  <Input
                    id="advancedEmail"
                    type="email"
                    placeholder="john.doe@example.com"
                    value={advancedFields.email}
                    onChange={(e) => setAdvancedFields({ ...advancedFields, email: e.target.value })}
                    className="bg-secondary border-border"
                    maxLength={255}
                  />
                </div>

                <PhoneInput
                  value={advancedFields.phone}
                  onChange={handlePhoneChange}
                  onValidChange={handlePhoneValidChange}
                />
              </CollapsibleContent>
            </Collapsible>
          </div>

          {/* Related Tools Links */}
          <div className="pt-4 border-t border-border">
            <p className="text-xs text-muted-foreground text-center mb-3">
              Or try our focused search tools:
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Button asChild variant="ghost" size="sm" className="text-xs">
                <Link to="/username-search">
                  <User className="w-3 h-3 mr-1" />
                  Username Search
                </Link>
              </Button>
              <Button asChild variant="ghost" size="sm" className="text-xs">
                <Link to="/email-breach-check">
                  <Mail className="w-3 h-3 mr-1" />
                  Email Breach Check
                </Link>
              </Button>
            </div>
          </div>
        </form>
      </Card>
    </div>
  );
};
