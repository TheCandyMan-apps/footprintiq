import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface ScanTemplateConfig {
  scanType: string;
  providers: string[];
  sensitiveSources?: string[];
  darkwebEnabled?: boolean;
  darkwebDepth?: number;
  premiumOptions?: Record<string, any>;
  selectedTool?: string;
}

export interface ScanTemplate {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  configuration: ScanTemplateConfig;
  is_favorite: boolean;
  created_at: string;
  updated_at: string;
}

export function useScanTemplates() {
  const [templates, setTemplates] = useState<ScanTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchTemplates = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error: fetchError } = await supabase
        .from('scan_templates')
        .select('*')
        .order('is_favorite', { ascending: false })
        .order('updated_at', { ascending: false });

      if (fetchError) throw fetchError;
      setTemplates((data || []) as unknown as ScanTemplate[]);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch templates'));
      console.error('Error fetching templates:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const saveTemplate = async (
    name: string,
    description: string | null,
    configuration: ScanTemplateConfig
  ): Promise<ScanTemplate | null> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error: insertError } = await supabase
        .from('scan_templates')
        .insert({
          user_id: user.id,
          name,
          description,
          configuration: configuration as any,
        })
        .select()
        .single();

      if (insertError) throw insertError;
      
      toast.success('Template saved successfully');
      await fetchTemplates();
      return data as unknown as ScanTemplate;
    } catch (err) {
      console.error('Error saving template:', err);
      toast.error(err instanceof Error ? err.message : 'Failed to save template');
      return null;
    }
  };

  const updateTemplate = async (
    id: string,
    updates: Partial<Pick<ScanTemplate, 'name' | 'description' | 'configuration' | 'is_favorite'>>
  ): Promise<boolean> => {
    try {
      const updateData: any = { ...updates };
      if (updates.configuration) {
        updateData.configuration = updates.configuration as any;
      }

      const { error: updateError } = await supabase
        .from('scan_templates')
        .update(updateData)
        .eq('id', id);

      if (updateError) throw updateError;
      
      toast.success('Template updated');
      await fetchTemplates();
      return true;
    } catch (err) {
      console.error('Error updating template:', err);
      toast.error(err instanceof Error ? err.message : 'Failed to update template');
      return false;
    }
  };

  const deleteTemplate = async (id: string): Promise<boolean> => {
    try {
      const { error: deleteError } = await supabase
        .from('scan_templates')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;
      
      toast.success('Template deleted');
      await fetchTemplates();
      return true;
    } catch (err) {
      console.error('Error deleting template:', err);
      toast.error(err instanceof Error ? err.message : 'Failed to delete template');
      return false;
    }
  };

  const toggleFavorite = async (id: string, isFavorite: boolean): Promise<boolean> => {
    return updateTemplate(id, { is_favorite: isFavorite });
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  return {
    templates,
    isLoading,
    error,
    saveTemplate,
    updateTemplate,
    deleteTemplate,
    toggleFavorite,
    refetch: fetchTemplates,
  };
}
