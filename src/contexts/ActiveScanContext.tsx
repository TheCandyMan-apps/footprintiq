import { createContext, useContext, ReactNode } from 'react';
import { useActiveScan } from '@/hooks/useActiveScan';

interface ActiveScan {
  scanId: string;
  type: 'advanced' | 'username' | 'spiderfoot';
  target: string;
  startedAt: string;
}

interface ActiveScanContextType {
  activeScan: ActiveScan | null;
  progress: any;
  isMinimized: boolean;
  startTracking: (scan: ActiveScan) => void;
  clearActiveScan: () => void;
  toggleMinimize: () => void;
}

const ActiveScanContext = createContext<ActiveScanContextType | null>(null);

export function ActiveScanProvider({ children }: { children: ReactNode }) {
  const activeScanData = useActiveScan();

  return (
    <ActiveScanContext.Provider value={activeScanData}>
      {children}
    </ActiveScanContext.Provider>
  );
}

export function useActiveScanContext() {
  const context = useContext(ActiveScanContext);
  if (!context) {
    throw new Error('useActiveScanContext must be used within ActiveScanProvider');
  }
  return context;
}
