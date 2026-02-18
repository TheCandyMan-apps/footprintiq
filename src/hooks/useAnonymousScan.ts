/**
 * Hook for triggering and tracking anonymous (unauthenticated) scans.
 * Generates a session fingerprint for later claim association.
 */
import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface AnonymousScanResult {
  scanId: string | null;
  error: string | null;
  rateLimited: boolean;
  isLoading: boolean;
}

// Simple session fingerprint — not cryptographically strong, just for claim correlation
function getSessionFingerprint(): string {
  const stored = sessionStorage.getItem("fpiq_sfp");
  if (stored) return stored;
  const fp = `${Date.now()}-${Math.random().toString(36).slice(2)}-${navigator.userAgent.length}`;
  sessionStorage.setItem("fpiq_sfp", fp);
  return fp;
}

export function useAnonymousScan() {
  const [state, setState] = useState<AnonymousScanResult>({
    scanId: null,
    error: null,
    rateLimited: false,
    isLoading: false,
  });

  const triggerScan = useCallback(async (username: string): Promise<string | null> => {
    setState({ scanId: null, error: null, rateLimited: false, isLoading: true });

    const scanId = crypto.randomUUID();
    const session_fingerprint = getSessionFingerprint();

    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const anonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

      const res = await fetch(`${supabaseUrl}/functions/v1/anon-scan-trigger`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: anonKey,
        },
        body: JSON.stringify({ username, scanId, session_fingerprint }),
      });

      const data = await res.json();

      if (res.status === 429) {
        setState({
          scanId: null,
          error: data.message || "Rate limit exceeded. Create a free account to continue.",
          rateLimited: true,
          isLoading: false,
        });
        return null;
      }

      if (!res.ok) {
        setState({
          scanId: null,
          error: data.error || "Failed to start scan",
          rateLimited: false,
          isLoading: false,
        });
        return null;
      }

      const resolvedScanId = data.scan_id || scanId;

      // Store scan ID in sessionStorage for claim flow
      sessionStorage.setItem("fpiq_anon_scan_id", resolvedScanId);
      sessionStorage.setItem("fpiq_anon_target", username);

      setState({
        scanId: resolvedScanId,
        error: null,
        rateLimited: false,
        isLoading: false,
      });

      return resolvedScanId;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Network error";
      setState({ scanId: null, error: msg, rateLimited: false, isLoading: false });
      return null;
    }
  }, []);

  return { ...state, triggerScan };
}
