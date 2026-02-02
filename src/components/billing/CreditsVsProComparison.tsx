import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Check, X, HelpCircle, ArrowRight } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface CreditsVsProComparisonProps {
  onUpgrade: () => void;
  isPremium?: boolean;
}

const comparisonData = [
  {
    feature: 'Plan Tier',
    credits: 'Stays on Free',
    pro: 'Upgrades to Pro',
    tooltip: 'Your subscription tier determines which features and providers you can access',
  },
  {
    feature: 'Username Providers',
    credits: 'Maigret only',
    pro: 'Maigret + Sherlock',
    tooltip: 'Tools used to search for username presence across platforms',
  },
  {
    feature: 'Email Providers',
    credits: 'Holehe only',
    pro: 'Holehe + IPQS + HIBP',
    tooltip: 'Tools used to verify email validity and check for breaches',
  },
  {
    feature: 'Phone Providers',
    credits: false,
    pro: true,
    tooltip: 'Access to phone number intelligence providers',
  },
  {
    feature: 'AI Insights',
    credits: false,
    pro: true,
    tooltip: 'AI-powered analysis and recommendations for your scans',
  },
  {
    feature: 'PDF/CSV Export',
    credits: false,
    pro: true,
    tooltip: 'Export scan results as professional reports',
  },
  {
    feature: 'Risk Scoring',
    credits: false,
    pro: true,
    tooltip: 'Automated risk assessment based on findings',
  },
  {
    feature: 'Priority Queue',
    credits: false,
    pro: true,
    tooltip: 'Your scans are processed before free-tier users',
  },
  {
    feature: 'Context Enrichment',
    credits: false,
    pro: true,
    tooltip: 'Additional context and metadata for each finding',
  },
  {
    feature: 'LENS Verification',
    credits: false,
    pro: true,
    tooltip: 'Visual verification and screenshot capture of findings',
  },
];

function FeatureValue({ value }: { value: boolean | string }) {
  if (typeof value === 'boolean') {
    return value ? (
      <Check className="w-5 h-5 text-primary" />
    ) : (
      <X className="w-5 h-5 text-muted-foreground/50" />
    );
  }
  return <span className="text-sm">{value}</span>;
}

export function CreditsVsProComparison({ onUpgrade, isPremium }: CreditsVsProComparisonProps) {
  if (isPremium) return null;

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-primary" />
              Credits vs. Pro: What's the Difference?
            </CardTitle>
            <CardDescription className="mt-2">
              Credit packs add scan credits but <strong>do not unlock</strong> premium features or additional providers.
              To access all OSINT tools, you need a Pro subscription.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <TooltipProvider>
          <div className="rounded-lg border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="w-[200px]">Feature</TableHead>
                  <TableHead className="text-center">
                    <div className="flex flex-col items-center gap-1">
                      <span>Credits Only</span>
                      <Badge variant="secondary" className="text-xs">Free Tier</Badge>
                    </div>
                  </TableHead>
                  <TableHead className="text-center bg-primary/5">
                    <div className="flex flex-col items-center gap-1">
                      <span>Pro Subscription</span>
                      <Badge variant="default" className="text-xs">£14.99/mo</Badge>
                    </div>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {comparisonData.map((row) => (
                  <TableRow key={row.feature}>
                    <TableCell className="font-medium">
                      <Tooltip>
                        <TooltipTrigger className="flex items-center gap-1.5 cursor-help">
                          {row.feature}
                          <HelpCircle className="w-3.5 h-3.5 text-muted-foreground/50" />
                        </TooltipTrigger>
                        <TooltipContent side="right" className="max-w-[200px]">
                          <p>{row.tooltip}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex justify-center">
                        <FeatureValue value={row.credits} />
                      </div>
                    </TableCell>
                    <TableCell className="text-center bg-primary/5">
                      <div className="flex justify-center">
                        <FeatureValue value={row.pro} />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TooltipProvider>

        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-lg bg-primary/5 border border-primary/20">
          <div>
            <p className="font-medium">Want full access to all OSINT providers?</p>
            <p className="text-sm text-muted-foreground">
              Upgrade to Pro for complete username, email, and phone intelligence.
            </p>
          </div>
          <Button onClick={onUpgrade} className="shrink-0">
            Upgrade to Pro
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
