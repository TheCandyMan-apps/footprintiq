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

import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Loader2, Lock, Send, Shield, Info, Users, Hash, Network, Phone, Eye } from 'lucide-react';
import { useTelegramFindings, type TelegramFinding } from '@/hooks/useTelegramFindings';

interface TelegramTabProps {
  scanId: string;
  isPro: boolean;
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
  const displayName = getEv(f, 'display_name') || f.meta?.display_name || '';
  const bio = getEv(f, 'bio') || f.meta?.bio || '';
  const photoUrl = getEv(f, 'photo_url') || f.meta?.photo_url || '';

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
    <Card className="border-border/40">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <Network className="h-4 w-4 text-[hsl(var(--primary))]" />
          <CardTitle className="text-sm">Graph Summary</CardTitle>
        </div>
        <CardDescription className="text-xs">Relationship graph from Telegram data</CardDescription>
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
          <p className="text-xs text-muted-foreground">No graph data available for this scan.</p>
        )}
      </CardContent>
    </Card>
  );
}

function PhonePresenceCard({ findings }: { findings: TelegramFinding[] }) {
  const f = findings[0];
  if (!f) return null;

  const registered = getEv(f, 'registered') || f.meta?.registered;
  const lastSeen = getEv(f, 'last_seen') || f.meta?.last_seen;

  return (
    <Card className="border-border/40">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <Phone className="h-4 w-4 text-[hsl(var(--primary))]" />
          <CardTitle className="text-sm">Phone Presence</CardTitle>
          <Badge variant="outline" className="text-[10px] h-4 px-1 border-primary/30 text-primary">Pro</Badge>
        </div>
        <CardDescription className="text-xs">Whether this phone number is registered on Telegram</CardDescription>
      </CardHeader>
      <CardContent className="text-sm space-y-1">
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">Registered:</span>
          <Badge variant={registered === 'true' || registered === true ? 'default' : 'secondary'} className="text-[10px]">
            {registered === 'true' || registered === true ? 'Yes' : registered === 'false' || registered === false ? 'No' : 'Unknown'}
          </Badge>
        </div>
        {lastSeen && (
          <p className="text-xs text-muted-foreground">Last seen: {lastSeen}</p>
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

// ── Main component ──────────────────────────────────────────────

export function TelegramTab({ scanId, isPro }: TelegramTabProps) {
  const {
    findings,
    loading,
    artifacts,
    artifactLoading,
    loadArtifact,
    hasTelegramData,
  } = useTelegramFindings(scanId);

  const grouped = useMemo(() => groupByKind(findings), [findings]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!hasTelegramData) {
    return (
      <div className="py-12 text-center space-y-2">
        <Send className="h-8 w-8 text-muted-foreground/40 mx-auto" />
        <p className="text-sm text-muted-foreground">No Telegram data found for this scan.</p>
        <p className="text-xs text-muted-foreground/60">
          Telegram intelligence is gathered when available from public profiles and channels.
        </p>
      </div>
    );
  }

  const profileFindings = grouped['profile'] || grouped['profile_presence'] || [];
  const channelFindings = grouped['channel'] || grouped['channel_footprint'] || [];
  const entityFindings = grouped['entity'] || grouped['related_entity'] || [];
  const phoneFindings = grouped['phone_presence'] || [];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Send className="h-5 w-5 text-[hsl(var(--primary))]" />
          <h3 className="text-sm font-semibold text-foreground">Telegram Intelligence</h3>
          <Badge variant="secondary" className="text-[10px] h-4 px-1">
            {findings.length} finding{findings.length !== 1 ? 's' : ''}
          </Badge>
          <PublicDataBadge />
        </div>
        <ResponsibleUseTooltip />
      </div>

      {/* Cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Profile – always visible */}
        {profileFindings.length > 0 ? (
          <ProfileCard findings={profileFindings} />
        ) : null}

        {/* Channel Footprints – Pro only */}
        {isPro ? (
          channelFindings.length > 0 ? (
            <ChannelCard findings={channelFindings} />
          ) : null
        ) : (
          <LockedCard
            icon={Hash}
            title="Channel Footprints"
            description="Channels and groups where the user was observed"
          />
        )}

        {/* Entities – Pro only */}
        {isPro ? (
          entityFindings.length > 0 ? (
            <EntitiesCard findings={entityFindings} />
          ) : null
        ) : (
          <LockedCard
            icon={Users}
            title="Entities"
            description="Related users, bots, and entities discovered"
          />
        )}

        {/* Graph Summary – Pro only, lazy-loaded */}
        {isPro ? (
          <GraphSummaryCard
            scanId={scanId}
            loadArtifact={loadArtifact}
            artifact={artifacts['graph']}
            isLoading={artifactLoading['graph'] || false}
          />
        ) : (
          <LockedCard
            icon={Network}
            title="Graph Summary"
            description="Relationship graph from Telegram data"
          />
        )}

        {/* Phone Presence – Pro only */}
        {isPro ? (
          phoneFindings.length > 0 ? (
            <PhonePresenceCard findings={phoneFindings} />
          ) : null
        ) : (
          <LockedCard
            icon={Phone}
            title="Phone Presence"
            description="Whether a phone number is registered on Telegram"
          />
        )}
      </div>

      {/* Footer disclaimer */}
      <p className="text-[10px] text-muted-foreground/50 text-center leading-relaxed mt-4">
        Telegram data is sourced from publicly accessible profiles and channels only.
        No private messages are accessed.{' '}
        <a href="/ethical-osint-charter" className="underline underline-offset-2 hover:text-muted-foreground/70">
          Read our Ethical OSINT Charter
        </a>
      </p>
    </div>
  );
}

export default TelegramTab;
