# Export Functionality Documentation

## Overview

FootprintIQ provides comprehensive export capabilities for scan results, analytics, and reports in multiple formats:

- **PDF** - Professional, branded reports with charts and detailed findings
- **CSV** - Tabular data for analysis in spreadsheet tools
- **JSON** - Structured data for programmatic access

All exports support optional PII (Personally Identifiable Information) redaction for compliance and privacy.

---

## Supported Export Formats

### PDF Reports

#### Types of PDF Reports:
1. **Digital DNA Report** - Privacy score trends and analytics
2. **Comprehensive Report** - Full scan results with branding
3. **Username OSINT Report** - Social media findings
4. **Privacy Report** - Quick scan summary

#### PDF Features:
- ✅ Custom branding (logo, colors, company name)
- ✅ Multi-page support with page numbers
- ✅ Executive, technical, and compliance templates
- ✅ Charts and visualizations
- ✅ Professional formatting with tables
- ✅ Watermarks and confidentiality notices

#### PDF Templates:
- **Executive** - High-level summary, key metrics only
- **Technical** - Detailed findings with full evidence
- **Compliance** - Risk-focused with remediation steps

### CSV Exports

Best for:
- Importing into Excel, Google Sheets, or databases
- Data analysis and trend tracking
- Custom reporting and visualization

Features:
- Proper CSV escaping (commas, quotes, newlines)
- CSV injection prevention
- Flattened evidence structure for easy parsing

### JSON Exports

Best for:
- API integration and automation
- Backup and archival
- Custom processing workflows

Features:
- Pretty-printed JSON (2-space indentation)
- Full finding structure with nested evidence
- Preserves all metadata and timestamps

---

## Known Limitations & Browser Compatibility

### Logo Loading in PDFs
**Issue**: Custom logos may fail to load due to CORS restrictions or network timeouts.

**Behavior**: 
- Timeout after 5 seconds
- PDF generation continues without logo
- Warning logged to console

**Workaround**: 
- Use logos hosted on the same domain
- Ensure CORS headers allow cross-origin image loading
- Use smaller image file sizes (< 500KB recommended)

### Browser Compatibility

| Browser | PDF | CSV | JSON | Notes |
|---------|-----|-----|------|-------|
| Chrome 90+ | ✅ | ✅ | ✅ | Full support |
| Firefox 88+ | ✅ | ✅ | ✅ | Full support |
| Safari 14+ | ✅ | ✅ | ✅ | Logo CORS may require extra headers |
| Edge 90+ | ✅ | ✅ | ✅ | Full support |
| Mobile Safari | ⚠️ | ✅ | ✅ | Large PDFs may timeout |
| Chrome Mobile | ✅ | ✅ | ✅ | Full support |

### File Size Limits

| Export Type | Max Recommended Size | Max Tested Size |
|-------------|---------------------|-----------------|
| PDF | 10 MB | 25 MB |
| CSV | 50 MB | 100 MB |
| JSON | 20 MB | 50 MB |

**Note**: Larger files may cause browser memory issues or slow generation times.

---

## Troubleshooting

### "Export Failed" Error

**Possible Causes**:
1. **Logo load timeout** (PDF only)
   - Check console for "Logo failed to load" warning
   - Verify logo URL is accessible
   - Try without custom branding

2. **Browser memory limit**
   - Reduce number of findings being exported
   - Try splitting into multiple smaller exports
   - Use CSV instead of PDF for large datasets

3. **Network issues**
   - Check internet connection
   - Retry export after a moment
   - Check browser console for specific errors

### "PDF appears blank or incomplete"

**Solutions**:
- Ensure findings data is fully loaded before export
- Check browser console for JavaScript errors
- Try refreshing the page and exporting again
- Use CSV as fallback for data verification

### Custom Branding Not Appearing

**Checklist**:
- ✅ Logo URL is valid and accessible
- ✅ Logo is in PNG or JPEG format
- ✅ Logo file size is < 1MB
- ✅ CORS headers allow cross-origin loading
- ✅ Logo loads successfully in browser directly

---

## Error Codes & Messages

| Error Code | Message | Solution |
|------------|---------|----------|
| `LOGO_TIMEOUT` | Logo load timeout after 5s | Check logo URL, continue without logo |
| `LOGO_LOAD_FAILED` | Failed to load logo | Verify logo URL and CORS headers |
| `PDF_GENERATION_FAILED` | Failed to generate PDF report | Check console logs, try CSV export |
| `BLOB_CREATION_FAILED` | Blob creation failed | Browser memory issue, reduce data size |
| `EXPORT_MONITORING_FAILED` | Failed to log export attempt | Non-critical, export still succeeds |

---

## Best Practices

### For Large Exports
1. Use CSV instead of PDF for datasets > 1000 findings
2. Enable PII redaction to reduce file size
3. Filter findings by severity before exporting
4. Export in batches if dataset > 5000 items

### For Professional Reports
1. Set up custom branding in settings
2. Use "Executive" template for high-level summaries
3. Use "Technical" template for detailed analysis
4. Use "Compliance" template for regulatory documentation

### For Data Analysis
1. Export as CSV for spreadsheet analysis
2. Export as JSON for programmatic processing
3. Include metadata for context and traceability
4. Regular exports for trend analysis

### For Security & Compliance
1. Enable PII redaction for sensitive data
2. Use password-protected PDF tools for transmission
3. Store exports in encrypted locations
4. Set up automatic export deletion after 30 days

---

## API Integration

Exports can be automated via edge functions:

```typescript
// Example: Automated daily export
import { supabase } from '@supabase/supabase-js';

async function scheduledExport() {
  const { data: findings } = await supabase
    .from('findings')
    .select('*')
    .gte('created_at', '2025-01-01');
  
  // Export findings
  const { data, error } = await supabase.functions.invoke('export-data', {
    body: {
      findings,
      format: 'csv',
      redactPII: true,
    },
  });
}
```

---

## Monitoring & Analytics

All exports are logged to `audit_activity` table with:
- Export type (PDF, CSV, JSON)
- Success/failure status
- Duration in milliseconds
- Error messages (if failed)
- User and workspace context

Query export health:

```sql
SELECT 
  action,
  COUNT(*) as total,
  AVG((meta->>'duration')::int) as avg_duration_ms
FROM audit_activity
WHERE action LIKE 'export_%'
  AND created_at > NOW() - INTERVAL '7 days'
GROUP BY action;
```

---

## Support & Feedback

For export-related issues:
1. Check browser console for detailed error logs
2. Verify all requirements are met (browser version, file size, etc.)
3. Try alternative export format as workaround
4. Report persistent issues to support with:
   - Browser type and version
   - Export type and size
   - Error message from console
   - Steps to reproduce

---

## Changelog

### v1.1.0 (Current)
- ✅ Added timeout handling for logo loading
- ✅ Improved error messages with actionable steps
- ✅ Added export monitoring and health tracking
- ✅ Implemented fallback for failed logo loads
- ✅ Enhanced CSV escaping and security
- ✅ Added comprehensive test suite

### v1.0.0 (Initial Release)
- PDF export with custom branding
- CSV export with PII redaction
- JSON export for full data structure
