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

  // Empty state
  if (totalBreaches === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center mb-4">
          <ShieldCheck className="w-6 h-6 text-green-500" />
        </div>
        <h3 className={RESULTS_TYPOGRAPHY.cardTitle}>No Breaches Found</h3>
        <p className={`${RESULTS_TYPOGRAPHY.caption} max-w-sm text-center mt-1`}>
          Good news — no known data breaches detected for this identity.
        </p>
        <div className={`mt-4 ${RESULTS_SPACING.cardPadding} ${RESULTS_BACKGROUNDS.muted} rounded-lg max-w-sm`}>
          <p className={`${RESULTS_TYPOGRAPHY.captionMuted} text-center`}>
            We check against known breach databases. New breaches are discovered regularly.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={RESULTS_SPACING.contentMargin}>
      {/* Header summary */}
      <div className={`flex items-center gap-2 py-2 px-3 ${RESULTS_BACKGROUNDS.muted} rounded-md`}>
        <Info className="h-4 w-4 text-muted-foreground flex-shrink-0" />
        <p className={RESULTS_TYPOGRAPHY.caption}>
          <span className="font-medium text-foreground">{totalBreaches}</span> breach{totalBreaches !== 1 ? 'es' : ''} found. 
          Review and update credentials where applicable.
        </p>
      </div>

      {/* Breach cards */}
      <div className={RESULTS_SPACING.contentMarginSm}>
        {processedBreaches.map((breach) => (
          <Card key={breach.id} className={RESULTS_BORDERS.cardBorder}>
            <CardContent className="p-0">
              {/* Header */}
              <div className={`${RESULTS_SPACING.cardPadding} border-b ${RESULTS_BORDERS.divider}`}>
                <h3 className={`${RESULTS_TYPOGRAPHY.cardTitle} truncate`}>
                  {breach.name}
                </h3>
                {breach.year && (
                  <div className={`flex items-center gap-1.5 mt-1 ${RESULTS_TYPOGRAPHY.caption}`}>
                    <Calendar className="h-3 w-3" />
                    <span>{breach.year}</span>
                  </div>
                )}
              </div>

              {/* Data types */}
              {breach.dataTypes.length > 0 && (
                <div className={`px-3 py-2 border-b ${RESULTS_BORDERS.divider} ${RESULTS_BACKGROUNDS.subtle}`}>
                  <div className="flex items-center gap-2 mb-1.5">
                    <Database className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className={RESULTS_TYPOGRAPHY.sectionTitle}>Data Exposed</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {breach.dataTypes.slice(0, 6).map((dataType, idx) => (
                      <Badge 
                        key={idx} 
                        variant="secondary"
                        className="text-[10px] font-normal h-5 px-1.5"
                      >
                        {getDataTypeLabel(dataType)}
                      </Badge>
                    ))}
                    {breach.dataTypes.length > 6 && (
                      <Badge variant="outline" className="text-[10px] font-normal h-5 px-1.5">
                        +{breach.dataTypes.length - 6}
                      </Badge>
                    )}
                  </div>
                </div>
              )}

              {/* Impact */}
              <div className={`${RESULTS_SPACING.cardPadding} ${RESULTS_BACKGROUNDS.subtle}`}>
                <p className={RESULTS_TYPOGRAPHY.caption}>
                  {getImpactExplanation(breach.dataTypes)}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Next steps */}
      <Card className={`${RESULTS_SPACING.cardPadding} bg-primary/5 ${RESULTS_BORDERS.cardBorder}`}>
        <h4 className={`${RESULTS_TYPOGRAPHY.sectionTitle} mb-2`}>Next Steps</h4>
        <ul className={`${RESULTS_TYPOGRAPHY.caption} space-y-1.5`}>
          <li className="flex items-start gap-2">
            <span className="text-primary font-medium">1.</span>
            Update passwords for affected services.
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary font-medium">2.</span>
            Enable two-factor authentication.
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary font-medium">3.</span>
            Monitor accounts for unusual activity.
          </li>
        </ul>
      </Card>
    </div>
  );
}

export default BreachesTab;
