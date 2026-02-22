/**
 * TelegramExplore – Interactive Telegram Explore (Beta) panel.
 *
 * Uses dedicated edge function proxies:
 *   telegram-explore-resolve, telegram-explore-info,
 *   telegram-explore-recent, telegram-explore-search-dialog
 */

import { useState, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Loader2, Send, Search, Users, Shield,
  AlertTriangle, ChevronDown, Clock, MessageSquare, Eye,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

// ── Types ──

interface ResolvedEntity {
  title?: string;
  username?: string;
  type?: string;
  id?: number | string;
  verified?: boolean;
  scam?: boolean;
  fake?: boolean;
  participants_count?: number;
  about?: string;
  [key: string]: any;
}

interface TelegramMessage {
  id: number;
  date?: string;
  sender_id?: number | string;
  text?: string;
  message?: string;
  [key: string]: any;
}

interface TelegramExploreProps {
  scanId: string;
}

// ── Error handling ──

function mapError(status: number | undefined, body: any): string {
  if (status === 401) return 'Unauthorized — please sign in again.';
  if (status === 429) {
    const retryAfter = body?.retry_after ?? body?.detail?.retry_after;
    return retryAfter
      ? `Rate limited — retry after ${retryAfter} seconds.`
      : 'Rate limited — please wait and try again.';
  }
  if (status === 502 || status === 503) return 'Telegram service unavailable — try again later.';
  if (status === 403) return 'Access denied — you may not have permission for this scan.';
  if (status === 404) return 'Not found.';
  return body?.error || body?.detail || 'An unexpected error occurred.';
}

async function invokeExplore(
  fnName: string,
  body: Record<string, unknown>,
): Promise<{ data: any; error: string | null }> {
  const { data, error } = await supabase.functions.invoke(fnName, { body });

  // supabase-js wraps non-2xx as an error with context
  if (error) {
    // Try to parse structured error from the response
    const status = (error as any)?.status ?? (error as any)?.context?.status;
    let parsed: any = {};
    try {
      if (typeof (error as any)?.context?.body === 'string') {
        parsed = JSON.parse((error as any).context.body);
      } else if (typeof (error as any)?.message === 'string') {
        try { parsed = JSON.parse((error as any).message); } catch { /* ignore */ }
      }
    } catch { /* ignore */ }
    return { data: null, error: mapError(status, parsed) };
  }

  return { data, error: null };
}

// ── Helpers ──

function extractEntity(data: any): ResolvedEntity | null {
  if (!data) return null;
  if (data.title || data.username || data.id) return data as ResolvedEntity;
  if (data.entity) return data.entity as ResolvedEntity;
  return null;
}

function extractMessages(data: any): TelegramMessage[] {
  if (!data) return [];
  if (Array.isArray(data.messages)) return data.messages;
  if (Array.isArray(data)) return data;
  return [];
}

function snippetText(msg: TelegramMessage): string {
  const raw = msg.text || msg.message || '';
  return raw.length > 120 ? raw.slice(0, 120) + '…' : raw || '(no text)';
}

function formatDate(iso?: string): string {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString(undefined, {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

// ── Component ──

export function TelegramExplore({ scanId }: TelegramExploreProps) {
  const [target, setTarget] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');

  // Data state
  const [entity, setEntity] = useState<ResolvedEntity | null>(null);
  const [messages, setMessages] = useState<TelegramMessage[]>([]);
  const [searchResults, setSearchResults] = useState<TelegramMessage[]>([]);

  // Loading flags
  const [loadingLoad, setLoadingLoad] = useState(false);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [loadingOlder, setLoadingOlder] = useState(false);

  // Inline error
  const [inlineError, setInlineError] = useState<string | null>(null);

  // Track resolved dialog identifier for subsequent calls
  const dialogRef = useRef<string>('');

  // ── Load flow: resolve → info → recent ──
  const handleLoad = useCallback(async () => {
    const t = target.trim();
    if (!t) return;

    setLoadingLoad(true);
    setInlineError(null);
    setEntity(null);
    setMessages([]);
    setSearchResults([]);
    setActiveTab('overview');
    dialogRef.current = '';

    try {
      // 1. Resolve
      const { data: resolveData, error: resolveErr } = await invokeExplore(
        'telegram-explore-resolve',
        { scan_id: scanId, input: t },
      );
      if (resolveErr) { setInlineError(resolveErr); return; }

      // Determine dialog identifier from resolve response
      const resolved = resolveData;
      const dialog = resolved?.username || resolved?.id?.toString() || t;
      dialogRef.current = dialog;

      // 2. Info
      const { data: infoData, error: infoErr } = await invokeExplore(
        'telegram-explore-info',
        { scan_id: scanId, dialog },
      );
      if (infoErr) {
        // Non-fatal: we can still show what we have from resolve
        console.warn('[TelegramExplore] info error:', infoErr);
      }
      const ent = extractEntity(infoData) || extractEntity(resolved);
      setEntity(ent);

      // 3. Recent
      const { data: recentData, error: recentErr } = await invokeExplore(
        'telegram-explore-recent',
        { scan_id: scanId, dialog, limit: 20, offset_id: null, include_empty: false },
      );
      if (recentErr) {
        console.warn('[TelegramExplore] recent error:', recentErr);
      } else {
        setMessages(extractMessages(recentData));
      }
    } catch (err) {
      console.error('[TelegramExplore]', err);
      setInlineError('Unexpected error during load.');
    } finally {
      setLoadingLoad(false);
    }
  }, [target, scanId]);

  // ── Search flow ──
  const handleSearch = useCallback(async () => {
    const q = searchQuery.trim();
    const dialog = dialogRef.current || target.trim();
    if (!dialog) { setInlineError('Load a target first.'); return; }
    if (!q) return;

    setLoadingSearch(true);
    setInlineError(null);
    setActiveTab('search');
    setSearchResults([]);

    try {
      const { data, error } = await invokeExplore(
        'telegram-explore-search-dialog',
        { scan_id: scanId, dialog, query: q, limit: 50, offset_id: null },
      );
      if (error) { setInlineError(error); return; }
      const hits = extractMessages(data);
      setSearchResults(hits);
      if (hits.length === 0) setInlineError('No messages matched your query.');
    } catch (err) {
      console.error('[TelegramExplore] search', err);
      setInlineError('Unexpected search error.');
    } finally {
      setLoadingSearch(false);
    }
  }, [target, searchQuery, scanId]);

  // ── Load older ──
  const handleLoadOlder = useCallback(async () => {
    if (messages.length === 0) return;
    const ids = messages.map(m => m.id).filter(Boolean);
    if (ids.length === 0) return;
    const oldestId = Math.min(...ids);

    setLoadingOlder(true);
    setInlineError(null);

    try {
      const dialog = dialogRef.current || target.trim();
      const { data, error } = await invokeExplore(
        'telegram-explore-recent',
        { scan_id: scanId, dialog, limit: 20, offset_id: oldestId, include_empty: false },
      );
      if (error) { setInlineError(error); return; }
      const older = extractMessages(data);
      if (older.length === 0) {
        setInlineError('No older messages available.');
      } else {
        setMessages(prev => [...prev, ...older]);
      }
    } catch (err) {
      console.error('[TelegramExplore] loadOlder', err);
      setInlineError('Failed to load older messages.');
    } finally {
      setLoadingOlder(false);
    }
  }, [messages, target, scanId]);

  return (
    <Card className="border-primary/20 bg-primary/[0.02]">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Send className="h-4 w-4 text-primary" />
          <CardTitle className="text-sm">Telegram Explore</CardTitle>
          <Badge variant="outline" className="text-[10px] h-4 px-1.5 border-primary/30 text-primary">
            Beta
          </Badge>
        </div>
        <CardDescription className="text-xs">
          Browse Telegram users, channels, and groups interactively.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Input + Buttons */}
        <div className="flex flex-col sm:flex-row gap-2">
          <Input
            placeholder="@username | t.me/... | channel/group"
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleLoad()}
            className="flex-1 text-sm h-9"
          />
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={handleLoad}
              disabled={loadingLoad || !target.trim()}
              className="gap-1.5 h-9"
            >
              {loadingLoad ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Eye className="h-3.5 w-3.5" />}
              Load
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleSearch}
              disabled={loadingSearch || !target.trim() || !searchQuery.trim()}
              className="gap-1.5 h-9"
            >
              {loadingSearch ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Search className="h-3.5 w-3.5" />}
              Search
            </Button>
          </div>
        </div>

        {/* Search query input */}
        <Input
          placeholder="Search within loaded dialog…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          className="text-sm h-8"
        />

        {/* Inline error banner */}
        {inlineError && (
          <div className="flex items-center gap-2 rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>{inlineError}</span>
          </div>
        )}

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="h-8">
            <TabsTrigger value="overview" className="text-xs h-7 px-3">Overview</TabsTrigger>
            <TabsTrigger value="recent" className="text-xs h-7 px-3">
              Recent
              {messages.length > 0 && (
                <Badge variant="secondary" className="ml-1.5 text-[9px] h-3.5 px-1">{messages.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="search" className="text-xs h-7 px-3">
              Search
              {searchResults.length > 0 && (
                <Badge variant="secondary" className="ml-1.5 text-[9px] h-3.5 px-1">{searchResults.length}</Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {/* ── Overview ── */}
          <TabsContent value="overview" className="mt-3">
            {loadingLoad ? (
              <div className="flex items-center justify-center py-6 gap-2">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Resolving target…</span>
              </div>
            ) : entity ? (
              <div className="rounded-md border border-border/40 bg-muted/20 p-4 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 space-y-0.5">
                    <p className="font-medium text-foreground truncate text-sm">
                      {entity.title || entity.username || '—'}
                    </p>
                    {entity.username && (
                      <p className="text-xs text-muted-foreground">@{entity.username}</p>
                    )}
                    {entity.type && (
                      <p className="text-xs text-muted-foreground capitalize">Type: {entity.type}</p>
                    )}
                    {entity.id && (
                      <p className="text-xs text-muted-foreground">ID: {entity.id}</p>
                    )}
                  </div>
                  <div className="flex flex-col gap-1 items-end shrink-0">
                    {entity.verified && (
                      <Badge variant="outline" className="text-[10px] h-4 px-1.5 gap-0.5 border-primary/30 text-primary">
                        <Shield className="h-2.5 w-2.5" /> Verified
                      </Badge>
                    )}
                    {entity.scam && (
                      <Badge variant="destructive" className="text-[10px] h-4 px-1.5">Scam</Badge>
                    )}
                    {entity.fake && (
                      <Badge variant="destructive" className="text-[10px] h-4 px-1.5">Fake</Badge>
                    )}
                  </div>
                </div>
                {entity.participants_count != null && (
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Users className="h-3 w-3" />
                    <span>{Number(entity.participants_count).toLocaleString()} participants</span>
                  </div>
                )}
                {entity.about && (
                  <p className="text-xs text-muted-foreground line-clamp-3">{entity.about}</p>
                )}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground text-center py-4">
                Enter a target and click <strong>Load</strong> to resolve entity info.
              </p>
            )}
          </TabsContent>

          {/* ── Recent ── */}
          <TabsContent value="recent" className="mt-3">
            {loadingLoad && messages.length === 0 ? (
              <div className="flex items-center justify-center py-6 gap-2">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Loading messages…</span>
              </div>
            ) : messages.length > 0 ? (
              <div className="space-y-2">
                <MessageList messages={messages} />
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full gap-1.5 text-xs"
                  onClick={handleLoadOlder}
                  disabled={loadingOlder}
                >
                  {loadingOlder ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <ChevronDown className="h-3 w-3" />
                  )}
                  Load older
                </Button>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground text-center py-4">
                No recent messages loaded yet.
              </p>
            )}
          </TabsContent>

          {/* ── Search ── */}
          <TabsContent value="search" className="mt-3">
            {loadingSearch ? (
              <div className="flex items-center justify-center py-6 gap-2">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Searching…</span>
              </div>
            ) : searchResults.length > 0 ? (
              <MessageList messages={searchResults} />
            ) : (
              <p className="text-xs text-muted-foreground text-center py-4">
                Enter a query above and click <strong>Search</strong> to find messages.
              </p>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

// ── MessageList sub-component ──

function MessageList({ messages }: { messages: TelegramMessage[] }) {
  return (
    <div className="max-h-[400px] overflow-y-auto space-y-1.5 pr-1">
      {messages.map((msg, i) => (
        <div
          key={msg.id || i}
          className="flex items-start gap-2 rounded-md border border-border/30 bg-background px-3 py-2 text-xs"
        >
          <MessageSquare className="h-3 w-3 text-muted-foreground shrink-0 mt-0.5" />
          <div className="min-w-0 flex-1 space-y-0.5">
            <div className="flex items-center gap-2 text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="h-2.5 w-2.5" />
                {formatDate(msg.date)}
              </span>
              {msg.sender_id && (
                <span className="text-[10px]">sender: {msg.sender_id}</span>
              )}
            </div>
            <p className="text-foreground leading-relaxed">{snippetText(msg)}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

export default TelegramExplore;
