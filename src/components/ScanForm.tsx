import { useState, useMemo, useCallback } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { ArrowRight, Shield, User, Mail, Sparkles } from "lucide-react";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { PhoneInput } from "@/components/scan/PhoneInput";
import { ProviderPanel } from "@/components/scan/ProviderPanel";
import { validatePhone } from "@/lib/phone/phoneUtils";
import { HighRiskOptInModal } from "@/components/scan/HighRiskOptInModal";
import { useTierGating } from "@/hooks/useTierGating";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";

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
  highRiskOptIn?: boolean; // High-Risk Intelligence opt-in
}

const scanFormSchema = z.object({
  firstName: z.string().trim().max(100, "First name must be less than 100 characters").optional(),
  lastName: z.string().trim().max(100, "Last name must be less than 100 characters").optional(),
  email: z.string().trim().email("Invalid email address").max(255, "Email must be less than 255 characters").optional().or(z.literal("")),
  phone: z.string().trim().max(20, "Phone number must be less than 20 characters").optional().or(z.literal("")),
  username: z.string().trim().min(1).max(50, "Username must be less than 50 characters").optional().or(z.literal("")),
}).refine(
  (data) => {
    // Must have at least one of: username or basic info (first name + last name + email)
    const hasUsername = !!data.username && data.username.length > 0;
    const hasBasicInfo = !!data.firstName && !!data.lastName && !!data.email && data.email.length > 0;
    return hasUsername || hasBasicInfo;
  },
  {
    message: "Please provide either a username or your basic information (name and email)",
  }
);

export const ScanForm = ({ onSubmit }: ScanFormProps) => {
  const [formData, setFormData] = useState<ScanFormData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    username: "",
    phoneProviders: [],
    highRiskOptIn: false,
  });
  const [phoneProviders, setPhoneProviders] = useState<string[]>([]);
  const [phoneValid, setPhoneValid] = useState(false);
  const [normalizedPhone, setNormalizedPhone] = useState<string | null>(null);
  const [showHighRiskModal, setShowHighRiskModal] = useState(false);
  const { toast } = useToast();
  const { isPro, isBusiness } = useTierGating();
  
  const canAccessHighRisk = isPro || isBusiness;

  // Check if phone number is valid and should show providers
  const showPhoneProviders = useMemo(() => {
    const phone = formData.phone?.trim() || "";
    const digitCount = phone.replace(/\D/g, "").length;
    return digitCount >= 7 && phoneValid;
  }, [formData.phone, phoneValid]);

  const handlePhoneChange = useCallback((value: string) => {
    setFormData((prev) => ({ ...prev, phone: value }));
  }, []);

  const handlePhoneValidChange = useCallback((isValid: boolean, normalized: string | null) => {
    setPhoneValid(isValid);
    setNormalizedPhone(normalized);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form with zod
    const result = scanFormSchema.safeParse(formData);
    
    if (!result.success) {
      const firstError = result.error.errors[0];
      toast({
        title: "Validation Error",
        description: firstError.message,
        variant: "destructive",
      });
      return;
    }

    // Validate phone if provided
    if (formData.phone && formData.phone.trim().length > 0) {
      const phoneValidation = validatePhone(formData.phone);
      if (!phoneValidation.isValid) {
        toast({
          title: "Invalid Phone Number",
          description: phoneValidation.error || "Please enter a valid phone number",
          variant: "destructive",
        });
        return;
      }
    }
    
    // Include phone providers if phone scan, use normalized phone
    const submitData = {
      ...result.data,
      phone: normalizedPhone || result.data.phone,
      phoneProviders: showPhoneProviders ? phoneProviders : undefined,
      highRiskOptIn: formData.highRiskOptIn,
    };
    
    onSubmit(submitData);
  };

  const handleHighRiskOptInChange = (optIn: boolean) => {
    setFormData(prev => ({ ...prev, highRiskOptIn: optIn }));
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
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              type="text"
              placeholder="Search social media profiles"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              className="bg-secondary border-border"
              maxLength={50}
            />
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">Or search by personal details</span>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                placeholder="John"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                className="bg-secondary border-border"
                maxLength={100}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                placeholder="Doe"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                className="bg-secondary border-border"
                maxLength={100}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="john.doe@example.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="bg-secondary border-border"
              maxLength={255}
            />
          </div>

          {/* Improved phone input */}
          <PhoneInput
            value={formData.phone || ""}
            onChange={handlePhoneChange}
            onValidChange={handlePhoneValidChange}
          />

          {/* Phone provider selector - only show when phone is valid */}
          {showPhoneProviders && (
            <ProviderPanel
              scanType="phone"
              selectedProviders={phoneProviders}
              onSelectionChange={setPhoneProviders}
            />
          )}

          <div className="pt-4 space-y-3">
            <Button 
              type="submit" 
              size="lg" 
              data-tour="scan-button"
              className="w-full"
            >
              Begin Scan
              <ArrowRight className="w-5 h-5" />
            </Button>
            
            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <Shield className="w-3 h-3 text-accent" />
              <span>We delete queries immediately after processing</span>
            </div>
          </div>

          <p className="text-xs text-muted-foreground text-center">
            Provide at least a username or your basic information. We respect your privacy - data is only used for the scan.
          </p>

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
