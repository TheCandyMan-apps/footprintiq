/**
 * TelegramTab – Telegram OSINT results section.
 *
 * Cards:
 *  - Profile (Free + Pro)
 *  - Channel Footprints (Pro only)
 *  - Entities (Pro only)
 *  - Graph Summary (Pro only – lazy-loads artifact)
 *  - Phone Presence (Pro only)
 *
 * Tier gating: Free users see the Profile card + locked preview placeholders.
 */

import { useMemo, useState, useCallback, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Loader2, Lock, Send, Shield, Info, Users, Hash, Network, Phone, Eye, EyeOff, Activity, AlertTriangle, TrendingUp, Link, Clock, RefreshCw, CheckCircle2, XCircle, Hourglass, MessageSquare } from 'lucide-react';
import { useTelegramFindings, type TelegramFinding } from '@/hooks/useTelegramFindings';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';
import { TelegramExplore } from './TelegramExplore';
import { TelegramExposureSnapshot } from './TelegramExposureSnapshot';
import { FeatureGate } from '@/components/tier-gating/FeatureGate';

interface TelegramTabProps {
  scanId: string;
  isPro: boolean;
  scanType?: string;
  telegramTriggeredAt?: string | null;
  hasTelegramFindings?: boolean;
}

// ── Helpers ──────────────────────────────────────────────────────

function groupByKind(findings: TelegramFinding[]): Record<string, TelegramFinding[]> {
  const groups: Record<string, TelegramFinding[]> = {};
  for (const f of findings) {
    const key = f.kind || 'unknown';
    (groups[key] ||= []).push(f);
  }
  return groups;
}

function getEv(finding: TelegramFinding, key: string): string {
  if (Array.isArray(finding.evidence)) {
    const entry = finding.evidence.find(
      (e: any) => e.key?.toLowerCase() === key.toLowerCase(),
    );
    return entry?.value ?? '';
  }
  return finding.evidence?.[key] ?? '';
}

// ── Sub-cards ────────────────────────────────────────────────────

function ProfileCard({ findings }: { findings: TelegramFinding[] }) {
  const f = findings[0];
  if (!f) return null;

  const username = getEv(f, 'username') || f.meta?.username || '—';
  const displayName = getEv(f, 'display_name') || getEv(f, 'full_name') || f.meta?.display_name || f.meta?.full_name || '';
  const bio = getEv(f, 'bio') || f.meta?.bio || '';
  const photoUrl = getEv(f, 'photo_url') || f.meta?.photo_url || '';
  const summary = getEv(f, 'summary') || f.meta?.description || '';

  return (
    <Card className="border-border/40">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <Send className="h-4 w-4 text-[hsl(var(--primary))]" />
          <CardTitle className="text-sm">Telegram Profile</CardTitle>
          <PublicDataBadge />
        </div>
        <CardDescription className="text-xs">Public profile information</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <div className="flex items-center gap-3">
          {photoUrl && (
            <img
              src={photoUrl}
              alt="avatar"
              className="h-10 w-10 rounded-full object-cover ring-1 ring-border"
            />
          )}
          <div>
            <p className="font-medium text-foreground">{displayName || username}</p>
            {displayName && <p className="text-xs text-muted-foreground">@{username}</p>}
          </div>
        </div>
        {bio && <p className="text-xs text-muted-foreground mt-1 line-clamp-3">{bio}</p>}
        {!bio && summary && <p className="text-xs text-muted-foreground mt-1">{summary}</p>}
      </CardContent>
    </Card>
  );
}

function ChannelCard({ findings }: { findings: TelegramFinding[] }) {
  return (
    <Card className="border-border/40">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <Hash className="h-4 w-4 text-[hsl(var(--primary))]" />
          <CardTitle className="text-sm">Channel Footprints</CardTitle>
          <Badge variant="secondary" className="text-[10px] h-4 px-1">{findings.length}</Badge>
        </div>
        <CardDescription className="text-xs">Channels and groups where the user was observed</CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-1.5 text-xs">
          {findings.slice(0, 8).map((f) => (
            <li key={f.id} className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-primary/60 shrink-0" />
              <span className="text-foreground truncate">
                {getEv(f, 'channel_name') || f.meta?.channel_name || f.meta?.title || 'Unknown'}
              </span>
              {(getEv(f, 'member_count') || f.meta?.member_count) && (
                <span className="ml-auto text-muted-foreground">
                  {getEv(f, 'member_count') || f.meta?.member_count} members
                </span>
              )}
            </li>
          ))}
          {findings.length > 8 && (
            <li className="text-muted-foreground text-[10px]">+ {findings.length - 8} more</li>
          )}
        </ul>
      </CardContent>
    </Card>
  );
}

