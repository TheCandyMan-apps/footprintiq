import { useState, useEffect } from "react";
import { X, Download, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";

const SESSION_COUNT_KEY = "fpiq_session_count";
const PROMPT_DISMISSED_KEY = "fpiq_install_dismissed";
const INSTALLED_KEY = "fpiq_pwa_installed";

export const PWAInstallPrompt = () => {
  const [showPrompt, setShowPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches || 
        localStorage.getItem(INSTALLED_KEY)) {
      return;
    }

    // Check if user dismissed the prompt
    if (localStorage.getItem(PROMPT_DISMISSED_KEY)) {
      return;
    }

    // Track sessions
    const sessionCount = parseInt(localStorage.getItem(SESSION_COUNT_KEY) || "0");
    const newSessionCount = sessionCount + 1;
    localStorage.setItem(SESSION_COUNT_KEY, newSessionCount.toString());

    // Show prompt after 2 sessions
    if (newSessionCount >= 2) {
      setShowPrompt(true);
    }

    // Listen for beforeinstallprompt event
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    // Listen for app installed event
    const handleAppInstalled = () => {
      localStorage.setItem(INSTALLED_KEY, "true");
      setShowPrompt(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) {
      // Fallback instructions for iOS/browsers without prompt API
      return;
    }

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      localStorage.setItem(INSTALLED_KEY, "true");
    }
    
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    localStorage.setItem(PROMPT_DISMISSED_KEY, "true");
    setShowPrompt(false);
  };

  if (!showPrompt) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-md z-50"
      >
        <Card className="p-4 shadow-elevated border-primary/20 bg-card/95 backdrop-blur-lg">
          <button
            onClick={handleDismiss}
            className="absolute top-2 right-2 p-1 rounded-full hover:bg-muted transition-colors"
            aria-label="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-start gap-3 pr-6">
            <div className="p-2 rounded-lg bg-gradient-to-br from-primary to-accent">
              <Smartphone className="w-6 h-6 text-primary-foreground" />
            </div>

            <div className="flex-1 space-y-3">
              <div>
                <h3 className="font-semibold text-foreground mb-1">
                  Install FootprintIQ
                </h3>
                <p className="text-sm text-muted-foreground">
                  Add to your home screen for quick access and offline support
                </p>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleInstall}
                  size="sm"
                  className="flex-1 touch-target"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Install App
                </Button>
                <Button
                  onClick={handleDismiss}
                  variant="outline"
                  size="sm"
                  className="touch-target"
                >
                  Later
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
};
