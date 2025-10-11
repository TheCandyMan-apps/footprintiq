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
  username?: string;
}

export const ScanForm = ({ onSubmit }: ScanFormProps) => {
  const [formData, setFormData] = useState<ScanFormData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    username: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if at least username or basic info is provided
    if (!formData.username && (!formData.firstName || !formData.lastName || !formData.email)) {
      alert("Please provide either a username or your basic information (name and email)");
      return;
    }
    
    onSubmit(formData);
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
            Provide at least a username or your basic information. We respect your privacy - data is only used for the scan.
          </p>
        </form>
      </Card>
    </div>
  );
};