function EntitiesCard({ findings }: { findings: TelegramFinding[] }) {
  return (
    <Card className="border-border/40">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-[hsl(var(--primary))]" />
          <CardTitle className="text-sm">Entities</CardTitle>
          <Badge variant="secondary" className="text-[10px] h-4 px-1">{findings.length}</Badge>
        </div>
        <CardDescription className="text-xs">Related users, bots, and entities discovered</CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-1.5 text-xs">
          {findings.slice(0, 6).map((f) => (
            <li key={f.id} className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-accent/60 shrink-0" />
              <span className="text-foreground truncate">
                {getEv(f, 'entity_name') || f.meta?.entity_name || getEv(f, 'username') || 'Entity'}
              </span>
              <span className="ml-auto text-muted-foreground capitalize">
                {getEv(f, 'entity_type') || f.meta?.entity_type || ''}
              </span>
            </li>
          ))}
          {findings.length > 6 && (
            <li className="text-muted-foreground text-[10px]">+ {findings.length - 6} more</li>
          )}
        </ul>
      </CardContent>
    </Card>
  );
}

function GraphSummaryCard({
  scanId,
  loadArtifact,
  artifact,
  isLoading,
}: {
  scanId: string;
  loadArtifact: (type: string) => Promise<void>;
  artifact: any;
  isLoading: boolean;
}) {
  const [expanded, setExpanded] = useState(false);

  const handleExpand = () => {
    if (!expanded && !artifact) {
      loadArtifact('graph');
    }
    setExpanded(!expanded);
  };

  const nodeCount = artifact?.data?.nodes?.length ?? artifact?.data?.node_count ?? 0;
  const edgeCount = artifact?.data?.edges?.length ?? artifact?.data?.edge_count ?? 0;

  return (
    <Card className="border-border/40 shadow-sm">
      <CardHeader className="pb-2 pt-4 px-4">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center justify-center w-7 h-7 rounded-md bg-primary/10">
            <Network className="h-4 w-4 text-primary" />
          </div>
          <CardTitle className="text-sm font-semibold">Relationship Graph</CardTitle>
        </div>
        <CardDescription className="text-xs ml-[38px]">Visualise public associations from Telegram data</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        <Button
          variant="outline"
          size="sm"
          className="text-xs w-full"
          onClick={handleExpand}
          disabled={isLoading}
        >
          {isLoading ? (
            <><Loader2 className="h-3 w-3 animate-spin mr-1" /> Loading graph…</>
          ) : expanded ? (
            'Hide details'
          ) : (
            <><Eye className="h-3 w-3 mr-1" /> Load graph data</>
          )}
        </Button>
        {expanded && artifact && (
          <div className="text-xs space-y-1 text-muted-foreground">
            <p>{nodeCount} nodes · {edgeCount} edges</p>
            {artifact.data?.clusters && (
              <p>{artifact.data.clusters.length} clusters detected</p>
            )}
          </div>
        )}
        {expanded && !artifact && !isLoading && (
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">If public associations are detected, a relationship graph will appear here.</p>
            <p className="text-[10px] text-muted-foreground/60">Relationship graphs visualise public channel memberships, mentions, and known connections.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ── LastSeenBadge ────────────────────────────────────────────────

const LAST_SEEN_CONFIG: Record<string, { label: string; className: string; icon: 'clock' | 'eye-off' }> = {
  recently:     { label: 'Active Recently',    className: 'bg-green-500/15 text-green-600 border-green-500/30 dark:text-green-400',   icon: 'clock' },
  within_week:  { label: 'Active This Week',   className: 'bg-teal-500/15 text-teal-600 border-teal-500/30 dark:text-teal-400',    icon: 'clock' },
  within_month: { label: 'Active This Month',  className: 'bg-amber-500/15 text-amber-600 border-amber-500/30 dark:text-amber-400', icon: 'clock' },
  long_ago:     { label: 'Last Seen Long Ago', className: 'bg-muted text-muted-foreground border-border',                           icon: 'clock' },
  hidden:       { label: 'Last Seen Hidden',   className: 'bg-muted text-muted-foreground border-border',                           icon: 'eye-off' },
  unknown:      { label: 'Last Seen Unknown',  className: 'bg-muted text-muted-foreground border-border',                           icon: 'eye-off' },
};

function LastSeenBadge({ bucket }: { bucket: string }) {
  const key = (bucket || '').toLowerCase().replace(/\s+/g, '_');
  const cfg = LAST_SEEN_CONFIG[key] ?? LAST_SEEN_CONFIG['unknown'];
  const Icon = cfg.icon === 'clock' ? Clock : EyeOff;
  return (
    <Badge variant="outline" className={`gap-1 h-5 px-1.5 text-[10px] font-medium ${cfg.className}`}>
      <Icon className="w-2.5 h-2.5" />
      {cfg.label}
    </Badge>
  );
}

function PhonePresenceCard({ findings }: { findings: TelegramFinding[] }) {
  const f = findings[0];
  if (!f) return null;

  const ev = (k: string) => getEv(f, k) || f.meta?.[k];

  const registered   = ev('registered');
  const isRegistered = registered === 'true' || registered === true;
  const isNotFound   = registered === 'false' || registered === false;

  const displayName  = ev('display_name') || ev('full_name') || '';
  const username     = ev('username') || '';
  const lastSeen     = ev('last_seen_bucket') || ev('last_seen') || '';
  const verified     = ev('verified') === 'true' || ev('verified') === true;
  const isBot        = ev('bot') === 'true' || ev('bot') === true;
  const photoPresent = ev('photo_present') === 'true' || ev('photo_present') === true;
  const profileUrl   = ev('profile_url') || (username ? `https://t.me/${username}` : '');

  return (
    <Card className="border-border/40">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <Phone className="h-4 w-4 text-primary" />
          <CardTitle className="text-sm">Telegram Presence</CardTitle>
          <Badge variant="outline" className="text-[10px] h-4 px-1 border-primary/30 text-primary">Pro</Badge>
        </div>
        <CardDescription className="text-xs">Whether this phone number has a Telegram account</CardDescription>
      </CardHeader>
      <CardContent className="text-sm space-y-3">

        {/* Registration status row */}
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground text-xs">Registered:</span>
          <Badge
            variant={isRegistered ? 'default' : isNotFound ? 'secondary' : 'outline'}
            className={`text-[10px] ${isRegistered ? 'bg-green-500/20 text-green-700 border-green-500/30 dark:text-green-400' : ''}`}
          >
            {isRegistered ? 'Yes — found on Telegram' : isNotFound ? 'Not found' : 'Unknown'}
          </Badge>
        </div>

        {/* Profile block — only when registered */}
        {isRegistered && (
          <div className="rounded-md border border-border/40 bg-muted/20 p-3 space-y-2">

            {/* Name + badges row */}
            <div className="flex items-start justify-between gap-2">
              <div className="space-y-0.5 min-w-0">
                {displayName && (
                  <p className="font-medium text-foreground truncate">{displayName}</p>
                )}
                {username ? (
                  profileUrl ? (
                    <a
                      href={profileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary hover:underline underline-offset-2 flex items-center gap-1"
                    >
                      @{username}
                      <Link className="h-2.5 w-2.5 shrink-0" />
                    </a>
                  ) : (
                    <p className="text-xs text-muted-foreground">@{username}</p>
                  )
                ) : null}
                {!displayName && !username && (
                  <p className="text-xs text-muted-foreground italic">No public profile name</p>
                )}
              </div>

              {/* Flag badges */}
              <div className="flex flex-col gap-1 items-end shrink-0">
                {verified && (
                  <Badge variant="outline" className="text-[10px] h-4 px-1.5 gap-0.5 border-primary/30 text-primary">
                    <Shield className="h-2.5 w-2.5" /> Verified
                  </Badge>
                )}
                {isBot && (
                  <Badge variant="secondary" className="text-[10px] h-4 px-1.5">
                    Bot
                  </Badge>
                )}
                {photoPresent && (
                  <Badge variant="outline" className="text-[10px] h-4 px-1.5 gap-0.5 text-muted-foreground border-border">
                    <Eye className="h-2.5 w-2.5" /> Has photo
                  </Badge>
                )}
              </div>
            </div>

            {/* Last seen badge */}
            {lastSeen && (
              <div className="flex items-center gap-2 pt-0.5">
                <span className="text-[10px] text-muted-foreground uppercase tracking-wide">Last seen:</span>
                <LastSeenBadge bucket={lastSeen} />
              </div>
            )}
          </div>
        )}

        {/* Not-found hint */}
        {isNotFound && (
          <p className="text-xs text-muted-foreground">
            No Telegram account linked to this number. The account may be private or unregistered.
          </p>
        )}

      </CardContent>
    </Card>
  );
}

function ChannelProfileCard({ findings }: { findings: TelegramFinding[] }) {
  const f = findings[0];
  if (!f) return null;

  const ev = (k: string) => getEv(f, k) || f.meta?.[k];
  const title = ev('title') || ev('channel_name') || ev('username') || '—';
  const username = ev('username') || '';
  const subscribers = ev('subscriber_count') || ev('members_count') || ev('participants_count');
  const totalMessages = ev('total_messages') || ev('message_count');
  const description = ev('description') || ev('bio') || ev('about') || '';
  const linkedChannels: any[] = Array.isArray(f.meta?.linked_channels) ? f.meta.linked_channels : [];
  const lastSeenBucket = ev('last_seen_bucket') || ev('last_seen') || f.meta?.last_seen_bucket || f.meta?.last_seen || '';

  return (
    <Card className="border-border/40">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <Hash className="h-4 w-4 text-primary" />
          <CardTitle className="text-sm">Channel Profile</CardTitle>
          <PublicDataBadge />
        </div>
        <CardDescription className="text-xs">Public channel metadata from Telegram</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <div>
          <p className="font-medium text-foreground">{title}</p>
          {username && <p className="text-xs text-muted-foreground">@{username}</p>}
          {lastSeenBucket && (
            <div className="mt-1.5">
              <LastSeenBadge bucket={lastSeenBucket} />
            </div>
          )}
          {description && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{description}</p>}
        </div>
        <div className="flex flex-wrap gap-3 text-xs">
          {subscribers && (
            <div className="flex items-center gap-1 text-muted-foreground">
              <Users className="h-3 w-3" />
              <span>{Number(subscribers).toLocaleString()} subscribers</span>
            </div>
          )}
          {totalMessages && (
            <div className="flex items-center gap-1 text-muted-foreground">
              <Send className="h-3 w-3" />
              <span>{Number(totalMessages).toLocaleString()} messages</span>
            </div>
          )}
        </div>
        {linkedChannels.length > 0 && (
          <div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1 flex items-center gap-1">
              <Link className="h-2.5 w-2.5" /> Linked Channels
            </p>
            <ul className="space-y-0.5">
              {linkedChannels.slice(0, 4).map((lc: any, i: number) => (
                <li key={i} className="text-xs text-muted-foreground truncate">
                  {lc.username ? `@${lc.username}` : lc.title || lc}
                </li>
              ))}
              {linkedChannels.length > 4 && (
                <li className="text-[10px] text-muted-foreground">+{linkedChannels.length - 4} more</li>
              )}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ActivityIntelCard({ findings }: { findings: TelegramFinding[] }) {
  const f = findings[0];
  if (!f) return null;

  const ev = (k: string) => getEv(f, k) || f.meta?.[k];
  const riskScore = Number(ev('risk_score') ?? ev('risk') ?? 0);
  const postFrequency = ev('post_frequency') || ev('posts_per_day') || ev('avg_posts_per_day');
  const peakHour = ev('peak_hour') || ev('peak_posting_hour');
  const linkDensity = ev('link_density') || ev('links_per_post');
  const contentTypes: any = f.meta?.content_classification || f.meta?.content_types || {};
  const riskIndicators: string[] = Array.isArray(f.meta?.risk_indicators) ? f.meta.risk_indicators : [];

  const riskColor =
    riskScore >= 70 ? 'text-destructive' :
    riskScore >= 40 ? 'text-yellow-500 dark:text-yellow-400' :
    'text-green-600 dark:text-green-400';

  const riskBg =
    riskScore >= 70 ? 'bg-destructive/10' :
    riskScore >= 40 ? 'bg-yellow-500/10' :
    'bg-green-500/10';

  return (
    <Card className="border-border/40">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-primary" />
          <CardTitle className="text-sm">Activity Intelligence</CardTitle>
          <Badge variant="outline" className="text-[10px] h-4 px-1 border-primary/30 text-primary">Pro</Badge>
        </div>
        <CardDescription className="text-xs">Behavioural analysis and risk indicators</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        {/* Risk Score */}
        {riskScore > 0 && (
          <div className={`flex items-center gap-3 rounded-md px-3 py-2 ${riskBg}`}>
            <AlertTriangle className={`h-4 w-4 shrink-0 ${riskColor}`} />
            <div>
              <p className={`font-semibold ${riskColor}`}>Risk Score: {riskScore}/100</p>
              <p className="text-[10px] text-muted-foreground">
                {riskScore >= 70 ? 'High risk signals detected' : riskScore >= 40 ? 'Moderate risk signals' : 'Low risk profile'}
              </p>
            </div>
          </div>
        )}

        {/* Posting Cadence */}
        <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs">
          {postFrequency && (
            <div className="flex items-center gap-1 text-muted-foreground">
              <TrendingUp className="h-3 w-3" />
              <span>{postFrequency} posts/day avg</span>
            </div>
          )}
          {peakHour && (
            <div className="flex items-center gap-1 text-muted-foreground">
              <Activity className="h-3 w-3" />
              <span>Peak: {peakHour}:00 UTC</span>
            </div>
          )}
          {linkDensity && (
            <div className="flex items-center gap-1 text-muted-foreground">
              <Link className="h-3 w-3" />
              <span>{typeof linkDensity === 'number' ? linkDensity.toFixed(2) : linkDensity} links/post</span>
            </div>
          )}
        </div>

        {/* Content classification */}
        {Object.keys(contentTypes).length > 0 && (
          <div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">Content Mix</p>
            <div className="flex flex-wrap gap-1">
              {Object.entries(contentTypes).slice(0, 5).map(([type, pct]: [string, any]) => (
                <Badge key={type} variant="secondary" className="text-[10px] h-4 px-1.5 capitalize">
                  {type}: {typeof pct === 'number' ? `${Math.round(pct * 100)}%` : pct}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Risk indicators list */}
        {riskIndicators.length > 0 && (
          <div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1 flex items-center gap-1">
              <AlertTriangle className="h-2.5 w-2.5" /> Risk Indicators
            </p>
            <ul className="space-y-0.5">
              {riskIndicators.slice(0, 4).map((r, i) => (
                <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                  <div className="w-1 h-1 rounded-full bg-destructive/60 mt-1.5 shrink-0" />
                  {r}
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ── Locked preview placeholder ──────────────────────────────────

function LockedCard({ icon: Icon, title, description }: { icon: any; title: string; description: string }) {
  return (
    <Card className="border-border/40 relative overflow-hidden">
      <div className="absolute inset-0 bg-background/60 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center gap-2">
        <Lock className="h-5 w-5 text-muted-foreground/60" />
        <p className="text-xs font-medium text-muted-foreground">Pro feature</p>
        <Button size="sm" variant="outline" className="text-xs h-7" asChild>
          <a href="/billing">Unlock</a>
        </Button>
      </div>
      <CardHeader className="pb-2 opacity-40">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4" />
          <CardTitle className="text-sm">{title}</CardTitle>
        </div>
        <CardDescription className="text-xs">{description}</CardDescription>
      </CardHeader>
      <CardContent className="opacity-40">
        <div className="h-16 rounded bg-muted/30" />
      </CardContent>
    </Card>
  );
}

// ── Shared badges ───────────────────────────────────────────────

function PublicDataBadge() {
  return (
    <Badge variant="outline" className="text-[9px] h-4 px-1.5 border-green-500/30 text-green-600 dark:text-green-400 gap-0.5">
      <Shield className="h-2.5 w-2.5" />
      Public data only
    </Badge>
  );
}

function ResponsibleUseTooltip() {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button className="inline-flex items-center gap-1 text-[10px] text-muted-foreground/70 hover:text-muted-foreground transition-colors">
            <Info className="h-3 w-3" />
            Responsible Use
          </button>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-xs text-xs leading-relaxed">
          <p className="font-medium mb-1">Responsible OSINT Use</p>
          <p>
            Telegram data shown here comes from publicly accessible sources only.
            No private messages or protected content is accessed.
            Use this information for self-assessment, authorised investigation, or risk awareness — never for harassment or unauthorised surveillance.
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// ── TelegramHealthIndicator ──────────────────────────────────────

function formatRelativeTime(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  const secs = Math.floor(ms / 1000);
  if (secs < 60) return `${secs}s ago`;
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function TelegramHealthIndicator({
  triggeredAt,
  hasFindings,
  hasNotFoundDiagnostic = false,
  healthRefreshKey = 0,
}: {
  triggeredAt: string | null | undefined;
  hasFindings: boolean;
  hasNotFoundDiagnostic?: boolean;
  healthRefreshKey?: number;
}) {
  const [workerOnline, setWorkerOnline] = useState<boolean | null>(null);
  const [healthChecking, setHealthChecking] = useState(false);
  const [showDiagnostics, setShowDiagnostics] = useState(false);

  // Check worker health on mount and after retrigger (healthRefreshKey changes)
  useEffect(() => {
    let cancelled = false;
    const checkHealth = async () => {
      setHealthChecking(true);
      try {
        const { data, error } = await supabase.functions.invoke('telegram-worker-health');
        if (!cancelled) {
          if (error) {
            setWorkerOnline(false);
          } else {
            setWorkerOnline(data?.connected === true && data?.authorized === true);
          }
        }
      } catch {
        if (!cancelled) setWorkerOnline(false);
      } finally {
        if (!cancelled) setHealthChecking(false);
      }
    };
    checkHealth();
    return () => { cancelled = true; };
  }, [healthRefreshKey]);

  // Derive scan findings status
  const findingsStatus: 'completed' | 'not_found' | 'pending' | 'timed_out' | 'not_triggered' = (() => {
    if (hasFindings) return 'completed';
    if (hasNotFoundDiagnostic) return 'not_found';
    if (!triggeredAt) return 'not_triggered';
    const elapsed = Date.now() - new Date(triggeredAt).getTime();
    if (elapsed > 5 * 60 * 1000) return 'timed_out';
    return 'pending';
  })();

  // Worker status line
  const workerLabel = healthChecking
    ? 'Checking status…'
    : workerOnline === true
      ? 'Data source operational'
      : workerOnline === false
        ? 'Data source unavailable'
        : 'Status unknown';

  const workerDotClass = healthChecking
    ? 'bg-muted-foreground animate-pulse'
    : workerOnline === true
      ? 'bg-green-500'
      : 'bg-destructive';

  const workerBadgeClass = healthChecking
    ? 'bg-muted text-muted-foreground border-border'
    : workerOnline === true
      ? 'bg-green-500/10 text-green-600 border-green-500/30 dark:text-green-400'
      : 'bg-destructive/10 text-destructive border-destructive/30';

  // Findings status config
  const findingsCfg: Record<string, { label: string; icon: React.ComponentType<{ className?: string }>; badgeClass: string; dotClass: string }> = {
    completed: { label: 'Scan findings recorded', icon: CheckCircle2, badgeClass: 'bg-green-500/10 text-green-600 border-green-500/30 dark:text-green-400', dotClass: 'bg-green-500' },
    not_found: { label: 'No public profile found', icon: XCircle, badgeClass: 'bg-orange-500/10 text-orange-600 border-orange-500/30 dark:text-orange-400', dotClass: 'bg-orange-500' },
    pending: { label: 'Analysis in progress', icon: Hourglass, badgeClass: 'bg-amber-500/10 text-amber-600 border-amber-500/30 dark:text-amber-400', dotClass: 'bg-amber-500 animate-pulse' },
    timed_out: { label: 'Analysis timed out', icon: AlertTriangle, badgeClass: 'bg-destructive/10 text-destructive border-destructive/30', dotClass: 'bg-destructive' },
    not_triggered: { label: 'Not yet scanned', icon: XCircle, badgeClass: 'bg-muted text-muted-foreground border-border', dotClass: 'bg-muted-foreground' },
  };
  const fc = findingsCfg[findingsStatus];
  const FindingsIcon = fc.icon;

  // Contextual description
  const description = (() => {
    if (workerOnline === false) return 'Telegram data source is currently unreachable. Scans may be limited.';
    if (workerOnline === true && !hasFindings && findingsStatus !== 'pending') {
      return 'Public Telegram data is accessible — no findings recorded for this scan yet.';
    }
    if (findingsStatus === 'completed') return 'Data source operational and scan findings have been recorded.';
    if (findingsStatus === 'pending') return 'Data source operational — analysis is in progress.';
    if (findingsStatus === 'not_found') return 'The username could not be found on public Telegram.';
    return '';
  })();

  // Admin debug toggle
  const isDebugMode = typeof window !== 'undefined' && localStorage.getItem('fpiq_debug') === 'true';

  return (
    <Card className="border-border/40 bg-muted/20 shadow-sm">
      <CardHeader className="pb-2 pt-4 px-4">
       <div className="flex items-center gap-2.5">
          <div className="flex items-center justify-center w-7 h-7 rounded-md bg-muted/50">
            <Shield className="h-4 w-4 text-muted-foreground" />
          </div>
          <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Telegram Intelligence Status
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="px-3 pb-3 space-y-2">
        {/* Worker reachable signal */}
        <div className="flex items-center justify-between gap-3">
          <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[11px] font-medium ${workerBadgeClass}`}>
            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${workerDotClass}`} />
            {healthChecking ? <Loader2 className="h-3 w-3 animate-spin shrink-0" /> : workerOnline ? <CheckCircle2 className="h-3 w-3 shrink-0" /> : <XCircle className="h-3 w-3 shrink-0" />}
            {workerLabel}
          </div>
        </div>

        {/* Scan findings signal */}
        <div className="flex items-center justify-between gap-3">
          <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[11px] font-medium ${fc.badgeClass}`}>
            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${fc.dotClass}`} />
            <FindingsIcon className="h-3 w-3 shrink-0" />
            {fc.label}
          </div>

          {triggeredAt && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="flex items-center gap-1 text-[10px] text-muted-foreground cursor-default">
                    <Clock className="h-3 w-3" />
                    {formatRelativeTime(triggeredAt)}
                  </span>
                </TooltipTrigger>
                <TooltipContent side="top" className="text-xs">
                  Last triggered: {new Date(triggeredAt).toLocaleString()}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>

        {description && (
          <p className="text-[10px] text-muted-foreground leading-relaxed">{description}</p>
        )}

        {/* Admin debug toggle */}
        {isDebugMode && (
          <div className="pt-1 border-t border-border/30">
            <button
              onClick={() => setShowDiagnostics(prev => !prev)}
              className="text-[10px] text-muted-foreground/60 hover:text-muted-foreground transition-colors"
            >
              {showDiagnostics ? 'Hide diagnostics' : 'Show diagnostics'}
            </button>
            {showDiagnostics && (
              <pre className="mt-1 text-[9px] text-muted-foreground/50 bg-muted/30 rounded p-1.5 font-mono leading-relaxed overflow-x-auto">
{`workerOnline: ${workerOnline}
findingsStatus: ${findingsStatus}
triggeredAt: ${triggeredAt ?? 'n/a'}`}
              </pre>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ── RetriggerButton ──────────────────────────────────────────────


const COOLDOWN_MS = 30_000;

function RetriggerButton({ scanId, scanType, variant = 'default', onRetriggered }: {
  scanId: string;
  scanType?: string;
  onRetriggered?: () => void;
  variant?: 'default' | 'icon';
}) {
  const [loading, setLoading] = useState(false);
  const cooldownRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [disabled, setDisabled] = useState(false);

  const handleRetrigger = useCallback(async () => {
    if (loading || disabled) return;
    setLoading(true);

    try {
      const { error } = await supabase.functions.invoke('telegram-retrigger', {
        body: { scan_id: scanId },
      });

      if (error) {
        toast.error('Failed to re-trigger Telegram scan. Please try again.');
        console.error('[RetriggerButton]', error);
      } else {
        toast.success('Telegram scan re-triggered. Results will appear shortly.');
        onRetriggered?.();
        setDisabled(true);
        cooldownRef.current = setTimeout(() => setDisabled(false), COOLDOWN_MS);
      }
    } catch (err) {
      toast.error('Unexpected error. Please try again.');
      console.error('[RetriggerButton]', err);
    } finally {
      setLoading(false);
    }
  }, [scanId, loading, disabled]);

  if (variant === 'icon') {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="h-7 w-7 p-0"
              onClick={handleRetrigger}
              disabled={loading || disabled}
            >
              {loading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <RefreshCw className="h-3.5 w-3.5" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="left">
            <p className="text-xs">{disabled ? 'Re-triggered — waiting for results…' : 'Re-run Telegram scan'}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleRetrigger}
      disabled={loading || disabled}
      className="gap-2"
    >
      {loading ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : (
        <RefreshCw className="h-3.5 w-3.5" />
      )}
      {disabled ? 'Re-triggered…' : 'Re-run Telegram Scan'}
    </Button>
  );
}

// ── Main component ──────────────────────────────────────────────

export function TelegramTab({ scanId, isPro, scanType, telegramTriggeredAt }: TelegramTabProps) {
  // Keep a local copy of triggeredAt so it can be refreshed after a retrigger
  // without requiring the parent to re-fetch the whole scan record.
  const [localTriggeredAt, setLocalTriggeredAt] = useState<string | null | undefined>(telegramTriggeredAt);
  const [healthRefreshKey, setHealthRefreshKey] = useState(0);

  // Sync if the parent updates (e.g. on initial load)
  useEffect(() => {
    setLocalTriggeredAt(telegramTriggeredAt);
  }, [telegramTriggeredAt]);

  const handleRetriggered = useCallback(async () => {
    // Re-fetch telegram_triggered_at from the DB so the health indicator updates immediately
    const { data } = await supabase
      .from('scans')
      .select('telegram_triggered_at')
      .eq('id', scanId)
      .maybeSingle();
    if (data) setLocalTriggeredAt((data as any).telegram_triggered_at ?? null);
    // Also re-check worker health
    setHealthRefreshKey(k => k + 1);
  }, [scanId]);

  const {
    findings,
    loading,
    artifacts,
    artifactLoading,
    loadArtifact,
    hasTelegramData,
  } = useTelegramFindings(scanId);

  // Detect the 'not_found' diagnostic finding written by telegram-proxy
  const hasNotFoundDiagnostic = useMemo(
    () => findings.some(f => f.kind === 'telegram.not_found'),
    [findings],
  );

  // Real findings exclude the diagnostic sentinel
  const realFindings = useMemo(
    () => findings.filter(f => f.kind !== 'telegram.not_found'),
    [findings],
  );

  const hasRealData = realFindings.length > 0;

  // Group real findings by kind (hoisted before any early returns)
  const groupedReal = useMemo(() => groupByKind(realFindings), [realFindings]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const profileFindings = hasRealData ? (groupedReal['profile'] || groupedReal['profile_presence'] || groupedReal['telegram_username'] || []) : [];
  const channelProfileFindings = hasRealData ? (groupedReal['channel_profile'] || []) : [];
  const channelFindings = hasRealData ? (groupedReal['channel'] || groupedReal['channel_footprint'] || []) : [];
  const activityIntelFindings = hasRealData ? (groupedReal['activity_intel'] || []) : [];
  const entityFindings = hasRealData ? (groupedReal['entity'] || groupedReal['related_entity'] || []) : [];
  const phoneFindings = hasRealData ? (groupedReal['phone_presence'] || []) : [];

  return (
    <div className="space-y-6">
      {/* ── Provider Selector ──────────────────────────────────── */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 bg-muted/40 rounded-lg p-1">
          <button
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-background shadow-sm border border-border/50 text-foreground transition-colors"
            disabled
          >
            <Send className="h-3 w-3" />
            Telegram
          </button>
          <button
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-muted-foreground/50 cursor-not-allowed transition-colors"
            disabled
            title="Coming soon"
          >
            <MessageSquare className="h-3 w-3" />
            Discord
          </button>
          <button
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-muted-foreground/50 cursor-not-allowed transition-colors"
            disabled
            title="Coming soon"
          >
            <Hash className="h-3 w-3" />
            X Threads
          </button>
          <button
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-muted-foreground/50 cursor-not-allowed transition-colors"
            disabled
            title="Coming soon"
          >
            <Phone className="h-3 w-3" />
            WhatsApp
          </button>
        </div>
      </div>

      {/* ── Provider Header ────────────────────────────────────── */}
      <div className="flex items-center gap-2.5">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10">
          <Send className="h-4 w-4 text-primary" />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-foreground">Telegram Intelligence</h2>
          <p className="text-[11px] text-muted-foreground">Public OSINT from Telegram users, channels, and groups</p>
        </div>
      </div>

      {/* ── Telegram Content ───────────────────────────────────── */}
      <div className="space-y-6">
      {/* Worker health indicator – always visible */}
      <TelegramHealthIndicator
        triggeredAt={localTriggeredAt}
        hasFindings={hasRealData}
        hasNotFoundDiagnostic={hasNotFoundDiagnostic}
        healthRefreshKey={healthRefreshKey}
      />

      {/* Explore section – Pro only */}
      <FeatureGate
        feature="advanced_scan"
        fallback={
          <Card className="relative overflow-hidden border-primary/15 bg-gradient-to-br from-primary/[0.04] via-primary/[0.02] to-transparent">
            <CardContent className="py-8 px-6 flex flex-col items-center text-center gap-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10">
                <Send className="h-5 w-5 text-primary" />
              </div>
              <div className="space-y-2 max-w-sm">
                <h3 className="text-base font-semibold text-foreground">Unlock Telegram Intelligence</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">Upgrade to Pro to:</p>
                <ul className="text-sm text-muted-foreground space-y-1.5 text-left mx-auto w-fit">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
                    <span>Explore Telegram usernames, channels, and groups</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
                    <span>Search public message history</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
                    <span>Visualise relationship graphs</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
                    <span>Access unredacted findings and evidence</span>
                  </li>
                </ul>
              </div>
              <Button asChild className="h-10 px-6 mt-1">
                <a href="/settings/billing">Upgrade to Pro</a>
              </Button>
            </CardContent>
          </Card>
        }
      >
        <TelegramExplore scanId={scanId} />
      </FeatureGate>

      {hasRealData ? (
        <>
          {/* Exposure Snapshot */}
          <TelegramExposureSnapshot findings={realFindings} isPro={isPro} />

          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Send className="h-5 w-5 text-primary" />
              <h3 className="text-sm font-semibold text-foreground">Telegram Intelligence</h3>
              <Badge variant="secondary" className="text-[10px] h-4 px-1">
                {realFindings.length} finding{realFindings.length !== 1 ? 's' : ''}
              </Badge>
              <PublicDataBadge />
            </div>
            <div className="flex items-center gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={async () => {
                        const { error } = await supabase.functions.invoke('telegram-retrigger', {
                          body: { scan_id: scanId, scan_type: scanType },
                        });
                        if (!error) { toast.success('Telegram scan re-triggered.'); handleRetriggered(); }
                        else toast.error('Failed to re-trigger.');
                      }}
                      aria-label="Re-run Telegram scan"
                    >
                      <RefreshCw className="h-3.5 w-3.5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="left">
                    <p className="text-xs">Re-run Telegram scan</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <ResponsibleUseTooltip />
            </div>
          </div>

          {/* Cards grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {profileFindings.length > 0 && <ProfileCard findings={profileFindings} />}
            {channelProfileFindings.length > 0 && <ChannelProfileCard findings={channelProfileFindings} />}

            {isPro ? (
              activityIntelFindings.length > 0 ? <ActivityIntelCard findings={activityIntelFindings} /> : null
            ) : (
              <LockedCard icon={Activity} title="Activity Intelligence" description="Behavioural analysis, posting cadence, and risk indicators" />
            )}

            {isPro ? (
              channelFindings.length > 0 ? <ChannelCard findings={channelFindings} /> : null
            ) : (
              <LockedCard icon={Hash} title="Channel Footprints" description="Channels and groups where the user was observed" />
            )}

            {isPro ? (
              entityFindings.length > 0 ? <EntitiesCard findings={entityFindings} /> : null
            ) : (
              <LockedCard icon={Users} title="Entities" description="Related users, bots, and entities discovered" />
            )}

            {isPro ? (
              <GraphSummaryCard
                scanId={scanId}
                loadArtifact={loadArtifact}
                artifact={artifacts['relationship_graph']}
                isLoading={artifactLoading['relationship_graph'] || false}
              />
            ) : (
              <LockedCard icon={Network} title="Graph Summary" description="Relationship graph from Telegram data" />
            )}

            {isPro ? (
              phoneFindings.length > 0 ? <PhonePresenceCard findings={phoneFindings} /> : null
            ) : (
              <LockedCard icon={Phone} title="Telegram Presence" description="Whether a phone number has a Telegram account" />
            )}
          </div>
        </>
      ) : (
        /* Empty state – no findings */
        <div className="py-6 text-center space-y-3">
          <Send className="h-7 w-7 text-muted-foreground/40 mx-auto" />
          <p className="text-sm text-muted-foreground">
            No Telegram findings saved for this scan yet — use the Intelligence Suite above to browse Telegram content.
          </p>
          <div className="flex justify-center pt-1">
            <RetriggerButton scanId={scanId} scanType={scanType} variant="icon" onRetriggered={handleRetriggered} />
          </div>
        </div>
      )}

      {/* Footer disclaimer */}
      <p className="text-[10px] text-muted-foreground/50 text-center leading-relaxed mt-4">
        Telegram data is sourced from publicly accessible profiles and channels only.
        No private messages are accessed.{' '}
        <a href="/ethical-osint-charter" className="underline underline-offset-2 hover:text-muted-foreground/70">
          Read our Ethical OSINT Charter
        </a>
      </p>
      </div>
    </div>
  );
}

export default TelegramTab;
