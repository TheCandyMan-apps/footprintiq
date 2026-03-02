/**
 * MessagingTab – Unified messaging intelligence hub with sub-tabs
 * for Telegram, WhatsApp, and planned messengers (Discord, Threads).
 */

import { lazy, Suspense, useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Send, MessageCircle, Hash, AtSign, Shield } from "lucide-react";
import { flags } from "@/lib/featureFlags";
import { WhatsAppTab } from "./WhatsAppTab";
import { MessagingExposureSummary } from "./MessagingExposureSummary";
import { useMessagingScores } from "@/hooks/useMessagingScores";

const TelegramTab = lazy(() => import("./TelegramTab"));

const TabSkeleton = () => (
  <div className="p-6">
    <div className="h-7 w-48 bg-muted rounded mb-4" />
    <div className="space-y-3">
      <div className="h-4 w-full bg-muted rounded" />
      <div className="h-4 w-5/6 bg-muted rounded" />
      <div className="h-4 w-4/6 bg-muted rounded" />
    </div>
  </div>
);

export interface MessagingTabProps {
  scanId: string;
  isPro: boolean;
  phoneNumber?: string;
  isPhoneTarget: boolean;
  results: any[];
}

const MESSENGER_TABS = ["telegram", "whatsapp", "discord", "threads"] as const;
type MessengerTab = (typeof MESSENGER_TABS)[number];

export default function MessagingTab({
  scanId,
  isPro,
  phoneNumber,
  isPhoneTarget,
  results,
}: MessagingTabProps) {
  const [searchParams, setSearchParams] = useSearchParams();

  const showWhatsApp = isPhoneTarget && flags.whatsappBasic;

  const { scores: combinedScores } = useMessagingScores({ scanId, phoneNumber, isPhoneTarget });

  // Read initial messenger from URL query param
  const messengerParam = searchParams.get("messenger") as MessengerTab | null;
  const resolveInitial = (): MessengerTab => {
    if (messengerParam === "whatsapp" && showWhatsApp) return "whatsapp";
    if (messengerParam === "whatsapp" && !showWhatsApp) return "telegram";
    if (messengerParam && MESSENGER_TABS.includes(messengerParam)) return messengerParam;
    return "telegram";
  };

  const [activeMessenger, setActiveMessenger] = useState<MessengerTab>(resolveInitial);

  // Sync messenger param to URL
  const contentRef = useRef<HTMLDivElement>(null);
  const [transitioning, setTransitioning] = useState(false);

  const handleMessengerChange = (value: string) => {
    const m = value as MessengerTab;
    setTransitioning(true);
    setTimeout(() => {
      setActiveMessenger(m);
      const next = new URLSearchParams(searchParams);
      if (m === "telegram") {
        next.delete("messenger");
      } else {
        next.set("messenger", m);
      }
      setSearchParams(next, { replace: true });
      contentRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      setTransitioning(false);
    }, 150);
  };

  // If whatsapp tab is active but scan isn't phone, fall back
  useEffect(() => {
    if (activeMessenger === "whatsapp" && !showWhatsApp) {
      setActiveMessenger("telegram");
    }
  }, [activeMessenger, showWhatsApp]);

  const activeLabel = activeMessenger === 'whatsapp' ? 'WhatsApp' : 'Telegram';

  return (
    <div className="px-4 sm:px-6 pt-10 pb-6 space-y-8">
      {/* Unified header */}
      <div className="space-y-0.5">
        <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground/55">
          Messaging Intelligence
        </p>
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold tracking-[0.01em] text-foreground">Platform Overview</h2>
          <span className="flex items-center gap-1 text-[8px] text-muted-foreground/40 shrink-0">
            <Shield className="h-2.5 w-2.5" />
            Public data only
          </span>
        </div>
      </div>

      {/* Combined exposure summary */}
      {combinedScores.length > 0 && (
        <MessagingExposureSummary scores={combinedScores} />
      )}

      <Tabs value={activeMessenger} onValueChange={handleMessengerChange}>
        {/* Secondary ghost-style sub-tabs */}
        <TabsList className="h-auto flex-wrap justify-start gap-1 bg-transparent p-0 border-b border-border/30 pb-2">
          <TabsTrigger
            value="telegram"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors data-[state=active]:bg-muted data-[state=active]:text-foreground data-[state=active]:shadow-none"
          >
            <Send className="h-3 w-3" />
            Telegram
          </TabsTrigger>

          {showWhatsApp && (
            <TabsTrigger
              value="whatsapp"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors data-[state=active]:bg-muted data-[state=active]:text-foreground data-[state=active]:shadow-none"
            >
              <MessageCircle className="h-3 w-3" />
              WhatsApp
            </TabsTrigger>
          )}

          <TabsTrigger
            value="discord"
            disabled
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md text-muted-foreground/40 cursor-default"
          >
            <Hash className="h-3 w-3" />
            Discord
            <Badge variant="outline" className="text-[7px] h-3 px-1 ml-0.5 border-border/40 text-muted-foreground/40">
              Planned
            </Badge>
          </TabsTrigger>

          <TabsTrigger
            value="threads"
            disabled
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md text-muted-foreground/40 cursor-default"
          >
            <AtSign className="h-3 w-3" />
            Threads
            <Badge variant="outline" className="text-[7px] h-3 px-1 ml-0.5 border-border/40 text-muted-foreground/40">
              Planned
            </Badge>
          </TabsTrigger>
        </TabsList>

        <div
          ref={contentRef}
          className="transition-opacity duration-150 ease-in-out"
          style={{ opacity: transitioning ? 0 : 1 }}
        >
          <TabsContent value="telegram" className="mt-8">
            <Suspense fallback={<TabSkeleton />}>
              <TelegramTab scanId={scanId} isPro={isPro} />
            </Suspense>
          </TabsContent>

          {showWhatsApp && (
            <TabsContent value="whatsapp" className="mt-8">
              <WhatsAppTab
                scanId={scanId}
                isPro={isPro}
                phoneNumber={phoneNumber}
                results={results}
              />
            </TabsContent>
          )}
        </div>
      </Tabs>
    </div>
  );
}
