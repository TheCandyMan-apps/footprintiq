import React from 'react';
import { Document, Page, Text, View, StyleSheet, pdf, Svg, Path, Circle, Rect, G, Line } from '@react-pdf/renderer';
import { Finding } from './ufm';
import { redactFindings } from './redact';

// Color palette matching FootprintIQ brand
const colors = {
  primary: '#2563eb',
  primaryDark: '#1d4ed8',
  secondary: '#0ea5e9',
  accent: '#22c55e',
  critical: '#dc2626',
  high: '#ea580c',
  medium: '#d97706',
  low: '#3b82f6',
  info: '#64748b',
  text: '#1e293b',
  textMuted: '#64748b',
  textLight: '#94a3b8',
  border: '#e2e8f0',
  borderLight: '#f1f5f9',
  background: '#ffffff',
  backgroundAlt: '#f8fafc',
  success: '#22c55e',
  warning: '#f59e0b',
  danger: '#ef4444',
};

const styles = StyleSheet.create({
  page: {
    padding: 0,
    fontSize: 10,
    fontFamily: 'Helvetica',
    backgroundColor: colors.background,
  },
  contentPage: {
    padding: 40,
    paddingTop: 50,
    paddingBottom: 60,
    fontSize: 10,
    fontFamily: 'Helvetica',
    backgroundColor: colors.background,
  },
  // Cover Page Styles
  coverPage: {
    backgroundColor: colors.background,
    position: 'relative',
  },
  coverHeader: {
    backgroundColor: colors.primary,
    paddingTop: 60,
    paddingBottom: 80,
    paddingHorizontal: 40,
  },
  coverGradientOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 200,
    backgroundColor: colors.primary,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
  },
  logoText: {
    fontSize: 28,
    fontFamily: 'Helvetica-Bold',
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  logoSubtext: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  coverTitle: {
    fontSize: 32,
    fontFamily: 'Helvetica-Bold',
    color: '#ffffff',
    marginTop: 20,
  },
  coverSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 8,
  },
  coverContent: {
    padding: 40,
  },
  coverInfoBox: {
    backgroundColor: colors.backgroundAlt,
    borderRadius: 8,
    padding: 24,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.border,
  },
  coverInfoTitle: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  coverInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  coverInfoRowLast: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 0,
    paddingBottom: 0,
    borderBottomWidth: 0,
  },
  coverInfoLabel: {
    fontSize: 10,
    color: colors.textMuted,
  },
  coverInfoValue: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: colors.text,
  },
  // Stats Grid
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 24,
    gap: 12,
  },
  statCard: {
    width: '48%',
    backgroundColor: colors.backgroundAlt,
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statCardAccent: {
    borderLeftWidth: 4,
  },
  statValue: {
    fontSize: 24,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 10,
    color: colors.textMuted,
  },
  // Severity Distribution
  severityGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  severityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '48%',
    marginBottom: 8,
  },
  severityDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  severityCount: {
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
    color: colors.text,
    marginRight: 6,
  },
  severityLabel: {
    fontSize: 10,
    color: colors.textMuted,
  },
  // Page Header
  pageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
  },
  pageHeaderTitle: {
    fontSize: 18,
    fontFamily: 'Helvetica-Bold',
    color: colors.text,
  },
  pageHeaderBrand: {
    fontSize: 10,
    color: colors.primary,
    fontFamily: 'Helvetica-Bold',
  },
  // Section Styles
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
    color: colors.text,
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  // Table Styles
  table: {
    marginTop: 8,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
  },
  tableHeaderText: {
    color: '#ffffff',
    fontFamily: 'Helvetica-Bold',
    fontSize: 9,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    backgroundColor: colors.background,
  },
  tableRowAlt: {
    backgroundColor: colors.backgroundAlt,
  },
  tableCell: {
    fontSize: 9,
    color: colors.text,
  },
  tableCellMuted: {
    fontSize: 8,
    color: colors.textMuted,
  },
  // Badge Styles
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    fontSize: 7,
    fontFamily: 'Helvetica-Bold',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  badgeCritical: {
    backgroundColor: colors.critical,
    color: '#ffffff',
  },
  badgeHigh: {
    backgroundColor: colors.high,
    color: '#ffffff',
  },
  badgeMedium: {
    backgroundColor: colors.medium,
    color: '#ffffff',
  },
  badgeLow: {
    backgroundColor: colors.low,
    color: '#ffffff',
  },
  badgeInfo: {
    backgroundColor: colors.info,
    color: '#ffffff',
  },
  // Finding Card
  findingCard: {
    marginBottom: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  findingCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: colors.backgroundAlt,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  findingCardTitle: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: colors.text,
    flex: 1,
    marginRight: 12,
  },
  findingCardBody: {
    padding: 12,
  },
  findingMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 10,
  },
  findingMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  findingMetaLabel: {
    fontSize: 8,
    color: colors.textMuted,
    marginRight: 4,
  },
  findingMetaValue: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: colors.text,
  },
  findingDescription: {
    fontSize: 9,
    color: colors.text,
    lineHeight: 1.5,
    marginTop: 8,
  },
  findingImpact: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#fef3c7',
    borderRadius: 4,
    borderLeftWidth: 3,
    borderLeftColor: colors.warning,
  },
  findingImpactLabel: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: colors.warning,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  findingImpactText: {
    fontSize: 9,
    color: '#92400e',
    lineHeight: 1.4,
  },
  // Evidence
  evidenceSection: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  evidenceTitle: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: colors.textMuted,
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  evidenceItem: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  evidenceKey: {
    fontSize: 8,
    color: colors.textMuted,
    width: 80,
  },
  evidenceValue: {
    fontSize: 8,
    color: colors.text,
    flex: 1,
  },
  // Recommendations
  recommendationCard: {
    backgroundColor: colors.backgroundAlt,
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  recommendationTitle: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    color: colors.text,
    marginBottom: 10,
  },
  recommendationList: {
    paddingLeft: 8,
  },
  recommendationItem: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  recommendationBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary,
    marginRight: 10,
    marginTop: 4,
  },
  recommendationText: {
    fontSize: 9,
    color: colors.text,
    flex: 1,
    lineHeight: 1.5,
  },
  // Footer
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 40,
    backgroundColor: colors.backgroundAlt,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  footerText: {
    fontSize: 8,
    color: colors.textMuted,
  },
  footerBrand: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: colors.primary,
  },
  // Cover footer
  coverFooter: {
    position: 'absolute',
    bottom: 40,
    left: 40,
    right: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  confidentialBadge: {
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
    borderRadius: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  confidentialText: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: colors.danger,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  // Utility
  row: {
    flexDirection: 'row',
  },
  text: {
    fontSize: 10,
    color: colors.text,
    lineHeight: 1.5,
  },
  textMuted: {
    fontSize: 9,
    color: colors.textMuted,
  },
  textSmall: {
    fontSize: 8,
    color: colors.textMuted,
  },
});

