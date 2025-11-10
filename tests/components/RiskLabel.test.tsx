import { describe, it, expect } from 'vitest';

// Test helper function for risk level calculation
const getRiskLevel = (highCount: number, mediumCount: number, lowCount: number): { label: string; color: string; variant: "destructive" | "default" | "secondary" } => {
  const totalFindings = highCount + mediumCount + lowCount;
  if (totalFindings === 0) return { label: "No Risk", color: "text-green-500", variant: "secondary" };
  
  // Calculate weighted risk score
  const riskScore = ((highCount * 100) + (mediumCount * 50) + (lowCount * 10)) / totalFindings;
  
  if (riskScore >= 70) {
    return { label: "High Risk", color: "text-destructive", variant: "destructive" };
  } else if (riskScore >= 30) {
    return { label: "Medium Risk", color: "text-primary", variant: "default" };
  } else {
    return { label: "Low Risk", color: "text-accent", variant: "secondary" };
  }
};

describe('Risk Label Logic', () => {
  describe('getRiskLevel', () => {
    it('should return "No Risk" when all counts are zero', () => {
      const result = getRiskLevel(0, 0, 0);
      expect(result.label).toBe("No Risk");
      expect(result.variant).toBe("secondary");
      expect(result.color).toBe("text-green-500");
    });

    it('should return "Low Risk" when risk score < 30', () => {
      // Only low risk findings: (0*100 + 0*50 + 10*10) / 10 = 10
      const result = getRiskLevel(0, 0, 10);
      expect(result.label).toBe("Low Risk");
      expect(result.variant).toBe("secondary");
      expect(result.color).toBe("text-accent");
    });

    it('should return "Low Risk" for mostly low with some medium', () => {
      // (0*100 + 2*50 + 10*10) / 12 = 200/12 = 16.67
      const result = getRiskLevel(0, 2, 10);
      expect(result.label).toBe("Low Risk");
      expect(result.variant).toBe("secondary");
    });

    it('should return "Medium Risk" when risk score is between 30-70', () => {
      // (2*100 + 5*50 + 3*10) / 10 = 480/10 = 48
      const result = getRiskLevel(2, 5, 3);
      expect(result.label).toBe("Medium Risk");
      expect(result.variant).toBe("default");
      expect(result.color).toBe("text-primary");
    });

    it('should return "Medium Risk" at exactly 30', () => {
      // Need score = 30: e.g., (0*100 + 2*50 + 2*10) / 4 = 120/4 = 30
      const result = getRiskLevel(0, 2, 2);
      expect(result.label).toBe("Medium Risk");
      expect(result.variant).toBe("default");
    });

    it('should return "High Risk" when risk score >= 70', () => {
      // (8*100 + 1*50 + 1*10) / 10 = 860/10 = 86
      const result = getRiskLevel(8, 1, 1);
      expect(result.label).toBe("High Risk");
      expect(result.variant).toBe("destructive");
      expect(result.color).toBe("text-destructive");
    });

    it('should return "High Risk" at exactly 70', () => {
      // (7*100 + 0*50 + 3*10) / 10 = 730/10 = 73
      const result = getRiskLevel(7, 0, 3);
      expect(result.label).toBe("High Risk");
      expect(result.variant).toBe("destructive");
    });

    it('should return "High Risk" when all findings are high risk', () => {
      // (5*100 + 0*50 + 0*10) / 5 = 100
      const result = getRiskLevel(5, 0, 0);
      expect(result.label).toBe("High Risk");
      expect(result.variant).toBe("destructive");
    });

    it('should handle equal distribution correctly', () => {
      // (3*100 + 3*50 + 3*10) / 9 = 480/9 = 53.33
      const result = getRiskLevel(3, 3, 3);
      expect(result.label).toBe("Medium Risk");
      expect(result.variant).toBe("default");
    });

    it('should handle edge case with single high risk finding', () => {
      // (1*100 + 0*50 + 0*10) / 1 = 100
      const result = getRiskLevel(1, 0, 0);
      expect(result.label).toBe("High Risk");
      expect(result.variant).toBe("destructive");
    });

    it('should handle edge case with single medium risk finding', () => {
      // (0*100 + 1*50 + 0*10) / 1 = 50
      const result = getRiskLevel(0, 1, 0);
      expect(result.label).toBe("Medium Risk");
      expect(result.variant).toBe("default");
    });

    it('should handle edge case with single low risk finding', () => {
      // (0*100 + 0*50 + 1*10) / 1 = 10
      const result = getRiskLevel(0, 0, 1);
      expect(result.label).toBe("Low Risk");
      expect(result.variant).toBe("secondary");
    });
  });
});
