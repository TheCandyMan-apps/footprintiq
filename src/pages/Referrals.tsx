import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Copy, 
  Check, 
  Gift, 
  Users, 
  TrendingUp, 
  Share2,
  Twitter,
  Facebook,
  Linkedin,
  Mail,
  ExternalLink
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface ReferralCode {
  id: string;
  code: string;
  uses: number;
  max_uses: number | null;
  created_at: string;
}

interface ReferralStats {
  total_referrals: number;
  successful_referrals: number;
  pending_referrals: number;
  total_credits_earned: number;
}

interface Referral {
  id: string;
  status: string;
  created_at: string;
  completed_at: string | null;
  rewarded_at: string | null;
  referrer_reward_credits: number;
  referee: {
    email: string;
  };
}

export default function Referrals() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [code, setCode] = useState<ReferralCode | null>(null);
  const [stats, setStats] = useState<ReferralStats>({
    total_referrals: 0,
    successful_referrals: 0,
    pending_referrals: 0,
    total_credits_earned: 0,
  });
  const [recentReferrals, setRecentReferrals] = useState<Referral[]>([]);
  const [copied, setCopied] = useState(false);

  const referralUrl = code ? `${window.location.origin}/signup?ref=${code.code}` : '';

  useEffect(() => {
    loadReferralData();
  }, []);

  const loadReferralData = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase.functions.invoke('referral-manage', {
        body: { action: 'get_stats' },
      });

      if (error) throw error;

      setCode(data.code);
      setStats(data.stats);
      setRecentReferrals(data.recent_referrals);
    } catch (error: any) {
      console.error('Error loading referral data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load referral data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const createReferralCode = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('referral-manage', {
        body: { action: 'create_code' },
      });

      if (error) throw error;

      setCode(data.code);
      toast({
        title: 'Referral code created!',
        description: 'Start sharing your code to earn credits',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create referral code',
        variant: 'destructive',
      });
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast({
        title: 'Copied!',
        description: 'Link copied to clipboard',
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to copy to clipboard',
        variant: 'destructive',
      });
    }
  };

  const shareViaEmail = () => {
    const subject = encodeURIComponent('Join FootprintIQ with my referral code!');
    const body = encodeURIComponent(
      `I've been using FootprintIQ for OSINT investigations and thought you might find it useful!\n\n` +
      `Use my referral link to get 50 bonus credits when you sign up:\n${referralUrl}\n\n` +
      `FootprintIQ gives you access to 20+ OSINT providers in one platform.`
    );
    window.open(`mailto:?subject=${subject}&body=${body}`);
  };

  const shareViaTwitter = () => {
    const text = encodeURIComponent(
      `Just found an amazing OSINT platform! Join me on FootprintIQ and get 50 bonus credits: ${referralUrl}`
    );
    window.open(`https://twitter.com/intent/tweet?text=${text}`);
  };

  const shareViaFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralUrl)}`);
  };

  const shareViaLinkedIn = () => {
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(referralUrl)}`);
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Referral Program</h1>
        <p className="text-muted-foreground mt-2">
          Earn credits by inviting others to FootprintIQ
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Referrals</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total_referrals}</div>
            <p className="text-xs text-muted-foreground">
              {stats.pending_referrals} pending
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Successful</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.successful_referrals}</div>
            <p className="text-xs text-muted-foreground">
              Completed first scan
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Credits Earned</CardTitle>
            <Gift className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total_credits_earned}</div>
            <p className="text-xs text-muted-foreground">
              100 per referral
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <Share2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.total_referrals > 0 
                ? Math.round((stats.successful_referrals / stats.total_referrals) * 100)
                : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              Signups to completions
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Referral Code & Sharing */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Your Referral Link</CardTitle>
            <CardDescription>
              Share this link to earn 100 credits per successful referral
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!code ? (
              <div className="text-center py-6">
                <p className="text-muted-foreground mb-4">
                  Create your referral code to start earning credits
                </p>
                <Button onClick={createReferralCode}>
                  Create Referral Code
                </Button>
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <Label>Referral Code</Label>
                  <div className="flex gap-2">
                    <Input 
                      value={code.code} 
                      readOnly 
                      className="font-mono text-lg"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => copyToClipboard(code.code)}
                    >
                      {copied ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Referral URL</Label>
                  <div className="flex gap-2">
                    <Input 
                      value={referralUrl} 
                      readOnly 
                      className="text-sm"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => copyToClipboard(referralUrl)}
                    >
                      {copied ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="pt-4">
                  <Label className="mb-3 block">Share via</Label>
                  <div className="grid grid-cols-4 gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={shareViaEmail}
                      className="flex flex-col gap-1 h-auto py-3"
                    >
                      <Mail className="h-5 w-5" />
                      <span className="text-xs">Email</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={shareViaTwitter}
                      className="flex flex-col gap-1 h-auto py-3"
                    >
                      <Twitter className="h-5 w-5" />
                      <span className="text-xs">X</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={shareViaFacebook}
                      className="flex flex-col gap-1 h-auto py-3"
                    >
                      <Facebook className="h-5 w-5" />
                      <span className="text-xs">Facebook</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={shareViaLinkedIn}
                      className="flex flex-col gap-1 h-auto py-3"
                    >
                      <Linkedin className="h-5 w-5" />
                      <span className="text-xs">LinkedIn</span>
                    </Button>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>How It Works</CardTitle>
            <CardDescription>
              Earn credits every time someone signs up and completes their first scan
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold">
                  1
                </div>
                <div>
                  <p className="font-medium">Share your link</p>
                  <p className="text-sm text-muted-foreground">
                    Send your referral link to friends and colleagues
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold">
                  2
                </div>
                <div>
                  <p className="font-medium">They sign up</p>
                  <p className="text-sm text-muted-foreground">
                    They create an account using your link and get 50 bonus credits
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold">
                  3
                </div>
                <div>
                  <p className="font-medium">You both earn credits</p>
                  <p className="text-sm text-muted-foreground">
                    Once they complete their first scan, you get 100 credits!
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-lg bg-muted p-4">
              <p className="text-sm font-medium mb-2">💡 Pro Tip</p>
              <p className="text-sm text-muted-foreground">
                Share your referral link on social media, in your email signature, or with your network to maximize earnings.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Referrals */}
      {recentReferrals.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Referrals</CardTitle>
            <CardDescription>
              Track the status of your recent referrals
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Credits Earned</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentReferrals.map((referral) => (
                  <TableRow key={referral.id}>
                    <TableCell className="font-medium">
                      {referral.referee?.email || 'Anonymous'}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          referral.status === 'rewarded'
                            ? 'default'
                            : referral.status === 'completed'
                            ? 'secondary'
                            : 'outline'
                        }
                      >
                        {referral.status === 'rewarded' ? '✓ Rewarded' : 
                         referral.status === 'completed' ? 'Completed' : 
                         'Pending'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {referral.status === 'rewarded' ? '+100' : '-'}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(referral.created_at).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
