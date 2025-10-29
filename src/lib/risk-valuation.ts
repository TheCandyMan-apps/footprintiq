import { supabase } from '@/integrations/supabase/client';

export interface RiskValuation {
  entityId: string;
  clientId?: string;
  riskType: string;
  probability: number;
  impactValue: number;
  currency: string;
  confidence: number;
}

export async function calculateRiskValue(
  entityId: string,
  findings: any[],
  clientId?: string
): Promise<RiskValuation> {
  // Base impact values by severity
  const severityImpact = {
    critical: 100000,
    high: 50000,
    medium: 20000,
    low: 5000,
  };

  // Calculate probability based on finding count and severity
  const criticalCount = findings.filter(f => f.severity === 'critical').length;
  const highCount = findings.filter(f => f.severity === 'high').length;
  
  const probability = Math.min(
    0.95,
    (criticalCount * 0.15 + highCount * 0.08 + findings.length * 0.02)
  );

  // Calculate expected value
  let totalImpact = 0;
  findings.forEach(f => {
    const impact = severityImpact[f.severity as keyof typeof severityImpact] || 0;
    totalImpact += impact;
  });

  const expectedValue = totalImpact * probability;

  // Confidence based on data completeness
  const confidence = Math.min(0.95, findings.length * 0.05);

  const valuation: RiskValuation = {
    entityId,
    clientId,
    riskType: 'cybersecurity',
    probability: Math.round(probability * 100) / 100,
    impactValue: Math.round(expectedValue),
    currency: 'USD',
    confidence: Math.round(confidence * 100) / 100,
  };

  // Store valuation
  try {
    await supabase.from('risk_valuations').insert({
      entity_id: valuation.entityId,
      client_id: valuation.clientId,
      risk_type: valuation.riskType,
      probability: valuation.probability,
      impact_value: valuation.impactValue,
      currency: valuation.currency,
      confidence: valuation.confidence,
      calculated_at: new Date().toISOString(),
      metadata: {
        findingsAnalyzed: findings.length,
        criticalCount,
        highCount,
      },
    });
  } catch (error) {
    console.error('Error storing risk valuation:', error);
  }

  return valuation;
}

export async function calculateROI(
  clientId: string,
  timeframe: 'quarter' | 'year'
): Promise<{
  costAvoided: number;
  platformCost: number;
  roi: number;
  currency: string;
}> {
  try {
    // Fetch risk valuations for the client
    const { data: valuations } = await supabase
      .from('risk_valuations')
      .select('*')
      .eq('client_id', clientId);

    if (!valuations || valuations.length === 0) {
      return { costAvoided: 0, platformCost: 0, roi: 0, currency: 'USD' };
    }

    // Calculate total risk value avoided
    const totalRiskValue = valuations.reduce((sum, v) => {
      return sum + (v.impact_value * v.probability);
    }, 0);

    // Estimate platform cost (simplified)
    const platformCost = timeframe === 'quarter' ? 5000 : 20000;

    // Calculate ROI
    const costAvoided = Math.round(totalRiskValue * 0.7); // 70% mitigation
    const roi = platformCost > 0 ? (costAvoided - platformCost) / platformCost : 0;

    return {
      costAvoided,
      platformCost,
      roi: Math.round(roi * 100) / 100,
      currency: 'USD',
    };
  } catch (error) {
    console.error('Error calculating ROI:', error);
    return { costAvoided: 0, platformCost: 0, roi: 0, currency: 'USD' };
  }
}

export function formatCurrency(value: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatROI(roi: number): string {
  return `${roi.toFixed(1)}×`;
}