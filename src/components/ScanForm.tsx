import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Upload, X, Shield, Crown, Lock } from "lucide-react";
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
  imageFile?: File;
}

const scanFormSchema = z.object({
  firstName: z.string().trim().max(100, "First name must be less than 100 characters").optional(),
  lastName: z.string().trim().max(100, "Last name must be less than 100 characters").optional(),
  email: z.string().trim().email("Invalid email address").max(255, "Email must be less than 255 characters").optional().or(z.literal("")),
  phone: z.string().trim().regex(/^[\d\s\+\-\(\)]*$/, "Invalid phone number format").max(20, "Phone number must be less than 20 characters").optional().or(z.literal("")),
  username: z.string().trim().min(1).max(50, "Username must be less than 50 characters").optional().or(z.literal("")),
  imageFile: z.instanceof(File).optional(),
}).refine(
  (data) => {
    // Must have at least one of: image, username, or basic info (first name + last name + email)
    const hasImage = !!data.imageFile;
    const hasUsername = !!data.username && data.username.length > 0;
    const hasBasicInfo = !!data.firstName && !!data.lastName && !!data.email && data.email.length > 0;
    return hasImage || hasUsername || hasBasicInfo;
  },
  {
    message: "Please provide either an image, a username, or your basic information (name and email)",
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
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const { toast } = useToast();
  const { isPremium } = useSubscription();
  const navigate = useNavigate();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isPremium) {
      toast({
        title: "Premium Feature",
        description: "Profile photo reverse search requires a Pro plan. Upgrade to unlock this feature.",
        variant: "default",
      });
      return;
    }

    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File Too Large",
          description: "Image must be under 10MB",
          variant: "destructive",
        });
        return;
      }
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid File Type",
          description: "Please upload an image file",
          variant: "destructive",
        });
        return;
      }
      
      setFormData({ ...formData, imageFile: file });
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setFormData({ ...formData, imageFile: undefined });
    setImagePreview(null);
  };

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
            Search by image, username, or personal details to find your online presence
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div data-tour="search-input" className="space-y-2">
            <div className="flex items-center gap-2">
              <Label htmlFor="image">Profile Photo (Optional)</Label>
              {!isPremium && (
                <Badge variant="secondary" className="text-xs">
                  <Crown className="w-3 h-3 mr-1" />
                  Pro
                </Badge>
              )}
            </div>
            <div className="flex flex-col gap-3">
              {!imagePreview ? (
                <div className="relative">
                  <label 
                    htmlFor="image"
                    className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-lg transition-colors ${
                      isPremium ? 'cursor-pointer bg-secondary hover:bg-secondary/80' : 'cursor-not-allowed bg-secondary/50 opacity-60'
                    }`}
                  >
                    {isPremium ? (
                      <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
                    ) : (
                      <Lock className="w-8 h-8 mb-2 text-muted-foreground" />
                    )}
                    <span className="text-sm text-muted-foreground">
                      {isPremium ? 'Click to upload profile photo' : 'Reverse image search - Pro feature'}
                    </span>
                    <span className="text-xs text-muted-foreground mt-1">
                      {isPremium ? 'PNG, JPG up to 10MB' : 'Upgrade to unlock face recognition'}
                    </span>
                    <Input
                      id="image"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                      disabled={!isPremium}
                    />
                  </label>
                  {!isPremium && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Button
                        type="button"
                        variant="default"
                        size="sm"
                        onClick={() => navigate('/pricing')}
                        className="shadow-lg"
                      >
                        <Crown className="w-4 h-4 mr-2" />
                        Upgrade to Pro
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="relative w-full h-32 border-2 border-border rounded-lg overflow-hidden">
                  <img 
                    src={imagePreview} 
                    alt="Preview" 
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute top-2 right-2 p-1 bg-destructive text-destructive-foreground rounded-full hover:bg-destructive/90 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">Or search by username</span>
            </div>
          </div>

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
            Provide at least an image, a username, or your basic information. We respect your privacy - data is only used for the scan.
          </p>
        </form>
      </Card>
    </div>
  );
};