import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export type Persona = 'standard' | 'advanced' | 'enterprise';

export function useUserPersona() {
  const [persona, setPersona] = useState<Persona | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchPersona();
  }, []);

  const fetchPersona = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('persona')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Failed to fetch persona:', error);
        setPersona('standard'); // Default fallback
      } else {
        setPersona((data?.persona as Persona) || 'standard');
      }
    } catch (error) {
      console.error('Error fetching persona:', error);
      setPersona('standard'); // Default fallback
    } finally {
      setLoading(false);
    }
  };

  const updatePersona = async (newPersona: Persona) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('No user found');
      }

      const { error } = await supabase
        .from('profiles')
        .update({ persona: newPersona })
        .eq('user_id', user.id);

      if (error) throw error;

      setPersona(newPersona);
      toast({
        title: 'Persona updated',
        description: `Your interface is now set to ${newPersona} mode`,
      });
    } catch (error: any) {
      toast({
        title: 'Failed to update persona',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  return {
    persona,
    loading,
    updatePersona,
    isStandard: persona === 'standard',
    isAdvanced: persona === 'advanced',
    isEnterprise: persona === 'enterprise',
  };
}
