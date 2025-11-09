/**
 * Tests for subscription tier gating and feature access
 */

import { describe, it, expect } from '@jest/globals';
import { hasFeatureAccess, getQuotas, getScanCost, PLAN_QUOTAS } from '../src/lib/workspace/quotas';
import type { SubscriptionTier } from '../src/lib/workspace/quotas';

describe('Tier Gating System', () => {
  describe('Feature Access Control', () => {
    it('should deny Maigret access for free tier', () => {
      expect(hasFeatureAccess('free', 'maigret')).toBe(false);
    });

    it('should allow Maigret access for pro tier', () => {
      expect(hasFeatureAccess('pro', 'maigret')).toBe(true);
    });

    it('should allow Maigret access for enterprise tier', () => {
      expect(hasFeatureAccess('enterprise', 'maigret')).toBe(true);
    });

    it('should deny dark web access for free tier', () => {
      expect(hasFeatureAccess('free', 'darkweb')).toBe(false);
    });

    it('should allow dark web access for pro tier', () => {
      expect(hasFeatureAccess('pro', 'darkweb')).toBe(true);
    });

    it('should deny advanced scan for free tier', () => {
      expect(hasFeatureAccess('free', 'advanced_scan')).toBe(false);
    });

    it('should allow advanced scan for pro tier', () => {
      expect(hasFeatureAccess('pro', 'advanced_scan')).toBe(true);
    });

    it('should deny batch scan for free and pro tiers', () => {
      expect(hasFeatureAccess('free', 'batch_scan')).toBe(false);
      expect(hasFeatureAccess('pro', 'batch_scan')).toBe(false);
    });

    it('should allow batch scan for enterprise tier only', () => {
      expect(hasFeatureAccess('enterprise', 'batch_scan')).toBe(true);
    });

    it('should allow AI analyst for tiers with quota', () => {
      expect(hasFeatureAccess('free', 'ai_analyst')).toBe(true); // 5 queries
      expect(hasFeatureAccess('pro', 'ai_analyst')).toBe(true); // 50 queries
      expect(hasFeatureAccess('enterprise', 'ai_analyst')).toBe(true); // unlimited
    });

    it('should deny priority support for free and pro', () => {
      expect(hasFeatureAccess('free', 'priority_support')).toBe(false);
      expect(hasFeatureAccess('pro', 'priority_support')).toBe(false);
    });

    it('should allow priority support for enterprise', () => {
      expect(hasFeatureAccess('enterprise', 'priority_support')).toBe(true);
    });

    it('should deny SSO for non-enterprise tiers', () => {
      expect(hasFeatureAccess('free', 'sso')).toBe(false);
      expect(hasFeatureAccess('pro', 'sso')).toBe(false);
    });

    it('should allow SSO for enterprise', () => {
      expect(hasFeatureAccess('enterprise', 'sso')).toBe(true);
    });
  });

  describe('Quota Management', () => {
    it('should return correct quotas for free tier', () => {
      const quotas = getQuotas('free');
      expect(quotas.scansPerMonth).toBe(10);
      expect(quotas.darkWebAccess).toBe(false);
      expect(quotas.teamMembers).toBe(1);
    });

    it('should return correct quotas for pro tier', () => {
      const quotas = getQuotas('pro');
      expect(quotas.scansPerMonth).toBe(100);
      expect(quotas.darkWebAccess).toBe(true);
      expect(quotas.teamMembers).toBe(5);
    });

    it('should return correct quotas for enterprise tier', () => {
      const quotas = getQuotas('enterprise');
      expect(quotas.scansPerMonth).toBe(-1); // unlimited
      expect(quotas.darkWebAccess).toBe(true);
      expect(quotas.teamMembers).toBe(-1); // unlimited
    });

    it('should map legacy analyst tier to pro', () => {
      const quotas = getQuotas('analyst' as any);
      const proQuotas = getQuotas('pro');
      expect(quotas).toEqual(proQuotas);
    });
  });

  describe('Credit System', () => {
    it('should charge 1 credit for basic scan on free tier', () => {
      expect(getScanCost('free', 'basic')).toBe(1);
    });

    it('should charge 5 credits for advanced scan on free tier', () => {
      expect(getScanCost('free', 'advanced')).toBe(5);
    });

    it('should charge 3 credits for Maigret scan on pro tier', () => {
      expect(getScanCost('pro', 'maigret')).toBe(3);
    });

    it('should charge 10 credits for dark web scan on pro tier', () => {
      expect(getScanCost('pro', 'darkweb')).toBe(10);
    });

    it('should charge 0 credits for all scans on enterprise tier', () => {
      expect(getScanCost('enterprise', 'basic')).toBe(0);
      expect(getScanCost('enterprise', 'advanced')).toBe(0);
      expect(getScanCost('enterprise', 'maigret')).toBe(0);
      expect(getScanCost('enterprise', 'darkweb')).toBe(0);
    });

    it('should default to basic cost for unknown scan types', () => {
      expect(getScanCost('free', 'unknown_type')).toBe(1);
      expect(getScanCost('pro', 'unknown_type')).toBe(1);
    });
  });

  describe('Tier Limits', () => {
    it('should enforce monthly scan limits', () => {
      expect(PLAN_QUOTAS.free.scansPerMonth).toBe(10);
      expect(PLAN_QUOTAS.pro.scansPerMonth).toBe(100);
      expect(PLAN_QUOTAS.enterprise.scansPerMonth).toBe(-1);
    });

    it('should enforce monitor limits', () => {
      expect(PLAN_QUOTAS.free.monitorsPerWorkspace).toBe(2);
      expect(PLAN_QUOTAS.pro.monitorsPerWorkspace).toBe(10);
      expect(PLAN_QUOTAS.enterprise.monitorsPerWorkspace).toBe(-1);
    });

    it('should enforce API rate limits', () => {
      expect(PLAN_QUOTAS.free.apiCallsPerHour).toBe(100);
      expect(PLAN_QUOTAS.pro.apiCallsPerHour).toBe(1000);
      expect(PLAN_QUOTAS.enterprise.apiCallsPerHour).toBe(10000);
    });

    it('should enforce AI query limits', () => {
      expect(PLAN_QUOTAS.free.aiAnalystQueries).toBe(5);
      expect(PLAN_QUOTAS.pro.aiAnalystQueries).toBe(50);
      expect(PLAN_QUOTAS.enterprise.aiAnalystQueries).toBe(-1);
    });
  });

  describe('Access Scenarios', () => {
    const testScenarios = [
      {
        name: 'Free user trying advanced features',
        tier: 'free' as SubscriptionTier,
        feature: 'maigret',
        expected: false,
      },
      {
        name: 'Pro user accessing dark web',
        tier: 'pro' as SubscriptionTier,
        feature: 'darkweb',
        expected: true,
      },
      {
        name: 'Pro user trying batch scan',
        tier: 'pro' as SubscriptionTier,
        feature: 'batch_scan',
        expected: false,
      },
      {
        name: 'Enterprise user accessing all features',
        tier: 'enterprise' as SubscriptionTier,
        feature: 'batch_scan',
        expected: true,
      },
    ];

    testScenarios.forEach((scenario) => {
      it(scenario.name, () => {
        const hasAccess = hasFeatureAccess(scenario.tier, scenario.feature);
        expect(hasAccess).toBe(scenario.expected);
      });
    });
  });
});
