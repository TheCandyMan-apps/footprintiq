/**
 * MessagingTab – Unified messaging intelligence hub with sub-tabs
 * for Telegram, WhatsApp, and planned messengers (Discord, Threads).
 */

import { lazy, Suspense, useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Send, MessageCircle, Hash, AtSign } from "lucide-react";
import { flags } from "@/lib/featureFlags";
import { WhatsAppTab } from "./WhatsAppTab";

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
  const handleMessengerChange = (value: string) => {
    const m = value as MessengerTab;
    setActiveMessenger(m);
    const next = new URLSearchParams(searchParams);
    if (m === "telegram") {
      next.delete("messenger");
    } else {
      next.set("messenger", m);
    }
    setSearchParams(next, { replace: true });
  };

  // If whatsapp tab is active but scan isn't phone, fall back
  useEffect(() => {
    if (activeMessenger === "whatsapp" && !showWhatsApp) {
      setActiveMessenger("telegram");
    }
  }, [activeMessenger, showWhatsApp]);

  return (
    <div className="p-4 sm:p-6 space-y-4">
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
      </Tabs>
    </div>
  );
}
