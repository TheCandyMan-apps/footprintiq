import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { FileText, Code, FileBarChart, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ReportTemplate = 'executive' | 'technical' | 'summary';

export interface TemplateOptions {
  show_executive_summary: boolean;
  show_provider_breakdown: boolean;
  show_risk_analysis: boolean;
  show_timeline: boolean;
  show_detailed_findings: boolean;
}

interface ReportTemplateSelectorProps {
  selectedTemplate: ReportTemplate;
  templateOptions: TemplateOptions;
  onTemplateChange: (template: ReportTemplate) => void;
  onOptionsChange: (options: TemplateOptions) => void;
}

const templates = [
  {
    id: 'executive' as ReportTemplate,
    name: 'Executive',
    description: 'High-level overview with key metrics and risk summary. Ideal for stakeholders and management.',
    icon: FileBarChart,
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500',
  },
  {
    id: 'technical' as ReportTemplate,
    name: 'Technical',
    description: 'Detailed findings with full URLs, metadata, and provider-level breakdowns for analysts.',
    icon: Code,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500',
  },
  {
    id: 'summary' as ReportTemplate,
    name: 'Summary',
    description: 'Compact one-page summary with essential findings only. Quick reference format.',
    icon: FileText,
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500',
  },
];

const optionLabels: Record<keyof TemplateOptions, { label: string; description: string }> = {
  show_executive_summary: {
    label: 'Executive Summary',
    description: 'Overview paragraph with key findings',
  },
  show_provider_breakdown: {
    label: 'Provider Breakdown',
    description: 'Results grouped by OSINT provider',
  },
  show_risk_analysis: {
    label: 'Risk Analysis',
    description: 'Confidence levels and risk indicators',
  },
  show_timeline: {
    label: 'Timeline',
    description: 'Chronological order of discoveries',
  },
  show_detailed_findings: {
    label: 'Detailed Findings',
    description: 'Full table with all finding data',
  },
};

export function ReportTemplateSelector({
  selectedTemplate,
  templateOptions,
  onTemplateChange,
  onOptionsChange,
}: ReportTemplateSelectorProps) {
  const handleOptionToggle = (key: keyof TemplateOptions) => {
    onOptionsChange({
      ...templateOptions,
      [key]: !templateOptions[key],
    });
  };

  return (
    <div className="space-y-6">
      {/* Template Selection */}
      <div>
        <Label className="text-base font-medium mb-3 block">Report Template</Label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {templates.map((template) => {
            const Icon = template.icon;
            const isSelected = selectedTemplate === template.id;
            
            return (
              <Card
                key={template.id}
                className={cn(
                  'cursor-pointer transition-all hover:shadow-md relative overflow-hidden',
                  isSelected
                    ? `border-2 ${template.borderColor} shadow-sm`
                    : 'border border-border hover:border-muted-foreground/50'
                )}
                onClick={() => onTemplateChange(template.id)}
              >
                {isSelected && (
                  <div className={cn('absolute top-2 right-2 rounded-full p-1', template.bgColor)}>
                    <Check className={cn('h-3 w-3', template.color)} />
                  </div>
                )}
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className={cn('p-2 rounded-lg', template.bgColor)}>
                      <Icon className={cn('h-5 w-5', template.color)} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-sm">{template.name}</h4>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {template.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Content Options */}
      <div>
        <Label className="text-base font-medium mb-3 block">Report Sections</Label>
        <Card>
          <CardContent className="p-4 space-y-4">
            {(Object.keys(optionLabels) as Array<keyof TemplateOptions>).map((key) => (
              <div key={key} className="flex items-center justify-between">
                <div>
                  <Label htmlFor={key} className="text-sm font-medium cursor-pointer">
                    {optionLabels[key].label}
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    {optionLabels[key].description}
                  </p>
                </div>
                <Switch
                  id={key}
                  checked={templateOptions[key]}
                  onCheckedChange={() => handleOptionToggle(key)}
                />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
