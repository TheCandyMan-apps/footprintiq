/**
 * MessagingTab – Unified messaging intelligence hub with sub-tabs
 * for Telegram, WhatsApp, and planned messengers (Discord, Threads).
 *
 * - Compact header with inline exposure summary
 * - Ghost-style sub-tabs with localStorage persistence
 * - No progress bars or looping indicators
 */

import { lazy, Suspense, useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Send, MessageCircle, Hash, AtSign, Shield } from "lucide-react";
import { flags } from "@/lib/featureFlags";
import { WhatsAppTab } from "./WhatsAppTab";
import { MessagingExposureSummary } from "./MessagingExposureSummary";
import { useMessagingScores } from "@/hooks/useMessagingScores";
import { cn } from "@/lib/utils";

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

const STORAGE_KEY = "fpiq_messaging_subtab";

function readStoredTab(): MessengerTab | null {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    if (v && MESSENGER_TABS.includes(v as MessengerTab)) return v as MessengerTab;
  } catch { /* noop */ }
  return null;
}

function storeTab(tab: MessengerTab) {
  try { localStorage.setItem(STORAGE_KEY, tab); } catch { /* noop */ }
}

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

  // Resolve initial tab: URL param > localStorage > telegram
  const resolveInitial = useCallback((): MessengerTab => {
    const urlParam = searchParams.get("messenger") as MessengerTab | null;
    if (urlParam === "whatsapp" && showWhatsApp) return "whatsapp";
    if (urlParam && MESSENGER_TABS.includes(urlParam) && urlParam !== "whatsapp") return urlParam;
    const stored = readStoredTab();
    if (stored === "whatsapp" && showWhatsApp) return "whatsapp";
    if (stored === "telegram") return "telegram";
    return "telegram";
  }, [searchParams, showWhatsApp]);

  const [activeMessenger, setActiveMessenger] = useState<MessengerTab>(resolveInitial);
  const contentRef = useRef<HTMLDivElement>(null);
  const [transitioning, setTransitioning] = useState(false);

  const handleMessengerChange = useCallback((m: MessengerTab) => {
    if (m === "discord" || m === "threads") return; // disabled
    setTransitioning(true);
    setTimeout(() => {
      setActiveMessenger(m);
      storeTab(m);
      const next = new URLSearchParams(searchParams);
      if (m === "telegram") {
        next.delete("messenger");
      } else {
        next.set("messenger", m);
      }
      setSearchParams(next, { replace: true });
      setTransitioning(false);
    }, 150);
  }, [searchParams, setSearchParams]);

  // Fall back if whatsapp disabled
  useEffect(() => {
    if (activeMessenger === "whatsapp" && !showWhatsApp) {
      setActiveMessenger("telegram");
      storeTab("telegram");
    }
  }, [activeMessenger, showWhatsApp]);

  const tabs: { id: MessengerTab; label: string; icon: typeof Send; disabled: boolean; planned: boolean }[] = [
    { id: "telegram", label: "Telegram", icon: Send, disabled: false, planned: false },
    ...(showWhatsApp ? [{ id: "whatsapp" as const, label: "WhatsApp", icon: MessageCircle, disabled: false, planned: false }] : []),
    { id: "discord", label: "Discord", icon: Hash, disabled: true, planned: true },
    { id: "threads", label: "Threads", icon: AtSign, disabled: true, planned: true },
  ];

  return (
    <div className="px-4 sm:px-6 pt-8 pb-6 space-y-6">
      {/* Compact header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground/55 mb-0.5">
            Messaging Intelligence
          </p>
          <h2 className="text-base font-semibold tracking-tight text-foreground">
            Platform Overview
          </h2>
        </div>
        <span className="flex items-center gap-1 text-[9px] text-muted-foreground/40 shrink-0">
          <Shield className="h-2.5 w-2.5" />
          Public data only
        </span>
      </div>

      {/* Compact exposure summary card (replaces progress bar) */}
      {combinedScores.length > 0 && (
        <MessagingExposureSummary scores={combinedScores} />
      )}

      {/* Sub-tabs */}
      <div className="border-b border-border/30">
        <div className="flex items-center gap-1 pb-0 -mb-px">
          {tabs.map(({ id, label, icon: Icon, disabled, planned }) => (
            <button
              key={id}
              onClick={() => !disabled && handleMessengerChange(id)}
              disabled={disabled}
              className={cn(
                "flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-t-md border-b-2 transition-colors",
                "min-h-[40px]",
                activeMessenger === id && !disabled
                  ? "border-primary text-foreground bg-muted/40"
                  : "border-transparent",
                !disabled && activeMessenger !== id && "text-muted-foreground hover:text-foreground hover:bg-muted/20",
                disabled && "text-muted-foreground/35 cursor-default"
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
              {planned && (
                <Badge variant="outline" className="text-[7px] h-3.5 px-1 ml-0.5 border-border/40 text-muted-foreground/40">
                  Planned
                </Badge>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div
        ref={contentRef}
        className="transition-opacity duration-150 ease-in-out"
        style={{ opacity: transitioning ? 0 : 1 }}
      >
        {activeMessenger === "telegram" && (
          <Suspense fallback={<TabSkeleton />}>
            <TelegramTab scanId={scanId} isPro={isPro} />
          </Suspense>
        )}

        {activeMessenger === "whatsapp" && showWhatsApp && (
          <WhatsAppTab
            scanId={scanId}
            isPro={isPro}
            phoneNumber={phoneNumber}
            results={results}
          />
        )}
      </div>
    </div>
  );
}
