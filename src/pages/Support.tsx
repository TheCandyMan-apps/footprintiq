import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Upload, Mail, MessageSquare, Clock, Ticket, Save } from "lucide-react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useWorkspace } from "@/hooks/useWorkspace";

const supportSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100, "Name must be less than 100 characters"),
  email: z.string().trim().email("Invalid email address").max(255, "Email must be less than 255 characters"),
  issueType: z.string().min(1, "Please select an issue type"),
  priority: z.string().min(1, "Please select a priority"),
  subject: z.string().trim().min(1, "Subject is required").max(200, "Subject must be less than 200 characters"),
  message: z.string().trim().min(10, "Message must be at least 10 characters").max(2000, "Message must be less than 2000 characters"),
});

const RESPONSE_TIMES = {
  low: "2-3 business days",
  normal: "1-2 business days",
  high: "4-8 hours",
  urgent: "1-2 hours"
};

const Support = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [issueType, setIssueType] = useState("");
  const [priority, setPriority] = useState("normal");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [attachments, setAttachments] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [autoSaving, setAutoSaving] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { workspace } = useWorkspace();

  // Auto-save draft to sessionStorage (cleared when browser closes)
  useEffect(() => {
    const saveDraft = () => {
      if (name || email || subject || message) {
        setAutoSaving(true);
        sessionStorage.setItem('support_draft', JSON.stringify({
          name, email, issueType, priority, subject, message
        }));
        setTimeout(() => setAutoSaving(false), 1000);
      }
    };

    const timer = setTimeout(saveDraft, 2000);
    return () => clearTimeout(timer);
  }, [name, email, issueType, priority, subject, message]);

  // Load draft on mount
  useEffect(() => {
    const draft = sessionStorage.getItem('support_draft');
    if (draft) {
      try {
        const parsed = JSON.parse(draft);
        setName(parsed.name || "");
        setEmail(parsed.email || "");
        setIssueType(parsed.issueType || "");
        setPriority(parsed.priority || "normal");
        setSubject(parsed.subject || "");
        setMessage(parsed.message || "");
      } catch (e) {
        console.error('Failed to load draft:', e);
      }
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      
      // Validation constants
      const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB per file
      const MAX_FILES = 5;
      const ALLOWED_TYPES = [
        'image/jpeg', 'image/png', 'image/gif', 'image/webp',
        'application/pdf',
        'text/plain',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ];

      // Check number of files
      if (files.length > MAX_FILES) {
        toast({
          title: "Too Many Files",
          description: `Maximum ${MAX_FILES} files allowed`,
          variant: "destructive",
        });
        return;
      }

      // Validate each file
      for (const file of files) {
        if (file.size > MAX_FILE_SIZE) {
          toast({
            title: "File Too Large",
            description: `${file.name} exceeds 10MB limit`,
            variant: "destructive",
          });
          return;
        }

        if (!ALLOWED_TYPES.includes(file.type)) {
          toast({
            title: "Invalid File Type",
            description: `${file.name} type not allowed. Accepted: images, PDF, Word documents`,
            variant: "destructive",
          });
          return;
        }

        // Check for invalid characters in filename
        const sanitized = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
        if (sanitized !== file.name) {
          toast({
            title: "Invalid Filename",
            description: `${file.name} contains invalid characters. Only letters, numbers, dots, dashes and underscores allowed`,
            variant: "destructive",
          });
          return;
        }
      }
      
      setAttachments(files);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    const result = supportSchema.safeParse({
      name,
      email,
      issueType,
      priority,
      subject,
      message,
    });

    if (!result.success) {
      const firstError = result.error.errors[0];
      toast({
        title: "Validation Error",
        description: firstError.message,
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Get current user - REQUIRED for ticket creation
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to submit a support ticket.",
          variant: "destructive",
        });
        navigate('/auth');
        return;
      }

      // Upload attachments if any
      const uploadedFiles: string[] = [];
      for (const file of attachments) {
        // Sanitize filename
        const sanitizeFilename = (filename: string): string => {
          let safe = filename.replace(/[\\/]/g, '_');
          safe = safe.replace(/[^a-zA-Z0-9._-]/g, '_');
          const ext = safe.split('.').pop() || '';
          const name = safe.substring(0, safe.lastIndexOf('.')) || safe;
          return `${name.substring(0, 100)}.${ext}`;
        };

        // Use user-scoped folder path
        const sanitizedName = sanitizeFilename(file.name);
        const fileName = `${user.id}/support/${Date.now()}-${sanitizedName}`;
        
        const { error: uploadError, data } = await supabase.storage
          .from('scan-images')
          .upload(fileName, file);
        
        if (!uploadError && data) {
          const { data: { publicUrl } } = supabase.storage
            .from('scan-images')
            .getPublicUrl(data.path);
          uploadedFiles.push(publicUrl);
        } else if (uploadError) {
          console.warn('File upload error:', uploadError);
        }
      }

      // Use workspace from hook
      const workspaceId = workspace?.id || null;

      // Create support ticket
      const { data: ticket, error: insertError } = await supabase
        .from('support_tickets')
        .insert({
          workspace_id: workspaceId,
          user_id: user.id,
          created_by: user.id,
          category: result.data.issueType,
          priority: result.data.priority,
          subject: result.data.subject,
          description: result.data.message,
          status: 'open'
        })
        .select('id, ticket_number')
        .single();

      if (insertError) {
        console.error('Ticket creation error:', insertError);
        throw new Error(insertError.message || 'Failed to create support ticket');
      }

      if (!ticket) {
        throw new Error('Ticket created but no data returned');
      }

      // Clear form and draft
      sessionStorage.removeItem('support_draft');
      setName('');
      setEmail('');
      setIssueType('');
      setPriority('normal');
      setSubject('');
      setMessage('');
      setAttachments([]);
      
      toast({
        title: "Ticket Submitted Successfully",
        description: `Your support ticket #${ticket.ticket_number} has been created. Expected response: ${RESPONSE_TIMES[result.data.priority as keyof typeof RESPONSE_TIMES]}.`,
      });

      navigate('/support-confirmation', { 
        state: { ticketNumber: ticket.ticket_number }
      });

    } catch (error) {
      console.error('Support ticket submission error:', error);
      toast({
        title: "Submission Failed",
        description: error instanceof Error ? error.message : "Failed to submit support ticket. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="max-w-4xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <MessageSquare className="w-12 h-12 text-primary" />
          </div>
          <h1 className="text-4xl font-bold mb-4">Support Center</h1>
          <p className="text-lg text-muted-foreground">
            Need help? We're here to assist you. Fill out the form below and we'll get back to you as soon as possible.
          </p>
          <Button
            variant="outline"
            onClick={() => navigate('/my-tickets')}
            className="mt-4"
          >
            <Ticket className="w-4 h-4 mr-2" />
            View My Tickets
          </Button>
        </div>

        <Card className="p-8 bg-gradient-card border-border shadow-card">
          {autoSaving && (
            <Alert className="mb-4">
              <Save className="w-4 h-4" />
              <AlertDescription>Draft saved automatically</AlertDescription>
            </Alert>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  required
                  maxLength={100}
                />
              </div>

              <div>
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="john@example.com"
                  required
                  maxLength={255}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="issueType">Issue Type *</Label>
                <Select value={issueType} onValueChange={setIssueType} required>
                  <SelectTrigger id="issueType">
                    <SelectValue placeholder="Select an issue type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="technical">Technical Issue</SelectItem>
                    <SelectItem value="billing">Billing & Payments</SelectItem>
                    <SelectItem value="account">Account Access</SelectItem>
                    <SelectItem value="scan">Scan Results</SelectItem>
                    <SelectItem value="privacy">Privacy Concerns</SelectItem>
                    <SelectItem value="removal">Data Removal Request</SelectItem>
                    <SelectItem value="feature">Feature Request</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="priority">Priority *</Label>
                <Select value={priority} onValueChange={setPriority} required>
                  <SelectTrigger id="priority">
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low - General inquiry</SelectItem>
                    <SelectItem value="normal">Normal - Standard issue</SelectItem>
                    <SelectItem value="high">High - Important issue</SelectItem>
                    <SelectItem value="urgent">Urgent - Critical issue</SelectItem>
                  </SelectContent>
                </Select>
                {priority && (
                  <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Est. response: {RESPONSE_TIMES[priority as keyof typeof RESPONSE_TIMES]}
                  </p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="subject">Subject *</Label>
              <Input
                id="subject"
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Brief description of your issue"
                required
                maxLength={200}
              />
            </div>

            <div>
              <Label htmlFor="message">Message *</Label>
              <Textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Please provide as much detail as possible about your issue..."
                required
                className="min-h-[200px]"
                maxLength={2000}
              />
              <p className="text-xs text-muted-foreground mt-2">
                {message.length}/2000 characters
              </p>
            </div>

            <div>
              <Label htmlFor="attachments">Attachments (Optional)</Label>
              <div className="mt-2">
                <Input
                  id="attachments"
                  type="file"
                  multiple
                  onChange={handleFileChange}
                  accept="image/*,.pdf,.doc,.docx"
                  className="cursor-pointer"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  <Upload className="w-3 h-3 inline mr-1" />
                  Max 10MB total. Accepted: images, PDF, Word documents
                </p>
                {attachments.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {attachments.map((file, idx) => (
                      <p key={idx} className="text-xs text-muted-foreground">
                        • {file.name} ({(file.size / 1024).toFixed(1)} KB)
                      </p>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Sending..." : "Send Message"}
            </Button>
          </form>

          <div className="mt-8 pt-8 border-t border-border">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Mail className="w-4 h-4" />
              <span>
                Or email us directly at{" "}
                <a href="mailto:support@footprintiq.app" className="text-primary hover:underline">
                  support@footprintiq.app
                </a>
              </span>
            </div>
          </div>
        </Card>
      </main>

      <Footer />
    </div>
  );
};

export default Support;
