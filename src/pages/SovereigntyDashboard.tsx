import { useState } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { SEO } from '@/components/SEO';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SovereigntyScoreGauge } from '@/components/sovereignty/SovereigntyScoreGauge';
import { RequestPipeline } from '@/components/sovereignty/RequestPipeline';
import { CreateRequestDialog } from '@/components/sovereignty/CreateRequestDialog';
import { SovereigntyTimeline } from '@/components/sovereignty/SovereigntyTimeline';
import { JurisdictionBreakdown } from '@/components/sovereignty/JurisdictionBreakdown';
import { DeadlineAlerts } from '@/components/sovereignty/DeadlineAlerts';
import { useSovereignty, SovereigntyStatus } from '@/hooks/useSovereignty';
import { useProUnlock } from '@/hooks/useProUnlock';
import { LockedSection } from '@/components/results/LockedSection';
import { Shield, Plus, Send, CheckCircle, AlertTriangle, Clock, TrendingUp, FileText } from 'lucide-react';

export default function SovereigntyDashboard() {
  const { requests, requestsLoading, stats, calculatedScore, createRequest, updateStatus } = useSovereignty();
  const { currentPlan } = useProUnlock();
  const [createOpen, setCreateOpen] = useState(false);
  const isPro = currentPlan.id !== 'free';

  const activeRequests = requests.filter(r => ['submitted', 'acknowledged', 'processing'].includes(r.status));
  const completedRequests = requests.filter(r => r.status === 'completed');
  const allRequests = requests;

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Sovereignty Dashboard — FootprintIQ"
        description="Track and manage your data erasure requests across jurisdictions. Monitor your digital sovereignty score."
      />
      <Header />

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Hero header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Shield className="h-6 w-6 text-primary" />
              Sovereignty Dashboard
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Track erasure requests and take control of your digital narrative
            </p>
          </div>
          {isPro && (
            <Button onClick={() => setCreateOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              New Request
            </Button>
          )}
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <Card className="col-span-2 md:col-span-1 flex flex-col items-center justify-center p-4">
            <SovereigntyScoreGauge score={calculatedScore} size={120} />
            <p className="text-xs text-muted-foreground mt-1">Sovereignty Score</p>
          </Card>

          <StatCard
            icon={<Send className="h-4 w-4 text-primary" />}
            label="Active"
            value={stats.active}
          />
          <StatCard
            icon={<CheckCircle className="h-4 w-4 text-primary" />}
            label="Removed"
            value={stats.completed}
          />
          <StatCard
            icon={<Clock className="h-4 w-4 text-muted-foreground" />}
            label="Pending"
            value={stats.pending}
          />
          <StatCard
            icon={<AlertTriangle className="h-4 w-4 text-destructive" />}
            label="Overdue"
            value={stats.overdue}
            highlight={stats.overdue > 0}
          />
        </div>

        {/* Success rate bar */}
        {stats.total > 0 && (
          <Card className="mb-8 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                Removal Success Rate
              </span>
              <span className="text-sm font-semibold">{stats.successRate}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className="bg-primary rounded-full h-2 transition-all duration-700"
                style={{ width: `${stats.successRate}%` }}
              />
            </div>
          </Card>
        )}

        {/* Timeline + Jurisdiction sidebar */}
        {isPro && requests.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
            <div className="lg:col-span-2">
              <SovereigntyTimeline requests={requests} />
            </div>
            <div className="space-y-4">
              <JurisdictionBreakdown requests={requests} />
              <DeadlineAlerts requests={requests} />
            </div>
          </div>
        )}

        {/* Main content */}
        {isPro ? (
          <Tabs defaultValue="active" className="space-y-4">
            <TabsList>
              <TabsTrigger value="active" className="gap-1.5">
                <Send className="h-3.5 w-3.5" />
                Active ({activeRequests.length})
              </TabsTrigger>
              <TabsTrigger value="completed" className="gap-1.5">
                <CheckCircle className="h-3.5 w-3.5" />
                Completed ({completedRequests.length})
              </TabsTrigger>
              <TabsTrigger value="all" className="gap-1.5">
                <FileText className="h-3.5 w-3.5" />
                All ({allRequests.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="active">
              <RequestPipeline
                requests={activeRequests}
                onUpdateStatus={(id, status) => updateStatus.mutate({ id, status })}
              />
            </TabsContent>

            <TabsContent value="completed">
              <RequestPipeline
                requests={completedRequests}
                onUpdateStatus={(id, status) => updateStatus.mutate({ id, status })}
              />
            </TabsContent>

            <TabsContent value="all">
              <RequestPipeline
                requests={allRequests}
                onUpdateStatus={(id, status) => updateStatus.mutate({ id, status })}
              />
            </TabsContent>
          </Tabs>
        ) : (
          <div className="space-y-6">
            <Card className="p-6 text-center">
              <Shield className="h-12 w-12 text-primary/40 mx-auto mb-4" />
              <h2 className="text-lg font-semibold mb-2">Sovereignty Dashboard</h2>
              <p className="text-sm text-muted-foreground mb-4 max-w-md mx-auto">
                Track your erasure requests, monitor compliance deadlines, and build your sovereignty score.
                Upgrade to Pro to unlock the full dashboard.
              </p>
              <Button asChild>
                <a href="/pricing">Upgrade to Pro</a>
              </Button>
            </Card>
            <LockedSection
              isLocked={true}
              title="Erasure Request Pipeline"
              lockedContentCount={3}
              upgradeCTA="Unlock full erasure tracking"
            />
          </div>
        )}
      </main>

      <CreateRequestDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSubmit={(input) => createRequest.mutate(input)}
        isSubmitting={createRequest.isPending}
      />

      <Footer />
    </div>
  );
}

function StatCard({ icon, label, value, highlight }: { icon: React.ReactNode; label: string; value: number; highlight?: boolean }) {
  return (
    <Card className={`p-4 ${highlight ? 'border-destructive/50' : ''}`}>
      <div className="flex items-center gap-2 mb-1">
        {icon}
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
      <p className={`text-2xl font-bold ${highlight ? 'text-destructive' : ''}`}>{value}</p>
    </Card>
  );
}
