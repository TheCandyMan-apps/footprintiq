import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { generateSampleDarkWebData } from '@/lib/generateSampleDarkWebData';

export const InitializeDarkWebDemo = () => {
  useEffect(() => {
    const initializeDemo = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // Check if dark web monitoring is enabled
      const enabled = localStorage.getItem(`darkweb_monitor_${session.user.id}`) === 'true';
      
      if (enabled) {
        // Generate sample data on first enable
        const hasGeneratedKey = `darkweb_demo_generated_${session.user.id}`;
        if (!localStorage.getItem(hasGeneratedKey)) {
          try {
            await generateSampleDarkWebData(session.user.id);
            localStorage.setItem(hasGeneratedKey, 'true');
          } catch (error) {
            console.error('Failed to generate demo data:', error);
          }
        }
      }
    };

    initializeDemo();
  }, []);

  return null;
};