// Icon components
const ShieldIcon = ({ color = colors.primary, size = 24 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
      fill="none"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M9 12l2 2 4-4"
      fill="none"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

interface PDFReportProps {
  findings: Finding[];
  reportDate: string;
  scanTarget?: string;
  scanId?: string;
}

const PDFReport: React.FC<PDFReportProps> = ({ findings, reportDate, scanTarget, scanId }) => {
  const safeFindings = Array.isArray(findings) ? findings : [];
  
  const severityCounts = {
    critical: safeFindings.filter(f => f?.severity === 'critical').length,
    high: safeFindings.filter(f => f?.severity === 'high').length,
    medium: safeFindings.filter(f => f?.severity === 'medium').length,
    low: safeFindings.filter(f => f?.severity === 'low').length,
    info: safeFindings.filter(f => f?.severity === 'info').length,
  };

  const accountCount = safeFindings.filter(f => f?.type?.includes('account') || f?.type?.includes('profile')).length;
  const breachCount = safeFindings.filter(f => f?.type?.includes('breach') || f?.severity === 'high' || f?.severity === 'critical').length;
  
  const riskScore = Math.max(
    0,
    100 - (severityCounts.critical * 15 + severityCounts.high * 10 + severityCounts.medium * 5 + severityCounts.low * 2)
  );

  const getRiskLevel = (score: number) => {
    if (score >= 80) return { label: 'Low Risk', color: colors.success };
    if (score >= 60) return { label: 'Moderate Risk', color: colors.warning };
    return { label: 'High Risk', color: colors.danger };
  };

  const risk = getRiskLevel(riskScore);

  const getBadgeStyle = (severity: string) => {
    switch (severity) {
      case 'critical': return styles.badgeCritical;
      case 'high': return styles.badgeHigh;
      case 'medium': return styles.badgeMedium;
      case 'low': return styles.badgeLow;
      default: return styles.badgeInfo;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return colors.critical;
      case 'high': return colors.high;
      case 'medium': return colors.medium;
      case 'low': return colors.low;
      default: return colors.info;
    }
  };

  // Paginate findings for detailed section
  const findingsPerPage = 4;
  const detailedPages = [];
  for (let i = 0; i < Math.min(safeFindings.length, 20); i += findingsPerPage) {
    detailedPages.push(safeFindings.slice(i, i + findingsPerPage));
  }

  return (
    <Document>
      {/* Cover Page */}
      <Page size="A4" style={styles.coverPage}>
        {/* Header with gradient effect */}
        <View style={styles.coverHeader}>
          <View style={styles.logoContainer}>
            <ShieldIcon color="#ffffff" size={32} />
            <View style={{ marginLeft: 12 }}>
              <Text style={styles.logoText}>FootprintIQ</Text>
              <Text style={styles.logoSubtext}>Digital Footprint Intelligence</Text>
            </View>
          </View>
          <Text style={styles.coverTitle}>Investigation Report</Text>
          <Text style={styles.coverSubtitle}>Digital Footprint Analysis</Text>
        </View>

        <View style={styles.coverContent}>
          {/* Scan Details */}
          <View style={styles.coverInfoBox}>
            <Text style={styles.coverInfoTitle}>Scan Target</Text>
            <View style={styles.coverInfoRow}>
              <Text style={styles.coverInfoLabel}>Target</Text>
              <Text style={styles.coverInfoValue}>{scanTarget || 'Not specified'}</Text>
            </View>
            <View style={styles.coverInfoRow}>
              <Text style={styles.coverInfoLabel}>Scan ID</Text>
              <Text style={styles.coverInfoValue}>{scanId ? `${scanId.substring(0, 8)}...` : 'N/A'}</Text>
            </View>
            <View style={styles.coverInfoRowLast}>
              <Text style={styles.coverInfoLabel}>Generated</Text>
              <Text style={styles.coverInfoValue}>{reportDate}</Text>
            </View>
          </View>

          {/* Stats Grid */}
          <View style={styles.statsGrid}>
            <View style={[styles.statCard, styles.statCardAccent, { borderLeftColor: colors.primary }]}>
              <Text style={[styles.statValue, { color: colors.primary }]}>{safeFindings.length}</Text>
              <Text style={styles.statLabel}>Total Findings</Text>
            </View>
            <View style={[styles.statCard, styles.statCardAccent, { borderLeftColor: risk.color }]}>
              <Text style={[styles.statValue, { color: risk.color }]}>{riskScore}/100</Text>
              <Text style={styles.statLabel}>{risk.label}</Text>
            </View>
            <View style={[styles.statCard, styles.statCardAccent, { borderLeftColor: colors.secondary }]}>
              <Text style={[styles.statValue, { color: colors.secondary }]}>{accountCount}</Text>
              <Text style={styles.statLabel}>Accounts Found</Text>
            </View>
            <View style={[styles.statCard, styles.statCardAccent, { borderLeftColor: colors.high }]}>
              <Text style={[styles.statValue, { color: colors.high }]}>{breachCount}</Text>
              <Text style={styles.statLabel}>Breach Exposures</Text>
            </View>
          </View>

          {/* Severity Distribution */}
          <View style={styles.coverInfoBox}>
            <Text style={styles.coverInfoTitle}>Severity Distribution</Text>
            <View style={styles.severityGrid}>
              {severityCounts.critical > 0 && (
                <View style={styles.severityItem}>
                  <View style={[styles.severityDot, { backgroundColor: colors.critical }]} />
                  <Text style={styles.severityCount}>{severityCounts.critical}</Text>
                  <Text style={styles.severityLabel}>Critical</Text>
                </View>
              )}
              {severityCounts.high > 0 && (
                <View style={styles.severityItem}>
                  <View style={[styles.severityDot, { backgroundColor: colors.high }]} />
                  <Text style={styles.severityCount}>{severityCounts.high}</Text>
                  <Text style={styles.severityLabel}>High</Text>
                </View>
              )}
              {severityCounts.medium > 0 && (
                <View style={styles.severityItem}>
                  <View style={[styles.severityDot, { backgroundColor: colors.medium }]} />
                  <Text style={styles.severityCount}>{severityCounts.medium}</Text>
                  <Text style={styles.severityLabel}>Medium</Text>
                </View>
              )}
              {severityCounts.low > 0 && (
                <View style={styles.severityItem}>
                  <View style={[styles.severityDot, { backgroundColor: colors.low }]} />
                  <Text style={styles.severityCount}>{severityCounts.low}</Text>
                  <Text style={styles.severityLabel}>Low</Text>
                </View>
              )}
              {severityCounts.info > 0 && (
                <View style={styles.severityItem}>
                  <View style={[styles.severityDot, { backgroundColor: colors.info }]} />
                  <Text style={styles.severityCount}>{severityCounts.info}</Text>
                  <Text style={styles.severityLabel}>Info</Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Cover Footer */}
        <View style={styles.coverFooter}>
          <View style={styles.confidentialBadge}>
            <Text style={styles.confidentialText}>Confidential</Text>
          </View>
          <Text style={styles.textSmall}>For authorized use only</Text>
        </View>
      </Page>

      {/* Findings Summary Page */}
      <Page size="A4" style={styles.contentPage}>
        <View style={styles.pageHeader}>
          <Text style={styles.pageHeaderTitle}>Findings Summary</Text>
          <Text style={styles.pageHeaderBrand}>FootprintIQ</Text>
        </View>

        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderText, { width: '12%' }]}>Severity</Text>
            <Text style={[styles.tableHeaderText, { width: '18%' }]}>Type</Text>
            <Text style={[styles.tableHeaderText, { width: '35%' }]}>Finding</Text>
            <Text style={[styles.tableHeaderText, { width: '20%' }]}>Provider</Text>
            <Text style={[styles.tableHeaderText, { width: '15%', textAlign: 'right' }]}>Confidence</Text>
          </View>
          
          {safeFindings.slice(0, 15).map((finding, idx) => (
            <View key={idx} style={[styles.tableRow, idx % 2 === 1 ? styles.tableRowAlt : {}]}>
              <View style={{ width: '12%' }}>
                <Text style={[styles.badge, getBadgeStyle(finding?.severity || 'info')]}>
                  {(finding?.severity || 'info').toUpperCase()}
                </Text>
              </View>
              <Text style={[styles.tableCell, { width: '18%' }]}>
                {(finding?.type || 'Unknown').replace(/\./g, ' ').substring(0, 15)}
              </Text>
              <View style={{ width: '35%' }}>
                <Text style={styles.tableCell}>
                  {(finding?.title || 'Untitled').length > 40 
                    ? (finding?.title || 'Untitled').substring(0, 40) + '...' 
                    : (finding?.title || 'Untitled')}
                </Text>
              </View>
              <Text style={[styles.tableCellMuted, { width: '20%' }]}>{finding?.provider || 'Unknown'}</Text>
              <Text style={[styles.tableCell, { width: '15%', textAlign: 'right' }]}>
                {(finding?.confidence ?? 0).toFixed(0)}%
              </Text>
            </View>
          ))}
        </View>

        {safeFindings.length > 15 && (
          <Text style={[styles.textMuted, { marginTop: 12, textAlign: 'center' }]}>
            Showing 15 of {safeFindings.length} findings. See detailed section for complete list.
          </Text>
        )}

        <View style={styles.footer}>
          <Text style={styles.footerText}>Page 2 of {2 + detailedPages.length + 1}</Text>
          <Text style={styles.footerBrand}>FootprintIQ</Text>
          <Text style={styles.footerText}>{new Date().toLocaleDateString()}</Text>
        </View>
      </Page>

      {/* Detailed Findings Pages */}
      {detailedPages.map((pageFindings, pageIdx) => (
        <Page key={pageIdx} size="A4" style={styles.contentPage}>
          <View style={styles.pageHeader}>
            <Text style={styles.pageHeaderTitle}>Detailed Findings</Text>
            <Text style={styles.pageHeaderBrand}>FootprintIQ</Text>
          </View>

          {pageFindings.map((finding, idx) => {
            const evidence = Array.isArray(finding?.evidence) ? finding.evidence : [];
            const globalIdx = pageIdx * findingsPerPage + idx + 1;
            
            return (
              <View key={idx} style={styles.findingCard}>
                <View style={styles.findingCardHeader}>
                  <Text style={styles.findingCardTitle}>
                    {globalIdx}. {finding?.title || 'Untitled Finding'}
                  </Text>
                  <Text style={[styles.badge, getBadgeStyle(finding?.severity || 'info')]}>
                    {(finding?.severity || 'info').toUpperCase()}
                  </Text>
                </View>
                
                <View style={styles.findingCardBody}>
                  <View style={styles.findingMeta}>
                    <View style={styles.findingMetaItem}>
                      <Text style={styles.findingMetaLabel}>Provider:</Text>
                      <Text style={styles.findingMetaValue}>{finding?.provider || 'Unknown'}</Text>
                    </View>
                    <View style={styles.findingMetaItem}>
                      <Text style={styles.findingMetaLabel}>Category:</Text>
                      <Text style={styles.findingMetaValue}>{finding?.providerCategory || 'Unknown'}</Text>
                    </View>
                    <View style={styles.findingMetaItem}>
                      <Text style={styles.findingMetaLabel}>Confidence:</Text>
                      <Text style={styles.findingMetaValue}>{(finding?.confidence ?? 0).toFixed(0)}%</Text>
                    </View>
                  </View>

                  {finding?.description && (
                    <Text style={styles.findingDescription}>
                      {finding.description.substring(0, 200)}
                      {finding.description.length > 200 ? '...' : ''}
                    </Text>
                  )}

                  {finding?.impact && (
                    <View style={styles.findingImpact}>
                      <Text style={styles.findingImpactLabel}>Impact</Text>
                      <Text style={styles.findingImpactText}>
                        {finding.impact.substring(0, 150)}
                        {finding.impact.length > 150 ? '...' : ''}
                      </Text>
                    </View>
                  )}

                  {evidence.length > 0 && (
                    <View style={styles.evidenceSection}>
                      <Text style={styles.evidenceTitle}>Evidence</Text>
                      {evidence.slice(0, 3).map((ev, evIdx) => (
                        <View key={evIdx} style={styles.evidenceItem}>
                          <Text style={styles.evidenceKey}>{ev?.key || 'unknown'}:</Text>
                          <Text style={styles.evidenceValue}>
                            {typeof ev?.value === 'string' 
                              ? ev.value.substring(0, 60) + (ev.value.length > 60 ? '...' : '')
                              : JSON.stringify(ev?.value ?? '').substring(0, 60)}
                          </Text>
                        </View>
                      ))}
                      {evidence.length > 3 && (
                        <Text style={styles.textSmall}>+ {evidence.length - 3} more evidence items</Text>
                      )}
                    </View>
                  )}
                </View>
              </View>
            );
          })}

          <View style={styles.footer}>
            <Text style={styles.footerText}>Page {3 + pageIdx} of {2 + detailedPages.length + 1}</Text>
            <Text style={styles.footerBrand}>FootprintIQ</Text>
            <Text style={styles.footerText}>{new Date().toLocaleDateString()}</Text>
          </View>
        </Page>
      ))}

      {/* Recommendations Page */}
      <Page size="A4" style={styles.contentPage}>
        <View style={styles.pageHeader}>
          <Text style={styles.pageHeaderTitle}>Recommended Actions</Text>
          <Text style={styles.pageHeaderBrand}>FootprintIQ</Text>
        </View>

        <View style={styles.recommendationCard}>
          <Text style={styles.recommendationTitle}>🚨 Immediate Actions (Within 24 Hours)</Text>
          <View style={styles.recommendationList}>
            <View style={styles.recommendationItem}>
              <View style={[styles.recommendationBullet, { backgroundColor: colors.critical }]} />
              <Text style={styles.recommendationText}>
                Change passwords for all accounts found in data breaches immediately
              </Text>
            </View>
            <View style={styles.recommendationItem}>
              <View style={[styles.recommendationBullet, { backgroundColor: colors.critical }]} />
              <Text style={styles.recommendationText}>
                Enable two-factor authentication (2FA) on all high-value accounts
              </Text>
            </View>
            <View style={styles.recommendationItem}>
              <View style={[styles.recommendationBullet, { backgroundColor: colors.critical }]} />
              <Text style={styles.recommendationText}>
                Review recent account activity for any signs of unauthorized access
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.recommendationCard}>
          <Text style={styles.recommendationTitle}>⚠️ Short-Term Actions (1-2 Weeks)</Text>
          <View style={styles.recommendationList}>
            <View style={styles.recommendationItem}>
              <View style={[styles.recommendationBullet, { backgroundColor: colors.warning }]} />
              <Text style={styles.recommendationText}>
                Request data removal from identified data broker sites
              </Text>
            </View>
            <View style={styles.recommendationItem}>
              <View style={[styles.recommendationBullet, { backgroundColor: colors.warning }]} />
              <Text style={styles.recommendationText}>
                Update privacy settings on all social media platforms
              </Text>
            </View>
            <View style={styles.recommendationItem}>
              <View style={[styles.recommendationBullet, { backgroundColor: colors.warning }]} />
              <Text style={styles.recommendationText}>
                Consider using a password manager for unique, strong passwords
              </Text>
            </View>
            <View style={styles.recommendationItem}>
              <View style={[styles.recommendationBullet, { backgroundColor: colors.warning }]} />
              <Text style={styles.recommendationText}>
                Monitor financial accounts for any unauthorized transactions
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.recommendationCard}>
          <Text style={styles.recommendationTitle}>📋 Long-Term Strategy</Text>
          <View style={styles.recommendationList}>
            <View style={styles.recommendationItem}>
              <View style={[styles.recommendationBullet, { backgroundColor: colors.primary }]} />
              <Text style={styles.recommendationText}>
                Schedule regular privacy audits (quarterly recommended)
              </Text>
            </View>
            <View style={styles.recommendationItem}>
              <View style={[styles.recommendationBullet, { backgroundColor: colors.primary }]} />
              <Text style={styles.recommendationText}>
                Implement a minimal digital footprint approach going forward
              </Text>
            </View>
            <View style={styles.recommendationItem}>
              <View style={[styles.recommendationBullet, { backgroundColor: colors.primary }]} />
              <Text style={styles.recommendationText}>
                Use privacy-focused tools and browser extensions
              </Text>
            </View>
            <View style={styles.recommendationItem}>
              <View style={[styles.recommendationBullet, { backgroundColor: colors.primary }]} />
              <Text style={styles.recommendationText}>
                Stay informed about data privacy best practices and new threats
              </Text>
            </View>
          </View>
        </View>

        <View style={[styles.coverInfoBox, { marginTop: 20 }]}>
          <Text style={[styles.coverInfoTitle, { marginBottom: 8 }]}>Report Information</Text>
          <View style={styles.coverInfoRow}>
            <Text style={styles.coverInfoLabel}>Report Generated</Text>
            <Text style={styles.coverInfoValue}>{new Date().toISOString()}</Text>
          </View>
          <View style={styles.coverInfoRow}>
            <Text style={styles.coverInfoLabel}>Report Version</Text>
            <Text style={styles.coverInfoValue}>2.0</Text>
          </View>
          <View style={styles.coverInfoRowLast}>
            <Text style={styles.coverInfoLabel}>Classification</Text>
            <Text style={[styles.coverInfoValue, { color: colors.danger }]}>CONFIDENTIAL</Text>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Page {2 + detailedPages.length + 1} of {2 + detailedPages.length + 1}</Text>
          <Text style={styles.footerBrand}>FootprintIQ</Text>
          <Text style={styles.footerText}>{new Date().toLocaleDateString()}</Text>
        </View>
      </Page>
    </Document>
  );
};

