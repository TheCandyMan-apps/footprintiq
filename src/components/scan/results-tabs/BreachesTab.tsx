import { useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ShieldCheck, Calendar, Database, Info } from 'lucide-react';
import { ScanResult } from '@/hooks/useScanResultsData';
import { 
  RESULTS_SPACING, 
  RESULTS_TYPOGRAPHY, 
  RESULTS_BORDERS,
  RESULTS_BACKGROUNDS 
} from './styles';

interface BreachesTabProps {
  results: ScanResult[];
  breachResults: any[];
}

const detectBreachFromResult = (r: any): boolean => {
  const breachKeywords = ['breach', 'hibp', 'leak', 'pwned', 'compromised', 'exposure'];
  const kind = (r?.kind || '').toString().toLowerCase();
  const provider = (r?.provider || '').toString().toLowerCase();
  const site = (r?.site || '').toString().toLowerCase();
  const metaStr = JSON.stringify(r?.meta || r?.metadata || {}).toLowerCase();
  const evidenceStr = JSON.stringify(r?.evidence || {}).toLowerCase();
  return breachKeywords.some((k) =>
    kind.includes(k) || provider.includes(k) || site.includes(k) || metaStr.includes(k) || evidenceStr.includes(k)
  );
};

const getDataTypeLabel = (dataType: string): string => {
  const labels: Record<string, string> = {
    'email': 'Email addresses',
    'password': 'Passwords',
    'passwords': 'Passwords',
    'username': 'Usernames',
    'phone': 'Phone numbers',
    'address': 'Physical addresses',
    'ip_address': 'IP addresses',
    'credit_card': 'Payment card details',
    'ssn': 'Social security numbers',
    'dob': 'Dates of birth',
    'name': 'Names',
    'gender': 'Gender information',
  };
  return labels[dataType.toLowerCase()] || dataType.replace(/_/g, ' ');
};

const getImpactExplanation = (dataTypes: string[]): string => {
  const hasPassword = dataTypes.some(t => t.toLowerCase().includes('password'));
  const hasEmail = dataTypes.some(t => t.toLowerCase().includes('email'));
  const hasFinancial = dataTypes.some(t => 
    t.toLowerCase().includes('credit') || 
    t.toLowerCase().includes('card') || 
    t.toLowerCase().includes('bank')
  );
  const hasPII = dataTypes.some(t => 
    t.toLowerCase().includes('ssn') || 
    t.toLowerCase().includes('address') || 
    t.toLowerCase().includes('phone')
  );

  if (hasFinancial) {
    return 'Financial data included. Review accounts for unauthorized activity.';
  }
  if (hasPassword && hasEmail) {
    return 'Email and password may be exposed. Update passwords immediately.';
  }
  if (hasPassword) {
    return 'Password data included. Update this and any reused passwords.';
  }
  if (hasPII) {
    return 'Personal info included. Watch for phishing attempts.';
  }
  if (hasEmail) {
    return 'Email address included. Expect potential spam or phishing.';
  }
  return 'Some data was exposed. Review and take precautions.';
};

const extractYear = (breach: any): string | null => {
  if (breach.meta?.breach_date) {
    const year = new Date(breach.meta.breach_date).getFullYear();
    return isNaN(year) ? null : year.toString();
  }
  if (breach.meta?.year) return breach.meta.year.toString();
  if (breach.year) return breach.year.toString();
  const yearMatch = (breach.site || breach.provider || '').match(/\b(20\d{2}|19\d{2})\b/);
  return yearMatch ? yearMatch[1] : null;
};

const extractDataTypes = (breach: any): string[] => {
  if (Array.isArray(breach.meta?.data_classes)) return breach.meta.data_classes;
  if (Array.isArray(breach.meta?.dataTypes)) return breach.meta.dataTypes;
  if (Array.isArray(breach.dataTypes)) return breach.dataTypes;
  if (typeof breach.meta?.data_types === 'string') {
    return breach.meta.data_types.split(',').map((t: string) => t.trim());
  }
  return [];
};

