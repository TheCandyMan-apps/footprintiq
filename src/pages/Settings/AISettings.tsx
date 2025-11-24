import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Brain, Sparkles, Zap, ArrowLeft } from 'lucide-react';
import { updatePreferredModel, getPreferredModel } from '@/lib/aiRouter';
import { SettingsNav } from '@/components/settings/SettingsNav';

type Model = "gemini" | "gpt" | "grok";

interface ModelOption {
  value: Model;
  label: string;
  description: string;
  icon: typeof Brain;
  speed: string;
  quality: string;
}

const modelOptions: ModelOption[] = [
  {
    value: "gemini",
    label: "Google Gemini",
    description: "Fast and balanced AI model. Best for most tasks.",
    icon: Sparkles,
    speed: "Fast",
    quality: "High",
  },
  {
    value: "gpt",
    label: "OpenAI GPT",
    description: "Powerful reasoning with excellent accuracy.",
    icon: Brain,
    speed: "Medium",
    quality: "Very High",
  },
  {
    value: "grok",
    label: "xAI Grok",
    description: "Direct and witty responses with real-time awareness.",
    icon: Zap,
    speed: "Very Fast",
    quality: "High",
  },
];

export default function AISettings() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedModel, setSelectedModel] = useState<Model>("gemini");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      setLoading(true);
      const model = await getPreferredModel();
      setSelectedModel(model);
    } catch (error) {
      console.error('Error loading preferences:', error);
      toast({
        title: 'Error loading preferences',
        description: 'Failed to load your AI model preference',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await updatePreferredModel(selectedModel);
      
      toast({
        title: 'Preferences saved',
        description: `AI model set to ${modelOptions.find(m => m.value === selectedModel)?.label}`,
      });
    } catch (error) {
      console.error('Error saving preferences:', error);
      toast({
        title: 'Error saving preferences',
        description: 'Failed to save your AI model preference',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container max-w-4xl mx-auto py-8 px-4">
        <Button
          variant="ghost"
          onClick={() => navigate('/settings')}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Settings
        </Button>
        
        <Card>
          <CardHeader>
            <CardTitle>AI Model Settings</CardTitle>
            <CardDescription>Loading your preferences...</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-7xl mx-auto py-8 px-4">
      <div className="grid lg:grid-cols-[280px_1fr] gap-6">
        <aside className="hidden lg:block">
          <div className="sticky top-24">
            <SettingsNav />
          </div>
        </aside>
        
        <div className="min-w-0">
          <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5" />
            AI Model Settings
          </CardTitle>
          <CardDescription>
            Choose your preferred AI model for threat analysis, summaries, and insights
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <RadioGroup value={selectedModel} onValueChange={(value) => setSelectedModel(value as Model)}>
            <div className="space-y-4">
              {modelOptions.map((option) => {
                const Icon = option.icon;
                const isSelected = selectedModel === option.value;
                
                return (
                  <div
                    key={option.value}
                    className={`flex items-start space-x-4 p-4 rounded-lg border-2 transition-colors cursor-pointer ${
                      isSelected
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                    onClick={() => setSelectedModel(option.value)}
                  >
                    <RadioGroupItem value={option.value} id={option.value} className="mt-1" />
                    <div className="flex-1">
                      <Label
                        htmlFor={option.value}
                        className="flex items-center gap-2 text-base font-medium cursor-pointer"
                      >
                        <Icon className="w-5 h-5" />
                        {option.label}
                      </Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        {option.description}
                      </p>
                      <div className="flex gap-4 mt-2">
                        <div className="text-xs">
                          <span className="text-muted-foreground">Speed: </span>
                          <span className="font-medium">{option.speed}</span>
                        </div>
                        <div className="text-xs">
                          <span className="text-muted-foreground">Quality: </span>
                          <span className="font-medium">{option.quality}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </RadioGroup>

          <div className="flex justify-end pt-4">
            <Button onClick={handleSave} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Preferences'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-base">About AI Models</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>
            <strong className="text-foreground">Google Gemini:</strong> Our default choice, offering
            excellent balance between speed and quality. Great for most AI features including threat
            analysis and summarization.
          </p>
          <p>
            <strong className="text-foreground">OpenAI GPT:</strong> Premium model with superior
            reasoning capabilities. Ideal for complex analysis and nuanced threat assessments.
          </p>
          <p>
            <strong className="text-foreground">xAI Grok:</strong> Fast and direct responses with a
            unique perspective. Excellent for quick insights and real-time threat monitoring.
          </p>
          <p className="text-xs pt-2 border-t">
            Note: Your AI model preference applies to all AI-powered features including dark web
            alert summaries, threat analysis, and chat assistance.
          </p>
        </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
