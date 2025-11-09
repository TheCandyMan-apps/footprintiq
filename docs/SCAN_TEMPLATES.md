# Scan Templates Feature

## Overview

The Scan Templates feature allows users to save frequently-used scan configurations for quick one-click launching. This significantly improves workflow efficiency by eliminating the need to repeatedly configure the same scan settings.

## Features

### 1. **Save Scan Configurations**
Users can save their current scan configuration including:
- Scan type (email, username, domain, phone)
- Selected providers (HIBP, DeHashed, Clearbit, etc.)
- Sensitive sources (dating, NSFW, dark web)
- Dark web settings (enabled, depth)
- Premium options (social media finder, OSINT scraper, etc.)
- Selected tool (SpiderFoot, Maigret, Recon-ng)

### 2. **Template Management**
- **View Templates**: See all saved templates ordered by favorites and most recently updated
- **Apply Template**: One-click to load a saved configuration
- **Favorite Templates**: Mark frequently-used templates for quick access
- **Edit Templates**: Update name, description, or configuration
- **Delete Templates**: Remove templates that are no longer needed

### 3. **Quick Launch**
- Single-click template application
- Instant configuration loading
- Visual feedback on template application

## Database Schema

### `scan_templates` Table

```sql
CREATE TABLE public.scan_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  configuration JSONB NOT NULL,
  is_favorite BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
```

### Configuration Structure

The `configuration` JSONB column stores:

```typescript
{
  scanType: string;              // 'email' | 'username' | 'domain' | 'phone'
  providers: string[];           // Array of provider IDs
  sensitiveSources?: string[];   // Optional sensitive source categories
  darkwebEnabled?: boolean;      // Dark web scan toggle
  darkwebDepth?: number;         // Dark web crawl depth
  premiumOptions?: {             // Premium feature settings
    socialMediaFinder?: boolean;
    osintScraper?: boolean;
    osintKeywords?: string[];
    darkwebScraper?: boolean;
    darkwebUrls?: string[];
    // ... more options
  };
  selectedTool?: string;         // Tool selection
}
```

## Row Level Security (RLS)

The following RLS policies ensure data privacy:

1. **View Policy**: Users can only see their own templates
2. **Create Policy**: Users can create templates with their user_id
3. **Update Policy**: Users can only update their own templates
4. **Delete Policy**: Users can only delete their own templates

## Components

### `useScanTemplates` Hook
Location: `src/hooks/useScanTemplates.ts`

Provides CRUD operations for templates:
- `templates`: Array of user templates
- `isLoading`: Loading state
- `error`: Error state
- `saveTemplate()`: Save new template
- `updateTemplate()`: Update existing template
- `deleteTemplate()`: Remove template
- `toggleFavorite()`: Toggle favorite status
- `refetch()`: Manually refresh templates

### `TemplateManager` Component
Location: `src/components/scan/TemplateManager.tsx`

Main UI component for managing templates:
- Displays all saved templates
- Shows template metadata (name, description, config summary)
- Provides actions: apply, favorite, delete
- Responsive design for mobile and desktop
- Empty state for new users

### `SaveTemplateDialog` Component
Location: `src/components/scan/SaveTemplateDialog.tsx`

Dialog for saving new templates:
- Name input (required, max 100 chars)
- Description input (optional, max 500 chars)
- Validation and error handling
- Cancel and save actions

## User Flow

### Saving a Template

1. User configures scan settings on Advanced Scan page
2. Click "Save Current" button in Template Manager
3. Enter template name and optional description
4. Click "Save Template"
5. Template appears in the template list

### Applying a Template

1. User views saved templates in Template Manager
2. Click the "Play" icon on desired template
3. All scan settings are instantly applied
4. Toast notification confirms application
5. User can modify settings or start scan immediately

### Managing Templates

**Favorite a Template:**
1. Click the star icon on a template
2. Template moves to top of list
3. Star icon fills to indicate favorite status

**Delete a Template:**
1. Click the trash icon on a template
2. Confirm deletion in dialog
3. Template is removed from database

## Integration Points

### Advanced Scan Page
Location: `src/pages/AdvancedScan.tsx`