export function BreachesTab({ results, breachResults }: BreachesTabProps) {
  const effectiveBreachResults = useMemo(() => {
    if (Array.isArray(breachResults) && breachResults.length > 0) return breachResults;
    // Fallback: derive breaches directly from results if upstream filtering produced none.
    return (results as any[]).filter(detectBreachFromResult);
  }, [breachResults, results]);

  const processedBreaches = useMemo(() => {
    return effectiveBreachResults.map((breach, idx) => ({
      id: breach.id || idx,
      name: breach.site || breach.provider || breach.meta?.name || 'Unknown Breach',
      year: extractYear(breach),
      dataTypes: extractDataTypes(breach),
      description: breach.meta?.description || null,
    }));
  }, [effectiveBreachResults]);

  const totalBreaches = processedBreaches.length;

  // Empty state
  if (totalBreaches === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center mb-3">
          <ShieldCheck className="w-5 h-5 text-green-500" />
        </div>
        <h3 className="text-[13px] font-medium">No Breaches Found</h3>
        <p className="text-[11px] text-muted-foreground max-w-xs text-center mt-1">
          Good news — no known data breaches detected for this identity.
        </p>
        <div className="mt-3 px-3 py-2 bg-muted/20 rounded text-center max-w-xs">
          <p className="text-[10px] text-muted-foreground/70">
            We check against known breach databases. New breaches are discovered regularly.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={RESULTS_SPACING.contentMarginSm}>
      {/* Header summary */}
      <div className="flex items-center gap-2 py-1.5 px-2.5 bg-muted/20 rounded text-[11px]">
        <Info className="h-3 w-3 text-muted-foreground flex-shrink-0" />
        <p className="text-muted-foreground">
          <span className="font-medium text-foreground">{totalBreaches}</span> breach{totalBreaches !== 1 ? 'es' : ''} found. 
          Review and update credentials.
        </p>
      </div>

      {/* Breach cards - compact */}
      <div className="space-y-1.5">
        {processedBreaches.map((breach) => (
          <Card key={breach.id} className="border-border/30">
            <CardContent className="p-0">
              {/* Header */}
              <div className="px-2.5 py-2 border-b border-border/20">
                <h3 className="text-[12px] font-medium truncate">{breach.name}</h3>
                {breach.year && (
                  <div className="flex items-center gap-1 mt-0.5 text-[10px] text-muted-foreground">
                    <Calendar className="h-2.5 w-2.5" />
                    <span>{breach.year}</span>
                  </div>
                )}
              </div>

              {/* Data types */}
              {breach.dataTypes.length > 0 && (
                <div className="px-2.5 py-1.5 border-b border-border/20 bg-muted/10">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Database className="h-2.5 w-2.5 text-muted-foreground" />
                    <span className="text-[9px] font-medium text-muted-foreground uppercase tracking-wider">Exposed</span>
                  </div>
                  <div className="flex flex-wrap gap-0.5">
                    {breach.dataTypes.slice(0, 5).map((dataType, idx) => (
                      <Badge 
                        key={idx} 
                        variant="secondary"
                        className="text-[9px] font-normal h-4 px-1"
                      >
                        {getDataTypeLabel(dataType)}
                      </Badge>
                    ))}
                    {breach.dataTypes.length > 5 && (
                      <Badge variant="outline" className="text-[9px] font-normal h-4 px-1">
                        +{breach.dataTypes.length - 5}
                      </Badge>
                    )}
                  </div>
                </div>
              )}

              {/* Impact */}
              <div className="px-2.5 py-1.5 bg-muted/5">
                <p className="text-[10px] text-muted-foreground">
                  {getImpactExplanation(breach.dataTypes)}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Next steps - compact */}
      <Card className="p-2.5 bg-primary/5 border-border/30">
        <h4 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Next Steps</h4>
        <ul className="text-[11px] text-muted-foreground space-y-1">
          <li className="flex items-start gap-1.5">
            <span className="text-primary font-medium">1.</span>
            Update passwords for affected services
          </li>
          <li className="flex items-start gap-1.5">
            <span className="text-primary font-medium">2.</span>
            Enable two-factor authentication
          </li>
          <li className="flex items-start gap-1.5">
            <span className="text-primary font-medium">3.</span>
            Monitor accounts for unusual activity
          </li>
        </ul>
      </Card>
    </div>
  );
}

export default BreachesTab;
