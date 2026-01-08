import React from 'react';
import { Document, Page, Text, View, StyleSheet, pdf } from '@react-pdf/renderer';
import { Finding } from './ufm';
import { redactFindings } from './redact';

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: 'Helvetica',
    backgroundColor: '#ffffff',
  },
  header: {
    fontSize: 24,
    marginBottom: 20,
    color: '#2563eb',
    fontFamily: 'Helvetica-Bold',
    textAlign: 'center',
  },
  subHeader: {
    fontSize: 14,
    marginBottom: 10,
    color: '#1e293b',
    fontFamily: 'Helvetica-Bold',
    marginTop: 15,
  },
  text: {
    fontSize: 10,
    marginBottom: 5,
    color: '#334155',
    lineHeight: 1.5,
  },
  table: {
    marginTop: 10,
    marginBottom: 20,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#2563eb',
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderRadius: 4,
    marginBottom: 5,
  },
  tableHeaderText: {
    color: '#ffffff',
    fontFamily: 'Helvetica-Bold',
    fontSize: 9,
  },
  tableCell: {
    fontSize: 8,
    color: '#475569',
  },
  severityBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
  },
  critical: {
    backgroundColor: '#dc2626',
    color: '#ffffff',
  },
  high: {
    backgroundColor: '#ea580c',
    color: '#ffffff',
  },
  medium: {
    backgroundColor: '#facc15',
    color: '#000000',
  },
  low: {
    backgroundColor: '#3b82f6',
    color: '#ffffff',
  },
  info: {
    backgroundColor: '#94a3b8',
    color: '#ffffff',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: 'center',
    color: '#64748b',
    fontSize: 8,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingTop: 10,
  },
  summaryBox: {
    backgroundColor: '#f8fafc',
    padding: 15,
    borderRadius: 6,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 10,
    color: '#475569',
    fontFamily: 'Helvetica-Bold',
  },
  summaryValue: {
    fontSize: 10,
    color: '#1e293b',
  },
  findingCard: {
    marginBottom: 15,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 4,
    backgroundColor: '#fafafa',
  },
  findingTitle: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: '#1e293b',
    marginBottom: 6,
  },
  evidenceList: {
    marginTop: 8,
    paddingLeft: 10,
  },
  evidenceItem: {
    fontSize: 8,
    color: '#64748b',
    marginBottom: 3,
  },
});

interface PDFReportProps {
  findings: Finding[];
  reportDate: string;
}

