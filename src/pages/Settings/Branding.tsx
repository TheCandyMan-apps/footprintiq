import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Upload, Image as ImageIcon, FileText, ArrowLeft, Save } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ReportTemplateSelector, ReportTemplate, TemplateOptions } from '@/components/settings/ReportTemplateSelector';

interface BrandingSettings {
  company_name: string;
  company_tagline: string;
  logo_url: string | null;
  primary_color: string;
  secondary_color: string;
  footer_text: string;
  contact_email: string;
  website_url: string;
  report_template: ReportTemplate;
  template_options: TemplateOptions;
}

const defaultTemplateOptions: TemplateOptions = {
  show_executive_summary: true,
  show_provider_breakdown: true,
  show_risk_analysis: true,
  show_timeline: false,
  show_detailed_findings: true,
};

export default function BrandingSettings() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [settings, setSettings] = useState<BrandingSettings>({
    company_name: '',
    company_tagline: '',
    logo_url: null,
    primary_color: '#667eea',
    secondary_color: '#10b981',
    footer_text: 'Confidential - For authorized use only',
    contact_email: '',
    website_url: '',
    report_template: 'executive',
    template_options: defaultTemplateOptions,
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('pdf_branding_settings')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setSettings({
          company_name: data.company_name || '',
          company_tagline: data.company_tagline || '',
          logo_url: data.logo_url || null,
          primary_color: data.primary_color || '#667eea',
          secondary_color: data.secondary_color || '#10b981',
          footer_text: data.footer_text || 'Confidential - For authorized use only',
          contact_email: data.contact_email || '',
          website_url: data.website_url || '',
          report_template: (data.report_template as ReportTemplate) || 'executive',
          template_options: data.template_options 
            ? (data.template_options as unknown as TemplateOptions) 
            : defaultTemplateOptions,
        });
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      toast({
        title: "Error loading settings",
        description: "Could not load your branding settings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file (PNG, JPG, etc.)",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload an image smaller than 2MB",
        variant: "destructive",
      });
      return;
    }

    try {
      setUploading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `logos/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('scan-images')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('scan-images')
        .getPublicUrl(filePath);

      setSettings(prev => ({ ...prev, logo_url: publicUrl }));

      toast({
        title: "Logo uploaded",
        description: "Your company logo has been uploaded successfully",
      });
    } catch (error) {
      console.error('Error uploading logo:', error);
      toast({
        title: "Upload failed",
        description: "Could not upload your logo. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: existingData } = await supabase
        .from('pdf_branding_settings')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      const templateOptionsJson = JSON.parse(JSON.stringify(settings.template_options));

      if (existingData?.id) {
        const { error: updateError } = await supabase
          .from('pdf_branding_settings')
          .update({
            company_name: settings.company_name,
            company_tagline: settings.company_tagline,
            logo_url: settings.logo_url,
            primary_color: settings.primary_color,
            secondary_color: settings.secondary_color,
            footer_text: settings.footer_text,
            contact_email: settings.contact_email,
            website_url: settings.website_url,
            report_template: settings.report_template,
            template_options: templateOptionsJson,
          })
          .eq('id', existingData.id);
        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase
          .from('pdf_branding_settings')
          .insert({
            user_id: user.id,
            company_name: settings.company_name,
            company_tagline: settings.company_tagline,
            logo_url: settings.logo_url,
            primary_color: settings.primary_color,
            secondary_color: settings.secondary_color,
            footer_text: settings.footer_text,
            contact_email: settings.contact_email,
            website_url: settings.website_url,
            report_template: settings.report_template,
            template_options: templateOptionsJson,
          });
        if (insertError) throw insertError;
      }

      toast({
        title: "Settings saved",
        description: "Your branding settings have been updated",
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: "Save failed",
        description: "Could not save your settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const removeLogo = () => {
    setSettings(prev => ({ ...prev, logo_url: null }));
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-4xl flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <Button variant="ghost" size="sm" asChild className="mb-4">
          <Link to="/settings">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Settings
          </Link>
        </Button>
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-lg bg-primary/10">
            <FileText className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-3xl font-bold">Report Branding</h1>
        </div>
        <p className="text-muted-foreground">
          Customize how your PDF reports look with your company branding
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Settings Form */}
        <div className="space-y-6">
          {/* Company Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Company Information</CardTitle>
              <CardDescription>
                Basic company details that appear on your reports
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="company_name">Company Name</Label>
                <Input
                  id="company_name"
                  value={settings.company_name}
                  onChange={(e) => setSettings(prev => ({ ...prev, company_name: e.target.value }))}
                  placeholder="Your Company Name"
                />
              </div>

              <div>
                <Label htmlFor="company_tagline">Company Tagline</Label>
                <Textarea
                  id="company_tagline"
                  value={settings.company_tagline}
                  onChange={(e) => setSettings(prev => ({ ...prev, company_tagline: e.target.value }))}
                  placeholder="Your company tagline or mission statement"
                  rows={2}
                />
              </div>

              <div>
                <Label htmlFor="contact_email">Contact Email</Label>
                <Input
                  id="contact_email"
                  type="email"
                  value={settings.contact_email}
                  onChange={(e) => setSettings(prev => ({ ...prev, contact_email: e.target.value }))}
                  placeholder="reports@company.com"
                />
              </div>

              <div>
                <Label htmlFor="website_url">Website URL</Label>
                <Input
                  id="website_url"
                  value={settings.website_url}
                  onChange={(e) => setSettings(prev => ({ ...prev, website_url: e.target.value }))}
                  placeholder="https://www.company.com"
                />
              </div>

              <div>
                <Label htmlFor="footer_text">Footer Text</Label>
                <Textarea
                  id="footer_text"
                  value={settings.footer_text}
                  onChange={(e) => setSettings(prev => ({ ...prev, footer_text: e.target.value }))}
                  placeholder="Confidential - For authorized use only"
                  rows={2}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Appears at the bottom of each page in your reports
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Logo Upload */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Company Logo</CardTitle>
              <CardDescription>
                Upload your logo to appear on report headers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-4">
                {settings.logo_url ? (
                  <div className="relative w-32 h-32 border rounded-lg overflow-hidden bg-muted flex-shrink-0">
                    <img
                      src={settings.logo_url}
                      alt="Company logo"
                      className="w-full h-full object-contain"
                    />
                  </div>
                ) : (
                  <div className="w-32 h-32 border-2 border-dashed rounded-lg flex items-center justify-center bg-muted flex-shrink-0">
                    <ImageIcon className="w-8 h-8 text-muted-foreground" />
                  </div>
                )}
                
                <div className="flex-1 space-y-2">
                  <Button
                    variant="outline"
                    disabled={uploading}
                    onClick={() => document.getElementById('logo-upload')?.click()}
                    className="w-full"
                  >
                    {uploading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 mr-2" />
                        Upload Logo
                      </>
                    )}
                  </Button>
                  {settings.logo_url && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={removeLogo}
                      className="w-full text-destructive hover:text-destructive"
                    >
                      Remove Logo
                    </Button>
                  )}
                  <input
                    id="logo-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleLogoUpload}
                  />
                  <p className="text-xs text-muted-foreground">
                    Recommended: PNG with transparent background, max 2MB
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Color Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Brand Colors</CardTitle>
              <CardDescription>
                Colors used in headers and accents throughout your reports
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="primary_color">Primary Color</Label>
                <div className="flex items-center gap-2 mt-2">
                  <Input
                    id="primary_color"
                    type="color"
                    value={settings.primary_color}
                    onChange={(e) => setSettings(prev => ({ ...prev, primary_color: e.target.value }))}
                    className="w-16 h-10 p-1 cursor-pointer"
                  />
                  <Input
                    value={settings.primary_color}
                    onChange={(e) => setSettings(prev => ({ ...prev, primary_color: e.target.value }))}
                    placeholder="#667eea"
                    className="flex-1"
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Used for headers, table headers, and main accents
                </p>
              </div>

              <div>
                <Label htmlFor="secondary_color">Secondary Color</Label>
                <div className="flex items-center gap-2 mt-2">
                  <Input
                    id="secondary_color"
                    type="color"
                    value={settings.secondary_color}
                    onChange={(e) => setSettings(prev => ({ ...prev, secondary_color: e.target.value }))}
                    className="w-16 h-10 p-1 cursor-pointer"
                  />
                  <Input
                    value={settings.secondary_color}
                    onChange={(e) => setSettings(prev => ({ ...prev, secondary_color: e.target.value }))}
                    placeholder="#10b981"
                    className="flex-1"
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Used for success indicators and positive metrics
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Report Templates */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Report Templates</CardTitle>
              <CardDescription>
                Choose a template style and customize which sections appear in your reports
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ReportTemplateSelector
                selectedTemplate={settings.report_template}
                templateOptions={settings.template_options}
                onTemplateChange={(template) => setSettings(prev => ({ ...prev, report_template: template }))}
                onOptionsChange={(options) => setSettings(prev => ({ ...prev, template_options: options }))}
              />
            </CardContent>
          </Card>

          {/* Save Button */}
          <Button onClick={handleSave} disabled={saving} className="w-full">
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Branding Settings
              </>
            )}
          </Button>
        </div>

        {/* Live Preview */}
        <div className="lg:sticky lg:top-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Live Preview</CardTitle>
              <CardDescription>
                See how your branding will appear on exported reports
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg overflow-hidden bg-white text-black">
                {/* Mock PDF Header */}
                <div 
                  className="p-6 text-white"
                  style={{ background: `linear-gradient(135deg, ${settings.primary_color} 0%, ${adjustColor(settings.primary_color, -20)} 100%)` }}
                >
                  <div className="flex items-center gap-4">
                    {settings.logo_url ? (
                      <img 
                        src={settings.logo_url} 
                        alt="Logo" 
                        className="h-12 w-12 object-contain bg-white rounded p-1"
                      />
                    ) : (
                      <div className="h-12 w-12 bg-white/20 rounded flex items-center justify-center">
                        <ImageIcon className="h-6 w-6 text-white/60" />
                      </div>
                    )}
                    <div>
                      <h3 className="font-bold text-lg">
                        {settings.company_name || 'Your Company Name'}
                      </h3>
                      <p className="text-sm opacity-80">
                        {settings.company_tagline || 'Your tagline here'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Mock Report Content */}
                <div className="p-6 space-y-4">
                  <div>
                    <h4 className="font-semibold text-sm" style={{ color: settings.primary_color }}>
                      OSINT Scan Report
                    </h4>
                    <p className="text-xs text-gray-500 mt-1">Generated on December 25, 2025</p>
                  </div>

                  {/* Mock Table */}
                  <div className="border rounded overflow-hidden">
                    <div 
                      className="px-3 py-2 text-white text-xs font-medium"
                      style={{ backgroundColor: settings.primary_color }}
                    >
                      <div className="flex justify-between">
                        <span>Platform</span>
                        <span>Status</span>
                      </div>
                    </div>
                    <div className="divide-y">
                      <div className="px-3 py-2 text-xs flex justify-between">
                        <span>Twitter</span>
                        <span 
                          className="px-2 py-0.5 rounded text-white text-[10px]"
                          style={{ backgroundColor: settings.secondary_color }}
                        >
                          Found
                        </span>
                      </div>
                      <div className="px-3 py-2 text-xs flex justify-between bg-gray-50">
                        <span>LinkedIn</span>
                        <span 
                          className="px-2 py-0.5 rounded text-white text-[10px]"
                          style={{ backgroundColor: settings.secondary_color }}
                        >
                          Found
                        </span>
                      </div>
                      <div className="px-3 py-2 text-xs flex justify-between">
                        <span>GitHub</span>
                        <span className="px-2 py-0.5 rounded bg-gray-200 text-gray-600 text-[10px]">
                          Not Found
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Mock Footer */}
                <div className="px-6 py-4 border-t bg-gray-50 text-xs text-gray-500">
                  <div className="flex justify-between items-center">
                    <div>
                      <p>{settings.footer_text || 'Confidential - For authorized use only'}</p>
                      {settings.website_url && (
                        <p className="text-[10px] mt-1" style={{ color: settings.primary_color }}>
                          {settings.website_url}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      {settings.contact_email && (
                        <p className="text-[10px]">{settings.contact_email}</p>
                      )}
                      <p className="text-[10px]">Page 1 of 3</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// Helper function to adjust color brightness
function adjustColor(hex: string, percent: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = (num >> 16) + amt;
  const G = (num >> 8 & 0x00FF) + amt;
  const B = (num & 0x0000FF) + amt;
  return '#' + (
    0x1000000 +
    (R < 255 ? (R < 0 ? 0 : R) : 255) * 0x10000 +
    (G < 255 ? (G < 0 ? 0 : G) : 255) * 0x100 +
    (B < 255 ? (B < 0 ? 0 : B) : 255)
  ).toString(16).slice(1);
}