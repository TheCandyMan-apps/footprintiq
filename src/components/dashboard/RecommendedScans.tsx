import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Target, Play, Mail, Phone, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Recommendation {
  type: 'email' | 'phone' | 'username';
  reason: string;
  icon: React.ElementType;
}

export function RecommendedScans() {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    generateRecommendations();
  }, []);

  const generateRecommendations = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get recent scans
      const { data: scans } = await supabase
        .from('scans')
        .select('email, phone, username, scan_type')
        .order('created_at', { ascending: false })
        .limit(10);

      const recs: Recommendation[] = [];

      if (scans && scans.length > 0) {
        // Check what scan types haven't been used recently
        const hasEmail = scans.some(s => s.email);
        const hasPhone = scans.some(s => s.phone);
        const hasUsername = scans.some(s => s.username);
        // Note: scan_type can be 'username', 'personal_details', or 'both'
        const hasAdvanced = scans.length > 3; // Consider "advanced" if user has multiple scans

        if (!hasEmail) {
          recs.push({
            type: 'email',
            reason: 'Scan your email for data breaches and leaks',
            icon: Mail,
          });
        }

        if (!hasPhone) {
          recs.push({
            type: 'phone',
            reason: 'Check if your phone number is exposed online',
            icon: Phone,
          });
        }

        if (!hasUsername) {
          recs.push({
            type: 'username',
            reason: 'Find social media profiles and online presence',
            icon: User,
          });
        }

        if (!hasAdvanced && hasEmail) {
          recs.push({
            type: 'email',
            reason: 'Try advanced scan for deeper OSINT analysis',
            icon: Target,
          });
        }
      } else {
        // No scans yet - recommend starting
        recs.push({
          type: 'email',
          reason: 'Start with an email scan to discover breaches',
          icon: Mail,
        });
        recs.push({
          type: 'username',
          reason: 'Scan username across social media platforms',
          icon: User,
        });
      }

      setRecommendations(recs.slice(0, 3));
    } catch (error) {
      console.error('Error generating recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleScanClick = (type: string) => {
    if (type === 'email' && recommendations.some(r => r.reason.includes('advanced'))) {
      navigate('/scan/advanced');
    } else {
      navigate('/scan');
    }
  };

  return (
    <Card className="shadow-card hover:shadow-glow transition-shadow">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5 text-primary" />
          Recommended Scans
        </CardTitle>
        <CardDescription>Suggested next steps for comprehensive coverage</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-[200px] flex items-center justify-center text-muted-foreground">
            Loading...
          </div>
        ) : recommendations.length === 0 ? (
          <div className="h-[200px] flex items-center justify-center text-muted-foreground">
            No recommendations at this time
          </div>
        ) : (
          <div className="space-y-3">
            {recommendations.map((rec, index) => {
              const Icon = rec.icon;
              return (
                <div
                  key={index}
                  className="flex items-center gap-3 p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium capitalize">{rec.type} Scan</p>
                    <p className="text-xs text-muted-foreground">{rec.reason}</p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleScanClick(rec.type)}
                    className="flex-shrink-0"
                  >
                    <Play className="h-3 w-3 mr-1" />
                    Start
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