/**
 * Export findings as PDF using @react-pdf/renderer with professional formatting
 */
export async function exportReactPDF(
  findings: Finding[], 
  redactPII: boolean = true,
  scanTarget?: string,
  scanId?: string
): Promise<void> {
  try {
    if (!findings || !Array.isArray(findings)) {
      console.warn('[PDF Export] No findings provided, generating empty report');
    }
    
    const safeFindings = Array.isArray(findings) ? findings : [];
    const data = redactPII ? redactFindings(safeFindings, true) : safeFindings;
    const reportDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    console.log(`[PDF Export] Generating professional PDF with ${data.length} findings`);
    
    const blob = await pdf(
      <PDFReport 
        findings={data} 
        reportDate={reportDate}
        scanTarget={scanTarget}
        scanId={scanId}
      />
    ).toBlob();
    
    // Generate meaningful filename
    const targetSlug = scanTarget 
      ? scanTarget.replace(/[^a-zA-Z0-9@.-]/g, '_').substring(0, 50)
      : 'investigation';
    const timestamp = Date.now();
    
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `footprintiq-${targetSlug}-${timestamp}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    console.log('[PDF Export] Professional PDF generated successfully');
  } catch (error) {
    console.error('Failed to generate PDF:', error);
    throw new Error(`Failed to generate PDF report: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
