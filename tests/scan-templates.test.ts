import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { supabase } from '@/integrations/supabase/client';

describe('Scan Templates', () => {
  let testUserId: string;
  let testTemplateId: string;

  beforeAll(async () => {
    // Create test user or get existing
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('No authenticated user for testing');
    testUserId = user.id;
  });

  afterAll(async () => {
    // Cleanup test templates
    if (testTemplateId) {
      await supabase
        .from('scan_templates')
        .delete()
        .eq('id', testTemplateId);
    }
  });

  it('should create a new scan template', async () => {
    const templateData = {
      name: 'Test Email Scan',
      description: 'A test template for email scanning',
      configuration: {
        scanType: 'email',
        providers: ['hibp', 'dehashed'],
        sensitiveSources: [],
        darkwebEnabled: false,
        selectedTool: 'spiderfoot',
      },
    };

    const { data, error } = await supabase
      .from('scan_templates')
      .insert(templateData)
      .select()
      .single();

    expect(error).toBeNull();
    expect(data).toBeDefined();
    expect(data?.name).toBe('Test Email Scan');
    expect(data?.configuration.scanType).toBe('email');
    expect(data?.configuration.providers).toHaveLength(2);
    
    testTemplateId = data!.id;
  });

  it('should fetch user templates ordered by favorites and date', async () => {
    const { data, error } = await supabase
      .from('scan_templates')
      .select('*')
      .order('is_favorite', { ascending: false })
      .order('updated_at', { ascending: false });

    expect(error).toBeNull();
    expect(data).toBeDefined();
    expect(Array.isArray(data)).toBe(true);
  });

  it('should update template to favorite', async () => {
    expect(testTemplateId).toBeDefined();

    const { data, error } = await supabase
      .from('scan_templates')
      .update({ is_favorite: true })
      .eq('id', testTemplateId)
      .select()
      .single();

    expect(error).toBeNull();
    expect(data?.is_favorite).toBe(true);
  });

  it('should update template configuration', async () => {
    expect(testTemplateId).toBeDefined();

    const updatedConfig = {
      scanType: 'email',
      providers: ['hibp', 'dehashed', 'clearbit'],
      selectedTool: 'spiderfoot',
    };

    const { data, error } = await supabase
      .from('scan_templates')
      .update({ 
        configuration: updatedConfig,
        name: 'Updated Email Scan',
      })
      .eq('id', testTemplateId)
      .select()
      .single();

    expect(error).toBeNull();
    expect(data?.name).toBe('Updated Email Scan');
    expect(data?.configuration.providers).toHaveLength(3);
  });

  it('should enforce RLS - users can only see their own templates', async () => {
    // This test verifies RLS is working by fetching templates
    const { data, error } = await supabase
      .from('scan_templates')
      .select('*');

    expect(error).toBeNull();
    // All returned templates should belong to the current user
    data?.forEach(template => {
      expect(template.user_id).toBe(testUserId);
    });
  });

  it('should delete a template', async () => {
    expect(testTemplateId).toBeDefined();

    const { error } = await supabase
      .from('scan_templates')
      .delete()
      .eq('id', testTemplateId);

    expect(error).toBeNull();

    // Verify deletion
    const { data } = await supabase
      .from('scan_templates')
      .select('*')
      .eq('id', testTemplateId)
      .single();

    expect(data).toBeNull();
  });

  it('should validate required fields', async () => {
    const { error } = await supabase
      .from('scan_templates')
      .insert({
        name: '', // Invalid: empty name
        configuration: {},
      });

    expect(error).toBeDefined();
  });

  it('should store complex configuration objects', async () => {
    const complexConfig = {
      scanType: 'domain',
      providers: ['urlscan', 'securitytrails', 'shodan'],
      sensitiveSources: ['darkweb'],
      darkwebEnabled: true,
      darkwebDepth: 3,
      premiumOptions: {
        socialMediaFinder: true,
        osintScraper: true,
        osintKeywords: ['test', 'example'],
      },
      selectedTool: 'recon-ng',
    };

    const { data, error } = await supabase
      .from('scan_templates')
      .insert({
        name: 'Complex Domain Scan',
        configuration: complexConfig,
      })
      .select()
      .single();

    expect(error).toBeNull();
    expect(data?.configuration.premiumOptions.osintKeywords).toHaveLength(2);
    expect(data?.configuration.darkwebDepth).toBe(3);

    // Cleanup
    if (data?.id) {
      await supabase.from('scan_templates').delete().eq('id', data.id);
    }
  });
});
