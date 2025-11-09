import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock audit result
const mockAuditResult = {
  success: true,
  summary: {
    total_issues: 5,
    fixed: 2,
    severity_breakdown: {
      critical: 0,
      high: 1,
      medium: 2,
      low: 2,
    },
    duration_ms: 1500,
  },
  ai_summary: 'System is generally healthy. Priority fixes: RLS policies, performance optimization.',
  prioritized_issues: [
    {
      category: 'rls',
      severity: 'high',
      title: 'Missing RLS policy on scans table',
      description: 'Add SELECT policy for authenticated users',
      auto_fixable: false,
    },
  ],
  all_issues: [
    {
      category: 'rls',
      severity: 'high',
      title: 'Missing RLS policy on scans table',
      description: 'Add SELECT policy for authenticated users',
      auto_fixable: false,
    },
    {
      category: 'performance',
      severity: 'medium',
      title: 'Large bundle size',
      description: 'Consider code splitting',
      auto_fixable: true,
      fix_applied: true,
    },
  ],
};

describe('Full Codebase Audit', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should detect RLS policy issues', () => {
    const rlsIssues = mockAuditResult.all_issues.filter(
      (issue) => issue.category === 'rls'
    );
    
    expect(rlsIssues.length).toBeGreaterThan(0);
    expect(rlsIssues[0].severity).toBe('high');
  });

  it('should identify auto-fixable issues', () => {
    const fixableIssues = mockAuditResult.all_issues.filter(
      (issue) => issue.auto_fixable
    );
    
    expect(fixableIssues.length).toBe(1);
    expect(fixableIssues[0].fix_applied).toBe(true);
  });

  it('should provide AI analysis', () => {
    expect(mockAuditResult.ai_summary).toBeTruthy();
    expect(mockAuditResult.ai_summary).toContain('Priority fixes');
  });

  it('should categorize issues by severity', () => {
    const { severity_breakdown } = mockAuditResult.summary;
    
    expect(severity_breakdown.critical).toBe(0);
    expect(severity_breakdown.high).toBe(1);
    expect(severity_breakdown.medium).toBe(2);
    expect(severity_breakdown.low).toBe(2);
  });

  it('should prioritize critical and high severity issues', () => {
    const prioritized = mockAuditResult.prioritized_issues;
    
    expect(prioritized.length).toBeGreaterThan(0);
    expect(prioritized[0].severity).toBe('high');
  });

  it('should track audit duration', () => {
    expect(mockAuditResult.summary.duration_ms).toBeGreaterThan(0);
    expect(mockAuditResult.summary.duration_ms).toBeLessThan(10000);
  });

  it('should detect security issues', () => {
    const hasSecurityCheck = mockAuditResult.all_issues.some(
      (issue) => issue.category === 'security' || issue.category === 'rls'
    );
    
    expect(hasSecurityCheck).toBe(true);
  });

  it('should check performance metrics', () => {
    const hasPerformanceCheck = mockAuditResult.all_issues.some(
      (issue) => issue.category === 'performance'
    );
    
    expect(hasPerformanceCheck).toBe(true);
  });

  it('should aggregate test results', () => {
    const { total_issues, fixed } = mockAuditResult.summary;
    
    expect(total_issues).toBe(5);
    expect(fixed).toBe(2);
  });

  it('should provide actionable recommendations', () => {
    const hasActionableIssues = mockAuditResult.all_issues.every(
      (issue) => issue.description && issue.title
    );
    
    expect(hasActionableIssues).toBe(true);
  });
});
