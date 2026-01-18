import { useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ShieldCheck, Calendar, Database, Info } from 'lucide-react';
import { ScanResult } from '@/hooks/useScanResultsData';

interface BreachesTabProps {
  results: ScanResult[];
  breachResults: any[];
}

// Map data types to plain-language descriptions
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

// Generate plain-language impact explanation
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
    return 'This breach included financial data. Review your accounts for unauthorized activity and consider placing a fraud alert.';
  }
  if (hasPassword && hasEmail) {
    return 'Your email and password combination may have been exposed. Update your password for this service and any others where you used the same credentials.';
  }
  if (hasPassword) {
    return 'Password data was included. If you reused this password elsewhere, consider updating those accounts as well.';
  }
  if (hasPII) {
    return 'Personal identifying information was included. Be alert to potential phishing attempts using this data.';
  }
  if (hasEmail) {
    return 'Your email address was included. You may receive more spam or phishing emails as a result.';
  }
  return 'Some of your data was included in this breach. Review the exposed data types and take appropriate precautions.';
};

// Extract year from breach data
const extractYear = (breach: any): string | null => {
  if (breach.meta?.breach_date) {
    const year = new Date(breach.meta.breach_date).getFullYear();
    return isNaN(year) ? null : year.toString();
  }
  if (breach.meta?.year) return breach.meta.year.toString();
  if (breach.year) return breach.year.toString();
  // Try to extract year from description or name
  const yearMatch = (breach.site || breach.provider || '').match(/\b(20\d{2}|19\d{2})\b/);
  return yearMatch ? yearMatch[1] : null;
};

// Extract data types from breach
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
  // Process breach data for display
  const processedBreaches = useMemo(() => {
    return breachResults.map((breach, idx) => ({
      id: breach.id || idx,
      name: breach.site || breach.provider || breach.meta?.name || 'Unknown Breach',
      year: extractYear(breach),
      dataTypes: extractDataTypes(breach),
      description: breach.meta?.description || null,
    }));
  }, [breachResults]);

  const totalBreaches = processedBreaches.length;

  // Empty state - reassuring message
  if (totalBreaches === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mb-6">
          <ShieldCheck className="w-8 h-8 text-green-500" />
        </div>
        <h3 className="text-xl font-semibold mb-2">No Breaches Found</h3>
        <p className="text-muted-foreground text-center max-w-md">
          Good news — we didn't find this identity in any known data breaches. 
          This doesn't guarantee complete safety, but it's a positive sign.
        </p>
        <div className="mt-6 p-4 bg-muted/50 rounded-lg max-w-md">
          <p className="text-sm text-muted-foreground text-center">
            We check against known breach databases. New breaches are discovered regularly, 
            so periodic monitoring is recommended.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header summary */}
      <div className="flex items-center gap-3 p-4 bg-muted/30 rounded-lg">
        <Info className="h-5 w-5 text-muted-foreground flex-shrink-0" />
        <p className="text-sm text-muted-foreground">
          Found <span className="font-medium text-foreground">{totalBreaches}</span> breach{totalBreaches !== 1 ? 'es' : ''} associated with this identity. 
          Review each entry and consider updating credentials where applicable.
        </p>
      </div>

      {/* Breach cards */}
      <div className="space-y-4">
        {processedBreaches.map((breach) => (
          <Card key={breach.id} className="overflow-hidden">
            <CardContent className="p-0">
              {/* Card header */}
              <div className="p-4 border-b border-border/50">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-base truncate">
                      {breach.name}
                    </h3>
                    {breach.year && (
                      <div className="flex items-center gap-1.5 mt-1 text-sm text-muted-foreground">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>{breach.year}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Data types exposed */}
              {breach.dataTypes.length > 0 && (
                <div className="px-4 py-3 border-b border-border/50 bg-muted/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Database className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Data Exposed
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {breach.dataTypes.slice(0, 8).map((dataType, idx) => (
                      <Badge 
                        key={idx} 
                        variant="secondary"
                        className="text-xs font-normal"
                      >
                        {getDataTypeLabel(dataType)}
                      </Badge>
                    ))}
                    {breach.dataTypes.length > 8 && (
                      <Badge variant="outline" className="text-xs font-normal">
                        +{breach.dataTypes.length - 8} more
                      </Badge>
                    )}
                  </div>
                </div>
              )}

              {/* Impact explanation */}
              <div className="p-4 bg-muted/10">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {getImpactExplanation(breach.dataTypes)}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Practical next steps */}
      <Card className="p-4 bg-primary/5 border-primary/20">
        <h4 className="font-medium text-sm mb-3">Practical Next Steps</h4>
        <ul className="text-sm text-muted-foreground space-y-2">
          <li className="flex items-start gap-2">
            <span className="text-primary font-medium">1.</span>
            Update passwords for any affected services, using unique passwords for each.
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary font-medium">2.</span>
            Enable two-factor authentication where available for additional security.
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary font-medium">3.</span>
            Monitor your accounts for any unusual activity over the coming weeks.
          </li>
        </ul>
      </Card>
    </div>
  );
}

export default BreachesTab;