const PDFReport: React.FC<PDFReportProps> = ({ findings, reportDate }) => {
  const severityCounts = {
    critical: findings.filter(f => f.severity === 'critical').length,
    high: findings.filter(f => f.severity === 'high').length,
    medium: findings.filter(f => f.severity === 'medium').length,
    low: findings.filter(f => f.severity === 'low').length,
    info: findings.filter(f => f.severity === 'info').length,
  };

  const riskScore = Math.max(
    0,
    100 - (severityCounts.critical * 15 + severityCounts.high * 10 + severityCounts.medium * 5 + severityCounts.low * 2)
  );

  return (
    <Document>
      {/* Cover Page */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.header}>FootprintIQ Digital Footprint Report</Text>
        
        <View style={styles.summaryBox}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Report Date:</Text>
            <Text style={styles.summaryValue}>{reportDate}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Findings:</Text>
            <Text style={styles.summaryValue}>{findings.length}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Risk Score:</Text>
            <Text style={styles.summaryValue}>{riskScore}/100</Text>
          </View>
        </View>

        <Text style={styles.subHeader}>Severity Distribution</Text>
        <View style={styles.summaryBox}>
          {severityCounts.critical > 0 && (
            <View style={styles.summaryRow}>
              <Text style={[styles.severityBadge, styles.critical]}>CRITICAL</Text>
              <Text style={styles.summaryValue}>{severityCounts.critical} findings</Text>
            </View>
          )}
          {severityCounts.high > 0 && (
            <View style={styles.summaryRow}>
              <Text style={[styles.severityBadge, styles.high]}>HIGH</Text>
              <Text style={styles.summaryValue}>{severityCounts.high} findings</Text>
            </View>
          )}
          {severityCounts.medium > 0 && (
            <View style={styles.summaryRow}>
              <Text style={[styles.severityBadge, styles.medium]}>MEDIUM</Text>
              <Text style={styles.summaryValue}>{severityCounts.medium} findings</Text>
            </View>
          )}
          {severityCounts.low > 0 && (
            <View style={styles.summaryRow}>
              <Text style={[styles.severityBadge, styles.low]}>LOW</Text>
              <Text style={styles.summaryValue}>{severityCounts.low} findings</Text>
            </View>
          )}
          {severityCounts.info > 0 && (
            <View style={styles.summaryRow}>
              <Text style={[styles.severityBadge, styles.info]}>INFO</Text>
              <Text style={styles.summaryValue}>{severityCounts.info} findings</Text>
            </View>
          )}
        </View>

        <Text style={styles.footer}>
          Generated by FootprintIQ | Confidential | {new Date().toLocaleString()}
        </Text>
      </Page>

      {/* Findings Summary Table */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.header}>Findings Summary</Text>
        
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderText, { width: '15%' }]}>Severity</Text>
            <Text style={[styles.tableHeaderText, { width: '20%' }]}>Type</Text>
            <Text style={[styles.tableHeaderText, { width: '30%' }]}>Finding</Text>
            <Text style={[styles.tableHeaderText, { width: '20%' }]}>Provider</Text>
            <Text style={[styles.tableHeaderText, { width: '15%' }]}>Confidence</Text>
          </View>
          
          {findings.slice(0, 20).map((finding, idx) => (
            <View key={idx} style={styles.tableRow}>
              <View style={{ width: '15%' }}>
                <Text
                  style={[
                    styles.severityBadge,
                    styles[finding.severity as keyof typeof styles] || styles.info,
                  ]}
                >
                  {finding.severity.toUpperCase()}
                </Text>
              </View>
              <Text style={[styles.tableCell, { width: '20%' }]}>{finding.type}</Text>
              <Text style={[styles.tableCell, { width: '30%' }]}>
                {finding.title.length > 35 ? finding.title.substring(0, 35) + '...' : finding.title}
              </Text>
              <Text style={[styles.tableCell, { width: '20%' }]}>{finding.provider}</Text>
              <Text style={[styles.tableCell, { width: '15%' }]}>{finding.confidence.toFixed(1)}%</Text>
            </View>
          ))}
        </View>

        {findings.length > 20 && (
          <Text style={styles.text}>... and {findings.length - 20} more findings</Text>
        )}

        <Text style={styles.footer}>
          Page 2 | Generated by FootprintIQ | {new Date().toLocaleString()}
        </Text>
      </Page>

      {/* Detailed Findings */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.header}>Detailed Findings</Text>
        
        {findings.slice(0, 10).map((finding, idx) => (
          <View key={idx} style={styles.findingCard}>
            <Text style={styles.findingTitle}>
              {idx + 1}. {finding.title}
            </Text>
            
            <View style={{ marginBottom: 6 }}>
              <Text
                style={[
                  styles.severityBadge,
                  styles[finding.severity as keyof typeof styles] || styles.info,
                ]}
              >
                {finding.severity.toUpperCase()}
              </Text>
            </View>

            <Text style={styles.text}>
              <Text style={{ fontFamily: 'Helvetica-Bold' }}>Provider: </Text>
              {finding.provider} | {finding.providerCategory}
            </Text>
            
            <Text style={styles.text}>
              <Text style={{ fontFamily: 'Helvetica-Bold' }}>Confidence: </Text>
              {finding.confidence.toFixed(1)}%
            </Text>

            <Text style={styles.text}>
              <Text style={{ fontFamily: 'Helvetica-Bold' }}>Impact: </Text>
              {finding.impact}
            </Text>

            {(finding.evidence || []).length > 0 && (
              <View style={styles.evidenceList}>
                <Text style={[styles.text, { fontFamily: 'Helvetica-Bold' }]}>Evidence:</Text>
                {(finding.evidence || []).slice(0, 3).map((ev, evIdx) => (
                  <Text key={evIdx} style={styles.evidenceItem}>
                    • {ev.key}: {typeof ev.value === 'string' ? ev.value : JSON.stringify(ev.value)}
                  </Text>
                ))}
                {(finding.evidence || []).length > 3 && (
                  <Text style={styles.evidenceItem}>... and {(finding.evidence || []).length - 3} more</Text>
                )}
              </View>
            )}
          </View>
        ))}

        {findings.length > 10 && (
          <Text style={styles.text}>
            Note: Showing first 10 findings. Full report contains {findings.length} findings.
          </Text>
        )}

        <Text style={styles.footer}>
          Page 3 | Generated by FootprintIQ | {new Date().toLocaleString()}
        </Text>
      </Page>
    </Document>
  );
};

/**
 * Export findings as PDF using @react-pdf/renderer
 */
export async function exportReactPDF(findings: Finding[], redactPII: boolean = true): Promise<void> {
  try {
    const data = redactPII ? redactFindings(findings, true) : findings;
    const reportDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const blob = await pdf(<PDFReport findings={data} reportDate={reportDate} />).toBlob();
    
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `footprintiq-scan-${Date.now()}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Failed to generate PDF:', error);
    throw new Error('Failed to generate PDF report');
  }
}