The Template Manager is integrated at the top of the scan form:
- Positioned after the page header
- Before the main scan configuration
- Available in the "Advanced Scan" tab

Key functions:
- `handleApplyTemplate()`: Applies template configuration to state
- `handleSaveTemplate()`: Saves current configuration as template
- `getCurrentConfig()`: Captures current scan settings

## Testing

Location: `tests/scan-templates.test.ts`

Comprehensive test suite covering:
- Template creation with valid data
- Template fetching and ordering
- Favorite toggling
- Configuration updates
- RLS policy enforcement
- Template deletion
- Complex configuration storage
- Field validation

### Running Tests

```bash
npm test tests/scan-templates.test.ts
```

## Performance Considerations

### Database Indexes
- `idx_scan_templates_user_id`: Fast user template lookups
- `idx_scan_templates_is_favorite`: Efficient favorite filtering

### Optimization
- Templates fetched once on mount
- Local state management for UI updates
- Optimistic UI updates for better UX
- JSONB for flexible configuration storage

## Security

### Authentication
- All operations require authenticated user
- User ID extracted from JWT token
- Supabase handles authentication

### Authorization
- RLS policies enforce user isolation
- No cross-user data access
- Server-side validation

### Data Privacy
- Templates stored per-user
- No shared templates (future feature)
- Secure configuration storage

## Future Enhancements

### Planned Features
1. **Template Sharing**: Share templates with team members
2. **Template Categories**: Organize templates by category
3. **Template Export/Import**: JSON export for backup
4. **Template Analytics**: Track most-used templates
5. **Template Recommendations**: AI-suggested templates
6. **Workspace Templates**: Organization-wide templates
7. **Template Versioning**: Track configuration changes

### API Extensions
- RESTful API for template management
- Bulk operations support
- Template marketplace (community templates)

## Troubleshooting

### Template Not Saving
- Check authentication status
- Verify required fields (name, configuration)
- Check browser console for errors
- Ensure database connection

### Template Not Applying
- Verify template has valid configuration
- Check for scan type compatibility
- Ensure providers are still available
- Review toast notifications for errors

### RLS Errors
- Confirm user is authenticated
- Check RLS policies are enabled
- Verify user_id matches auth.uid()

## Best Practices

### Template Naming
- Use descriptive names: "Quick Email Breach Check"
- Include scan type for clarity
- Keep names under 50 characters for display

### Template Descriptions
- Explain the use case
- Note any special requirements
- Mention provider dependencies
- Add update frequency notes

### Configuration Management
- Test templates before saving
- Update outdated templates regularly
- Delete unused templates
- Favorite most-used templates

## Examples

### Example: Email Breach Template
```javascript
{
  name: "Email Breach Scan",
  description: "Quick check for email in data breaches",
  configuration: {
    scanType: "email",
    providers: ["hibp", "dehashed"],
    sensitiveSources: [],
    darkwebEnabled: false,
    selectedTool: "spiderfoot"
  }
}
```

### Example: Deep Username Investigation
```javascript
{
  name: "Deep Username Search",
  description: "Comprehensive username scan with social media",
  configuration: {
    scanType: "username",
    providers: ["dehashed", "apify-social"],
    sensitiveSources: ["darkweb"],
    darkwebEnabled: true,
    darkwebDepth: 3,
    premiumOptions: {
      socialMediaFinder: true,
      osintKeywords: ["profile", "account"]
    },
    selectedTool: "maigret"
  }
}
```

### Example: Domain Recon Template
```javascript
{
  name: "Full Domain Reconnaissance",
  description: "Complete domain analysis with threat intel",
  configuration: {
    scanType: "domain",
    providers: ["urlscan", "securitytrails", "shodan", "virustotal"],
    sensitiveSources: [],
    darkwebEnabled: false,
    selectedTool: "spiderfoot"
  }
}
```

## Support

For issues or questions about Scan Templates:
- Check this documentation
- Review test files for examples
- Contact support: admin@footprintiq.app
- Submit bug reports via GitHub issues

## Changelog

### v1.0.0 (Current)
- Initial release
- Basic CRUD operations
- Favorite functionality
- RLS security
- Integration with Advanced Scan page
- Comprehensive test coverage
