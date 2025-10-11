import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";

interface ScanFormProps {
  onSubmit: (data: ScanFormData) => void;
}

export interface ScanFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
}

export const ScanForm = ({ onSubmit }: ScanFormProps) => {
  const [formData, setFormData] = useState<ScanFormData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-20">
      <Card className="w-full max-w-2xl p-8 bg-gradient-card border-border shadow-card">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-3">Start Your Digital Footprint Scan</h2>
          <p className="text-muted-foreground">
            Enter your information to see where your data appears online
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                placeholder="John"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                required
                className="bg-secondary border-border"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                placeholder="Doe"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                required
                className="bg-secondary border-border"
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
              required
              className="bg-secondary border-border"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number (Optional)</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="+1 (555) 000-0000"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="bg-secondary border-border"
            />
          </div>

          <div className="pt-4">
            <Button 
              type="submit" 
              size="lg" 
              variant="hero"
              className="w-full text-lg"
            >
              Begin Scan
              <ArrowRight className="w-5 h-5" />
            </Button>
          </div>

          <p className="text-xs text-muted-foreground text-center">
            We respect your privacy. Your information is only used for the scan and is not stored or shared.
          </p>
        </form>
      </Card>
    </div>
  );
};
