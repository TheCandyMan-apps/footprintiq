import { supabase } from '@/integrations/supabase/client';

const sampleFindings = [
  {
    finding_type: 'Email Address Found in Data Breach',
    data_exposed: ['Email', 'Password Hash', 'Username'],
    severity: 'high',
    provider: 'HaveIBeenPwned',
  },
  {
    finding_type: 'Credentials on Darknet Forum',
    data_exposed: ['Email', 'Password', 'IP Address'],
    severity: 'critical',
    provider: 'IntelligenceX',
  },
  {
    finding_type: 'Phone Number Leaked',
    data_exposed: ['Phone Number', 'Name', 'Address'],
    severity: 'medium',
    provider: 'BreachDirectory',
  },
  {
    finding_type: 'Social Media Data Dump',
    data_exposed: ['Profile URL', 'Photos', 'Posts', 'Friends List'],
    severity: 'medium',
    provider: 'DarkWebMonitor',
  },
  {
    finding_type: 'Financial Information Exposure',
    data_exposed: ['Credit Card (partial)', 'Billing Address'],
    severity: 'critical',
    provider: 'BreachAlert',
  },
];

export const generateSampleDarkWebData = async (userId: string) => {
  try {
    // Check if user already has findings
    const { data: existingFindings } = await supabase
      .from('darkweb_findings')
      .select('id')
      .eq('user_id', userId)
      .limit(1);

    if (existingFindings && existingFindings.length > 0) {
      console.log('User already has dark web findings, skipping generation');
      return;
    }

    // Generate sample findings with dates spread over the last 30 days
    const findings = sampleFindings.map((finding, index) => {
      const daysAgo = Math.floor(Math.random() * 30);
      const discoveredAt = new Date();
      discoveredAt.setDate(discoveredAt.getDate() - daysAgo);
      
      return {
        user_id: userId,
        finding_type: finding.finding_type,
        data_exposed: finding.data_exposed,
        severity: finding.severity,
        provider: finding.provider,
        discovered_at: discoveredAt.toISOString(),
        is_verified: Math.random() > 0.5,
        is_new: index < 2, // Mark first 2 as new
        source_url: 'https://example.com/breach',
        url: 'https://example.com/breach',
      };
    });

    const { error } = await supabase
      .from('darkweb_findings')
      .insert(findings);

    if (error) throw error;

    console.log(`Generated ${findings.length} sample dark web findings for user ${userId}`);
    return findings;
  } catch (error) {
    console.error('Error generating sample dark web data:', error);
    throw error;
  }
};

export const enableDarkWebMonitoring = async (userId: string) => {
  // Enable monitoring in localStorage
  localStorage.setItem(`darkweb_monitor_${userId}`, 'true');
  
  // Generate sample data if not exists
  await generateSampleDarkWebData(userId);
  
  // Request notification permission
  if ('Notification' in window && Notification.permission === 'default') {
    await Notification.requestPermission();
  }
};
