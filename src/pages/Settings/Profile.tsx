import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SettingsBreadcrumb } from '@/components/settings/SettingsBreadcrumb';
import { SettingsNav } from '@/components/settings/SettingsNav';
import { useUserPersona, type Persona } from '@/hooks/useUserPersona';
import { supabase } from '@/integrations/supabase/client';
import { User, Zap, Building2, Check, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

export default function ProfileSettings() {
  const navigate = useNavigate();
  const { persona, loading, updatePersona } = useUserPersona();
  const [profile, setProfile] = useState<{ email: string; full_name: string } | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('email, full_name')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    } finally {
      setLoadingProfile(false);
    }
  };

  const personas: Array<{
    id: Persona;
    icon: React.ElementType;
    title: string;
    description: string;
    features: string[];
    isContactSales?: boolean;
  }> = [
    {
      id: 'standard',
      icon: User,
      title: 'Simple',
      description: 'Recommended for most users',
      features: [
        'Quick scan interface',
        'Essential results only',
        'Clean, focused reports'
      ]
    },
    {
      id: 'advanced',
      icon: Zap,
      title: 'Advanced',
      description: 'Full control with all features',
      features: [
        'All scan providers visible',
        'Detailed confidence scores',
        'Advanced customization'
      ]
    },
    {
      id: 'enterprise',
      icon: Building2,
      title: 'Enterprise',
      description: 'For teams and organizations',
      features: [
        'API access',
        'Bulk scanning',
        'Team collaboration'
      ],
      isContactSales: true
    }
  ];

  if (loading || loadingProfile) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">
          <div className="container mx-auto py-8 px-4 max-w-7xl">
            <div className="grid lg:grid-cols-[280px_1fr] gap-6">
              <aside className="hidden lg:block">
                <div className="sticky top-24">
                  <SettingsNav />
                </div>
              </aside>
              <div className="min-w-0">
                <SettingsBreadcrumb currentPage="Profile" />
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto py-8 px-4 max-w-7xl">
          <div className="grid lg:grid-cols-[280px_1fr] gap-6">
            <aside className="hidden lg:block">
              <div className="sticky top-24">
                <SettingsNav />
              </div>
            </aside>
            <div className="min-w-0">
              <SettingsBreadcrumb currentPage="Profile" />

              <div className="space-y-6">
                {/* Profile Info */}
                <Card>
                  <CardHeader>
                    <CardTitle>Profile Information</CardTitle>
                    <CardDescription>
                      Your basic account details
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Full Name</label>
                      <p className="text-base mt-1">{profile?.full_name || 'Not set'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Email</label>
                      <p className="text-base mt-1">{profile?.email || 'Not set'}</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Interface Mode Selection */}
                <Card>
                  <CardHeader>
                    <CardTitle>Interface Mode</CardTitle>
                    <CardDescription>
                      Choose how much detail you want to see. You can change this anytime.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-3 gap-4">
                      {personas.map((p) => {
                        const Icon = p.icon;
                        const isSelected = persona === p.id;
                        const isEnterprise = p.isContactSales;
                        
                        return (
                          <Card
                            key={p.id}
                            className={`relative transition-all ${
                              isEnterprise 
                                ? 'opacity-80 border-dashed cursor-default'
                                : isSelected 
                                  ? 'border-primary shadow-lg cursor-pointer' 
                                  : 'hover:border-primary/50 hover:shadow-md cursor-pointer'
                            }`}
                            onClick={() => !isEnterprise && updatePersona(p.id)}
                          >
                            {isSelected && !isEnterprise && (
                              <div className="absolute -top-2 -right-2">
                                <div className="bg-primary text-primary-foreground rounded-full p-1">
                                  <Check className="w-4 h-4" />
                                </div>
                              </div>
                            )}
                            <CardHeader className="pb-3">
                              <div className="flex items-center gap-3 mb-2">
                                <div className={`p-2 rounded-lg ${
                                  isEnterprise 
                                    ? 'bg-muted text-muted-foreground' 
                                    : isSelected 
                                      ? 'bg-primary text-primary-foreground' 
                                      : 'bg-primary/10 text-primary'
                                }`}>
                                  <Icon className="w-5 h-5" />
                                </div>
                                {isSelected && !isEnterprise && (
                                  <Badge variant="default" className="text-xs">Active</Badge>
                                )}
                                {p.id === 'standard' && !isSelected && (
                                  <Badge variant="secondary" className="text-xs">Recommended</Badge>
                                )}
                              </div>
                              <CardTitle className="text-base">{p.title}</CardTitle>
                              <CardDescription className="text-xs">
                                {p.description}
                              </CardDescription>
                            </CardHeader>
                            <CardContent className="pt-0">
                              <ul className="space-y-1.5 mb-4">
                                {p.features.map((feature, idx) => (
                                  <li key={idx} className="flex items-start gap-2 text-xs">
                                    <Check className="w-3 h-3 text-primary mt-0.5 flex-shrink-0" />
                                    <span className="text-muted-foreground">{feature}</span>
                                  </li>
                                ))}
                              </ul>
                              
                              {isEnterprise && (
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="w-full text-xs"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    window.open('/pricing', '_blank');
                                  }}
                                >
                                  Contact Sales
                                </Button>
                              )}
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                    
                    <div className="mt-6 p-4 bg-muted rounded-lg">
                      <p className="text-sm text-muted-foreground">
                        <strong>💡 Tip:</strong> Simple mode is recommended for most users. Switch to Advanced if you want to see confidence scores and all provider details.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
