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
    <div className="px-4 sm:px-6 pt-2 pb-4 space-y-3">
      {/* Unified header */}
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-primary/10">
          <MessageCircle className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold text-foreground">Messaging Intelligence</h2>
            <Badge variant="secondary" className="text-[10px] h-5 px-2 font-medium">
              {activeLabel}
            </Badge>
          </div>
          <p className="text-[11px] text-muted-foreground">
            Public OSINT signals and exposure indicators from messaging platforms.
          </p>
        </div>
        <Badge
          variant="outline"
          className="text-[9px] h-4 px-1.5 border-green-500/30 text-green-600 dark:text-green-400 gap-0.5 shrink-0"
        >
          <Shield className="h-2.5 w-2.5" />
          Public data only
        </Badge>
      </div>

      {/* Combined exposure summary – elevated prominence */}
      {combinedScores.length > 0 && (
        <div className="rounded-xl border-2 border-primary/20 shadow-sm bg-card">
          <MessagingExposureSummary scores={combinedScores} />
        </div>
      )}

      <Tabs value={activeMessenger} onValueChange={handleMessengerChange}>
        <TabsList className="h-auto flex-wrap justify-start gap-1 bg-muted/50 p-1">
          <TabsTrigger
            value="telegram"
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm data-[state=active]:bg-background data-[state=active]:shadow-sm"
          >
            <Send className="h-3.5 w-3.5" />
            Telegram
          </TabsTrigger>

          {showWhatsApp && (
            <TabsTrigger
              value="whatsapp"
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              <MessageCircle className="h-3.5 w-3.5" />
              WhatsApp
            </TabsTrigger>
          )}

          <TabsTrigger
            value="discord"
            disabled
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm opacity-50"
          >
            <Hash className="h-3.5 w-3.5" />
            Discord
            <Badge variant="outline" className="text-[8px] h-3.5 px-1 ml-0.5">
              Planned
            </Badge>
          </TabsTrigger>

          <TabsTrigger
            value="threads"
            disabled
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm opacity-50"
          >
            <AtSign className="h-3.5 w-3.5" />
            Threads
            <Badge variant="outline" className="text-[8px] h-3.5 px-1 ml-0.5">
              Planned
            </Badge>
          </TabsTrigger>
        </TabsList>

        <div
          ref={contentRef}
          className="transition-opacity duration-150 ease-in-out"
          style={{ opacity: transitioning ? 0 : 1 }}
        >
          <TabsContent value="telegram" className="mt-4">
            <Suspense fallback={<TabSkeleton />}>
              <TelegramTab scanId={scanId} isPro={isPro} />
            </Suspense>
          </TabsContent>

          {showWhatsApp && (
            <TabsContent value="whatsapp" className="mt-4">
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
