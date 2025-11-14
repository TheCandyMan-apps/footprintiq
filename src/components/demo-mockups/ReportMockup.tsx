import { FileText, Palette, Layout, Send } from 'lucide-react';
import { motion } from 'framer-motion';

interface ReportMockupProps {
  step: number;
}

export function ReportMockup({ step }: ReportMockupProps) {
  return (
    <motion.div 
      className="w-full h-full p-8"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      {step === 0 && (
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="text-center space-y-4">
            <FileText className="w-12 h-12 text-primary mx-auto" />
            <h3 className="text-xl font-semibold">Select Template</h3>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[
              { name: 'Executive', desc: 'High-level summary' },
              { name: 'Technical', desc: 'Detailed findings' },
              { name: 'Compliance', desc: 'Regulatory mapping' }
            ].map((template, i) => (
              <div
                key={i}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  i === 0 ? 'bg-primary/10 border-primary' : 'bg-muted border-border hover:border-primary/50'
                }`}
              >
                <div className="aspect-[3/4] bg-background rounded mb-2 border border-border flex items-center justify-center">
                  <FileText className="w-8 h-8 text-muted-foreground" />
                </div>
                <div className="text-sm font-medium">{template.name}</div>
                <div className="text-xs text-muted-foreground">{template.desc}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {step === 1 && (
        <div className="max-w-3xl mx-auto space-y-4">
          <div className="text-center mb-6">
            <Palette className="w-12 h-12 text-primary mx-auto mb-2" />
            <h3 className="text-xl font-semibold">Customize Branding</h3>
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Company Logo</label>
                <div className="h-24 bg-muted rounded-lg border-2 border-dashed border-border flex items-center justify-center text-xs text-muted-foreground">
                  Upload Logo
                </div>
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Brand Colors</label>
                <div className="flex gap-2">
                  {['#3B82F6', '#10B981', '#F59E0B'].map((color) => (
                    <div
                      key={color}
                      className="w-12 h-12 rounded border-2 border-border"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            </div>
            <div className="bg-background rounded-lg border border-border p-4">
              <div className="text-xs text-muted-foreground mb-3">Preview</div>
              <div className="aspect-[3/4] bg-muted rounded border border-border p-3 space-y-2">
                <div className="h-8 bg-primary/20 rounded" />
                <div className="space-y-1">
                  <div className="h-2 bg-muted-foreground/20 rounded" />
                  <div className="h-2 bg-muted-foreground/20 rounded w-3/4" />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="max-w-3xl mx-auto space-y-4">
          <div className="text-center mb-6">
            <Layout className="w-12 h-12 text-primary mx-auto mb-2" />
            <h3 className="text-xl font-semibold">Configure Sections</h3>
          </div>
          <div className="bg-background rounded-lg border border-border p-6 space-y-3">
            {[
              { section: 'Executive Summary', included: true },
              { section: 'Detailed Findings', included: true },
              { section: 'Risk Assessment', included: true },
              { section: 'Remediation Steps', included: false },
              { section: 'Compliance Mapping', included: false },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded border border-border">
                <div className="flex items-center gap-3">
                  <input type="checkbox" checked={item.included} readOnly className="rounded" />
                  <span className="text-sm">{item.section}</span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {item.included ? '✓ Included' : 'Optional'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="text-center">
            <Send className="w-12 h-12 text-primary mx-auto mb-2" />
            <h3 className="text-xl font-semibold">Generate & Distribute</h3>
          </div>
          <div className="bg-background rounded-lg border border-border p-6 space-y-4">
            <div className="flex items-center justify-between p-4 bg-primary/10 rounded-lg border border-primary/20">
              <div>
                <div className="text-sm font-medium">Executive Security Report</div>
                <div className="text-xs text-muted-foreground">Ready to generate</div>
              </div>
              <button className="px-4 py-2 bg-primary text-primary-foreground rounded text-sm">
                Generate PDF
              </button>
            </div>
            <div className="pt-4 border-t border-border space-y-3">
              <div className="text-sm font-medium">Automated Distribution</div>
              <div>
                <label className="text-xs text-muted-foreground mb-2 block">Email Recipients</label>
                <input
                  type="text"
                  placeholder="team@company.com"
                  className="w-full px-3 py-2 bg-muted rounded border border-border text-sm"
                />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" readOnly className="rounded" />
                <span className="text-xs text-muted-foreground">Send weekly on Monday at 9:00 AM</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
