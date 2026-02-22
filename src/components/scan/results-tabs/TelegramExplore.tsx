/**
 * TelegramExplore – Interactive Telegram Explore (Beta) panel.
 *
 * Allows users to resolve usernames/channels, browse recent messages,
 * and search within loaded dialogs via the telegram-explore edge function.
 */

import { useState, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Loader2, Send, Search, Users, Shield, Hash, Eye, Bot,
  AlertTriangle, ChevronDown, Clock, MessageSquare,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';

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
  photo_url?: string;
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

// ── Helpers ──

function extractEntity(data: any): ResolvedEntity | null {
  if (!data) return null;
  // Worker may return findings array or a direct profile object
  if (data.findings && Array.isArray(data.findings)) {
    const profileFinding = data.findings.find(
      (f: any) => f.kind === 'profile' || f.kind === 'channel_profile' || f.kind === 'profile_presence',
    );
    if (profileFinding) {
      const meta = profileFinding.meta || {};
      const ev = Array.isArray(profileFinding.evidence)
        ? Object.fromEntries(profileFinding.evidence.map((e: any) => [e.key, e.value]))
        : profileFinding.evidence || {};
      return { ...meta, ...ev };
    }
  }
  if (data.artifacts?.channel_profile) return data.artifacts.channel_profile;
  if (data.artifacts?.channel_metadata) return data.artifacts.channel_metadata;
  // Direct profile in data
  if (data.title || data.username || data.id) return data as ResolvedEntity;
  return null;
}

function extractMessages(data: any): TelegramMessage[] {
  if (!data) return [];
  if (data.artifacts?.channel_messages) {
    const cm = data.artifacts.channel_messages;
    return Array.isArray(cm) ? cm : cm.channel_messages || cm.messages || [];
  }
  if (data.messages && Array.isArray(data.messages)) return data.messages;
  if (data.findings) {
    // Try to get messages from findings evidence
    for (const f of data.findings) {
      if (f.evidence?.messages) return f.evidence.messages;
    }
  }
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

export function TelegramExplore() {
  const [target, setTarget] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');

  // State
  const [entity, setEntity] = useState<ResolvedEntity | null>(null);
  const [messages, setMessages] = useState<TelegramMessage[]>([]);
  const [searchResults, setSearchResults] = useState<TelegramMessage[]>([]);

  // Loading flags
  const [loadingResolve, setLoadingResolve] = useState(false);
  const [loadingRecent, setLoadingRecent] = useState(false);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [loadingOlder, setLoadingOlder] = useState(false);

  const [notFound, setNotFound] = useState(false);
  const resolvedTarget = useRef('');

  // ── Load (Resolve + Info + Recent) ──
  const handleLoad = useCallback(async () => {
    const t = target.trim();
    if (!t) { toast.error('Enter a Telegram target.'); return; }

    setLoadingResolve(true);
    setNotFound(false);
    setEntity(null);
    setMessages([]);
    setSearchResults([]);
    setActiveTab('overview');
    resolvedTarget.current = t;

    try {
      // Step 1: Resolve
      const { data: resolveRes, error: resolveErr } = await supabase.functions.invoke('telegram-explore', {
        body: { action: 'resolve', target: t },
      });

      if (resolveErr) {
        toast.error('Failed to reach Telegram worker.');
        console.error('[TelegramExplore] resolve error:', resolveErr);
        setLoadingResolve(false);
        return;
      }

      if (resolveRes?.not_found) {
        setNotFound(true);
        setLoadingResolve(false);
        return;
      }

      const ent = extractEntity(resolveRes?.data);
      setEntity(ent);
      setLoadingResolve(false);

      // Step 2: Recent messages
      setLoadingRecent(true);
      const { data: recentRes, error: recentErr } = await supabase.functions.invoke('telegram-explore', {
        body: { action: 'recent', target: t, message_limit: 25 },
      });

      if (!recentErr && recentRes?.data) {
        setMessages(extractMessages(recentRes.data));
      }
    } catch (err) {
      toast.error('Unexpected error during Telegram load.');
      console.error('[TelegramExplore]', err);
    } finally {
      setLoadingResolve(false);
      setLoadingRecent(false);
    }
  }, [target]);

  // ── Search ──
  const handleSearch = useCallback(async () => {
    const t = target.trim();
    const q = searchQuery.trim();
    if (!t) { toast.error('Enter a Telegram target first.'); return; }
    if (!q) { toast.error('Enter a search query.'); return; }

    setLoadingSearch(true);
    setActiveTab('search');
    setSearchResults([]);

    try {
      const { data: res, error } = await supabase.functions.invoke('telegram-explore', {
        body: { action: 'search', target: t, query: q, message_limit: 50 },
      });

      if (error) {
        toast.error('Search failed.');
        console.error('[TelegramExplore] search error:', error);
      } else if (res?.data) {
        setSearchResults(extractMessages(res.data));
        if (extractMessages(res.data).length === 0) {
          toast('No messages matched your query.');
        }
      }
    } catch (err) {
      toast.error('Unexpected search error.');
      console.error('[TelegramExplore]', err);
    } finally {
      setLoadingSearch(false);
    }
  }, [target, searchQuery]);

  // ── Load Older ──
  const handleLoadOlder = useCallback(async () => {
    if (messages.length === 0) return;
    const oldestId = Math.min(...messages.map(m => m.id).filter(Boolean));
    if (!oldestId || oldestId <= 0) return;

    setLoadingOlder(true);
    try {
      const { data: res, error } = await supabase.functions.invoke('telegram-explore', {
        body: { action: 'recent', target: resolvedTarget.current || target.trim(), message_limit: 25, offset_id: oldestId },
      });

      if (!error && res?.data) {
        const older = extractMessages(res.data);
        if (older.length === 0) {
          toast('No older messages available.');
        } else {
          setMessages(prev => [...prev, ...older]);
        }
      }
    } catch (err) {
      toast.error('Failed to load older messages.');
    } finally {
      setLoadingOlder(false);
    }
  }, [messages, target]);

  const isLoading = loadingResolve || loadingRecent;

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
              disabled={isLoading || !target.trim()}
              className="gap-1.5 h-9"
            >
              {loadingResolve ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Eye className="h-3.5 w-3.5" />}
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

        {/* Search query input (always visible for convenience) */}
        <Input
          placeholder="Search within loaded dialog…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          className="text-sm h-8"
        />

        {/* Not found */}
        {notFound && (
          <div className="flex items-center gap-2 rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>No Telegram entity found for "{target}". Check the handle and try again.</span>
          </div>
        )}

        {/* Tabs: Overview / Recent / Search */}
        {(entity || messages.length > 0 || searchResults.length > 0) && (
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
              {entity ? (
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
                        <Badge variant="destructive" className="text-[10px] h-4 px-1.5">
                          Scam
                        </Badge>
                      )}
                      {entity.fake && (
                        <Badge variant="destructive" className="text-[10px] h-4 px-1.5">
                          Fake
                        </Badge>
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
              ) : !isLoading ? (
                <p className="text-xs text-muted-foreground text-center py-4">
                  Enter a target and click <strong>Load</strong> to resolve entity info.
                </p>
              ) : (
                <div className="flex items-center justify-center py-6">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              )}
            </TabsContent>

            {/* ── Recent ── */}
            <TabsContent value="recent" className="mt-3">
              {loadingRecent && messages.length === 0 ? (
                <div className="flex items-center justify-center py-6">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
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
                <div className="flex items-center justify-center py-6">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
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
        )}
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
