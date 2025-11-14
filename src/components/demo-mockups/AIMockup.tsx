import { Bot, Send, Sparkles, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

interface AIMockupProps {
  step: number;
}

export function AIMockup({ step }: AIMockupProps) {
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
            <Bot className="w-12 h-12 text-primary mx-auto" />
            <h3 className="text-xl font-semibold">Ask AI Analyst</h3>
          </div>
          <div className="bg-background rounded-lg border-2 border-border p-6 space-y-4">
            <div className="flex gap-3">
              <input
                type="text"
                placeholder="Ask me anything about your data..."
                className="flex-1 px-4 py-3 bg-muted rounded-lg border border-border"
                value="Show me all compromised accounts from last month"
                readOnly
              />
              <button className="px-4 py-3 bg-primary text-primary-foreground rounded-lg">
                <Send className="w-5 h-5" />
              </button>
            </div>
            <div className="text-xs text-muted-foreground">
              Try: "What's our risk score?" or "Find connections between these emails"
            </div>
          </div>
        </div>
      )}

      {step === 1 && (
        <div className="max-w-3xl mx-auto space-y-4">
          <div className="text-center mb-6">
            <Sparkles className="w-12 h-12 text-primary mx-auto mb-2 animate-pulse" />
            <h3 className="text-xl font-semibold">AI Processing</h3>
          </div>
          <div className="bg-background rounded-lg border border-border p-6 space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1 space-y-2">
                <div className="text-sm text-muted-foreground">Analyzing your data...</div>
                <div className="space-y-1">
                  {['Scanning 1,247 records', 'Cross-referencing breach data', 'Calculating risk scores'].map((task, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs">
                      <div className="w-1 h-1 rounded-full bg-primary animate-pulse" />
                      {task}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="max-w-3xl mx-auto space-y-4">
          <div className="text-center mb-6">
            <TrendingUp className="w-12 h-12 text-primary mx-auto mb-2" />
            <h3 className="text-xl font-semibold">AI Insights</h3>
          </div>
          <div className="bg-background rounded-lg border border-border p-6 space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1 space-y-3">
                <div className="text-sm">Found <span className="font-semibold text-primary">23 compromised accounts</span> from last month.</div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-destructive/10 rounded-lg border border-destructive/20 p-3 text-center">
                    <div className="text-xl font-bold text-destructive">8</div>
                    <div className="text-xs text-muted-foreground">High Risk</div>
                  </div>
                  <div className="bg-accent/10 rounded-lg border border-accent/20 p-3 text-center">
                    <div className="text-xl font-bold text-accent">15</div>
                    <div className="text-xs text-muted-foreground">Medium Risk</div>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground pt-2 border-t border-border">
                  Recommendation: Immediate password reset required for high-risk accounts
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="max-w-3xl mx-auto space-y-4">
          <div className="text-center mb-6">
            <Bot className="w-12 h-12 text-primary mx-auto mb-2" />
            <h3 className="text-xl font-semibold">Deep Dive Analysis</h3>
          </div>
          <div className="bg-background rounded-lg border border-border p-6 space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                <span className="text-xs">You</span>
              </div>
              <div className="flex-1 bg-muted/50 rounded-lg p-3 text-sm">
                Show me more details about the high-risk accounts
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1 space-y-2">
                <div className="text-sm">Here are the high-risk accounts with breach details:</div>
                <div className="space-y-1">
                  {['admin@company.com - LinkedIn (2023)', 'ceo@company.com - Adobe (2022)', 'finance@company.com - Facebook (2023)'].map((detail, i) => (
                    <div key={i} className="text-xs p-2 bg-destructive/10 rounded border border-destructive/20">
                      {detail}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
