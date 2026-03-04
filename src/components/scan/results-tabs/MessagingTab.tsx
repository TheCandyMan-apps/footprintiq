/**
 * MessagingTab – Unified messaging intelligence hub.
 *
 * Sub-tabs: All (default) | Telegram | WhatsApp | Discord (planned) | Threads (planned)
 * "All" view shows combined exposure summary + platform overview tiles with jump links.
 * localStorage persists last selected sub-tab.
 */

import { lazy, Suspense, useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Send, MessageCircle, Hash, AtSign, Shield, Layers,
  ArrowRight, Activity,
} from "lucide-react";
import { flags } from "@/lib/featureFlags";
import { WhatsAppTab } from "./WhatsAppTab";
import { MessagingExposureSummary, type MessagingScoreInput } from "./MessagingExposureSummary";
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

const ALL_TABS = ["all", "telegram", "whatsapp", "discord", "threads"] as const;
type SubTab = (typeof ALL_TABS)[number];

const STORAGE_KEY = "fpiq_messaging_subtab";

function readStoredTab(): SubTab | null {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    if (v && ALL_TABS.includes(v as SubTab)) return v as SubTab;
  } catch { /* noop */ }
  return null;
}

function storeTab(tab: SubTab) {
  try { localStorage.setItem(STORAGE_KEY, tab); } catch { /* noop */ }
}

/* ------------------------------------------------------------------ */
/*  Platform overview tile (used in the "All" view)                    */
/* ------------------------------------------------------------------ */
function PlatformTile({
  label,
  icon: Icon,
  score,
  onNavigate,
}: {
  label: string;
  icon: typeof Send;
  score: MessagingScoreInput | null;
  onNavigate: () => void;
}) {
  const hasData = score && (score.signalCount > 0 || score.riskScore > 0);

  return (
    <Card disableHover className="overflow-hidden border-border/40">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-muted/50 flex items-center justify-center">
              <Icon className="h-4 w-4 text-foreground/70" />
            </div>
            <span className="text-sm font-semibold text-foreground">{label}</span>
          </div>
          {hasData && (
            <Badge variant="secondary" className="text-[10px] h-5 px-2 font-medium tabular-nums">
              {score.signalCount} {score.signalCount === 1 ? "signal" : "signals"}
            </Badge>
          )}
        </div>

        {hasData ? (
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Activity className="h-3 w-3" />
              Risk: <span className="font-medium text-foreground tabular-nums">{score.riskScore}/100</span>
            </span>
            <span>
              Confidence: <span className="font-medium text-foreground tabular-nums">{Math.round(score.confidence * 100)}%</span>
            </span>
          </div>
        ) : (
          <p className="text-xs text-muted-foreground/60">No signals detected for this platform.</p>
        )}

        <Button
          variant="ghost"
          size="sm"
          onClick={onNavigate}
          className="w-full justify-between h-9 text-xs font-medium text-muted-foreground hover:text-foreground"
        >
          View {label} details
          <ArrowRight className="h-3.5 w-3.5" />
        </Button>
      </CardContent>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */
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

  // Individual platform scores for tiles
  const telegramScore = useMemo(
    () => combinedScores.find((s) => s.label === "Telegram") ?? null,
    [combinedScores]
  );
  const whatsAppScore = useMemo(
    () => combinedScores.find((s) => s.label === "WhatsApp") ?? null,
    [combinedScores]
  );

  // Resolve initial tab: URL param > localStorage > "all"
  const resolveInitial = useCallback((): SubTab => {
    const urlParam = searchParams.get("messenger") as SubTab | null;
    if (urlParam === "whatsapp" && showWhatsApp) return "whatsapp";
    if (urlParam === "telegram") return "telegram";
    if (urlParam === "all") return "all";
    const stored = readStoredTab();
    if (stored === "whatsapp" && !showWhatsApp) return "all";
    if (stored && ALL_TABS.includes(stored)) return stored;
    return "all";
  }, [searchParams, showWhatsApp]);

  const [activeTab, setActiveTab] = useState<SubTab>(resolveInitial);
  const contentRef = useRef<HTMLDivElement>(null);
  const [transitioning, setTransitioning] = useState(false);

  const handleTabChange = useCallback((m: SubTab) => {
    if (m === "discord" || m === "threads") return;
    setTransitioning(true);
    setTimeout(() => {
      setActiveTab(m);
      storeTab(m);
      const next = new URLSearchParams(searchParams);
      if (m === "all") {
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
    if (activeTab === "whatsapp" && !showWhatsApp) {
      setActiveTab("all");
      storeTab("all");
    }
  }, [activeTab, showWhatsApp]);

  const tabs: { id: SubTab; label: string; icon: typeof Send; disabled: boolean; planned: boolean }[] = [
    { id: "all", label: "All", icon: Layers, disabled: false, planned: false },
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

      {/* Sub-tabs */}
      <div className="border-b border-border/30">
        <div className="flex items-center gap-1 pb-0 -mb-px overflow-x-auto">
          {tabs.map(({ id, label, icon: Icon, disabled, planned }) => (
            <button
              key={id}
              onClick={() => !disabled && handleTabChange(id)}
              disabled={disabled}
              className={cn(
                "flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-t-md border-b-2 transition-colors whitespace-nowrap",
                "min-h-[40px]",
                activeTab === id && !disabled
                  ? "border-primary text-foreground bg-muted/40"
                  : "border-transparent",
                !disabled && activeTab !== id && "text-muted-foreground hover:text-foreground hover:bg-muted/20",
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
        {/* ===== ALL VIEW ===== */}
        {activeTab === "all" && (
          <div className="space-y-6">
            {/* Combined exposure summary */}
            {combinedScores.length > 0 && (
              <MessagingExposureSummary scores={combinedScores} />
            )}

            {/* Platform tiles grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <PlatformTile
                label="Telegram"
                icon={Send}
                score={telegramScore}
                onNavigate={() => handleTabChange("telegram")}
              />
              {showWhatsApp && (
                <PlatformTile
                  label="WhatsApp"
                  icon={MessageCircle}
                  score={whatsAppScore}
                  onNavigate={() => handleTabChange("whatsapp")}
                />
              )}
            </div>

            {/* No data state */}
            {combinedScores.length === 0 && (
              <div className="text-center py-10 space-y-2">
                <Shield className="h-8 w-8 text-muted-foreground/30 mx-auto" />
                <p className="text-sm text-muted-foreground">No messaging signals detected for this scan.</p>
                <p className="text-xs text-muted-foreground/60">
                  Messaging intelligence is available when platform-specific data is found.
                </p>
              </div>
            )}
          </div>
        )}

        {/* ===== TELEGRAM ===== */}
        {activeTab === "telegram" && (
          <Suspense fallback={<TabSkeleton />}>
            <TelegramTab scanId={scanId} isPro={isPro} />
          </Suspense>
        )}

        {/* ===== WHATSAPP ===== */}
        {activeTab === "whatsapp" && showWhatsApp && (
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
