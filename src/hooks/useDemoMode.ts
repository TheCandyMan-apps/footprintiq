import { useState, useEffect } from "react";
import { generateDemoFindings } from "@/lib/demo";
import { Finding } from "@/lib/ufm";

/**
 * Demo Mode Hook
 * Checks URL query params or localStorage for demo mode
 * Returns demo findings when enabled
 */
export function useDemoMode(): {
  isDemoMode: boolean;
  demoFindings: Finding[];
  enableDemoMode: () => void;
  disableDemoMode: () => void;
} {
  const [isDemoMode, setIsDemoMode] = useState(false);

  useEffect(() => {
    // Check URL param: ?demo=true
    const urlParams = new URLSearchParams(window.location.search);
    const demoParam = urlParams.get('demo');
    
    // Check localStorage
    const storedDemo = localStorage.getItem('footprintiq-demo-mode');
    
    if (demoParam === 'true' || storedDemo === 'true') {
      setIsDemoMode(true);
    }
  }, []);

  const enableDemoMode = () => {
    setIsDemoMode(true);
    localStorage.setItem('footprintiq-demo-mode', 'true');
  };

  const disableDemoMode = () => {
    setIsDemoMode(false);
    localStorage.removeItem('footprintiq-demo-mode');
  };

  const demoFindings = isDemoMode ? generateDemoFindings('comprehensive') : [];

  return {
    isDemoMode,
    demoFindings,
    enableDemoMode,
    disableDemoMode,
  };
}
