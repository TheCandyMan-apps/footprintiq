import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Shield } from "lucide-react";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { useSubscription } from "@/hooks/useSubscription";
import { useNavigate } from "react-router-dom";

interface ScanFormProps {
  onSubmit: (data: ScanFormData) => void;
}

export interface ScanFormData {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  username?: string;
}

const scanFormSchema = z.object({
  firstName: z.string().trim().max(100, "First name must be less than 100 characters").optional(),
  lastName: z.string().trim().max(100, "Last name must be less than 100 characters").optional(),
  email: z.string().trim().email("Invalid email address").max(255, "Email must be less than 255 characters").optional().or(z.literal("")),
  phone: z.string().trim().regex(/^[\d\s\+\-\(\)]*$/, "Invalid phone number format").max(20, "Phone number must be less than 20 characters").optional().or(z.literal("")),
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
  });
  const { toast } = useToast();


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
    
    onSubmit(result.data);
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

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="+1 (555) 000-0000"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="bg-secondary border-border"
              maxLength={20}
            />
          </div>

          <div className="pt-4 space-y-3">
            <Button 
              type="submit" 
              size="lg" 
              variant="hero"
              data-tour="scan-button"
              className="w-full text-lg"
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
        </form>
      </Card>
    </div>
  );
};